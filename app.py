from flask import Flask, Response, request, send_from_directory, stream_with_context
from dotenv import load_dotenv
from dateutil import parser, tz
from datetime import datetime
from time import sleep
import logging
import pandas as pd
import requests
import json
import os

logging.basicConfig(level=logging.DEBUG)

load_dotenv()

app = Flask(__name__, static_folder="build", static_url_path="")

if os.getenv("debug_mode") == "True":
    app.config["DEBUG"] = True

if os.getenv("demo_data") == "True":
    api_oa_base = os.getenv("demo_api_base")
    api_oa_acc = os.getenv("demo_oa_acc")
    api_oa_key = os.getenv("demo_oa_key")
else:
    api_oa_base = os.getenv("live_api_base")
    api_oa_acc = os.getenv("live_oa_acc")
    api_oa_key = os.getenv("live_oa_key")
    

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


@app.route("/stream", methods=["GET", "POST"])
def chart_data():  # streaming live data for chartssession
    if request.method == "POST":
        output = request.get_json()
        result = json.loads(output)
        post_speed = float(result["speed_input"])

    session = requests.Session()
    def get_data():
        global run_get_data
        run_get_data = True

        while run_get_data:
            if request.method == "POST":
                run_get_data = False
                break

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_oa_key}",
            }

            ## -------------- SUMMARY DATA _ PNL / EQUITY CHARTS -------------- ##
            
            summary_url = f"https://{api_oa_base}/v3/accounts/{api_oa_acc}/summary"
            summary_response = session.get(summary_url, headers=headers)
            summary_balance = float(summary_response.json()["account"]["balance"])
            summary_pnl = float(summary_response.json()["account"]["unrealizedPL"])
            summary_equity = summary_balance + summary_pnl

            ## -------------- TABLE DATA -------------- ##

            open_trades_url = f"https://{api_oa_base}/v3/accounts/{api_oa_acc}/trades?state=OPEN&count=500"
            open_trades_response = session.get(open_trades_url, headers=headers)
            open_trades = open_trades_response.json()["trades"]

            open_trades_list = []
            for idx, trade in enumerate(open_trades):
                id = int(trade["id"])
                instrument = open_trades[idx]["instrument"]
                direction = (
                    "Long" if int(open_trades[idx]["initialUnits"]) > 0 else "Short"
                )

                live_pricing_url = f"https://{api_oa_base}/v3/accounts/{api_oa_acc}/pricing?instruments={instrument}"
                live_pricing_response = session.get(live_pricing_url, headers=headers)
                live_pricing = live_pricing_response.json()
                live_bid = live_pricing["prices"][0]["bids"][0]["price"]
                live_ask = live_pricing["prices"][0]["asks"][0]["price"]
                live_price = float(live_bid) if direction == "Long" else float(live_ask)

                instrument = instrument.replace("_", "/")

                time = (
                    parser.parse(str(trade["openTime"]))
                    .astimezone(tz.gettz("US/Central"))
                    .strftime("%D %H:%M")
                )

                pnl = round(float(trade["unrealizedPL"]), 2)
                entry_price = float(trade["price"])
                stop_price = float(trade["stopLossOrder"]["price"])
                target_price = float(trade["takeProfitOrder"]["price"])
                target_r = round(
                    abs(target_price - entry_price) / abs(entry_price - stop_price), 2
                )

                if direction == "Long":
                    live_r = round(
                        (live_price - entry_price) / (entry_price - stop_price), 2
                    )
                else:
                    live_r = round(
                        (entry_price - live_price) / (stop_price - entry_price), 2
                    )

                open_trades_list.append(
                    {
                        "ID": id,
                        "Time": time,
                        "Instrument": instrument,
                        "Direction": direction,
                        "Entry": entry_price,
                        "Stop": stop_price,
                        "Target": target_price,
                        "Price": live_price,
                        "TPR": target_r,
                        "R": live_r,
                        "PnL": pnl,
                    }
                )

            closed_trades_url = f"https://{api_oa_base}/v3/accounts/{api_oa_acc}/trades?state=CLOSED&count=500"
            closed_trades_response = session.get(closed_trades_url, headers=headers)
            closed_trades = closed_trades_response.json()["trades"]

            closed_trades_list = []
            closed_trades_df = []
            for idx, trade in enumerate(closed_trades):
                id = int(trade["id"])
                instrument = closed_trades[idx]["instrument"].replace("_", "/")
                direction = (
                    "Long" if int(closed_trades[idx]["initialUnits"]) > 0 else "Short"
                )

                entry_time = (
                    parser.parse(str(trade["openTime"]))
                    .astimezone(tz.gettz("US/Central"))
                    .strftime("%D %H:%M")
                )
                exit_time = (
                    parser.parse(str(trade["closeTime"]))
                    .astimezone(tz.gettz("US/Central"))
                    .strftime("%D %H:%M")
                )

                entry_price = float(trade["price"])
                exit_price = float(trade["averageClosePrice"])
                pnl = round(float(trade["realizedPL"]), 2)
                try:
                    stop_price = float(trade["stopLossOrder"]["price"])
                    target_price = float(trade["takeProfitOrder"]["price"])
                    target_r = round(
                        abs(target_price - entry_price) / abs(entry_price - stop_price),
                        2,
                    )
                    if direction == "Long":
                        net_r = round(
                            (exit_price - entry_price) / (entry_price - stop_price), 2
                        )
                    else:
                        net_r = round(
                            (entry_price - exit_price) / (stop_price - entry_price), 2
                        )
                except Exception as e:
                    stop_price = None
                    target_price = None
                    target_r = None
                    net_r = None

                closed_trades_list.append(
                    {
                        "ID": id,
                        "EntryTime": entry_time,
                        "Instrument": instrument,
                        "Direction": direction,
                        "Entry": entry_price,
                        "Stop": stop_price,
                        "Target": target_price,
                        "Exit": exit_price,
                        "ExitTime": exit_time,
                        "TPR": "{:.2f}".format(target_r),
                        "R": "{:.2f}".format(net_r),
                        "PnL": pnl,
                    }
                )
                closed_trades_df.append(
                    {
                        "ID": id,
                        "EntryTime": entry_time,
                        "Instrument": instrument,
                        "Direction": direction,
                        "Entry": entry_price,
                        "Stop": stop_price,
                        "Target": target_price,
                        "Exit": exit_price,
                        "ExitTime": exit_time,
                        "TPR": target_r,
                        "R": net_r,
                        "PnL": pnl,
                    }
                )

                df = pd.DataFrame(closed_trades_df)
                df = df.sort_values("ExitTime").copy().dropna().reset_index(drop=True)
                df["CumR"] = df["R"].cumsum()

                equity_labels = ["09-14 00:00"]
                equity_values = [0]
                for i in range(len(df)):
                    equity_labels.append(
                        parser.parse(df["ExitTime"][i])
                        .astimezone(tz.gettz("US/Central"))
                        .strftime("%m-%d %H:%M")
                    )
                    equity_values.append(df["CumR"][i])

            ## ---------------------------------------------------------------- ##

            json_data = json.dumps(
                {
                    "summary": {
                        "time": parser.parse(str(datetime.now()))
                        .astimezone(tz.gettz("US/Central"))
                        .strftime("%H:%M"),
                        "equity": summary_equity,
                        "pnl": summary_pnl,
                        "balance": summary_balance,
                    },
                    "openTrades": {"rows": open_trades_list},
                    "closedTrades": {"rows": closed_trades_list},
                    "equityCurve": {"time": equity_labels, "equity": equity_values},
                }
            )

            sleep(.2)

            yield f"data:{json_data}\n\n"

    response = Response(stream_with_context(get_data()), mimetype="text/event-stream")
    response.headers["Cache-Control"] = "no-cache"
    response.headers["X-Accel-Buffering"] = "no"
    return response


if __name__ == "__main__":
    app.run()

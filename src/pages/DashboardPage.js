import React, { useEffect, useState } from "react";
import "./DashboardPage.css";
import { Col, Row, Container } from "react-bootstrap";
import LineChart from "../components/LineChart";

import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";

function DashboardPage() {
  const [equityValues, setEquityValues] = useState([]);
  const [equityLabels, setEquityLabels] = useState([]);
  const [pnlValues, setPnlValues] = useState([]);
  const [pnlLabels, setPnlLabels] = useState([]);
  const [liveEquityValues, setLiveEquityValues] = useState([]);
  const [liveEquityLabels, setLiveEquityLabels] = useState([]);
  const [openTrades, setOpenTrades] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);

  const openColumns = [
    // { key: "ID", name: "ID" },
    { key: "Time", name: "Entry Time" },
    { key: "Instrument", name: "Pair" },
    { key: "Direction", name: "L/S" },
    { key: "Entry", name: "Entry" },
    { key: "Stop", name: "Stop" },
    { key: "Target", name: "Target" },
    { key: "TPR", name: "TPR" },
    { key: "R", name: "R" },
    { key: "PnL", name: "PnL" },
    { key: "Price", name: "Price" },
  ];
  const closedColumns = [
    // { key: "ID", name: "ID" },
    { key: "EntryTime", name: "Entry Time" },
    { key: "Instrument", name: "Pair" },
    { key: "Direction", name: "L/S" },
    { key: "Entry", name: "Entry" },
    { key: "Stop", name: "Stop" },
    { key: "Target", name: "Target" },
    { key: "TPR", name: "TPR" },
    { key: "R", name: "R" },
    { key: "PnL", name: "PnL" },
    { key: "ExitTime", name: "Exit Time" },
    { key: "Exit", name: "Exit" },
  ];

  useEffect(() => {
    const sse = new EventSource("/stream");

    const handleStream = (e) => {
      const eData = JSON.parse(e.data);

      const numDataPoints = 60;

      setEquityLabels([...eData.equityCurve.time]);
      setEquityValues([...eData.equityCurve.equity]);

      setPnlLabels((current) => [...current, eData.summary.time].slice(-numDataPoints));
      setPnlValues((current) => [...current, eData.summary.pnl].slice(-numDataPoints));

      setLiveEquityLabels((current) => [...current, eData.summary.time].slice(-numDataPoints));
      setLiveEquityValues((current) => [...current, eData.summary.equity].slice(-numDataPoints));

      setOpenTrades([...eData.openTrades]);
      setClosedTrades([...eData.closedTrades]);
    };

    sse.onmessage = (e) => {
      handleStream(e);
    };

    sse.onerror = (e) => {
      sse.close();
      setTimeout(() => {
        sse = new EventSource("/stream");
      }, 500);
    };

    return () => {
      sse.close();
    };
  }, []);

  return (
    <>
      <Container className="chartsContainer">
        <Row>
          <h1>Live Dashboard</h1>
        </Row>
        <Row>
          <Col xs={12} md={6}>
          <LineChart
              className="chart"
              chartTitle="Live PnL"
              chartLabel="$"
              dataValues={pnlValues}
              dataLabels={pnlLabels}
              />
          </Col>
          <Col xs={12} md={6}>
          <LineChart
              className="chart"
              chartTitle="Live Equity"
              chartLabel="$"
              dataValues={liveEquityValues}
              dataLabels={liveEquityLabels}
              />
          </Col>
        </Row>
        <Row>
          <Col>
            <DataGrid
              className="table openTable rdg-light"
              columns={openColumns}
              rows={openTrades}
              />
          </Col>
        </Row>
        <Row>
          <Col>
            <LineChart
              className="chart"
              chartTitle="Equity Curve"
              chartLabel="R"
              dataValues={equityValues}
              dataLabels={equityLabels}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <DataGrid
              className="table closedTable rdg-light"
              columns={closedColumns}
              rows={closedTrades}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default DashboardPage;

import React, { useEffect, useState } from "react";
import "./DashboardPage.css";
import { Col, Row, Container } from "react-bootstrap";
import LineChart from "../components/LineChart";
import TradeTable from "../components/TradeTable";

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
    { key: "Price", name: "Price" },
  ];
  const closedColumns = [
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
              chartTitle="Live PnL"
              chartLabel="$"
              dataValues={pnlValues}
              dataLabels={pnlLabels}
              />
          </Col>
          <Col xs={12} md={6}>
          <LineChart
              chartTitle="Live Equity"
              chartLabel="$"
              dataValues={liveEquityValues}
              dataLabels={liveEquityLabels}
              />
          </Col>
        </Row>
        <Row>
          <Col>
            <TradeTable
              rows={openTrades}
              exColumns={openColumns}
              />
          </Col>
        </Row>
        <Row>
          <Col>
            <LineChart
              chartTitle="Equity Curve"
              chartLabel="R"
              dataValues={equityValues}
              dataLabels={equityLabels}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <TradeTable
              rows={closedTrades}
              exColumns={closedColumns}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default DashboardPage;

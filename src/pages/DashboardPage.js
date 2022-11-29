import React, { useEffect, useState } from "react";
import "./DashboardPage.css";
import { Col, Row, Container } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";


function DashboardPage() {
  const [equityValues, setEquityValues] = useState([]);
  const [equityLabels, setEquityLabels] = useState([]);
  const [pnlValues, setPnlValues] = useState([]);
  const [pnlLabels, setPnlLabels] = useState([]);
  const [liveEquityValues, setLiveEquityValues] = useState([]);
  const [liveEquityLabels, setLiveEquityLabels] = useState([]);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
        text: "Live Chart",
      },
    },
  };

  const equityData = {
    labels: equityLabels,
    datasets: [
      {
        label: "Equity",
        data: equityValues,
        borderColor: "rgba(60, 49, 0, 0.3)",
        backgroundColor: "rgba(133, 82, 44, 0.5)",
        fill: true,
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const pnlData = {
    labels: pnlLabels,
    datasets: [
      {
        label: "Live Pnl",
        data: pnlValues,
        borderColor: "rgba(60, 49, 0, 0.3)",
        backgroundColor: "rgba(133, 82, 44, 0.5)",
        fill: true,
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const liveEquityData = {
    labels: liveEquityLabels,
    datasets: [
      {
        label: "Live Equity",
        data: liveEquityValues,
        borderColor: "rgba(60, 49, 0, 0.3)",
        backgroundColor: "rgba(133, 82, 44, 0.5)",
        fill: true,
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  useEffect(() => {
    const sse = new EventSource("/stream");

    const handleStream = (e) => {
      const eData = JSON.parse(e.data);

      if (pnlData.labels.length === 60) {
        pnlData.labels.shift();
        pnlData.datasets[0].data.shift();
      }

      if (liveEquityData.labels.length === 60) {
        liveEquityData.labels.shift();
        liveEquityData.datasets[0].data.shift();
      }

      setEquityLabels((current) => [...eData.equityCurve.time]);
      setEquityValues((current) => [...eData.equityCurve.equity]);

      setPnlLabels((current) => [...current, eData.summary.time]);
      setPnlValues((current) => [...current, eData.summary.pnl]);

      setLiveEquityLabels((current) => [...current, eData.summary.time]);
      setLiveEquityValues((current) => [...current, eData.summary.equity]);
    };

    sse.onmessage = (e) => {
      handleStream(e);
    };

    sse.onerror = (e) => {
      sse.close();
    };

    return () => {
      sse.close();
    };
  }, [liveEquityData.datasets, liveEquityData.labels, pnlData.datasets, pnlData.labels]);

  return (
    <Container className="chartsContainer">
      <Row>
        <h1>Live Dashboard</h1>
      </Row>
      <Row>
        <Col>
          <Line
            className="chart"
            options={chartOptions}
            data={equityData}
            updateMode={"active"}
          /></Col>
      </Row>
      <Row>
        <Col xs={12} md={6}>
          <Line
            className="chart"
            options={chartOptions}
            data={pnlData}
            updateMode={"active"}
          />
        </Col>
        <Col xs={12} md={6}>
          <Line
            className="chart"
            options={chartOptions}
            data={liveEquityData}
            updateMode={"active"}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardPage;

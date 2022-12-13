import React from "react";
import "./LineChart.css";
import { Line } from "react-chartjs-2";
import { Chart } from "chart.js/auto";

function LineChart({ dataValues, dataLabels, chartLabel, chartTitle }) {
  Chart.register();

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
  };

  const data = {
    labels: dataLabels,
    datasets: [
      {
        label: chartLabel,
        data: dataValues,
        borderColor: "rgba(60, 49, 0, 0.3)",
        backgroundColor: "rgba(133, 82, 44, 0.5)",
        fill: true,
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  return <Line className="lineChart" options={options} data={data} />;
}

export default LineChart;

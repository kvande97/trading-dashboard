import React from "react";
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

function LineChart({ dataValues, dataLabels, chartLabel, chartTitle }) {
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

  return (
    <Line
      className="chart"
      options={options}
      data={data}
    />
  );
}

export default LineChart;

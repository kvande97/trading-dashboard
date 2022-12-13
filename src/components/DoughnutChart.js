import React from "react";
import "./DoughnutChart.css";
import { Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";

function DoughnutChart({ winrate, chartTitle }) {
  Chart.register();

  const options = {
    responsive: true,
    animation: {
      animateScale: true,
    //   animateRotate: false,
    },
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
    labels: ["Wins", "Losses"],
    datasets: [
      {
        data: [winrate, 100 - winrate],
        borderColor: "rgba(60, 49, 0, 0.3)",
        backgroundColor: ["rgba(133, 82, 44, 0.5)", "rgba(133, 82, 44, 0.2)"],
        hoverOffset: 4,
      },
    ],
  };

  return <Doughnut className="doughnutChart" options={options} data={data} />;
}

export default DoughnutChart;

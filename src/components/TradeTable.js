import React from "react";
import "./TradeTable.css";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";

function TradeTable({ rows, exColumns }) {
  const columns = [
    { key: "EntryTime", name: "Entry Time" },
    { key: "Instrument", name: "Pair" },
    { key: "Direction", name: "L/S" },
    { key: "Entry", name: "Entry" },
    { key: "Stop", name: "Stop" },
    { key: "Target", name: "Target" },
    { key: "TPR", name: "TPR" },
    { key: "R", name: "R" },
    { key: "PnL", name: "PnL" },
    ...exColumns,
  ];

  return (
    <DataGrid
      className="table rdg-light"
      columns={columns}
      rows={rows}
    />
  );
}

export default TradeTable;

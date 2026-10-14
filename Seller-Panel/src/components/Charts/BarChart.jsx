import React from "react";
import { ResponsiveBar } from "@nivo/bar";

const gradients = [
  { id: "revenueGradient", colors: ["#12eff3ff", "#a6d6e4ff"] },
  { id: "profitGradient", colors: ["#0fe287ff", "#a6e4d9ff"] },
  { id: "lossGradient", colors: ["#e95a5aff", "#FEE2E2"] },
];

const customColors = {
  revenue: "url(#revenueGradient)",
  profit: "url(#profitGradient)",
  loss: "url(#lossGradient)",
};

const BarChart = ({ 
  data, 
  title = "Bar Chart", 
  keys = ["revenue", "profit", "loss"], 
  indexBy = "day",
  height = "400px",
  showLegend = true,
  axisBottomLegend = "Day of Week",
  axisLeftLegend = "Amount (₹)"
}) => {
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          minHeight: height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ textAlign: "center", color: "#888" }}>No data available for chart</p>
      </div>
    );
  }

  // Ensure all data points have required keys
  const normalizedData = data.map((item) => {
    const normalized = { ...item };
    keys.forEach((key) => {
      if (normalized[key] === undefined || normalized[key] === null) {
        normalized[key] = 0;
      }
    });
    return normalized;
  });

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          color: "#20BFA5",
          marginBottom: "20px",
          fontWeight: 600,
        }}
      >
        {title}
      </h3>

      <div style={{ height }}>
        <ResponsiveBar
          data={normalizedData}
          keys={keys}
          indexBy={indexBy}
          margin={{ 
            top: 50, 
            right: showLegend ? 130 : 30, 
            bottom: 50, 
            left: 70 
          }}
          padding={0.35}
          innerPadding={4}
          borderRadius={6}
          enableLabel={false}
          groupMode="grouped"
          colors={({ id }) => customColors[id] || "#20BFA5"}
          axisBottom={{
            tickRotation: 0,
            legend: axisBottomLegend,
            legendPosition: "middle",
            legendOffset: 36,
          }}
          axisLeft={{
            legend: axisLeftLegend,
            legendPosition: "middle",
            legendOffset: -50,
            format: (value) => 
              value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value,
          }}
          gridYValues={6}
          theme={{
            axis: {
              ticks: { text: { fill: "#555", fontSize: 12 } },
              legend: { text: { fill: "#444", fontWeight: 600 } },
            },
            grid: { line: { stroke: "#eaeaea", strokeWidth: 1 } },
            tooltip: {
              container: {
                background: "#fff",
                color: "#111",
                fontSize: 14,
                borderRadius: "6px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                padding: "8px 12px",
              },
            },
            legends: { text: { fill: "#333", fontSize: 13 } },
          }}
          legends={
            showLegend
              ? [
                  {
                    dataFrom: "keys",
                    anchor: "bottom-right",
                    direction: "column",
                    translateX: 120,
                    itemsSpacing: 6,
                    itemWidth: 100,
                    itemHeight: 20,
                    symbolSize: 18,
                  },
                ]
              : []
          }
          animate
          motionConfig="gentle"
          defs={gradients.map((g) => ({
            id: g.id,
            type: "linearGradient",
            colors: g.colors.map((c, i) => ({ 
              offset: `${i * 100}%`, 
              color: c 
            })),
          }))}
          fill={Object.keys(customColors).map((key) => ({
            match: { id: key },
            id: `${key}Gradient`,
          }))}
          tooltip={({ id, value, indexValue }) => (
            <div
              style={{
                padding: "8px 12px",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <strong>{indexValue}</strong>
              <br />
              {id}: ₹{value.toLocaleString()}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default BarChart;
import React from "react";
import { ResponsiveLine } from "@nivo/line";

/**
 * LineChart Component
 * 
 * @param {Array} data - Array of objects like:
 * [
 *   { id: "Revenue", color: "#16A34A", data: [{ x: "Jan", y: 50000 }, ...] },
 *   { id: "Profit", color: "#0EA5E9", data: [{ x: "Jan", y: 12000 }, ...] },
 * ]
 * 
 * @param {string} title - Chart title
 * @param {string} xLegend - X axis legend text
 * @param {string} yLegend - Y axis legend text
 * @param {string} height - Chart height (default 400px)
 */

const LineChart = ({
  data,
  title = "Revenue, Profit & Loss Trend",
  xLegend = "Time Period",
  yLegend = "Amount (₹)",
  height = "400px",
}) => {
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
        <ResponsiveLine
          data={data}
          margin={{ top: 50, right: 120, bottom: 50, left: 70 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
          curve="monotoneX"
          enableGridX={false}
          axisBottom={{
            tickRotation: -15,
            legend: xLegend,
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            legend: yLegend,
            legendOffset: -50,
            legendPosition: "middle",
            format: (value) =>
              value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value,
          }}
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          useMesh
          colors={{ datum: "color" }}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              translateX: 100,
              itemsSpacing: 6,
              itemWidth: 80,
              itemHeight: 20,
              symbolSize: 14,
              symbolShape: "circle",
            },
          ]}
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
          }}
        />
      </div>
    </div>
  );
};

export default LineChart;

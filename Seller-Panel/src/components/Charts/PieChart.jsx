import React from "react";
import { ResponsivePie } from "@nivo/pie";

/**
 * PieChart Component
 * 
 * @param {Array} data - Array like:
 * [
 *   { id: "Art Kit", label: "Art Kit", value: 40, color: "#3e97c0" },
 *   { id: "Pencils", label: "Pencils", value: 30, color: "#16A34A" },
 * ]
 * 
 * @param {string} title - Chart title
 * @param {string} height - Chart height (default 350px)
 */

const PieChart = ({
  data,
  title = "Sales Distribution by Category",
  height = "350px",
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
        <ResponsivePie
          data={data}
          margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={(d) => d.data.color}
          borderWidth={1}
          borderColor={(d) => `${d.data.color}88`}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={(d) => d.data.color}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#fff"
          tooltip={({ datum }) => (
            <div
              style={{
                padding: "6px 10px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              <strong>{datum.id}</strong>: {datum.value}
            </div>
          )}
          theme={{
            legends: { text: { fill: "#333", fontSize: 13 } },
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

export default PieChart;

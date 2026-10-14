// src/components/Charts/CategoryPieChart.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { ResponsivePie } from "@nivo/pie";

const CategoryPieChart = ({
  title = "Revenue by Category",
  height = "380px",
}) => {
  const { categoryStats, isLoading, isError, message } = useSelector(
    (state) => state.stats
  );

  // 🔍 Debug logs
  console.log("🟢 CategoryPieChart - categoryStats:", categoryStats);
  console.log("🟢 CategoryPieChart - isLoading:", isLoading);

  // 🧠 Transform backend data → Nivo Pie format
  const chartData = useMemo(() => {
    if (!categoryStats || !Array.isArray(categoryStats) || categoryStats.length === 0) {
      console.warn("⚠️ No category data available");
      return [];
    }

    const colorPalette = [
      "#3e97c0ff",
      "#16A34A",
      "#54887fff",
      "#1b4c4aff",
      "#0EA5E9",
      "#8B5CF6",
      "#EC4899",
      "#F59E0B",
    ];

    const transformed = categoryStats.map((item, index) => ({
      id: item.category || `Category ${index + 1}`,
      label: item.category || `Category ${index + 1}`,
      value: item.revenue || 0,
      color: colorPalette[index % colorPalette.length],
    }));

    console.log("✅ CategoryPieChart - transformed data:", transformed);
    return transformed;
  }, [categoryStats]);

  // 📊 Handle loading
  if (isLoading) {
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
        <p style={{ textAlign: "center", color: "#20BFA5" }}>
          Loading category data...
        </p>
      </div>
    );
  }

  // 📊 Handle no data
  if (!chartData || chartData.length === 0) {
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
        <p style={{ textAlign: "center", color: "#888" }}>
          No category data available
        </p>
      </div>
    );
  }

  // 📊 Handle error
  if (isError) {
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
        <p style={{ textAlign: "center", color: "#e95a5a" }}>
          Error: {message || "Failed to load data"}
        </p>
      </div>
    );
  }

  // 🥧 Render Pie Chart
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          color: "#20BFA5",
          marginBottom: "20px",
          fontWeight: 600,
          fontSize: "20px",
        }}
      >
        {title}
      </h3>

      <div style={{ height, flex: 1 }}>
        <ResponsivePie
          data={chartData}
          margin={{ top: 20, right: 100, bottom: 20, left: 20 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={(d) => d.data.color}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#fff"
          arcLabel={(d) => `₹${(d.value / 1000).toFixed(1)}k`}
          legends={[
            {
              anchor: "right",
              direction: "column",
              justify: false,
              translateX: 90,
              translateY: 0,
              itemsSpacing: 8,
              itemWidth: 80,
              itemHeight: 20,
              itemTextColor: "#333",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 16,
              symbolShape: "circle",
            },
          ]}
          tooltip={({ datum }) => (
            <div
              style={{
                padding: "8px 12px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              <strong>{datum.id}</strong>
              <br />
              Revenue: ₹{datum.value.toLocaleString()}
              <br />
              Share:{" "}
              {(
                (datum.value /
                  chartData.reduce((sum, d) => sum + d.value, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
          )}
          theme={{
            legends: { text: { fill: "#333", fontSize: 12 } },
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

export default CategoryPieChart;
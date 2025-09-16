import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";


const PieChart = ({data = [] }) => {

 
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const apiPieData = Array.isArray(data) ? data : [];


  // Transform and sort data
  const transformedData = apiPieData
    .map((item) => ({
      id: `${item.district} (${item.stateShortName || ''})`,
      label: `${item.district} (${item.stateShortName || ''})`,
      value: item.schools
    }))
    .sort((a, b) => b.value - a.value) // sort descending
    .slice(0, 10); // only top 10

  return (
    <ResponsivePie
      data={transformedData}
      tooltip={({ datum }) => (
        <div
          style={{
            padding: "6px 12px",
            background: "#ffffff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            color: "#000000",
          }}
        >
          <strong>{datum.label}: {datum.value}</strong>
        </div>
      )}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.gray[100],
            },
          },
          legend: {
            text: {
              fill: colors.gray[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.gray[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.gray[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.gray[100],
          },
        },
      }}
      margin={{ top: 20, right: 100, bottom: 50, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.gray[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
    />
  );
};

export default PieChart;

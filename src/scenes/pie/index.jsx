import { Box } from "@mui/material";
import { Header, PieChart } from "../../components";
import {  useSelector } from "react-redux";

const Pie = () => {
  const { blockWiseSchoolCount, loadingBlockWise } = useSelector((state) => state.dashboard || {});

  return (
    <Box m="20px">
      <Header  subtitle="Schools Geography Wise"  />
      <Box height="25vh">
        <PieChart data = {blockWiseSchoolCount} />
      </Box>
    </Box>
  );
};

export default Pie;

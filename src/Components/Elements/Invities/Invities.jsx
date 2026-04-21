import React from "react";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import DestinationTabs from "./DestinationTabs";

const Invities = () => {
  
  const { resetHeaderTitle } = useHeaderTitle();
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  return (
    <>
      <DestinationTabs />
    </>
  );
};

export default Invities;

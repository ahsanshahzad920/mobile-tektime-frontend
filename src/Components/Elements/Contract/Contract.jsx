import React from "react";
import ContractTabs from "./ContractTabs";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
const Contract = () => {
  const { resetHeaderTitle } = useHeaderTitle();
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  return (
    <>
      <ContractTabs />
    </>
  );
};

export default Contract;

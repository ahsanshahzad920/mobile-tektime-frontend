import React from "react";
import EntrepriseTabs from "./EntrepriseTabs";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

const Enterprises = () => {
  const {resetHeaderTitle} = useHeaderTitle();
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  return (
    <>
      <EntrepriseTabs />
    </>
  );
}

export default Enterprises;

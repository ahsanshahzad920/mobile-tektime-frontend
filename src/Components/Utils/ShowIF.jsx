import React from "react";

const ShowIF = ({ condition, children }) => {
  return condition ? children : null;
};

export default ShowIF;

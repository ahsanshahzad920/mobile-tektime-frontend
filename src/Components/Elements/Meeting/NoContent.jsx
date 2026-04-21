import React from "react";

const NoContent = ({ title }) => {
  return (
    <div>
      <div className="custom-container">
        <h5 className="custom-heading">No {title} Available</h5>
      </div>
    </div>
  );
};

export default NoContent;

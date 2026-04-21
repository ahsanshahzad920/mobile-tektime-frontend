import React from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const LoadingButton = ({
  loading,
  onClick,
  children,
  variant = "primary",
  ...rest
}) => {
  return (
    <Button variant={variant} disabled={loading} onClick={onClick} {...rest}>
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-1"
          />
          {/*  */}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;

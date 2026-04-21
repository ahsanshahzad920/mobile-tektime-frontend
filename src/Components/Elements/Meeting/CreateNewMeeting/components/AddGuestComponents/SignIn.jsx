import React from "react";
import { useTranslation } from "react-i18next";

const Signin = ({ handleClose }) => {
  const [t] = useTranslation("global");

  const handleSave = () => {
    handleClose();
  };
  return (
    <div>
      <div className={`col-md-12 d-flex justify-content-end px-4 `}>
        {/* <button className={`btn moment-btn`} onClick={handleSave}>
          &nbsp;{t("meeting.formState.Save and Continue")}
        </button> */}
      </div>
    </div>
  );
};

export default Signin;

import React, { useState, useEffect } from "react";
import { useFormContext } from "../../../../../../context/CreateMeetingContext";
import { useTranslation } from "react-i18next";

const RegistrationModal = () => {
  const { meeting, formState, setFormState, getMeeting, checkId } =
    useFormContext();
    const [t] = useTranslation("global")

//   useEffect(() => {
//     if (checkId) {
//       getMeeting(checkId);
//     }
//   }, [checkId]);

  useEffect(() => {
    if (meeting) {
      setFormState((prevState) => ({
        ...prevState,
        price: meeting.price || 0,
        max_participants_register: meeting.max_participants_register || 0,
      }));
    }
  }, [meeting, setFormState]);
  return (
    <div className="container mt-4"style={{marginBlock:'1rem'}}>
      <form className="p-4 border rounded shadow-sm bg-light">
        <div className="mb-3">
          <label htmlFor="maxParticipants" className="form-label">
            {t("Maximum Participants")}:
          </label>
          <input
            type="number"
            className="form-control"
            id="maxParticipants"
            value={formState.max_participants_register}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                max_participants_register: e.target.value,
              }))
            }
            min="1"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            {t("Price")}:
          </label>
          <input
            type="number"
            className="form-control"
            id="price"
            value={formState.price}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                price: e.target.value,
              }))
            }
            min="0"
            required
          />
        </div>
      </form>
    </div>
  );
};

export default RegistrationModal;

import { RxCross2 } from "react-icons/rx";
import MomentDetail from "./components/MomentDetails";
import { useTranslation } from "react-i18next";
import Solution from "./components/Template";
import SolutionDateAndTime from "./components/SolutionDateAndTime";
import Location from "./components/Location";
import AddSteps from "./components/AddSteps";
import Options from "./components/Options";
import Privacy from "./components/Privacy";
import { useEffect, useState } from "react"; // Use local state
import Share from "./components/Share";
import { Modal, Button } from "react-bootstrap";
import { useSolutionFormContext } from "../../../../context/CreateSolutionContext";
import Casting from "./components/SolutionCasting";
import { toast } from "react-toastify";
import { useSteps } from "../../../../context/Step";

const NewSolutionModal = ({ meeting }) => {
  const [t] = useTranslation("global");
  const [activeTab, setActiveTab] = useState("tab1"); // Local state for tabs
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal
  const {
    formState,
    checkId,
    deleteSolution,
    handleInputBlur,
    saveDraft,
    open,
    handleCloseModal,
    isUpdated,
    isDuplicate,
    validateAndUpdate,
    addParticipant,
    changePrivacy,
    setAddParticipant,
    setCheckId,
    setMeeting,
    setIsUpdated,
  } = useSolutionFormContext();
  const { solutionSteps } = useSteps();

  const handleCancel = () => {
    setShowConfirmation(true);
  };

  const handleClose = () => {
    setShowConfirmation(false);
  };

  const handleDelete = () => {
    deleteSolution(checkId);
  };

  const isTabDisabled = (tabName) => {
    const tabOrder = ["tab1", "tab2", "tab4", "tab5", "tab6", "tab7", "tab8"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const tabIndex = tabOrder.indexOf(tabName);
    if (isUpdated || isDuplicate) {
      return false;
    }

    return tabIndex > currentIndex;
  };

  return (
    <>
      {open && (
        <div id="chart-container" className="chart-content">
          <div className="modal-overlay">
            <div className="new-meeting-modal">
              <div className="modal-nav">
                <div>
                  {
                    <>
                      <h4>
                        {isUpdated
                          ? t("solution.newMeeting.UpdateMoment")
                          : isDuplicate
                            ? t("solution.newMeeting.DuplicateMoment")
                            : addParticipant || changePrivacy
                              ? t("solution.newMeeting.Add new invite")
                              : t("solution.newMeeting.CreateMoment")}
                      </h4>
                      {!isUpdated &&
                        !isDuplicate &&
                        !addParticipant &&
                        !changePrivacy && (
                          <small style={{ padding: "10px", margin: "0px" }}>
                            {t("solution.newMeeting.CreateMomentDescription")}
                          </small>
                        )}
                    </>
                  }
                </div>
                <div className="d-flex justify-content-end">
                  <button className="cross-btn" onClick={handleCancel}>
                    <RxCross2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-3 modal-body">
                <div
                  className="col-md-11"
                  style={{ borderBottom: "2px solid #F2F2F2" }}
                >
                  <div
                    className="tabs justify-content-start"
                    style={{ padding: "0 33px" }}
                  >
                    <button
                      className={`tab ${activeTab === "tab1" ? "active" : ""}`}
                      onClick={() => setActiveTab("tab1")}
                      disabled={isTabDisabled("tab1")}
                    >
                      {t("solution.NewMeetingTabs.Mission")}
                    </button>
                    <button
                      className={`tab ${activeTab === "tab2" ? "active" : ""}`}
                      onClick={() => setActiveTab("tab2")}
                      disabled={isTabDisabled("tab2")}
                    >
                      {t("solution.NewMeetingTabs.Solution")}
                    </button>

                    <button
                      className={`tab ${activeTab === "tab4" ? "active" : ""}`}
                      onClick={() => setActiveTab("tab4")}
                      disabled={isTabDisabled("tab4")}
                    >
                      Location
                    </button>
                    <button
                      className={`tab ${activeTab === "tab5" ? "active" : ""}`}
                      onClick={() => setActiveTab("tab5")}
                      disabled={isTabDisabled("tab5")}
                    >
                      {t("solution.NewMeetingTabs.Add Guest")}
                    </button>
                    <button
                      className={`tab ${activeTab === "tab6" ? "active" : ""}`}
                      onClick={() => setActiveTab("tab6")}
                      disabled={isTabDisabled("tab6")}
                    >
                      {t("solution.NewMeetingTabs.Add Step")}
                    </button>
                    <button
                      className={`tab ${activeTab === "tab7" ? "active" : ""}`}
                      onClick={() => {
                        const isStepRequired =
                          formState.location === "Google Meet" ||
                          formState.agenda === "Google Agenda" ||
                          formState.agenda === "Outlook Agenda";
                        // if (
                        //   isStepRequired &&
                        //   (!solutionSteps || solutionSteps.length === 0)
                        // ) {
                        //   toast.error(
                        //     t(
                        //       "For the Agenda Creation At least one step is required",
                        //     ),
                        //   );
                        //   return;
                        // }
                        setActiveTab("tab7");
                      }}
                      disabled={isTabDisabled("tab7")}
                    >
                      {t("solution.NewMeetingTabs.Options")}
                    </button>
                    <button
                      className={`tab ${activeTab === "tab8" ? "active" : ""}`}
                      onClick={() => {
                        const isStepRequired =
                          formState.location === "Google Meet" ||
                          formState.agenda === "Google Agenda" ||
                          formState.agenda === "Outlook Agenda";
                        // if (
                        //   isStepRequired &&
                        //   (!solutionSteps || solutionSteps.length === 0)
                        // ) {
                        //   toast.error(
                        //     t(
                        //       "For the Agenda Creation At least one step is required",
                        //     ),
                        //   );
                        //   return;
                        // }
                        setActiveTab("tab8");
                      }}
                      disabled={isTabDisabled("tab8")}
                    >
                      {t("solution.NewMeetingTabs.Privacy")}
                    </button>
                  </div>
                </div>
                <div>
                  {activeTab === "tab1" && (
                    <MomentDetail
                      setActiveTab={setActiveTab}
                      meeting={meeting}
                    />
                  )}
                  {activeTab === "tab2" && (
                    <Solution setActiveTab={setActiveTab} meeting={meeting} />
                  )}
                  {/* {activeTab === "tab3" && (
                    <SolutionDateAndTime setActiveTab={setActiveTab} />
                  )} */}
                  {activeTab === "tab4" && (
                    <Location setActiveTab={setActiveTab} />
                  )}
                  {activeTab === "tab5" && (
                    <Casting
                      setActiveTab={setActiveTab}
                      closeModal={handleCloseModal}
                      meeting={meeting}
                    />
                  )}
                  {activeTab === "tab6" && (
                    <AddSteps setActiveTab={setActiveTab} meeting={meeting} />
                  )}
                  {activeTab === "tab7" && (
                    <Options setActiveTab={setActiveTab} meeting={meeting} />
                  )}
                  {activeTab === "tab8" && (
                    <Privacy
                      setActiveTab={setActiveTab}
                      closeModal={handleCloseModal}
                      meeting={meeting}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <Modal
            show={showConfirmation}
            onHide={handleClose}
            dialogClassName="custom-modal-size custom-modal-border cancel-moment-modal modal-dialog-centered"
          >
            <Modal.Header closeButton className="border-0"></Modal.Header>
            <Modal.Body className="text-center p-4">
              <h2 className="w-100 text-center fs-5">{t("Are you sure")}</h2>
              <p className="mb-4" style={{ color: "#92929D" }}>
                {isUpdated || isDuplicate
                  ? ""
                  : addParticipant || changePrivacy
                    ? ""
                    : t("saveAndDraftText")}
              </p>
              <div className="d-flex justify-content-center gap-3 mb-3">
                {isUpdated || addParticipant || changePrivacy ? (
                  <Button
                    variant="outline-danger"
                    className="px-4 py-2 confirmation-delete"
                    onClick={handleCloseModal}
                  >
                    {t("Cancel")}
                  </Button>
                ) : (
                  <Button
                    variant="outline-danger"
                    className="px-4 py-2 confirmation-delete"
                    onClick={handleDelete}
                  >
                    {t("Delete")}
                  </Button>
                )}
                <Button
                  variant="primary"
                  className="px-4 py-2 confirmation-save"
                  onClick={
                    isDuplicate || isUpdated
                      ? validateAndUpdate
                      : addParticipant || changePrivacy
                        ? validateAndUpdate
                        : saveDraft
                  }
                >
                  {isUpdated || isDuplicate
                    ? t("Save Solution")
                    : addParticipant || changePrivacy
                      ? t("Save Solution")
                      : t("Save Draft")}
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </>
  );
};

export default NewSolutionModal;

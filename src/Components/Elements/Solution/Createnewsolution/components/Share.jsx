import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
// import StepChart from "../../StepChart";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import { toast } from "react-toastify";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { useSolutions } from "../../../../../context/SolutionsContext";
import { useNavigate } from "react-router-dom";

const Share = ({ setActiveTab }) => {
  const [t] = useTranslation("global");
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const closeModal = () => setShow(false);
  const {
    formState,
    setFormState,
    handleInputBlur,
    solution,
    isUpdated,
    handleCloseModal,
    checkId
  } = useSolutionFormContext();
  const { getDraftSolutions,getPrivateSolutions,getPublicSolutions,getEnterpriseSolutions,getTeamSolutions } = useSolutions();
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false); // Loading state
  const [loadingQuit, setLoadingQuit] = useState(false);

  const [selectedCard, setSelectedCard] = useState(null);

  const singleOption = {
    value: "email",
    label: t("meeting.formState.shareMoment"),
    svg: (
      <svg
        width="30px"
        height="30px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z"
          fill="#3D57B5"
        />
      </svg>
    ),
  };

  // Load meeting data into form when available
  useEffect(() => {
    if (solution) {
      setFormState((prevState) => ({
        ...prevState,
        share_by: solution?.share_by || "",
      }));

      if (solution?.share_by === singleOption.value) {
        setSelectedCard(0);
      }
    }
  }, [solution, setFormState]);

  // Handle card click
  const handleCardClick = () => {
    if (selectedCard === 0) {
      setSelectedCard(null);
      setFormState((prevState) => ({
        ...prevState,
        share_by: "",
      }));
    } else {
      setSelectedCard(0);
      setFormState((prevState) => ({
        ...prevState,
        share_by: singleOption.value,
      }));
    }
  };
  // Validation function
  const validateForm = () => {
    let validationErrors = {};

    if (!formState.share_by) {
      validationErrors.share_by = "email";
      toast.error(validationErrors.share_by);
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    // if (validateForm()) {
    // await handleInputBlur();
    // setActiveTab("tab9");
    // }
    setLoading(true); // Show loader
    try {
      await handleInputBlur();
      setActiveTab("tab9");
    } catch (error) {
      // Handle error (if any)
      toast.error("Error occurred");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const handleSaveAndQuit = async () => {
    if (validateForm()) {
      setLoadingQuit(true); // Show loader
      try {
        await handleInputBlur();
        // setActiveTab("tab2");
        handleCloseModal();
      } catch (error) {
        // Handle error (if any)
        toast.error("Error occurred");
      } finally {
        setLoadingQuit(false); // Hide loader
        navigate(`/solution/${checkId}`)

        // // await getSolutions();
        // getPrivateSolutions();
        // getPublicSolutions();
        // getTeamSolutions();
        // getEnterpriseSolutions();
        // getDraftSolutions();
      }
    }
  };
  return (
    <div className=" col-md-12 mt-1 p-4 modal-height">
      <div className="modal-body">
        <Row className="mb-4">
          <Col xs={12}>
            <div
              className="d-flex justify-content-between align-items-center modal-tab-button p-1 px-3"
              onClick={handleCardClick}
              style={{
                border: selectedCard === 0 ? "2px solid blue" : "none",
                cursor: "pointer",
              }}
            >
              <div className="d-flex align-items-center">
                {singleOption.svg}

                <span
                  className="solutioncards"
                  style={{ color: "#3D57B5", marginLeft: "8px" }}
                >
                  {singleOption.label}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 30 30"
                width="30px"
                height="30px"
              >
                <path
                  d="M 23 3 A 4 4 0 0 0 19 7 A 4 4 0 0 0 19.09375 7.8359375 L 10.011719 12.376953 A 4 4 0 0 0 7 11 A 4 4 0 0 0 3 15 A 4 4 0 0 0 7 19 A 4 4 0 0 0 10.013672 17.625 L 19.089844 22.164062 A 4 4 0 0 0 19 23 A 4 4 0 0 0 23 27 A 4 4 0 0 0 27 23 A 4 4 0 0 0 23 19 A 4 4 0 0 0 19.986328 20.375 L 10.910156 15.835938 A 4 4 0 0 0 11 15 A 4 4 0 0 0 10.90625 14.166016 L 19.988281 9.625 A 4 4 0 0 0 23 11 A 4 4 0 0 0 27 7 A 4 4 0 0 0 23 3 z"
                  fill="#3D57B5"
                />
              </svg>
            </div>
          </Col>
        </Row>
      </div>
      <div
        className={`modal-footer d-flex justify-content-end modal-save-button gap-4`}
      >
        {isUpdated && (
          <Button
            variant="danger"
            // className="btn "
            onClick={handleSaveAndQuit}
            disabled={loadingQuit}
            style={{ padding: "9px" }}
          >
            {loadingQuit ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "white",
                    margin: "5px 82px",
                  }}
                />
              </>
            ) : (
              <>
                &nbsp;{t("meeting.formState.Save and Quit")}
                {/* <span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.4707 8.52991C13.397 8.46125 13.3379 8.37845 13.2969 8.28645C13.2559 8.19445 13.2338 8.09513 13.2321 7.99443C13.2303 7.89373 13.2488 7.7937 13.2865 7.70031C13.3243 7.60692 13.3804 7.52209 13.4516 7.45087C13.5228 7.37965 13.6077 7.32351 13.7011 7.28579C13.7945 7.24807 13.8945 7.22954 13.9952 7.23132C14.0959 7.23309 14.1952 7.25514 14.2872 7.29613C14.3792 7.33712 14.462 7.39622 14.5307 7.46991L18.5307 11.4699C18.6711 11.6105 18.75 11.8012 18.75 11.9999C18.75 12.1987 18.6711 12.3893 18.5307 12.5299L14.5307 16.5299C14.462 16.6036 14.3792 16.6627 14.2872 16.7037C14.1952 16.7447 14.0959 16.7667 13.9952 16.7685C13.8945 16.7703 13.7945 16.7518 13.7011 16.714C13.6077 16.6763 13.5228 16.6202 13.4516 16.549C13.3804 16.4778 13.3243 16.393 13.2865 16.2996C13.2488 16.2062 13.2303 16.1062 13.2321 16.0055C13.2338 15.9048 13.2559 15.8055 13.2969 15.7135C13.3379 15.6215 13.397 15.5387 13.4707 15.4699L16.1907 12.7499H6C5.80109 12.7499 5.61032 12.671 5.46967 12.5303C5.32902 12.3897 5.25 12.1989 5.25 11.9999C5.25 11.801 5.32902 11.6103 5.46967 11.4696C5.61032 11.329 5.80109 11.2499 6 11.2499H16.1907L13.4707 8.52991Z"
                      fill="white"
                    />
                  </svg>
                </span> */}
              </>
            )}
          </Button>
        )}
        <button
          className={`btn moment-btn`}
          onClick={handleSaveAndContinue}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "white",
                  margin: "5px 82px",
                }}
              />
            </>
          ) : (
            <>
              &nbsp;{t("meeting.formState.Save and Continue")}
              <span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.4707 8.52991C13.397 8.46125 13.3379 8.37845 13.2969 8.28645C13.2559 8.19445 13.2338 8.09513 13.2321 7.99443C13.2303 7.89373 13.2488 7.7937 13.2865 7.70031C13.3243 7.60692 13.3804 7.52209 13.4516 7.45087C13.5228 7.37965 13.6077 7.32351 13.7011 7.28579C13.7945 7.24807 13.8945 7.22954 13.9952 7.23132C14.0959 7.23309 14.1952 7.25514 14.2872 7.29613C14.3792 7.33712 14.462 7.39622 14.5307 7.46991L18.5307 11.4699C18.6711 11.6105 18.75 11.8012 18.75 11.9999C18.75 12.1987 18.6711 12.3893 18.5307 12.5299L14.5307 16.5299C14.462 16.6036 14.3792 16.6627 14.2872 16.7037C14.1952 16.7447 14.0959 16.7667 13.9952 16.7685C13.8945 16.7703 13.7945 16.7518 13.7011 16.714C13.6077 16.6763 13.5228 16.6202 13.4516 16.5489C13.3804 16.4777 13.3243 16.3929 13.2865 16.2995C13.2488 16.2061 13.2303 16.1061 13.2321 16.0054C13.2338 15.9047 13.2559 15.8054 13.2969 15.7134C13.3379 15.6214 13.397 15.5386 13.4707 15.4699L16.1907 12.7499H6.50066C6.30175 12.7499 6.11098 12.6709 5.97033 12.5302C5.82968 12.3896 5.75066 12.1988 5.75066 11.9999C5.75066 11.801 5.82968 11.6102 5.97033 11.4696C6.11098 11.3289 6.30175 11.2499 6.50066 11.2499H16.1907L13.4707 8.52991Z"
                    fill="white"
                  />
                </svg>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Share;

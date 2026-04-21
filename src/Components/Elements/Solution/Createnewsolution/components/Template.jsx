import CookieService from '../../../../Utils/CookieService';
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getOptions } from "../../../../Utils/MeetingFunctions";
import { useSolutions } from "../../../../../context/SolutionsContext";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { useNavigate } from "react-router-dom";

const CustomComponent = ({ setActiveTab }) => {
  const {
    formState,
    setFormState,
    handleInputBlur,
    solution,
    getSolution,
    checkId,
    isUpdated,
    handleCloseModal,
  } = useSolutionFormContext();
  const { getPrivateSolutions, getDraftSolutions, getTeamSolutions, getEnterpriseSolutions, getPublicSolutions } = useSolutions();

  const [selectedTab, setSelectedTab] = useState("scratch");
  const [t] = useTranslation("global");
  const [errors, setErrors] = useState({});
  const user = JSON.parse(CookieService.get("user"));
  const roleId = parseInt(user?.role_id);
  const options = getOptions(t, roleId);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const navigate = useNavigate()
  useLayoutEffect(() => {
    if (checkId) {
      getSolution(checkId);
    }
  }, [checkId]);

  useEffect(() => {
    if (solution) {
      setFormState((prevState) => ({
        ...prevState,
        type: solution?.type || "",
      }));
    }
  }, [solution, setFormState]);

  useEffect(() => {
    if (formState.type) {
      const selectedIdx = options.findIndex(
        (item) => item.title === formState.type
      );
      setSelectedCard(selectedIdx);
    }
  }, [formState.type, options]);

  const handleCardClick = (idx, title) => {
    setSelectedCard(idx);
    setFormState((prevState) => ({
      ...prevState,
      type: title,
    }));
  };
  const validateForm = () => {
    let validationErrors = {};

    if (!formState.type) {
      validationErrors.type = t("meeting.formState.type");
      toast.error(validationErrors.type);
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  const handleSaveAndContinue = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        await handleInputBlur();
        setActiveTab("tab4");
      } catch (error) {
        toast.error("Error occurred");
      } finally {
        setLoading(false);
      }
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
        //   // await getSolutions();
        //   getPrivateSolutions();
        //  getPublicSolutions();
        //  getTeamSolutions();
        //  getEnterpriseSolutions();
        //  getDraftSolutions();
      }
    }
  };
  const sortedOptions = options?.sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="col-md-12 mt-1 p-4 modal-height">
      <Row className="g-3 mb-3">
        {sortedOptions?.map((item, idx) => (
          <Col
            xs={6}
            sm={4}
            md={3}
            lg={2}
            key={idx}
            className="d-flex justify-content-center"
          >
            <Card
              className="text-center shadow-sm"
              style={{
                borderRadius: "10px",
                height: "138px",
                width: "100%",
                maxWidth: "138px", // Set max width
                background: "none",
                cursor: "pointer",
                border: selectedCard === idx ? "2px solid blue" : "none",
                transform: "scale(1.1)", // Scale the card size up
                transition: "transform 0.2s ease-in-out", // Smooth transition on hover
              }}
              onClick={() => handleCardClick(idx, item.title)}
            >
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                {item.svg}
                <Card.Title
                  className="mt-2 solutioncards"
                  style={{ textAlign: "center", wordBreak: "break-word" }}
                >
                  {item.label}
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
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
          className="btn moment-btn"
          onClick={handleSaveAndContinue}
          disabled={loading}
          style={{padding:'0px 10px '}}

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
              <span className="ms-2">
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

export default CustomComponent;

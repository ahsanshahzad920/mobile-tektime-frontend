import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Modal, ProgressBar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaArrowRight } from "react-icons/fa";
import ParticipantCardProfile from "../Profile/ParticipantCardProfile";
import { IoArrowBackSharp } from "react-icons/io5";
import {
  getTimeZoneAbbreviation,
  userTimeZone,
  convertDateToUserTimezone,
  convertTo12HourFormat,
  timezoneSymbols,
} from "../Meeting/GetMeeting/Helpers/functionHelper";
import { convertToUserTimeZone } from "../../Utils/MeetingFunctions";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const isMarkdownContent = (content) => {
  if (!content) return false;
  const hasMarkdownBlock = content.includes("```") || content.includes("'''markdown");
  const hasHeaders = /#{1,6}\s/.test(content);
  // const hasBold = /\*\*[^*]+\*\*/.test(content); // Bold check might be too aggressive for just text, but ok for now
  // Check for common markdown indicators
  const hasList = /^(\s*[-*+]|\d+\.)\s/m.test(content);
  return hasMarkdownBlock || hasHeaders || hasList;
};

const cleanText = (text) => {
  if (!text) return "";
  let cleaned = text;
  // Handle '''markdown or ```markdown prefix
  cleaned = cleaned.replace(/^'''markdown\s*/i, "").replace(/^```markdown\s*/i, "");
  // Handle closing ''' or ```
  cleaned = cleaned.replace(/'''\s*$/, "").replace(/```\s*$/, "");
  return cleaned.trim();
};

function AddQuestionField({ data }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const questionFromURL = queryParams.get("question"); // Extract 'question' from URL
  const userId = parseInt(CookieService.get("user_id")); // Replace with dynamic user ID if needed
  const [isLoading, setIsLoading] = useState(false);
  const [t] = useTranslation("global");
  const { id: messageId } = useParams();
  const [questionResponse, setQuestionResponse] = useState(null);
  console.log('questionResponse', questionResponse)
  const [selectedQuestionId, setSelectedQuestionId] = useState(null); // Track selected question
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState("");
  const timeZoneAbbr = getTimeZoneAbbreviation(userTimeZone);
  const getTimezoneSymbol = (timezone) => timezoneSymbols[timezone] || timezone;


  //States For Guide Section
  const [isUser, setIsUser] = useState(false);
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [id, setId] = useState(null);


  // const handleCardClick = (citation) => {
  //   setSelectedCitation(citation);
  //   setShowModal(true);
  // };

  const handleCardClick = (citation) => {
    setSelectedCitation(citation);
    setShowModal(true);
  };

  const openInNewTab = (citation) => {
    window.open(citation, "_blank");
  };

  function convertToUserTimeZone(date) {
    if (!date) {
      console.error("Invalid date provided:", date);
      return "Invalid date"; // or handle gracefully
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      console.error("Could not parse date:", date);
      return "Invalid date";
    }

    return parsedDate.toLocaleString(); // Convert to local timezone
  }



  const askQuestion = async (question) => {
    setIsLoading(true);
    setProgress(0);
    setShowProgressBar(true);

    let progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          clearInterval(progressInterval);
          return oldProgress;
        }
        return oldProgress + 10;
      });
    }, 500);

    try {
      const response = await axios.post(`${API_BASE_URL}/ask-question`, {
        question,
        user_id: userId,
      });

      if (response.status) {
        setQuestionResponse(response?.data?.data);
      }
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      clearInterval(progressInterval);
      setProgress(100); // Ensure full progress on completion
      setTimeout(() => setShowProgressBar(false), 500); // Hide progress bar after a delay
      setIsLoading(false);
    }
  };

  const fetchMessageDetail = async (id) => {
    setIsLoading(true);
    setProgress(0);
    setShowProgressBar(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const response = await axios.get(`${API_BASE_URL}/assistant/${id}`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.data && response.data.status) {
        const apiData = response.data.data;
        console.log('apiData', apiData)
        const normalizedData = {
          ...apiData?.selected_message,
          citation: apiData?.selected_message?.source,
          user: {
            ...apiData?.selected_message?.user,
            questions: apiData?.related_messages?.filter(item => item?.question !== null)?.map((m) => ({
              ...m,
              citation: m.source,
            })),
          },
        };
        setQuestionResponse(normalizedData);
      }
    } catch (error) {
      console.error("Error fetching message detail:", error);
    } finally {
      setProgress(100);
      setTimeout(() => {
        setShowProgressBar(false);
        setIsLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (messageId) {
      fetchMessageDetail(messageId);
    } else if (questionFromURL) {
      askQuestion(questionFromURL);
    }
  }, [messageId, questionFromURL]);

  // Set default selected question to the last asked question
  useEffect(() => {
    if (messageId) {
      setSelectedQuestionId(parseInt(messageId));
    } else if (questionResponse?.user?.questions?.length > 0) {
      const lastQuestion =
        questionResponse.user.questions[
        questionResponse.user.questions.length - 1
        ];
      setSelectedQuestionId(lastQuestion.id);
    }
  }, [questionResponse, messageId]);

  const selectedQuestion =
    questionResponse?.user?.questions?.find(
      (item) => item.id === selectedQuestionId
    ) || questionResponse; // Default to latest question if none is selected


  const handleHostShow = () => {
    setShowHostProfile(true);
  };

  const handleHide = () => {
    setShowHostProfile(false);
  };
  const handleShowProfile = (userId) => {
    setId(userId);
    handleHostShow();
    setIsUser(true);
  };

  return (
    <>
      {showProgressBar && (
        <div className="progress-overlay">
          <div style={{ width: "50%" }}>
            <ProgressBar now={progress} animated />
          </div>
        </div>
      )}
      {!showProgressBar && (
        <div className="p-3 addquestion pb-5">
          <div className="d-flex align-items-center justify-content-between">
            <h5
              className="content-heading-title"
              dangerouslySetInnerHTML={{ __html: selectedQuestion?.question }}
            />
          </div>

          {/* Meeting Date & Time */}
          <div className="d-flex align-items-center gap-2 mt-3">
            <img
              src="/Assets/invite-date.svg"
              height="28px"
              width="28px"
              alt="Calendar"
            />
            <span className="fw-bold formate-date">
              {new Date(selectedQuestion?.created_at).toLocaleDateString(
                "en-GB"
              )}
            </span>
            <span className="fw-bold">{t("at")}</span>
            <span className="fw-bold formate-time">
              {new Date(selectedQuestion?.created_at)
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hourCycle: "h23",
                })
                .replace(":", "h")}
            </span>
          </div>

          {/* Which user ask question */}
          <div className="mt-4">
            <h4 className="participant-heading-meeting border p-3 m-0 rounded-5">
              {showHostProfile && (
                <IoArrowBackSharp
                  onClick={handleHide}
                  size={25}
                  style={{
                    cursor: "pointer",
                    marginRight: "1rem",
                  }}
                />
              )}
              Guide
            </h4>
            {showHostProfile ? (
              <div>
                <ParticipantCardProfile
                  userId={id}
                  handleHide={handleHide}
                  isUser={isUser}
                />
              </div>
            ) : (
              <div className="row guide-bg m-1 rounded-5">
                <div className="col-md-3 my-3 p-3">
                  <div
                    class="participant-card participant-card-meeting position-relative card rounded-4"
                    style={{ marginTop: "4rem" }}
                  >
                    <div class="card-body" style={{ padding: "20px 0px" }}>
                      <div class="d-flex justify-content-center">
                        <div class="participant-card-position">
                          <div class="profile-logo">
                            <img
                              class="card-img user-img"
                              src={
                                Assets_URL + "/" + questionResponse?.user?.image
                              }
                              alt="Guide Avatar"
                            />
                            <img
                              class="card-img logout-icon"
                              src="/Assets/Avatar_company.svg"
                              height="20px"
                              width="20px"
                              alt="tektime"
                            />
                            <img
                              class="card-img logout-icon"
                              src="/Assets/Avatar_company.svg"
                              height="20px"
                              width="20px"
                              alt="Company Logo"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="text-center mt-4 card-heading card-title h5">
                        {questionResponse?.user?.full_name}
                      </div>
                      <div class="mb-2 card-subtext card-subtitle h6">
                        {questionResponse?.user?.post}
                      </div>
                      <div class="visiting-card-link">
                        <span
                          onClick={() => {
                            handleShowProfile(
                              questionResponse?.user?.nick_name
                            );
                          }}
                        >
                          {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question */}
          <div className="mt-4">
            <h4 className="participant-heading-meeting border p-3 rounded-5">
              Question
            </h4>
            <div className={`p-3 rounded-4 mt-3 card`}>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-1 text-center px-0">
                    <span className="question-indexnumber">01</span>
                  </div>
                  <div className="col-md-11 ps-0">
                    <h4
                      className="step-card-heading card-title"
                      dangerouslySetInnerHTML={{ __html: selectedQuestion?.question }}
                    />

                    <div className="mt-4 d-flex gap-3 align-items-center flex-wrap">
                      <div className="d-flex gap-2 align-items-center mt-0 mt-md-5">
                        <img
                          src={Assets_URL + "/" + questionResponse?.user?.image}
                          className="avator-img"
                          alt="User Avatar"
                        />
                        <p className="user-heading m-0">
                          {questionResponse?.user?.full_name}
                        </p>
                      </div>
                      {/* <div className="d-flex align-items-center gap-2 mt-3">
                        <img
                          src="/Assets/invite-date.svg"
                          height="28px"
                          width="28px"
                          alt="Calendar"
                        />
                        <span className="fw-bold formate-date">
                          {new Date(selectedQuestion?.created_at).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                        <span className="fw-bold">{t("at")}</span>
                        <span className="fw-bold formate-time">
                          {new Date(selectedQuestion?.created_at)
                            .toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hourCycle: "h23",
                            })
                            .replace(":", "h")}
                        </span>
                      </div> */}
                      <div className="d-flex align-items-center gap-1 mt-0 mt-md-5">
                        <img
                          height="16px"
                          width="16px"
                          src="/Assets/ion_time-outline.svg"
                        />
                        {/* <span className="formate-time user-heading">
                          {new Date(
                            selectedQuestion?.created_at
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span> */}
                        <span className="formate-date user-heading">
                          {new Date(selectedQuestion?.created_at).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                        <span className="formate-date user-heading">{t("at")}</span>
                        <span className="formate-time user-heading">
                          {new Date(selectedQuestion?.created_at)
                            .toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hourCycle: "h23",
                            })
                            .replace(":", "h")}
                        </span>
                        <span className="user-heading ms-2">
                          {getTimezoneSymbol(CookieService.get("timezone"))}
                        </span>
                      </div>
                      {/* <div className="d-flex align-items-center gap-1 mt-0 mt-md-5">
                        <img
                          src="/Assets/invite-date.svg"
                          height="28px"
                          width="28px"
                          alt="Calendar"
                        />
                        <span className="formate-time user-heading">
                          {new Date(selectedQuestion?.created_at).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                        <span className="formate-time user-heading">
                          {`${convertToUserTimeZone(selectedQuestion?.created_at)} ${timeZoneAbbr}`}
                        </span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Response */}
          <div className="mt-4">
            <h4 className="participant-heading-meeting border p-3 rounded-5">
              {t("Response")}
            </h4>
            {questionResponse?.user?.questions?.map(
              (item, index) =>
                selectedQuestionId === item.id && (
                  <div key={item.id}>
                    {isMarkdownContent(item?.answer) ? (
                      <div className="rendered-content markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                            a: ({ node, ...props }) => <a className="text-primary text-break" target="_blank" rel="noopener noreferrer" {...props} />,
                            ul: ({ node, ...props }) => <ul className="mb-2 ps-3" {...props} />,
                            ol: ({ node, ...props }) => <ol className="mb-2 ps-3" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            code: ({ node, inline, ...props }) =>
                              inline
                                ? <code className="bg-light px-1 rounded text-danger" {...props} />
                                : <code className="d-block bg-light p-2 rounded text-dark overflow-auto" {...props} />,
                            pre: ({ node, ...props }) => <pre className="m-0" {...props} />,
                            h1: ({ node, ...props }) => <h3 className="h4 fw-bold mt-3 mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h4 className="h5 fw-bold mt-3 mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h5 className="h6 fw-bold mt-2 mb-2" {...props} />,
                          }}
                        >
                          {cleanText(item?.answer)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div
                        className="rendered-content"
                        dangerouslySetInnerHTML={{
                          __html: item?.answer,
                        }}
                      />
                    )}
                  </div>
                )
            )}
          </div>

          {/* Source */}
          <div className="mt-4">
            <h4 className="participant-heading-meeting border p-3 rounded-5">
              Source
            </h4>
            <div className="row justify-content-center">
              <div className="col-md-6">
                {questionResponse?.user?.questions?.map(
                  (item, index) =>
                    selectedQuestionId === item.id && (
                      <div key={item.id} className="text-center">
                        <div
                          className="card rounded-0 border-0 question-cardshadow"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleCardClick(item?.citation)}
                        >
                          <div className="card-body"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering modal
                              openInNewTab(item?.citation);
                            }}
                          >
                            <div className="row w-100">
                              <div className="col-md-10 col-10">
                                {item?.citation}
                              </div>
                              <div className="col-md-2 col-2 text-end">
                                <svg
                                  stroke="currentColor"
                                  fill="currentColor"
                                  stroke-width="0"
                                  viewBox="0 0 24 24"
                                  height="26"
                                  width="26"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          {/* Question List */}
          <div className="mt-4">
            <h4 className="participant-heading-meeting border p-3 rounded-5">
              {t("History")}
            </h4>
            {/* {questionResponse?.user?.questions?.map((item, index) => ( */}
            {questionResponse?.user?.questions
              ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort in descending order
              .map((item, index) => (
                <div key={item?.id}>
                  <div
                    style={{ cursor: "pointer" }}
                    className={`p-3 rounded-4 mt-3 card ${selectedQuestionId === item.id ? "active-question" : ""
                      }`}
                    onClick={() => setSelectedQuestionId(item.id)}
                  >
                    <div
                      className="card-body"
                      onClick={() => {
                        setSelectedQuestionId(item.id);
                        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top smoothly
                      }}
                    >
                      <div className="row">
                        <div className="col-md-1 text-center px-0">
                          <span className="question-indexnumber">
                            {index < 10 ? "0" : ""}
                            {index + 1}
                          </span>
                        </div>
                        <div className="col-md-11 ps-0">
                          <h4
                            className="step-card-heading card-title"
                            dangerouslySetInnerHTML={{ __html: item?.question }}
                          />

                          <div className="mt-4 d-flex gap-3 align-items-center flex-wrap">
                            <div className="d-flex gap-2 align-items-center mt-0 mt-md-5">
                              <img
                                src={
                                  Assets_URL + "/" + questionResponse?.user?.image
                                }
                                className="avator-img"
                                alt="User Avatar"
                              />
                              <p className="user-heading m-0">
                                {questionResponse?.user?.full_name}
                              </p>
                            </div>
                            {/* <div className="d-flex align-items-center gap-1 mt-0 mt-md-5">
                              <img
                                height="16px"
                                width="16px"
                                src="/Assets/ion_time-outline.svg"
                              />
                              <span className="formate-time user-heading">
                                {new Date(item?.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div> */}
                            <div className="d-flex align-items-center gap-1 mt-0 mt-md-5">
                              <img
                                height="16px"
                                width="16px"
                                src="/Assets/ion_time-outline.svg"
                              />
                              <span className="formate-date user-heading">
                                {new Date(item?.created_at).toLocaleDateString(
                                  "en-GB"
                                )}
                              </span>
                              <span className="formate-date user-heading">{t("at")}</span>
                              <span className="formate-time user-heading">
                                {new Date(item?.created_at)
                                  .toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hourCycle: "h23",
                                  })
                                  .replace(":", "h")}
                              </span>
                              <span className="user-heading ms-2">
                                {getTimezoneSymbol(CookieService.get("timezone"))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Source modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        fullscreen
        centered
      >
        <Modal.Header
          onClick={() => setShowModal(false)}
          style={{ cursor: "pointer" }}
        >
          <div className="row w-100">
            <div className="col-md-7 col-6">
              <h4
                className="step-card-heading text-end"
                dangerouslySetInnerHTML={{ __html: selectedQuestion?.question }}
              />
            </div>
            <div className="col-md-4 col-6 text-end">
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 24 24"
                height="26"
                width="26"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0V0z"></path>
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
              </svg>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedCitation ? (
            <iframe
              src={selectedCitation}
              style={{ width: "99%", height: "80vh", border: "none" }}
            ></iframe>
          ) : (
            <p>No preview available</p>
          )}
        </Modal.Body>
      </Modal>
      {/* End source modal */}
    </>
  );
}

export default AddQuestionField;

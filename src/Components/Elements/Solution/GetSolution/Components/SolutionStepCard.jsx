import CookieService from '../../../../Utils/CookieService';
import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import moment from "moment";
import { AiOutlinePlaySquare } from "react-icons/ai";
import { PiFilePdfLight } from "react-icons/pi";
import { IoCopyOutline, IoVideocamOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { HiUserCircle } from "react-icons/hi2";
import {
  MdInsertPhoto,
  MdKeyboardArrowDown,
  MdOutlinePhotoSizeSelectActual,
} from "react-icons/md";
import { FaFileExcel, FaVideo } from "react-icons/fa";
// import { useSolutionFormContext } from "../../../context/CreateMeetingContext";
import { toast } from "react-toastify";
import { RiFileExcel2Line } from "react-icons/ri";
import Spreadsheet from "react-spreadsheet";
import { read, utils } from "xlsx";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  formatStepDate,
  openGoogleMeet,
} from "../../../../Utils/MeetingFunctions";
import { useSidebarContext } from "../../../../../context/SidebarContext";
import { useSteps } from "../../../../../context/Step";
import { Assets_URL, API_BASE_URL } from "../../../../Apicongfig";

const LazyStepChart = lazy(() => import("../../Createnewsolution/StepChart"));

const SolutionStepCard = ({
  data,
  startTime,
  users,
  fromMeeting,
  meeting1,
}) => {
  const { setCall } = useSolutionFormContext();
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  const { solutionSteps, updateSolutionSteps } = useSteps();
  const [t] = useTranslation("global");
  const [meeting, setMeeting] = useState();
  const navigate = useNavigate();
  const { id } = useParams();
  const params = useParams();
  const { meeting_id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toggle, show } = useSidebarContext();
  const [stepId, setStepId] = useState(null);
  const [stepIndex, setStepIndex] = useState(null);
  const { setIsUpdated } = useSolutionFormContext();
  const [isDrop, setIsDrop] = useState(false);
  const [excelData, setExcelData] = useState(null);
  console.log("excelData", excelData);
  const [inProgressStep, setInProgressStep] = useState(null);
  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
    toggle(true);
  };
  useEffect(() => {
    const getMeeting = async () => {
      // setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/solutions/${id || meeting_id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        if (response.status) {
          updateSolutionSteps(response?.data?.data?.solution_steps);
          setMeeting(response.data?.data);
        }
      } catch (error) {
        console.log("error while fetching meeting data", error);
      } finally {
      }
    };
    getMeeting();
  }, [id, meeting_id, toggle]);
  const userId = parseInt(CookieService.get("user_id"));
  const [loading, setLoading] = useState(false);


  const [doneMomentsModal, setDoneMomentsModal] = useState(null);

  const toggleModal = async (id) => {
    setDoneMomentsModal((prev) => (prev === id ? null : id));
  };

  const localizeTimeTaken = (timeTaken) => {
    if (!timeTaken) return;

    // Retrieve localized time units
    const timeUnits = t("time_unit", { returnObjects: true });

    // Split timeTaken string by spaces and iterate over each segment
    return timeTaken
      .split(" ")
      .map((part) => {
        // Check if the part is numeric or text
        if (!isNaN(part)) {
          return part; // Return the number as is
        }
        // Otherwise, it's a unit; look up its localized version
        return timeUnits[part] || part; // Fallback to original if no localization
      })
      .join(" ");
  };

  const convertTo24HourFormat = (time, type) => {
    if (!time || !type) {
      return false;
    }
    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    // const timeMoment = moment(time, "hh:mm:ss A");
    // return timeMoment.isValid() ? timeMoment.format("HH:mm:ss") : "";
    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    const timeMoment = moment(time, "hh:mm:ss A");

    // Check if the time is valid
    if (!timeMoment.isValid()) return "";

    // If the meeting type is 'Quiz', include seconds in the format
    const format = type === "seconds" ? "HH[h]mm[m]ss" : "HH[h]mm";

    // Return the time in the appropriate format
    return timeMoment.format(format);
  };

  const localizeTimeTakenActive = (timeTaken) => {
    if (!timeTaken) return "";

    // Retrieve localized time units
    const timeUnits = t("time_unit", { returnObjects: true });

    // Split the timeTaken string by " - " to separate time components
    const timeParts = timeTaken.split(" - ");

    // Initialize variables for each time component
    let days = null;
    let hours = null;
    let minutes = null;
    let seconds = null;

    // Iterate over each part and assign it to the corresponding variable
    timeParts.forEach((part) => {
      if (part.includes("day")) {
        days = part;
      } else if (part.includes("hour")) {
        hours = part;
      } else if (part.includes("min")) {
        minutes = part;
      } else if (part.includes("sec")) {
        seconds = part;
      }
    });

    // Check if days are present
    const hasDays = Boolean(days);

    // Determine what to show based on the presence of days
    let result = "";
    if (hasDays) {
      // Show days and hours if days are present
      result = [days, hours].filter(Boolean).join(" - ");
    } else if (hours) {
      // Show only hours and minutes if hours and minutes are present
      result = [hours, minutes].filter(Boolean).join(" - ");
    } else if (minutes) {
      // Show minutes only if no days or hours are present
      // result = minutes;
      result = [minutes, seconds].filter(Boolean).join(" - ");
    } else {
      result = seconds;
    }

    // Return empty string if result is undefined or empty
    if (!result) return "";

    // Localize and return the result
    return result
      .split(" ")
      .map((part) => (isNaN(part) ? timeUnits[part] || part : part))
      .join(" ");
  };

  const RemoveTime = (time_taken, time_unit) => {
    if (!time_taken) return;
    if (time_unit === "days") {
      const newTimeTaken = localizeTimeTaken(time_taken);
      // Split the time_taken string by ' - ' and only keep the first two parts (days and hours)
      const parts = newTimeTaken?.split(" - ");
      if (parts?.length > 2) {
        return parts.slice(0, 2).join(" - ");
      }
    }
    return localizeTimeTaken(time_taken);
  };
  const calculateNewDateForStep = (baseDate, daysToAdd) => {
    if (!baseDate || !daysToAdd) return;
    let date = new Date(baseDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0]; // returns the date in 'YYYY-MM-DD' format
  };
  // // Assuming you have an array of steps with dates (stepsWithDates) and meetingData
  const formatDate = (date) => {
    if (!date) return null;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateStepDates = (steps, meetingDate, meetingTime) => {
    if (!steps || !meetingDate || !meetingTime) {
      console.error("Steps, meetingDate, or meetingTime is null or undefined");
      return [];
    }

    const stepsWithDates = [];
    let currentDate = new Date(`${meetingDate}T${meetingTime}`);

    steps.forEach((step, index) => {
      const stepStartDate = new Date(currentDate);
      stepsWithDates.push(formatDate(stepStartDate));

      // Parse time_taken based on its format
      let timeToAdd = 0;
      if (step.time_taken?.includes("day")) {
        timeToAdd = parseInt(step.time_taken) * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      } else if (step.time_taken?.includes("hour")) {
        timeToAdd = parseInt(step.time_taken) * 60 * 60 * 1000; // Convert hours to milliseconds
      } else if (step.time_taken?.includes("minute")) {
        timeToAdd = parseInt(step.time_taken) * 60 * 1000; // Convert minutes to milliseconds
      } else if (step.time_taken?.includes("second")) {
        timeToAdd = parseInt(step.time_taken) * 1000; // Convert seconds to milliseconds
      }

      // Add timeToAdd to currentDate
      currentDate = new Date(currentDate.getTime() + timeToAdd);
    });

    // Log the last step's end date
    console.log("Last Step End Date: ", formatDate(currentDate));

    return stepsWithDates;
  };

  const dates = calculateStepDates(solutionSteps, meeting?.date, meeting?.start_time);

  console.log("dates", dates);
  console.log("solutionSteps", solutionSteps);

  const [items, setItems] = useState(solutionSteps); // Store the items in the state

  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const draggedStep = items[result.source.index];
    const destinationStep = items[result.destination.index];

    // Prevent drag if status is 'in_progress'
    if (
      draggedStep.step_status === "in_progress" ||
      draggedStep?.step_status === "completed"
    ) {
      console.log("Cannot drag steps with 'in_progress' status.");
      return;
    }

    // Prevent moving any step before a 'completed' step
    if (
      destinationStep.step_status === "completed" &&
      draggedStep.step_status !== "completed"
    ) {
      console.log(
        "Cannot move an 'upcoming', 'in_progress', or 'completed' step before a 'completed' step."
      );
      return;
    }

    // Prevent placing a 'completed' step after an 'upcoming' or 'in_progress' step
    if (
      draggedStep.step_status === "completed" &&
      (destinationStep.step_status === null ||
        destinationStep.step_status === "in_progress")
    ) {
      console.log(
        "Cannot place a 'completed' step after an 'upcoming' or 'in_progress' step."
      );
      return;
    }

    // Prevent placing a step with 'null' status before an 'in_progress' step
    if (
      draggedStep.step_status === null &&
      destinationStep.step_status === "in_progress"
    ) {
      console.log(
        "Cannot place a step with 'null' status before an 'in_progress' step."
      );
      return;
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    // Get the ID of the dragged step
    const draggedStepId = reorderedItems[result.destination.index].id;
    console.log("Dragged Step ID:", draggedStepId);

    setItems(reorderedItems);

    // Call the API to save the new order after dragging
    try {
      const response = await axios.post(
        `${API_BASE_URL}/solution-steps/reorder`,
        {
          solution_id: meeting1?.id,
          // draggedStepId: draggedStepId, // Pass the dragged step ID
          solution_steps: reorderedItems.map((step, index) => ({
            id: step.id,
            order_no: index + 1, // You can pass the new order or any necessary data
          })),
          _method: "post",
        },
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Order updated successfully", response.data);
        const steps = response?.data?.solution_steps;
        updateSolutionSteps(steps);
        setCall((prev) => !prev);
      } else {
        console.error("Error updating the order");
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update the order_no after reordering
    return result.map((item, index) => ({
      ...item,
      order_no: index + 1, // Update the order_no based on the new index
    }));
  };

  const [dropdownVisible, setDropdownVisible] = useState(
    Array(data?.length).fill(true)
  );
  const dropdownRefs = useRef([]);

  useEffect(() => {
    data?.forEach((item, index) => {
      const el = dropdownRefs.current[index];
      if (el) {
        if (dropdownVisible[index]) {
          el.style.display = "block";
          requestAnimationFrame(() => {
            el.classList.add("show");
          });
        } else {
          el.classList.remove("show");
          el.addEventListener(
            "transitionend",
            () => {
              el.style.display = "none";
            },
            { once: true }
          );
        }
      }
    });
  }, [dropdownVisible, data]);

  useEffect(() => {
    const currentInProgressStep = solutionSteps?.find(
      (item) => item.step_status === "in_progress"
    );
    setInProgressStep(currentInProgressStep || null);
  }, [solutionSteps]);

  // Fetch Excel data when inProgressStep changes
  useEffect(() => {
    const fetchExcel = async () => {
      if (inProgressStep?.editor_type === "Excel" && inProgressStep?.file) {
        try {
          const fileResponse = await axios.get(
            `${Assets_URL}/${inProgressStep?.file}`,
            {
              responseType: "arraybuffer",
            }
          );

          const fileData = fileResponse.data;
          const workbook = read(fileData, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonSheetData = utils.sheet_to_json(worksheet, { header: 1 });

          const formattedData = jsonSheetData.map((row, rowIndex) =>
            row.map((cell) => ({
              value: cell,
              readOnly: rowIndex === 0,
            }))
          );

          setExcelData(formattedData);
        } catch (error) {
          console.error("Error fetching Excel file:", error);
        }
      }
    };

    if (inProgressStep) {
      fetchExcel();
    }
  }, [inProgressStep]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              className="row"
              style={{ marginBottom: "3rem", gap: fromMeeting ? "4px" : "" }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {solutionSteps?.map((item, index) => {
                let editorContent = item.editor_content;
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = editorContent;
                const firstImageTag = tempDiv.querySelector("img");
                const firstImageUrl = firstImageTag
                  ? firstImageTag.getAttribute("src")
                  : "";
                let stepTime = item.count2;

                let [time, modifier] = startTime.split(" ");
                let [hours, minutes] = time.split(":").map(Number);

                if (modifier === "PM" && hours < 12) {
                  hours += 12;
                }
                if (modifier === "AM" && hours === 12) {
                  hours = 0;
                }

                let startDate = new Date();
                startDate.setHours(hours);
                startDate.setMinutes(minutes);
                startDate.setSeconds(0);
                startDate.setMinutes(startDate.getMinutes() + stepTime);

                const calculateTimeDifference = (end_time, current_time) => {
                  if (!end_time || !current_time) {
                    return null;
                  }

                  const endTime = new Date(`1970-01-01T${end_time}Z`);
                  const currentTime = new Date(`1970-01-01T${current_time}Z`);

                  let diff = (endTime - currentTime) / 1000; // difference in seconds

                  const days = Math.floor(diff / (24 * 3600));
                  diff -= days * 24 * 3600;
                  const hours = Math.floor(diff / 3600);
                  diff -= hours * 3600;
                  const minutes = Math.floor(diff / 60);
                  const seconds = Math.floor(diff % 60); // ensure the seconds are integers

                  return { days, hours, minutes, seconds };
                };

                const formatTimeDifference = (diff, timeUnit) => {
                  if (!diff || !timeUnit) {
                    return "";
                  }

                  switch (timeUnit) {
                    case "seconds":
                      return `${
                        diff.hours * 3600 + diff.minutes * 60 + diff.seconds
                      } seconds`;
                    case "minutes":
                      return `${diff.minutes} minutes ${diff.seconds} seconds`;
                    case "hours":
                      return `${diff.hours} hours ${diff.minutes} minutes ${diff.seconds} seconds`;
                    case "days":
                      return `${diff.days} days ${diff.hours} hours ${diff.minutes} minutes ${diff.seconds} seconds`;
                    default:
                      return `${diff.seconds} seconds`;
                  }
                };

                const timeDifference = calculateTimeDifference(
                  item?.end_time,
                  item?.current_time
                );

                const handleClick = (item, index) => {
                  if (loading) return;
                  setLoading(true);
                  toggle(false);
                  setIsModalOpen(!isModalOpen);
                  // setIsUpdated(true)
                  setStepId(item?.id);
                  setStepIndex(index);
                  setIsDrop(false);
                  setTimeout(() => setLoading(false), 2000); // Adjust the delay if necessary
                };

                return (
                  <>
                    <Draggable
                      key={item.id}
                      draggableId={item.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="col-12 ste"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          key={index}
                        >
                          <Card
                            className="mt-4 step-card-meeting"
                            onClick={() => {
                              handleClick(item, index);
                            }}
                          >
                            <Card.Body className="step-card-body">
                              <div className="step-number-container">
                                <span className="step-number">
                                {item?.order_no <= 9 ? "0" : " "}
                                {item?.order_no}
                                </span>
                              </div>
                              <div className="step-body">
                                <div className="step-data">
                                  <div className="step-header">
                                    <Card.Title className="step-card-heading">
                                      {item?.title}
                                    </Card.Title>

                                    {/* <span className="status-badge-upcoming">
                                      {t("badge.future")}
                                    </span> */}
                                  </div>
                                  <div className="step-content">
                                    <Card.Subtitle className="step-card-subtext">
                                      <img
                                        height="24px"
                                        width="24px"
                                        style={{
                                          marginRight: "9px",
                                          borderRadius: "20px",
                                          objectFit: "cover",
                                          objectPosition: "top",
                                        }}
                                        src={
                                          item?.solution_step_creator?.image?.startsWith(
                                            "users/"
                                          )
                                            ? Assets_URL +
                                              "/" +
                                              item?.solution_step_creator?.image
                                            : item?.solution_step_creator?.image
                                        }
                                        alt="img"
                                      />

                                      <span>
                                        {item?.solution_step_creator?.full_name}
                                      </span>
                                    </Card.Subtitle>

                                    <Card.Text className="step-card-content">
                                      <span className="">
                                        <img
                                          height="16px"
                                          width="16px"
                                          src="/Assets/alarm-invite.svg"
                                        />
                                      </span>
                                      <>
                                        {item?.step_status === null
                                          ? item.count2 +
                                            " " +
                                            t(`time_unit.${item.time_unit}`)
                                          : localizeTimeTakenActive(
                                              item?.time_taken?.replace("-", "")
                                            )}
                                      </>
                                    </Card.Text>
                                  </div>
                                </div>
                                <div className="step-images">
                                  {item.editor_content &&
                                  item.editor_content.trim() !==
                                    "<html><head></head><body></body></html>" ? (
                                    <div className="step-img-container">
                                      {firstImageUrl ? (
                                        <Card.Img
                                          className="step-img report-step-img"
                                          src={firstImageUrl}
                                        />
                                      ) : (
                                        <div className="fallback-img-container">
                                          {/* <img
                                src="/Assets/Tek.png"
                                className="fallback-img"
                                alt="Fallback Image"
                              /> */}
                                          <FiEdit
                                            className="file-img img-fluid"
                                            style={{ padding: "12px" }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : item.editor_type === "File" ? (
                                    <div className="file-img-container">
                                      <PiFilePdfLight
                                        className="file-img img-fluid"
                                        style={{ padding: "12px" }}
                                      />
                                    </div>
                                  ) : item.editor_type === "Excel" ? (
                                    <div className="file-img-container">
                                      <RiFileExcel2Line
                                        className="file-img img-fluid"
                                        style={{ padding: "14px" }}
                                      />
                                    </div>
                                  ) : item.editor_type === "Video" ? (
                                    <div className="file-img-container">
                                      <IoVideocamOutline
                                        className="file-img img-fluid"
                                        style={{ padding: "12px" }}
                                      />
                                    </div>
                                  ) : item.editor_type === "Photo" ? (
                                    <div className="file-img-container">
                                      <MdOutlinePhotoSizeSelectActual
                                        className="file-img img-fluid"
                                        style={{ padding: "12px" }}
                                      />
                                    </div>
                                  ) : item.url ? (
                                    <div className="link-img-container">
                                      <IoCopyOutline
                                        className="file-img img-fluid"
                                        style={{ padding: "12px" }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="fallback-img-container">
                                      <FiEdit
                                        className="file-img img-fluid"
                                        style={{ padding: "12px" }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  </>
                );
              })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {isModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className="new-meeting-modal">
            <LazyStepChart
              meetingId={meeting1?.id}
              id={stepId}
              show={isModalOpen}
              meeting1={meeting1}
              setId={setStepId}
              closeModal={handleCloseModal}
              key={`step-chart-${stepId}`}
              isDrop={isDrop}
              stepIndex={stepIndex}
            />
          </div>
        </Suspense>
      )}
    </Suspense>
  );
};

export default SolutionStepCard;

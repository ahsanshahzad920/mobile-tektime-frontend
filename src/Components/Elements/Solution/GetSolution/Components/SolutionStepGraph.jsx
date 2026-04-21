import CookieService from '../../../../Utils/CookieService';
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Editor } from "@tinymce/tinymce-react";
import {
  API_BASE_URL,
  Assets_URL,
  Cloudinary_URL,
} from "../../../../Apicongfig";
import { useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import cheerio from "cheerio";
import { useTranslation } from "react-i18next";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { MdOutlineModeEdit } from "react-icons/md";
import { LuFileEdit } from "react-icons/lu";
import copy from "copy-to-clipboard";
// import { useSidebarContext } from "../../../context/SidebarContext";
import { useSidebarContext } from "../../../../../context/SidebarContext";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
} from "../../../../Utils/MeetingFunctions";
import StepChart from "../../Createnewsolution/StepChart";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { useTotalTime } from "../../../../../context/TotalTimeContext";

// Function to extract base64 image sources from HTML string
function extractBase64SrcFromHTML(htmlString) {
  const base64SrcArray = [];

  // Load the HTML string into cheerio
  const $ = cheerio.load(htmlString);

  // Find all elements with 'src' attribute
  $("[src]").each((index, element) => {
    const srcValue = $(element).attr("src");

    // Check if the src starts with 'data:image'
    if (srcValue?.startsWith("data:image")) {
      // If src is a base64 image, push it into base64SrcArray
      base64SrcArray.push(srcValue);
    }
  });

  return base64SrcArray;
}

// Function to replace base64 image sources with cloud URLs in HTML string
function replaceBase64SrcWithLinks(htmlString, imageLinks) {
  // Load the HTML string into cheerio
  const $ = cheerio.load(htmlString);

  let linkIndex = 0;

  // Find all elements with 'src' attribute
  $("[src]").each((index, element) => {
    const srcValue = $(element).attr("src");

    // Check if the src starts with 'data:image'
    if (srcValue && srcValue?.startsWith("data:image")) {
      // Replace the src with the corresponding link from imageLinks
      if (imageLinks[linkIndex]) {
        $(element).attr("src", imageLinks[linkIndex]);
      }
      linkIndex++;
    }
  });

  // Return the modified HTML string
  return $.html();
}

//FrontEnd - Cloudinary
export const optimizeEditorContent = async (editorContent) => {
  if (!editorContent) {
    return "";
  }
  //-------- CLOUD LOGIC ------------------------------
  let optimizedEditorContent = "";
  const base64Array = extractBase64SrcFromHTML(editorContent);
  if (!base64Array.length > 0) {
    optimizedEditorContent = editorContent;
    return optimizedEditorContent;
  } else {
    const cloudinaryUploads = base64Array.map(async (base64Image) => {
      try {
        const response = await fetch(`${Cloudinary_URL}`, {
          method: "POST",
          body: JSON.stringify({
            file: base64Image,
            upload_preset: "chat-application",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        return data.secure_url;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return null;
      }
    });

    const uploadedImageUrls = await Promise.all(cloudinaryUploads);
    const editorContentWithCloudLinks = replaceBase64SrcWithLinks(
      editorContent,
      uploadedImageUrls,
    );

    optimizedEditorContent = editorContentWithCloudLinks;
    return optimizedEditorContent;
  }
  //   // ------- CLOUD LOGIC END -------------------------
};

export const image_upload_handler_callback = (blobInfo, progress) =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", blobInfo.blob(), blobInfo.filename());

    formData.append("upload_preset", "chat-application");
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open("POST", `${Cloudinary_URL}`);

    xhr.upload.onprogress = (e) => {
      progress((e.loaded / e.total) * 100);
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url); // Assuming Cloudinary returns the secure URL of the uploaded image
      } else {
        reject("Failed to upload image to Cloudinary");
      }
    };

    xhr.onerror = () => {
      reject(
        "Image upload failed due to a XHR Transport error. Code: " + xhr.status,
      );
    };

    xhr.send(formData);
  });

//----------------------------------------------

const SolutionStepGraph = ({
  meetingId,
  puller,
  participants,
  data,
  steps,
  meeting,
}) => {
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  console.log("TINYMCEAPI", TINYMCEAPI);
  const { setIsUpdated } = useSolutionFormContext();
  // const [steps,setSteps] = useState([])
  console.log("steps", steps);
  const location = window.location.href;
  const navigate = useNavigate();
  const fromReport = location.includes("step-details")
    ? true
    : location.includes("meetingDetail")
      ? true
      : false;
  const [t] = useTranslation("global");
  const { toggle, show } = useSidebarContext();
  const [isDisabled, setIsDisabled] = useState(false);
  const id = useParams().id || meetingId;
  const [inputData, setInputData] = useState([]);
  console.log("inputData", inputData);
  const [loading, setLoading] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepId, setStepId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  console.log("selectedIndex", selectedIndex);
  const stepRef = useRef();
  const [accumulatedSelectedCounts, setAccumulatedSelectedCounts] = useState(
    [],
  );
  const [storedStartTime, setStoredStartTime] = useState(null);
  const [storedStartDate, setStoredStartDate] = useState(null);
  const [storedStartDateForHour, setStoredStartDateForHour] = useState(null);
  const [totalSelectedCount, setTotalSelectedCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [countSum, setCountSum] = useState(0);
  const [modifiedFileText, setModifiedFileText] = useState([]);
  const [modalType, setModalType] = useState("Editeur");
  const [editorContent, setEditorContent] = useState("");
  const [addBtnText, setAddBtnText] = useState("Ajouter une étape");
  const [copyBtnText, setCopyBtnText] = useState("Copier l’étape");
  const [nextBtnText, setNextBtnText] = useState("Suivant");
  const [prevBtnText, setPrevBtnText] = useState("Précédent");
  const [validateBtnText, setValidateBtnText] = useState("Valider");
  const [link, setLink] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [timeUnit, setTimeUnit] = useState("");
  const inputDataRef = useRef(inputData);
  const [fileUpload, setFileUpload] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isUpload, setIsUpload] = useState(false);
  const [isDrop, setIsDrop] = useState(false);
  const [stepIndex, setStepIndex] = useState(null);
  console.log("stepIndex", stepIndex);

  useEffect(() => {
    if (isModalOpen) {
      toggle(false);
    }
  }, [isModalOpen]);

  const [user, setUser] = useState(null);

  const [isEdited, setIsEdited] = useState(false);

  const getMeetingbyId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/solutions/${id}`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      console.log("steps when modal closed-->", response.data?.data?.steps);
      const updatedSteps = response.data?.data?.steps;
      setMySteps(updatedSteps);
      // setSteps(updatedSteps)
      if (puller !== undefined) {
        puller(updatedSteps);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getMeetingbyId();
  }, [id, isModalOpen]);

  useEffect(() => {
    if (fromReport) {
      setIsModalOpen(true);
    }
  }, [fromReport]);
  useEffect(() => {
    const getMeeting = async () => {
      try {
        setLoading(true);
        setIsDisabled(true);
        const REQUEST_URL = `${API_BASE_URL}/solutions/${meetingId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response.status) {
          console.log("response data chart: ", response.data?.data);
          const updatedSteps = response.data?.data?.solution_steps;
          const time = updatedSteps.reduce((acc, step) => acc + step.count2, 0);
          setInputData(response?.data?.data);

          // setInputData({ ...response.data?.data, steps: updatedSteps });
          setLoading(false);
          updateTotalTime(time);
          // setSteps(updatedSteps)

          // const formattedData = updatedSteps?.map(step => ({
          //   x: step.title,
          //   y: step.time,
          //   time_unit: step.time_unit
          // }));
          // setChartData(formattedData);
        }
      } catch (error) {
        // console.log("error", error);
        setLoading(false);
      } finally {
        setIsDisabled(false);
      }
    };

    getMeeting();
  }, [id, meetingId, isModalOpen]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     getMeeting();
  //   }, 5000); //5 sec

  //   return () => clearInterval(intervalId);
  // }, [meeting, id]);
  const [isDeleted, setIsDeleted] = useState(false);

  const [allData, setAllData] = useState([]);
  useEffect(() => {
    if (inputData && inputData?.solution_steps) {
      setModifiedFileText(
        inputData?.solution_steps?.map((step) => step.editor_content),
      );
    }

    if (inputData) {
      const { solution_steps } = inputData;
      let accumulatedCount2 =
        solution_steps?.length > 0 ? solution_steps[0]?.count2 : 0;
      let storedTime = moment(inputData.start_time, "HH:mm"); // Initialize stored time
      console.log("accumulatedCount2->", accumulatedCount2);
      const formattedData = solution_steps
        ?.map((step, index) => {
          let count1 = 0;
          let count2 = step.count2;

          if (index > 0) {
            accumulatedCount2 += step.count2;
            count1 = accumulatedCount2 - count2;
          }

          // Calculate new stored time if selectedIndex > 0
          if (index === selectedIndex) {
            storedTime.add(count1, "minutes");
          }

          return {
            x: step.title,
            y: [count1, count1 + count2, count2],
            // unit: step.time_unit,
          };
        })
        .reverse();

      const sumCount2UpToIndex = (steps, index) => {
        return steps
          .slice(0, index)
          .reduce((sum, step) => sum + step.count2, 0);
      };
      let sumCount2Minutes = 0;
      console.log("selectedIndex", selectedIndex);
      for (let i = 0; i < selectedIndex; i++) {
        const step = steps[i];
        if (step) {
          if (step.time_unit === "hours") {
            sumCount2Minutes += step.count2 * 60;
          } else if (step.time_unit === "minutes") {
            sumCount2Minutes += step.count2;
          } else if (step.time_unit === "seconds") {
            sumCount2Minutes += step.count2 / 60;
          }
        }
      }

      // Set stored time only if selectedIndex > 0
      if (selectedIndex > 0) {
        const totalCount2 = sumCount2UpToIndex(
          inputData?.solution_steps,
          selectedIndex,
        );
        // const newStoredStartTime = moment(inputData?.start_time,"HH:mm")
        //   .add(sumCount2Minutes, "minutes")
        //   .format("hh:mm a");
        // setStoredStartTime(newStoredStartTime);
        const newStoredStartTime =
          inputData?.solution_steps[selectedIndex]?.time_unit === "seconds"
            ? moment(inputData?.start_time, "HH:mm:ss")
                .add(sumCount2Minutes, "minutes")
                .format("hh:mm:ss a") // Format to HH:mm:ss
            : moment(inputData?.start_time, "HH:mm")
                .add(sumCount2Minutes, "minutes")
                .format("hh:mm a"); // Format to HH:mm if not seconds
        setStoredStartTime(newStoredStartTime);

        const startDate = new Date(
          `${inputData?.date}T${inputData?.start_time}`,
        );

        const newStoredStartDate =
          inputData?.solution_steps[selectedIndex]?.time_unit === "seconds"
            ? moment(startDate)
                .add(sumCount2Minutes, "minutes")
                .format("DD/MM/YYYY") // Format to HH:mm:ss
            : moment(startDate)
                .add(sumCount2Minutes, "minutes")
                .format("DD/MM/YYYY"); // Format to HH:mm if not seconds
        setStoredStartDateForHour(newStoredStartDate);

        setStoredStartDate(
          moment(inputData?.date).add(totalCount2, "days").format("YYYY-MM-DD"),
        );
      } else {
        setStoredStartTime(
          moment(inputData.start_time, "HH:mm").format("hh:mm a"),
        );
        setStoredStartDate(moment(inputData?.date).format("YYYY-MM-DD"));
        setStoredStartDateForHour(moment(inputData?.date).format("DD/MM/YYYY"));
      }

      console.log("formattedChartData-->", formattedData);
      setChartData(formattedData);
      setAllData(inputData.solution_steps);
    }
  }, [inputData, selectedIndex, steps]);

  const getMeeting = async () => {
    try {
      setLoading(true);
      setIsDisabled(true);
      const REQUEST_URL = `${API_BASE_URL}/solutions/${meetingId}`;
      const response = await axios.get(REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.status) {
        const updatedSteps = response.data?.data.solution_steps;
        setStepNotes(updatedSteps?.map((step) => step?.note));
        setInputData(response?.data?.data);
        // setSteps(updatedSteps)

        // setInputData({ ...response.data?.data, steps: updatedSteps });
        const { solution_steps } = response.data?.data;

        setMySteps(solution_steps);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setIsDisabled(false);
    }
  };

  const colors = steps
    ?.map((step) => {
      if (
        step?.step_status === "in_progress" &&
        convertTimeTakenToSeconds(step?.time_taken) >
          convertCount2ToSeconds(step?.count2, step?.time_unit)
      ) {
        return "#FF4560"; // Red
      } else if (step?.step_status === "completed") {
        return "#00E396"; // Green
      } else if (step?.step_status === null) {
        return "#008FFB"; // Blue
      } else {
        return "#f2db43"; // Green
      }
    })
    .reverse();

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
      // Split the time_taken string by ' - ' and only keep the first two parts (days and hours)
      const parts = time_taken?.split(" - ");
      if (parts?.length > 2) {
        return parts.slice(0, 2).join(" - ");
      }
    }
    return time_taken;
  };

  const options = {
    xaxis: {
      type: "category",
      labels: {
        show: false,

        formatter: function (val, index, opts) {
          const step = steps[index];
          const timeTaken = step?.time_taken || "";
          const firstValue = timeTaken.split(" - ")[0]; // Get the first value before the dash

          return firstValue;
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        formatter: function (val, index) {
          return val;
        },
      },
    },
    chart: {
      height: 650,
      zoom: false,
      type: "rangeBar",
      events: {
        click: function (event, chartContext, config) {
          const { dataPointIndex } = config;
          console.log("dataPointIndex: ", dataPointIndex);
          setChartData((prevChartData) => {
            if (
              dataPointIndex !== undefined &&
              dataPointIndex >= 0 &&
              dataPointIndex < prevChartData?.length
            ) {
              const updatedSelectedIndex =
                prevChartData.length - 1 - dataPointIndex;
              setSelectedIndex(updatedSelectedIndex);
              const clickedChartData = prevChartData[dataPointIndex];
              if (
                clickedChartData &&
                clickedChartData.y &&
                clickedChartData.y.length === 3
              ) {
                const bar2 = clickedChartData.y;
                const selectedCounts = prevChartData
                  .slice(dataPointIndex + 1)
                  .map((item) =>
                    item.y && item.y.length === 3 ? item.y[2] : 0,
                  );
                const totalSelectedCount = selectedCounts.reduce(
                  (sum, count) => sum + count,
                  0,
                );

                const newAccumulatedSelectedCounts = [
                  ...accumulatedSelectedCounts,
                  totalSelectedCount,
                ];

                const startTime = moment(
                  inputDataRef.current["start_time"],
                  "HH:mm",
                )
                  .add(
                    newAccumulatedSelectedCounts.reduce(
                      (sum, count) => sum + count,
                      0,
                    ),
                    "minutes",
                  )
                  .format("hh:mm a");

                setSelectedBar(clickedChartData.x);
                setSelectedValue(clickedChartData.x);
                setSelectedCount(bar2[2]);
                setTotalSelectedCount(totalSelectedCount);
                setAccumulatedSelectedCounts(newAccumulatedSelectedCounts);

                const selectedStep = data?.solution_steps[updatedSelectedIndex];
                setIsModalOpen(true);
                setStepId(selectedStep?.id);
                setIsDrop(false);
                // setStepIndex(selectedIndex)
              }
            }

            return prevChartData;
          });
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 15,
        barHeight: 35,
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      intersect: true,
      x: {
        show: true,
        formatter: function (val, opts) {
          return val; // Or any specific logic for x-axis tooltip
        },
      },
      y: {
        formatter: function (val, opts) {
          let step;
          let sanitizedTimeTaken = 0; // Default message

          if (steps && opts && opts.dataPointIndex !== undefined) {
            const reversedIndex = steps.length - 1 - opts.dataPointIndex;
            step = steps[reversedIndex];

            if (
              step &&
              step.time_taken &&
              step?.step_status === "in_progress"
            ) {
              sanitizedTimeTaken = step.time_taken;
            }
          }

          console.log("Tooltip options:", opts);
          console.log("Step:", step);
          console.log("Sanitized Time Taken:", sanitizedTimeTaken);

          return sanitizedTimeTaken && sanitizedTimeTaken;
        },
      },
    },

    grid: {
      row: {
        colors: ["#fff", "#fff"],
        opacity: 1,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ["black"],
        fontSize: "8px",
      },
      formatter: function (val, opts) {
        const reversedIndex = steps?.length - 1 - opts.dataPointIndex;
        console.log("reverseIndex", reversedIndex);
        const step = steps[reversedIndex];
        console.log("Step Data:", step);

        const sanitizedTimeTaken = localizeTimeTakenActive(
          step?.time_taken?.replace("-", ""),
        );
        console.log("Sanitized Time Taken:", sanitizedTimeTaken);

        if (
          step?.step_status === "in_progress" ||
          step?.step_status === "completed"
        ) {
          return (
            RemoveTime(sanitizedTimeTaken, step?.time_unit) +
            " / " +
            step?.count2 +
            " " +
            t(`time_unit.${step?.time_unit}`)
          );
        } else {
          return step?.count2 + " " + t(`time_unit.${step?.time_unit}`);
        }
      },
    },
    colors: colors,
  };

  const [assignUser, setAssignUser] = useState(null);
  const [stepOrder, setStepOrder] = useState(null);
  //   const [isModalOpen,setIsModalOpen] = useState(false);
  useEffect(() => {
    if (inputData && inputData?.solution_steps && selectedIndex >= 0) {
      const updatedStep = [...(inputData?.solution_steps || [])];
      const selectedStep = updatedStep[selectedIndex];

      //   if(selectedStep.step_status === null){
      //     setIsModalOpen(true)
      //   }
      console.log("selected-----------------", selectedStep);
      const currentStep = updatedStep[selectedIndex]?.count2;
      console.log("selected step:", selectedStep);
      setFileName(selectedStep?.file);
      setShowPreview(true);
      setLink(selectedStep?.url);
      setPreviewUrl(selectedStep?.url);
      // setFileName(
      //   selectedStep?.file !== null
      //     ? selectedStep?.editor_content
      //     : selectedStep?.file
      // );
      // setType(selectedStep?.editor_content);
      setSelectedCount(currentStep);
      setStepOrder(selectedStep?.order);
      setModalType(
        selectedStep?.editor_type !== null
          ? selectedStep?.editor_type
          : "Editeur",
      );
      setTimeUnit(selectedStep?.time_unit);

      setAssignUser(
        selectedStep?.assigned_to_name === null
          ? inputData?.user?.last_name !== null
            ? inputData?.user?.name + " " + inputData?.user?.last_name
            : inputData?.user?.name
          : selectedStep?.assigned_to_name,
      );
    }
  }, [inputData, selectedIndex, user, assignUser]);

  // -------------------------OPTIMIZE EDITOR CONTENT-------------------------
  const { total_Time, updateTotalTime } = useTotalTime();
  const [stepNotes, setStepNotes] = useState([]);

  const [mySteps, setMySteps] = useState([]);

  const [nextId, setNextId] = useState(null);
  const getStep = async () => {
    if (!inputData) {
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/solution-steps/${inputData?.solution_steps[selectedIndex]?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      // console.clear("clear");
      if (response.status) {
        setShowPreview(true);
        setFileName(response.data.data.file);
        setLink(response.data?.data?.url);
        setAssignUser(response.data?.data?.assigned_to_name);

        setPreviewUrl(response?.data?.data?.url);
        setUser(response.data?.data?.assigned_to);
      }
    } catch (error) {
      console.log("error while processing get step", error);
    }
  };

  useEffect(() => {
    getStep();
  }, [id, selectedIndex, nextId, meetingId, inputData]);

  useEffect(() => {
    getMeeting();
  }, [id, meetingId]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    toggle(true);
  };

  const [previousId, setPreviousId] = useState(null);

  // const getPreviousStep = async () => {
  //   const updatedSteps = [...(inputData?.steps || [])];
  //   const selectedStep = updatedSteps[selectedIndex];

  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/steps/${previousId}`, {
  //       headers: {
  //         Authorization: `Bearer ${CookieService.get("token")}`,
  //       },
  //     });
  //     // console.clear("clear")
  //     if (response.status) {
  //       setFileName(response.data.data.file);
  //       setLink(response.data.data?.url);
  //       setPreviewUrl(response.data.data?.url);
  //       // setModifiedFileText[previousId](response.data?.data?.editor_content);
  //     }
  //   } catch (error) {
  //     console.log("error while processing get step", error);
  //   }
  // };

  // useEffect(() => {
  //   getPreviousStep();
  // }, []);

  return (
    <>
      <div id="chart-container" className="chart-content ">
        <ReactApexChart
          options={options}
          key={steps && JSON.stringify(steps)}
          series={[{ data: chartData }]}
          type="rangeBar"
          height={500}
        />
      </div>

      <div
        id="chart-containe"
        className="chart-content"
        // style={{ width: "auto", height: "auto", overflow: "hidden" }}
      >
        {isModalOpen && selectedBar !== null && (
          <div className="new-meeting-modal">
            <StepChart
              show={isModalOpen}
              meetingId={meetingId}
              closeModal={handleCloseModal}
              id={stepId}
              setId={setStepId}
              stepIndex={selectedIndex}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SolutionStepGraph;

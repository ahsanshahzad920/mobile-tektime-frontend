import CookieService from '../../Utils/CookieService';
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Editor } from "@tinymce/tinymce-react";
import {
  API_BASE_URL,
  Assets_URL,
  Cloudinary_URL,
  NODE_API,
} from "../../Apicongfig";
import { useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { useTotalTime } from "../../../context/TotalTimeContext";
import cheerio from "cheerio";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
// import { useChartContext } from "../../../context/ChartContext";

// Function to extract base64 image sources from HTML string
function extractBase64SrcFromHTML(htmlString) {
  const base64SrcArray = [];

  // Load the HTML string into cheerio
  const $ = cheerio.load(htmlString);

  // Find all elements with 'src' attribute
  $("[src]").each((index, element) => {
    const srcValue = $(element).attr("src");

    // Check if the src starts with 'data:image'
    if (srcValue.startsWith("data:image")) {
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
    if (srcValue && srcValue.startsWith("data:image")) {
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

// Function to convert base64 strings to File objects
const base64toFile = (base64Strings) => {
  return base64Strings.map((dataurl, index) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    // Convert binary string to Uint8Array
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // Generate a unique filename for each file
    const filename = `file_${index}.${mime.split("/")[1]}`;

    // Create a File object
    return new File([u8arr], filename, { type: mime });
  });
};

// Main function to optimize editor content by replacing base64 images with cloud URLs
//Using NodeAPI - Cloudinary

// export const optimizeEditorContent = async (editorContent) => {
//   // Check if editor content exists
//   if (!editorContent) {
//     return "";
//   }

//   // Initialize variable to store optimized editor content
//   let optimizedEditorContent = "";

//   // Extract base64 image sources from editor content
//   const base64Array = extractBase64SrcFromHTML(editorContent);

//   // Check if there are base64 images in the editor content
//   if (!base64Array.length > 0) {
//     // If no base64 images found, return the original content
//     optimizedEditorContent = editorContent;
//     return optimizedEditorContent;
//   } else {
//     // If base64 images exist, proceed with cloud optimization
//     const API_URL = NODE_API;

//     // Convert base64 strings to File objects
//     const files = base64toFile(base64Array);
//     const formData = new FormData();

//     // Append files to FormData object
//     files.forEach((file, index) => {
//       formData.append(`images`, files[index]);
//     });

//     // Send FormData to cloud service and receive image URLs
//     const imagesResponse = await axios.post(API_URL, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     // Extract image URLs from the response
//     const imageSRCArray = imagesResponse?.data?.images?.map(
//       (image) => image.url
//     );

//     // Replace base64 image sources with cloud URLs in the editor content
//     const editorContentWithCloudLinks = replaceBase64SrcWithLinks(
//       editorContent,
//       imageSRCArray
//     );

//     // Update optimized editor content
//     optimizedEditorContent = editorContentWithCloudLinks;
//     return optimizedEditorContent;
//   }
// };

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

const Chart = ({ meetingId, puller, participants, data, setCall }) => {
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  // const { setIsChartClosed } = useChartContext();
  const location = window.location.href;
  const fromReport = location.includes("step-details")
    ? true
    : location.includes("meetingDetail")
      ? true
      : false;
  const [t] = useTranslation("global");

  const [isDisabled, setIsDisabled] = useState(false);
  const id = useParams().id || meetingId;
  const [inputData, setInputData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
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
  const [nextId, setNextId] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    // console.log("file: ", file);
    setIsUpload(true);
    const allowedFileTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    // Check file size (6 MB = 6 * 1024 * 1024 bytes)
    if (file.size > 6 * 1024 * 1024) {
      toast.error(t("meeting.chart.error.file"));
      setIsUpload(false);
      return;
    }
    if (file && allowedFileTypes.includes(file.type)) {
      try {
        setIsDisabled(false);

        const updatedSteps = [...(inputData?.steps || [])];
        const selectedStep = updatedSteps[selectedIndex];

        const filePayload = {
          title: selectedStep.title,
          count1: selectedStep.count1 || 0,
          count2: selectedStep.count2,
          time: selectedStep.count2, // Ensure this is correct
          editor_type: "File",
          file: file,
          editor_content: null,
          status: "active",
          _method: "put",
        };

        const formData = new FormData();
        formData.append("title", filePayload.title);
        formData.append("count1", filePayload.count1);
        formData.append("count2", filePayload.count2);
        formData.append("time", filePayload.time);
        formData.append("editor_type", filePayload.editor_type);
        formData.append("file", filePayload.file);
        formData.append("editor_content", filePayload.editor_content);
        formData.append("status", filePayload.status);
        formData.append("_method", filePayload._method);

        const response = await axios.post(
          `${API_BASE_URL}/steps/${selectedStep?.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );

        if (response.status === 200) {
          setFileName(response.data.data.file);
          setIsUpload(false);
        }
      } catch (error) {
        console.log("error while uploading file", error);
        setIsUpload(false);
      }
    } else {
      alert(
        "Please select a valid file type: PDF, Excel, PowerPoint, or Word.",
      );
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf,.xlsx,.xls,.ppt,.pptx,.doc,.docx",
    onDrop,
  });

  const [user, setUser] = useState(null);
  console.log("user", user);
  const handleUserSelect = (e) => {
    setUser(e.target.value);
    // setInputData((prev) => {
    //   let updatedSteps = [...prev?.steps];
    //   updatedSteps[selectedIndex].assigned_to = user;
    //   updatedSteps[selectedIndex].assigned_to_name =
    //     e.target.selectedOptions[0]?.text;
    //   return { ...prev, steps: updatedSteps };
    // });
  };

  const handleLinkUpload = (event) => {
    setLink(event.target.value);
    setShowPreview(true);
    setPreviewUrl(event.target.value);
  };

  const previewUrlResult = () => {
    setPreviewUrl(link);
    setShowPreview(true);
  };

  const getMeetingbyId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      const updatedSteps = response.data?.data?.steps;
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

  const closeModal = async () => {
    setIsDisabled(true);
    // setUser("");
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];
    const count2Difference = parseInt(selectedCount, 10) - selectedStep?.count2;
    if (puller !== undefined) {
      puller(updatedSteps);
    }
    const isUnique = updatedSteps.every(
      (step, index) => index === selectedIndex || step.title !== selectedValue,
    );
    if (!isUnique) {
      // toast.error("Le nom de l'étape doit être unique.");
      toast.error(t("meeting.chart.error.unique"));

      setIsDisabled(false);
      setNextBtnText("Suivant");
      return;
    }
    selectedStep.editor_content = modifiedFileText[selectedIndex];
    if (modalType === "Editeur") {
      selectedStep.editor_type = "Editeur";
      setModalType("Editeur");
    } else if (modalType === "Url") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "Url";
      // selectedStep.editor_content = link;
      // setLink(link);
      setModalType("Url");
    } else if (modalType === "File") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "File";
      // selectedStep.file = fileUpload;
      // setFileUpload(fileUpload);
    }
    selectedStep.title = selectedValue;
    selectedStep.count2 = parseInt(selectedCount, 10);

    for (let i = selectedIndex + 1; i < updatedSteps?.length; i++) {
      const currentStep = updatedSteps[i];
      currentStep.count1 += count2Difference;
    }
    // Update the time value for each step based on count1 and count2
    // let currentTime = selectedStep?.count1 + selectedStep?.count2;
    let currentTime = selectedStep?.count2;
    selectedStep.time = currentTime;

    for (let i = selectedIndex + 1; i < updatedSteps.length; i++) {
      const currentStep = updatedSteps[i];
      currentTime += currentStep?.count2;
      currentStep.time = currentTime;
    }

    const countSum = updatedSteps.reduce((sum, step) => sum + step.count2, 0);
    setTotalTime(countSum);

    const myStep = updatedSteps[selectedIndex + 1]?.count2;
    let accumulatedSelectedCount = myStep;
    for (let i = 0; i < selectedIndex + 1; i++) {
      accumulatedSelectedCount += updatedSteps[i]?.count2;
    }

    const newStoredStartTime = moment(inputData.start_time, "HH:mm")
      .add(accumulatedSelectedCount, "minutes")
      .format("hh:mm a");
    setStoredStartTime(newStoredStartTime);

    const newStoredStartDate = moment(inputData?.date)
      .add(accumulatedSelectedCount, "days")
      .format("YYYY-MM-DD");
    setStoredStartDate(newStoredStartDate);

    //-------- CLOUD LOGIC ------------------------------
    const optimizedEditorContent = await optimizeEditorContent(
      selectedStep?.editor_content,
    );
    // ------- CLOUD LOGIC END -------------------------

    // return;
    const updatedMeetingData = {
      ...selectedStep,
      title: selectedStep.title,
      count1: selectedStep.count1,
      count2: selectedStep.count2,
      time: selectedStep.count2,
      editor_type: selectedStep.editor_type,
      editor_content: fileName ? fileName : optimizedEditorContent,

      // editor_content: optimizedEditorContent.startsWith("<p>")
      //   ? fileName
      //   : optimizedEditorContent ? fileName : optimizedEditorContent,
      status: "active",
      file: fileName ? fileName : null,
      assigned_to: user,
      order_no: selectedStep.order_no,
      _method: "put",
    };

    try {
      setIsDisabled(true);
      const response = await axios.post(
        `${API_BASE_URL}/steps/${selectedStep?.id}`,
        updatedMeetingData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status) {
        updateTotalTime(countSum);
        // setUser(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      setIsModalOpen(false);

      // console.log("errors", error);
      // setIsDisabled(true);
      // toast.error("Échec de la copie de l'étape");
      toast.error(t("meeting.chart.error.failed"));
    } finally {
      setIsDisabled(false);
    }
  };

  // =================================> USE EFFECTS <=================================
  // useEffect(() => {
  //   // console.clear();
  //   console.log("participants", participants);
  //   setInputData((prev) => {
  //     return { ...prev, participants: participants };
  //   });
  // }, [participants]);
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
        const REQUEST_URL = fromReport
          ? `${API_BASE_URL}/showPublicMeeting/${meetingId}`
          : `${API_BASE_URL}/meetings/${meetingId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response.status) {
          const updatedSteps = response.data?.data.steps;
          const time = updatedSteps.reduce((acc, step) => acc + step.count2, 0);
          setInputData({ ...response.data?.data, steps: updatedSteps });
          setLoading(false);
          updateTotalTime(time);

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

  const [allData, setAllData] = useState([]);
  useEffect(() => {
    if (inputData && inputData?.steps) {
      setModifiedFileText(inputData?.steps?.map((step) => step.editor_content));
    }

    if (inputData) {
      const { steps } = inputData;
      let accumulatedCount2 = steps?.length > 0 ? steps[0]?.count2 : 0;
      let storedTime = moment(inputData.start_time, "HH:mm"); // Initialize stored time
      const formattedData = steps
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
        const totalCount2 = sumCount2UpToIndex(inputData?.steps, selectedIndex);
        // const newStoredStartTime = moment(inputData?.start_time,"HH:mm")
        //   .add(sumCount2Minutes, "minutes")
        //   .format("hh:mm a");
        // setStoredStartTime(newStoredStartTime);
        const newStoredStartTime =
          inputData?.steps[selectedIndex]?.time_unit === "seconds"
            ? moment(inputData?.start_time, "HH:mm:ss")
                .add(sumCount2Minutes, "minutes")
                .format("hh:mm:ss a") // Format to HH:mm:ss
            : moment(inputData?.start_time, "HH:mm")
                .add(sumCount2Minutes, "minutes")
                .format("hh:mm a"); // Format to HH:mm if not seconds
        setStoredStartTime(newStoredStartTime);

        // const newStoredStartDate =
        //   inputData?.steps[selectedIndex]?.time_unit === "seconds"
        //     ? moment(inputData?.date)
        //         .add(sumCount2Minutes, "minutes")
        //         .format("DD/MM/YYYY") // Format to HH:mm:ss
        //     : moment(inputData?.date)
        //         .add(sumCount2Minutes, "minutes")
        //         .format("DD/MM/YYYY"); // Format to HH:mm if not seconds
        //         setStoredStartDateForHour(newStoredStartDate);

        const startDate = new Date(
          `${inputData?.date}T${inputData?.start_time}`,
        );

        const newStoredStartDate =
          inputData?.steps[selectedIndex]?.time_unit === "seconds"
            ? moment(startDate) // Use startDate here
                .add(sumCount2Minutes, "minutes")
                .format("DD/MM/YYYY") // Format to DD/MM/YYYY HH:mm:ss for seconds
            : moment(startDate) // Use startDate here
                .add(sumCount2Minutes, "minutes")
                .format("DD/MM/YYYY"); // Format to DD/MM/YYYY HH:mm for other units

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

      setChartData(formattedData);
      setAllData(inputData.steps);
    }
  }, [inputData, selectedIndex]);

  const options = {
    xaxis: {
      type: "category",
      labels: {
        formatter: function (val) {
          if (data?.type === "Action1") {
            return val + ` ${t("days")} `;
          } else if (data?.type === "Task") {
            return val + ` ${t("hours")}`;
          } else if (data?.type === "Quiz") {
            return val + " sec";
          } else {
            return val + " mins";
          }
        },
      },
      // labels: {
      //   formatter: function (val, index, opts) {
      //     const time_unit =
      //       opts?.globals?.initialSeries?.[0]?.data?.[index]?.unit;
      //     console.log("time_unit", time_unit);
      //     return val + (time_unit ? ` ${time_unit}` : "");
      //   },
      // },
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
                // setStoredStartTime(startTime);
                setAccumulatedSelectedCounts(newAccumulatedSelectedCounts);
                setIsModalOpen(true);
                // if (clickedChartData && clickedChartData.id) {
                //   const clickedStepId = clickedChartData.id;
                // }
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
      x: {
        show: false,
        formatter: function (val) {
          return val;
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
      enabled: false,
      position: "center",
      style: {
        colors: ["black"],
      },
      formatter: function (val, opts) {
        var label = opts.w.globals.labels[opts.dataPointIndex];
        return label;
      },
    },
    colors: [
      "#008FFB",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
    ],
  };

  //Cloudinary API
  // const optimizeEditorContent = async (editorContent) => {
  //   if (!editorContent) {
  //     return "";
  //   }
  //   //-------- CLOUD LOGIC ------------------------------
  //   let optimizedEditorContent = "";
  //   const base64Array = extractBase64SrcFromHTML(editorContent);
  //   if (!base64Array.length > 0) {
  //     optimizedEditorContent = editorContent;
  //     return optimizedEditorContent;
  //   } else {
  //     const cloudinaryUploads = base64Array.map(async (base64Image) => {
  //       try {
  //         const response = await fetch(`{Cloundinary_URL}`", {
  //           method: "POST",
  //           body: JSON.stringify({ file: base64Image, upload_preset: "chat-application" }),
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         });
  //         const data = await response.json();
  //         return data.secure_url;
  //       } catch (error) {
  //         console.error("Error uploading image to Cloudinary:", error);
  //         return null;
  //       }
  //     });

  //     const uploadedImageUrls = await Promise.all(cloudinaryUploads);
  //     const editorContentWithCloudLinks = replaceBase64SrcWithLinks(
  //       editorContent,
  //       uploadedImageUrls
  //     );

  //     optimizedEditorContent = editorContentWithCloudLinks;
  //     return optimizedEditorContent;
  //   }
  // //   // ------- CLOUD LOGIC END -------------------------
  // };
  const [assignUser, setAssignUser] = useState(null);
  const [stepOrder, setStepOrder] = useState(null);
  useEffect(() => {
    if (inputData && inputData?.steps && selectedIndex >= 0) {
      const updatedStep = [...(inputData?.steps || [])];
      const selectedStep = updatedStep[selectedIndex];
      const currentStep = updatedStep[selectedIndex]?.count2;
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
  console.log("total_Time", total_Time);
  const [mySteps, setMySteps] = useState([]);
  const getMeeting = async () => {
    try {
      setLoading(true);
      setIsDisabled(true);
      const REQUEST_URL = fromReport
        ? `${API_BASE_URL}/showPublicMeeting/${meetingId}`
        : `${API_BASE_URL}/meetings/${meetingId}`;
      const response = await axios.get(REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.status) {
        const updatedSteps = response.data?.data.steps;
        setInputData({ ...response.data?.data, steps: updatedSteps });
        const { steps } = response.data?.data;
        setMySteps(steps);
        setLoading(false);
        setNextId(response?.data?.data?.steps[selectedIndex]?.id);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setIsDisabled(false);
    }
  };

  const [isEdited, setIsEdited] = useState(false);
  const handleEdit = async () => {
    setIsEdited(true);
    setIsDisabled(true);
    setFileUpload(null);
    // setLink(null);
    // setLink(null);
    // setModalType("Editeur")
    // setNextBtnText("Suivant...");
    // setUser("");
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];

    console.log("selectedStep", selectedStep);
    // if(!selectedStep?.userPID){
    //   toast.error('you are not authorized to edit this step.')
    //   setIsEdited(false);
    //   setIsDisabled(false);
    //   return
    // }
    const count2Difference = parseInt(selectedCount, 10) - selectedStep?.count2;
    if (puller !== undefined) {
      puller(updatedSteps);
    }
    const isUnique = updatedSteps.every(
      (step, index) => index === selectedIndex || step.title !== selectedValue,
    );
    if (!isUnique) {
      // toast.error("Le nom de l'étape doit être unique.");
      toast.error(t("meeting.chart.error.unique"));
      setIsEdited(false);
      setIsDisabled(false);
      setNextBtnText("Suivant");
      return;
    }
    // setEditorContent(selectedStep?.editor_content);
    selectedStep.editor_content = modifiedFileText[selectedIndex];
    if (modalType === "Editeur") {
      selectedStep.editor_type = "Editeur";
      setModalType("Editeur");
    } else if (modalType === "Url") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "Url";
      selectedStep.editor_content = "";
      selectedStep.link = link;
      setLink(link);
      setModalType("Url");
    } else if (modalType === "File") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "File";
      // selectedStep.file = fileUpload;
      // setFileUpload(fileUpload);
    }
    selectedStep.title = selectedValue;
    selectedStep.count2 = parseInt(selectedCount, 10);
    // console.log("time->", selectedCount);
    // selectedStep.count1 = selectedCount;
    for (let i = selectedIndex + 1; i < updatedSteps?.length; i++) {
      const currentStep = updatedSteps[i];
      currentStep.count1 += count2Difference;
    }
    // Update the time value for each step based on count1 and count2
    // let currentTime = selectedStep?.count1 + selectedStep?.count2;
    let currentTime = selectedStep?.count2;
    selectedStep.time = currentTime;

    for (let i = selectedIndex + 1; i < updatedSteps.length; i++) {
      const currentStep = updatedSteps[i];
      currentTime += currentStep?.count2;
      currentStep.time = currentTime;
    }

    const countSum = updatedSteps.reduce((sum, step) => sum + step.count2, 0);
    setTotalTime(countSum);

    const myStep = updatedSteps[selectedIndex + 1]?.count2;
    // let accumulatedSelectedCount = myStep;
    let accumulatedSelectedCount = 0;
    for (let i = 0; i < selectedIndex + 1; i++) {
      accumulatedSelectedCount += updatedSteps[i]?.count2;
    }
    console.log("accumulatedSelectedCount--->", accumulatedSelectedCount);

    // if (selectedIndex > 0) {
    const newStoredStartTime = moment(inputData.start_time, "HH:mm")
      .add(accumulatedSelectedCount, "minutes")
      .format("hh:mm a");
    console.log("newStoredStartTime--->", newStoredStartTime);
    // setStoredStartTime(newStoredStartTime);

    const newStoredStartDate = moment(inputData?.date)
      .add(accumulatedSelectedCount, "days")
      .format("YYYY-MM-DD");
    setStoredStartDate(newStoredStartDate);

    // const newStoredStartDate =
    // inputData?.steps[selectedIndex]?.time_unit === "seconds"
    //   ? moment(inputData?.date)
    //       .add(sumCount2Minutes, "minutes")
    //       .format("DD/MM/YYYY") // Format to HH:mm:ss
    //   : moment(inputData?.date)
    //       .add(sumCount2Minutes, "minutes")
    //       .format("DD/MM/YYYY"); // Format to HH:mm if not seconds
    //       setStoredStartDateForHour(newStoredStartDate);
    // }

    //-------- CLOUD LOGIC ------------------------------
    const optimizedEditorContent = await optimizeEditorContent(
      selectedStep.editor_content,
    );

    // console.log("optimizedEditorContent: ", optimizedEditorContent);
    // // ------- CLOUD LOGIC END -------------------------

    // console.log("count1 after add time-->", accumulatedSelectedCount);
    // console.log("selectedStep.count1-->", selectedStep.count1);
    // return;
    const updatedMeetingData = {
      ...selectedStep,
      title: selectedStep.title,
      count1: selectedStep.count1,
      count2: selectedStep.count2,
      // time_unit: data?.type === "Action" ? "days" : 'minutes',
      // time_unit:
      //   data?.type === "Action"
      //     ? "days"
      //     : data?.type === "Quiz"
      //     ? "seconds"
      //     : "minutes",
      time_unit:
        data?.type === "Action1"
          ? "days"
          : data?.type === "Task"
            ? "hours"
            : data?.type === "Quiz"
              ? "seconds"
              : "minutes",
      time: selectedStep.count2,
      editor_type: selectedStep.editor_type,
      editor_content:
        selectedStep.editor_type === "Editeur"
          ? optimizedEditorContent || ""
          : null,
      file:
        selectedStep.editor_type === "File"
          ? fileName
            ? fileName
            : null
          : null,
      url: selectedStep.editor_type === "Url" ? (link ? link : null) : null,
      status: "active",
      assigned_to: user,
      order_no: selectedStep.order_no,
      _method: "put",
    };

    try {
      // setIsDisabled(true);
      const response = await axios.post(
        `${API_BASE_URL}/steps/${selectedStep?.id}`,
        updatedMeetingData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status) {
        // setCall(true)
        setIsEdited(false);
        setIsDisabled(false);
        setNextId(response.data.data?.id);
        await getStep();

        updateTotalTime(countSum);
        setNextBtnText("Suivant");
        // setUser(null);

        // LOGIC FOR GOIG TO NEXT STEP ----------------
        const nextIndex = selectedIndex + 1;
        const index = selectedIndex;
        if (nextIndex < updatedSteps?.length) {
          const nextStep = updatedSteps[nextIndex];
          setNextId(nextStep.id);
          const step = updatedSteps[index];
          const nextSelectedValue = nextStep?.title;
          const nextSelectedCount = nextStep?.count2;
          const count = step.count2;
          setSelectedValue(nextSelectedValue);
          setSelectedCount(nextSelectedCount);
          setSelectedIndex(nextIndex);
          setStoredStartTime(newStoredStartTime);
          setStoredStartDate(newStoredStartDate);
          setFileName(nextStep?.editor_content);
          setLink(nextStep?.editor_content);
          setPreviewUrl(nextStep?.editor_content);

          // setAssignUser(step?.assigned_to_name);
          // setModalType("Editeur");
        } else {
          setModalType("");
          setFileUpload(null);
          setFileName(null);
          setLink(null);
          setIsModalOpen(false);
          setSelectedIndex(null);
          setSelectedValue(null);
          setSelectedCount(null);
        }
        // --------------------------------------------
      }
    } catch (error) {
      // console.log("errors", error);
      setNextBtnText("Suivant");
      // toast.error("Échec de la copie de l'étape");
      toast.error(t("meeting.chart.error.failed"));
    } finally {
      setIsEdited(false);
      setIsDisabled(false);
      // setIsChartClosed(true)
    }
  };

  const getStep = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/steps/${nextId}`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      // console.clear("clear");
      if (response.status) {
        setShowPreview(true);
        setFileName(response.data.data.file);
        setLink(response.data?.data?.url);
        setPreviewUrl(response?.data?.data?.url);
        setUser(response.data?.data?.assigned_to);
      }
    } catch (error) {
      console.log("error while processing get step", error);
    }
  };

  useEffect(() => {
    getStep();
  }, [nextId]);
  const [isAdd, setIsAdd] = useState(false);
  const handleAddStep = async () => {
    setIsAdd(true);
    setUser(null);
    // setAddBtnText("Ajouter une étape");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/steps`,
        {
          title: "new step",
          count1: 0,
          count2: 1,
          time: 1,
          editor_type: "Editeur",
          editor_content: "",
          file: null,
          assigned_to: null,
          order_no: stepOrder,
          // _method: "post",
          meeting_id: meetingId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        setIsAdd(false);
        setNextId(response.data.data.id);
        await getMeeting();
        setUser(null);
        // setIsModalOpen(false)
      }
    } catch (error) {
      console.log("Error: ", error);
      setIsAdd(false);
    }
  };

  const [isCopied, setIsCopied] = useState(false);
  const handleCopyStep = async () => {
    setIsCopied(true);
    // setUser(null);
    setCopyBtnText("Copier l’étape...");
    const updatedSlides = [...(inputData.steps || [])];
    const selectedStep = updatedSlides[selectedIndex];
    const isUnique = updatedSlides.every(
      (step, index) => index === selectedIndex || step.title !== selectedValue,
    );
    if (!isUnique) {
      // toast.error(t("meeting.chart.error.unqiue"));
      toast.error(t("meeting.chart.error.unique"));
      setIsCopied(false);
      setIsDisabled(false);
      return;
    }

    // Determine the editor type based on the format of the editor content
    let editorType = "Editeur"; // Default to Editeur
    if (
      selectedStep.editor_content &&
      selectedStep.editor_content.startsWith("<p>")
    ) {
      editorType = "File"; // If editor content starts with <p>, set editor type to File
    }

    selectedStep.editor_content = modifiedFileText[selectedIndex];
    if (modalType === "Editeur") {
      selectedStep.editor_type = "Editeur";
      setModalType("Editeur");
    } else if (modalType === "Url") {
      selectedStep.editor_type = "Url";
      // selectedStep.editor_content = link;
      setModalType("Url");
      // setLink(link);
    } else if (modalType === "File") {
      selectedStep.editor_type = "File";
      // selectedStep.file = fileUpload;
      // setModalType("File");
    }

    const selectedSlide = updatedSlides[selectedIndex];

    if (selectedSlide) {
      const copiedSlide = { ...selectedSlide };
      const insertIndex = selectedIndex + 1;

      if (insertIndex < updatedSlides.length) {
        updatedSlides.splice(insertIndex, 0, copiedSlide);
      } else {
        updatedSlides.push(copiedSlide);
      }

      const previousSlide = updatedSlides[insertIndex - 1];
      // const newCount1 = previousSlide.count1 + previousSlide.count2;
      const newCount1 = previousSlide.count2;

      copiedSlide.count1 = newCount1;
      copiedSlide.count2 = selectedCount;
      let accumulatedSelectedCount = 0;
      for (let i = 0; i < selectedIndex + 1; i++) {
        accumulatedSelectedCount += updatedSlides[i].count2;
      }

      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");
      setStoredStartTime(newStoredStartTime);

      const newStoredStartDate = moment(inputData?.date)
        .add(accumulatedSelectedCount, "days")
        .format("YYYY-MM-DD");
      setStoredStartDate(newStoredStartDate);

      for (let i = insertIndex + 1; i < updatedSlides.length; i++) {
        const currentSlide = updatedSlides[i];
        const nextSlide = updatedSlides[i - 1];
        // currentSlide.count1 = nextSlide.count1 + nextSlide.count2;
        currentSlide.count1 = nextSlide.count2;
        // currentSlide.fileText = modifiedFileText[i - 1];
      }
      if (selectedSlide.title !== selectedValue) {
        copiedSlide.title = selectedValue;
      }

      copiedSlide.time = selectedCount;
      const newCountSum = countSum + copiedSlide.count2;
      setCountSum(newCountSum);

      const newLastCountSum = updatedSlides.reduce(
        (sum, step) => sum + step.count2,
        0,
      );
      //-------- CLOUD LOGIC ------------------------------
      const optimizedEditorContent = await optimizeEditorContent(
        copiedSlide.editor_content,
      );
      // ------- CLOUD LOGIC END -------------------------
      const duplicateStepData = {
        title: copiedSlide.title,
        count1: copiedSlide.count1 || 0,
        count2: copiedSlide.count2,
        // time_unit: copiedSlide.time_unit,
        // time_unit: data?.type === "Action" ? "days" : timeUnit,
        time_unit:
          data?.type === "Action1"
            ? "days"
            : data?.type === "Task"
              ? "hours"
              : data?.type === "Quiz"
                ? "seconds"
                : "minutes",

        time: copiedSlide.count2,
        editor_type: copiedSlide.editor_type,
        editor_content:
          selectedStep.editor_type === "Editeur"
            ? optimizedEditorContent || ""
            : null,
        order_no: selectedStep.order_no,
        assigned_to: user,
        status: "active",
        file:
          selectedStep.editor_type === "File"
            ? fileName
              ? fileName
              : null
            : null,
        url: selectedStep.editor_type === "Url" ? (link ? link : null) : null,
        _method: "put",
        duplicate: true,
        meeting_id: meetingId,
      };
      const formattedData = updatedSlides
        .map((item) => ({
          x: item.title,
          y: [item.count1, item.count1 + item.count2, item.count2],
        }))
        .reverse();
      // setChartData(formattedData);
      try {
        setIsDisabled(true);
        const response = await axios.post(
          `${API_BASE_URL}/steps/${selectedStep?.id}`,
          duplicateStepData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        if (response.status) {
          setPreviousId(response.data.data?.id);
          setIsCopied(false);
          setCopyBtnText("Copier l’étape");
          // setChartData(formattedData);
          setTotalTime(newLastCountSum);
          updateTotalTime(newLastCountSum);
          getMeeting();
          // setType(response.data?.data?.editor_content);
          setFileName(response.data?.data?.file);
          setLink(response.data?.data?.url);
          // setFileUpload(response?.data?.data?.editor_content);
          // setFileName(response?.data?.data?.editor_content);
          setSelectedIndex(insertIndex);
          setSelectedValue(response.data?.data.title);
          setSelectedCount(copiedSlide.count2);
          setUser(null);
        }
      } catch (error) {
        setCopyBtnText("Copier l’étape");
        toast.error(error.response.data.message);
        // toast.error("Échec de la copie de l'étape");
      } finally {
        setIsDisabled(false);
        setIsCopied(false);
      }
    } else {
      toast.error(t("meeting.chart.error.failed"));
      setIsDisabled(false);
    }
  };

  useEffect(() => {
    getMeeting();
  }, [id, selectedIndex, meetingId]);

  const handleChange1 = (event) => {
    setSelectedValue(event.target.value);
  };
  const handleIncrementCount = () => {
    setSelectedCount((prevCount) => prevCount + 1);
  };
  const handleDecrementCount = () => {
    setSelectedCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
  };

  const [isDeleted, setIsDeleted] = useState(false);

  const handleModalDelete = async () => {
    setIsDeleted(true);
    const updatedSteps = [...(inputData.steps || [])];
    const deletedStep = updatedSteps.splice(selectedIndex, 1)[0];
    setCountSum((prevCountSum) => prevCountSum - deletedStep.count2);

    // Update the subsequent steps' count1 values
    for (let i = selectedIndex; i < updatedSteps.length; i++) {
      const currentStep = updatedSteps[i];
      const previousStep = updatedSteps[i - 1];

      if (previousStep) {
        currentStep.count1 = previousStep.count1 + previousStep.count2;
      } else {
        // If there is no previous step, set the count1 to 0
        currentStep.count1 = 0;
      }
    }

    const newLastCountSum = updatedSteps.reduce(
      (sum, step) => sum + step.count2,
      0,
    );
    const formattedData = updatedSteps
      .map((item) => ({
        x: item.title,
        y: [item.count1, item.count1 + item.count2, item.count2],
        // y: [item.counts[0], item.counts[0] + item.counts[1], item.counts[1]],
      }))
      .reverse();
    try {
      setIsDisabled(true);
      const response = await axios.delete(
        `${API_BASE_URL}/steps/${deletedStep?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        setIsDeleted(false);
        toast.success(t("meeting.chart.error.delete"));
        setChartData(formattedData);
        // setInputData(updatedMeetingData);
        setTotalTime(newLastCountSum);
        updateTotalTime(newLastCountSum);
        setIsModalOpen(false);
        // setSelectedValue(selectedStep.title)
        setSelectedValue(updatedSteps[selectedIndex - 1].title);
        setSelectedIndex(selectedIndex - 1);
        getMeeting();
      }
    } catch (error) {
      // console.log("error: ", error);
    } finally {
      setIsDisabled(false);
      setIsDeleted(false);
    }
    // toast.success("Data has been deleted permanently.");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [previousId, setPreviousId] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const handleLeftNavigation = async () => {
    // setFileName("")
    setLink(null);
    setIsUpdated(true);
    setIsDisabled(true);
    setUser("");
    setAssignUser(previousStep?.assigned_to_name);
    // setPrevBtnText("Précédent...");
    if (selectedIndex > 0) {
      const updatedSteps = [...(inputData?.steps || [])];
      const selectedStep = updatedSteps[selectedIndex];
      const count2Difference =
        parseInt(selectedCount, 10) - selectedStep?.count2;

      const isUnique = updatedSteps.every(
        (step, index) =>
          index === selectedIndex || step.title !== selectedValue,
      );
      if (!isUnique) {
        // toast.error("Le nom de l'étape doit être unique.");
        toast.error(t("meeting.chart.error.unique"));

        setIsDisabled(false);
        setIsUpdated(false);

        setPrevBtnText("Précédent");
        return;
      }

      selectedStep.editor_content = modifiedFileText[selectedIndex];

      if (modalType === "Editeur") {
        selectedStep.editor_type = "Editeur";
        setModalType("Editeur");
      } else if (modalType === "Url") {
        selectedStep.editor_type = "Url";
        // selectedStep.editor_content = link;
        selectedStep.editor_content = "";
        // selectedStep.link = link;
        // setLink(link);
        // setLink(link);
        setModalType("Url");
      } else if (modalType === "File") {
        selectedStep.editor_type = "File";
        // selectedStep.file = fileUpload;
        // setModalType("File");
      }
      selectedStep.title = selectedValue;
      selectedStep.count2 = parseInt(selectedCount, 10);

      const newSelectedIndex = selectedIndex - 1;
      const dataPointIndex = chartData.length - 1 - newSelectedIndex;

      // // Update the time value for each step based on count1 and count2
      // for (let i = selectedIndex; i < updatedSteps.length; i++) {
      //   const currentStep = updatedSteps[i];
      //   const previousStep = updatedSteps[i - 1];
      //   // Update time value for each step
      // }

      setSelectedIndex(newSelectedIndex);
      setSelectedBar(chartData[dataPointIndex].x);
      setSelectedValue(chartData[dataPointIndex].x);
      setSelectedCount(chartData[dataPointIndex].y[2]);

      const selectedCounts = chartData
        .slice(dataPointIndex + 1)
        .map((item) => item.y[2]);
      const totalSelectedCount = selectedCounts.reduce(
        (sum, count) => sum + count,
        0,
      );
      const myStep = updatedSteps[selectedIndex - 1]?.count2;
      // Calculate the accumulated time up to the selected step
      let accumulatedSelectedCount = 0;
      for (let i = 0; i < newSelectedIndex; i++) {
        accumulatedSelectedCount += updatedSteps[i]?.count2;
      }

      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");

      setStoredStartTime(newStoredStartTime);

      const newStoredStartDate = moment(inputData?.date)
        .add(accumulatedSelectedCount, "days")
        .format("YYYY-MM-DD");
      setStoredStartDate(newStoredStartDate);
      // const newAccumulatedSelectedCounts = accumulatedSelectedCounts
      //   .slice(0, newSelectedIndex)
      //   .concat(totalSelectedCount);

      // const start_Time = moment(inputData.start_time, "HH:mm")
      //   .add(
      //     newAccumulatedSelectedCounts.reduce((sum, count) => sum + count, 0),
      //     "minutes"
      //   )
      //   .format("hh:mm a");

      if (editorContent.length > newSelectedIndex) {
        setEditorContent((prevContents) =>
          prevContents.map((content, index) =>
            index === newSelectedIndex
              ? content
              : editorContent[chartData.length - 1 - index],
          ),
        );
      }

      setSelectedCount(chartData[dataPointIndex].y[2]);
      setTotalSelectedCount(totalSelectedCount);
      // setStoredStartTime(start_Time);
      // setAccumulatedSelectedCounts(newAccumulatedSelectedCounts);
      setIsModalOpen(true);

      const countSum = updatedSteps.reduce((sum, step) => sum + step.count2, 0);

      const optimized_EditorContent = await optimizeEditorContent(
        selectedStep.editor_content,
      );

      const updatedMeetingData = {
        ...selectedStep,
        title: selectedStep.title,
        count1: selectedStep.count1,
        count2: selectedStep.count2,
        // time_unit: selectedStep.time_unit,
        // time_unit: data?.type === "Action" ? "days" : timeUnit,
        time_unit:
          data?.type === "Action1"
            ? "days"
            : data?.type === "Task"
              ? "hours"
              : data?.type === "Quiz"
                ? "seconds"
                : "minutes",
        time: selectedStep.count2,
        editor_type: selectedStep.editor_type,
        // editor_content: fileName ? fileName : optimized_EditorContent,
        editor_content:
          selectedStep.editor_type === "Editeur"
            ? optimized_EditorContent || ""
            : null,

        // file: fileUpload ? null : fileUpload,
        // file: optimized_EditorContent ? null : fileName,
        status: "active",
        file:
          selectedStep.editor_type === "File"
            ? fileName
              ? fileName
              : null
            : null,
        url: selectedStep.editor_type === "Url" ? (link ? link : null) : null,
        assigned_to: user,
        _method: "put",
      };

      try {
        // setIsDisabled(true);
        const response = await axios.post(
          `${API_BASE_URL}/steps/${selectedStep?.id}`,
          updatedMeetingData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );

        if (response.status) {
          const id = response.data.data?.id - 1;
          setPrevBtnText("Précédent");
          // setLink(response.data?.data?.url);
          setIsUpdated(false);
          setIsDisabled(false);
          // const nextStep = mySteps[newSelectedIndex];
          const nextStep = updatedSteps[newSelectedIndex];
          // setPreviousId(nextStep?.id);
          const nextSelectedValue = nextStep?.title;
          const nextSelectedCount = nextStep?.count2;
          updateTotalTime(countSum);
          setUser(null);
          setSelectedValue(nextSelectedValue);
          setSelectedValue(nextSelectedValue);
          // await getPreviousStep();

          try {
            const response = await axios.get(
              `${API_BASE_URL}/steps/${nextStep?.id}`,
              {
                headers: {
                  Authorization: `Bearer ${CookieService.get("token")}`,
                },
              },
            );
            // console.clear("clear");
            console.log("previous step data--->", response.data.data);
            if (response.status) {
              setFileName(response.data.data.file);
              setLink(response.data.data?.url);
              setPreviewUrl(response.data.data?.url);
            }
          } catch (error) {
            // console.log(error);
          }

          // setFileName(nextStep?.editor_content);
          // setFileUpload(nextStep?.editor_content);
        }
      } catch (error) {
        // toast.error("Échec de la copie de l'étape");
        toast.error(t("meeting.chart.error.failed"));
        setIsDisabled(false);
      } finally {
        setIsDisabled(false);
        setIsUpdated(false);
      }
    }
  };

  const getPreviousStep = async () => {
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];

    try {
      const response = await axios.get(`${API_BASE_URL}/steps/${previousId}`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      // console.clear("clear")
      if (response.status) {
        setFileName(response.data.data.file);
        setLink(response.data.data?.url);
        setPreviewUrl(response.data.data?.url);
        // setModifiedFileText[previousId](response.data?.data?.editor_content);
      }
    } catch (error) {
      console.log("error while processing get step", error);
    }
  };

  useEffect(() => {
    getPreviousStep();
  }, []);

  const nextStep = () => {
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex + 1]?.count2;

    const updatedChartData = [...chartData];
    const slideIndex = updatedChartData.length - selectedIndex - 1;
    updatedChartData[slideIndex].x = selectedValue;

    let accumulatedSelectedCount = selectedStep;
    for (let i = 0; i < selectedIndex + 1; i++) {
      accumulatedSelectedCount += updatedSteps[i]?.count2;
    }

    const newStoredStartTime = moment(inputData.start_time, "HH:mm")
      .add(accumulatedSelectedCount, "minutes")
      .format("hh:mm a");
    // Update the state with new storedStartTime
    setStoredStartTime(newStoredStartTime);

    const newStoredStartDate = moment(inputData?.date)
      .add(accumulatedSelectedCount, "days")
      .format("YYYY-MM-DD");
    setStoredStartDate(newStoredStartDate);
    // LOGIC FOR GOIG TO NEXT STEP ----------------

    const nextIndex = selectedIndex + 1;
    if (nextIndex < updatedSteps?.length) {
      const nextStep = updatedSteps[nextIndex];
      const nextChartDataIndex = updatedChartData.length - nextIndex - 1;
      const nextSelectedBar = updatedChartData[nextChartDataIndex].x;
      const nextSelectedValue = nextStep?.title;
      const nextSelectedCount = nextStep?.count2;

      setSelectedBar(nextSelectedBar);
      setSelectedValue(nextSelectedValue);
      setSelectedCount(nextSelectedCount);
      setSelectedIndex(nextIndex);
      // setStoredStartTime(newStoredStartTime);
    } else {
      setIsModalOpen(false);
      setSelectedIndex(null);
      setSelectedValue(null);
      setSelectedCount(null);
    }
  };

  const previousStep = () => {
    if (selectedIndex > 0) {
      const updatedSteps = [...(inputData?.steps || [])];
      const selectedStep = updatedSteps[selectedIndex - 1]?.count2;

      const newSelectedIndex = selectedIndex - 1;
      const dataPointIndex = chartData.length - 1 - newSelectedIndex;

      // Calculate the accumulated time up to the selected step
      let accumulatedSelectedCount = selectedStep;
      for (let i = 0; i < newSelectedIndex; i++) {
        accumulatedSelectedCount += updatedSteps[i]?.count2;
      }

      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");

      const newStoredStartDate = moment(inputData?.date)
        .add(accumulatedSelectedCount, "days")
        .format("YYYY-MM-DD");

      setSelectedIndex(newSelectedIndex);
      setSelectedBar(chartData[dataPointIndex].x);
      setSelectedValue(chartData[dataPointIndex].x);
      setSelectedCount(chartData[dataPointIndex].y[2]);

      if (editorContent.length > newSelectedIndex) {
        setEditorContent((prevContents) =>
          prevContents.map((content, index) =>
            index === newSelectedIndex
              ? content
              : editorContent[chartData.length - 1 - index],
          ),
        );
      }

      setSelectedCount(chartData[dataPointIndex].y[2]);
      setTotalSelectedCount(totalSelectedCount);
      setIsModalOpen(true);
      setStoredStartTime(newStoredStartTime); // Update the stored start time
      setStoredStartDate(newStoredStartDate);
      setPrevBtnText("Précédent");
      updateTotalTime(countSum);
      // setUser(null);
    }
  };

  const editorRef = useRef(null);
  const filteredParticipants = inputData?.user_with_participants;
  // const filteredParticipants = inputData?.user_with_participants?.filter(
  //   (participant) =>
  //     `${participant.first_name} ${participant.last_name}` !== assignUser
  // );

  const filteredParticipantsLength = filteredParticipants?.length;
  return (
    <>
      <div
        id="chart-container"
        className="chart-content"
        style={{ width: "100%", height: "500px", overflow: "hidden" }}
      >
        <ReactApexChart
          options={options}
          series={[{ data: chartData }]}
          type="rangeBar"
          height={500}
        />
        {isModalOpen && selectedBar !== null && (
          <div>
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-nav">
                  <div>
                    {
                      <h4>
                        {location.includes("step-details")
                          ? ""
                          : t("meeting.newMeeting.Edit a step")}
                      </h4>
                    }
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      disabled={isDisabled}
                      className="cross-btn"
                      onClick={handleCloseModal}
                    >
                      <RxCross2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="row d-flex justify-content-center">
                  <div className="col-md-7">
                    <div className="d-flex justify-content-arround align-items-center gap-4">
                      <div className="input-field">
                        <div
                          style={{
                            flexGrow: 1,
                            textAlign: "left",
                            paddingLeft: "10px",
                          }}
                        >
                          <img
                            src="/Assets/Vector.svg"
                            alt="Edit"
                            className="img-fluid edit-icon"
                          />
                        </div>
                        <div style={{ flexGrow: 1, textAlign: "center" }}>
                          <input
                            className="text-center step-name"
                            type="text"
                            placeholder={t("stepModal.title")}
                            value={selectedValue}
                            onChange={handleChange1}
                            disabled={
                              inputData?.steps[selectedIndex]?.participant
                                ?.userPID !==
                                parseInt(CookieService.get("user_id")) &&
                              parseInt(CookieService.get("user_id")) !==
                                inputData?.user_id
                                ? true
                                : false ||
                                    window.location.href.includes(
                                      "/meetingDetail",
                                    ) ||
                                    fromReport
                                  ? true
                                  : false
                            }
                          />
                        </div>

                        <div
                          style={{
                            flexGrow: 1,
                            textAlign: "right",
                            paddingRight: "10px",
                          }}
                        >
                          {selectedIndex + 1}/{chartData?.length}
                        </div>
                      </div>
                      {/* <br /> */}
                      <select
                        className="form-select"
                        style={{
                          width: "13rem",
                        }}
                        // value={modalType === "Editeur" ? "Editeur" : "File"}
                        value={
                          modalType === "Editeur"
                            ? "Editeur"
                            : modalType === "File"
                              ? "File"
                              : "Url"
                        }
                        onChange={(e) => setModalType(e.target.value)}
                        disabled={
                          fromReport ||
                          // (parseInt(CookieService.get("user_id")) !==
                          //   inputData?.user_id &&
                          //   !inputData?.steps[selectedIndex]?.userPID)
                          (inputData?.steps[selectedIndex]?.participant
                            ?.userPID !==
                            parseInt(CookieService.get("user_id")) &&
                            parseInt(CookieService.get("user_id")) !==
                              inputData?.user_id)
                            ? true
                            : false
                        }
                      >
                        <option value={"Editeur"}>
                          {t("stepModal.editor")}
                        </option>
                        <option value={"File"}>{t("stepModal.pdf")}</option>
                        {/* <option value={"Url"}>Url</option> */}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-3 modal-body">
                  <div className="container-fluid">
                    <div className="row">
                      <div className="text-center col-md-2 col-6">
                        <div className="p-2 card timecard">
                          <p>{t("meeting.newMeeting.The stage starts at")}</p>
                          {/* <h5>{storedStartTime}</h5> */}

                          {data?.type === "Action1" ? (
                            <>
                              <h6 style={{ fontSize: "14px" }}>
                                {storedStartDate}
                              </h6>
                              {/* <h6 style={{fontSize:'14px'}}>{storedStartTime}</h6> */}
                            </>
                          ) : (
                            <>
                              <h5>{storedStartTime}</h5>
                              {storedStartDateForHour}
                            </>
                          )}
                        </div>
                        <br />
                        {!window.location.href.includes("/meetingDetail") && (
                          <div className="p-2 card timecard ">
                            <p>
                              {t(
                                "meeting.newMeeting.Estimated time of the stage",
                              )}
                            </p>
                            <div className="d-flex align-items-center justify-content-around">
                              <div>
                                <img
                                  src="/Assets/minus1.svg"
                                  alt="minus"
                                  className="img-fluid "
                                  width={"15px"}
                                  style={{ cursor: "pointer" }}
                                  // onClick={handleDecrementCount}
                                  onClick={() => {
                                    if (
                                      fromReport ||
                                      // // (parseInt(
                                      // //   CookieService.get("user_id")
                                      // // ) !== inputData?.user_id &&
                                      //   !inputData?.steps[selectedIndex]
                                      //     ?.userPID)
                                      (inputData?.steps[selectedIndex]
                                        ?.participant?.userPID !==
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) &&
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) !== inputData?.user_id)
                                        ? true
                                        : false
                                    )
                                      return;
                                    handleDecrementCount();
                                  }}
                                />{" "}
                                {/* &nbsp; &nbsp; */}
                                {/* <span>{selectedCount} Min</span>&nbsp;&nbsp; */}
                                <span>{selectedCount}</span>{" "}
                                {/* &nbsp;&nbsp; */}
                                <img
                                  src="/Assets/plus1.svg"
                                  alt="plus"
                                  className="img-fluid"
                                  width={"15px"}
                                  style={{ cursor: "pointer" }}
                                  // onClick={handleIncrementCount}
                                  onClick={() => {
                                    if (
                                      fromReport ||
                                      // (parseInt(
                                      //   CookieService.get("user_id")
                                      // ) !== inputData?.user_id &&
                                      //   !inputData?.steps[selectedIndex]
                                      //     ?.userPID)
                                      (inputData?.steps[selectedIndex]
                                        ?.participant?.userPID !==
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) &&
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) !== inputData?.user_id)
                                        ? true
                                        : false
                                    ) {
                                      return;
                                    }
                                    handleIncrementCount();
                                  }}
                                />
                              </div>
                              <div>
                                {data?.type === "Action1" ? (
                                  <span> {t("days")} </span>
                                ) : data?.type === "Task" ? (
                                  <span> {t("hours")} </span>
                                ) : data?.type === "Quiz" ? (
                                  <span> {t("sec")} </span>
                                ) : (
                                  <span>mins</span>

                                  // <select
                                  //   className="select-dropdown"
                                  //   value={timeUnit}
                                  //   onChange={(e) =>
                                  //     setTimeUnit(e.target.value)
                                  //   }
                                  // >
                                  //   {/* <option
                                  //     value="seconds"
                                  //     className="option-dropdown"
                                  //   >
                                  //     Seconds
                                  //   </option> */}
                                  //   <option
                                  //     value="minutes"
                                  //     className="option-dropdown"
                                  //   >
                                  //     Minutes
                                  //   </option>
                                  //   {/* <option
                                  //     value="hours"
                                  //     className="option-dropdown"
                                  //   >
                                  //     Hours
                                  //   </option> */}
                                  // </select>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-2 mt-3 card timecard">
                          <p>Guide</p>

                          {/* <label className="form-label">
                            {assignUser === null
                              ? `${inputData?.user?.name} ${
                                  inputData?.user?.last_name !== null
                                    ? inputData.user.last_name
                                    : " "
                                }`
                              : assignUser}
                          </label> */}

                          {filteredParticipantsLength > 0 && (
                            // !filteredParticipants?.every(
                            //   (participant) => participant?.isCreator === 1
                            // ) &&
                            <select
                              hidden={fromReport}
                              className="select"
                              value={user}
                              onChange={handleUserSelect}
                              disabled={
                                // parseInt(
                                //   CookieService.get("user_id")
                                // ) !== inputData?.user_id &&
                                // !inputData?.steps[selectedIndex]?.userPID
                                inputData?.steps[selectedIndex]?.participant
                                  ?.userPID !==
                                  parseInt(CookieService.get("user_id")) &&
                                parseInt(CookieService.get("user_id")) !==
                                  inputData?.user_id
                                  ? true
                                  : false ||
                                      window.location.href.includes(
                                        "/meetingDetail",
                                      ) ||
                                      fromReport
                                    ? true
                                    : false
                              }
                            >
                              {/* <option value="">
                              {participants?.length === 0
                                ? t("No Guests Available")
                                : t("meeting.newMeeting.Select Guests")}
                            </option> */}
                              <option value="" disabled>
                                {inputData?.user_with_participants.length === 0
                                  ? t("No Guests Available")
                                  : t("meeting.newMeeting.Select Guests")}
                              </option>
                              {inputData?.user_with_participants
                                // ?.filter(
                                //   (participant) =>
                                //     `${participant.first_name} ${participant.last_name}` !==
                                //     assignUser
                                // )
                                // &&
                                //                           participants
                                ?.reduce((uniqueParticipants, item) => {
                                  const isDuplicate = uniqueParticipants.some(
                                    (participant) =>
                                      participant.first_name ===
                                        item.first_name &&
                                      participant.last_name ===
                                        item.last_name &&
                                      participant.email === item.email &&
                                      participant.post === item.post,
                                  );

                                  if (!isDuplicate) {
                                    uniqueParticipants.push(item);
                                  }
                                  return uniqueParticipants;
                                }, [])
                                .map((item, index) => {
                                  // if (item?.isCreator === 1) {
                                  //   return;
                                  // }
                                  return (
                                    <>
                                      {(item.first_name === null) &
                                        (item.last_name === null) &&
                                      item.email === null &&
                                      item.post === null ? (
                                        <>
                                          <option value="" disabled>
                                            {t(
                                              "meeting.newMeeting.No Guest Available",
                                            )}
                                          </option>
                                        </>
                                      ) : (
                                        <option key={index} value={item.id}>
                                          {/* {item.first_name} */}
                                          {`${item.first_name} ${item.last_name}`}
                                        </option>
                                      )}
                                    </>
                                  );
                                })}

                              {/* {inputData?.participants &&
                              inputData?.participants?.map((item, index) => (
                                <>
                                  {(item.first_name === null) &
                                    (item.last_name === null) &&
                                  item.email === null &&
                                  item.post === null ? (
                                    <>
                                      <option value="" disabled>
                                        {t(
                                          "meeting.newMeeting.No Guest Available"
                                        )}
                                      </option>
                                    </>
                                  ) : (
                                    <option key={index} value={item.id}>
                                      {`${item.first_name} ${item.last_name}`}
                                    </option>
                                  )}
                                </>
                              ))} */}
                            </select>
                          )}
                        </div>
                        <div className="mt-4 modal-button">
                          {/* Add Step button */}
                          {/* {window.location.href.includes("/meetingDetail") ? (
                            <div>
                              <button
                                className="btn btn-primary"
                                // onClick={handleCopyStep}
                                // onClick={handleEdit}
                                style={{ width: "100%" }}
                                disabled={
                                  fromReport === true ||
                                  window.location.href.includes(
                                    "/meetingDetail"
                                  )
                                    ? true
                                    : false
                                }
                              >
                                {addBtnText}
                              </button>
                            </div>
                          ) : (
                            <>
                              {isAdd ? (
                                <>
                                  <div>
                                    <Button
                                      variant="blue"
                                      disabled
                                      className="w-100"
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <button
                                    disabled={isDisabled || fromReport}
                                    hidden={fromReport}
                                    className="btn btn-primary"
                                    onClick={handleAddStep}
                                    style={{ width: "100%" }}
                                  >
                                    {addBtnText}
                                  </button>
                                </div>
                              )}
                            </>
                          )} */}
                          {/* Copy Step button */}

                          {window.location.href.includes("/meetingDetail") ? (
                            <div>
                              <button
                                className="btn btn-primary"
                                // onClick={handleCopyStep}
                                // onClick={handleEdit}
                                style={{ width: "100%" }}
                                disabled={
                                  // !inputData?.steps[selectedIndex].userPID ||
                                  inputData?.steps[selectedIndex]?.participant
                                    ?.userPID !==
                                    parseInt(
                                      CookieService.get("user_id"),
                                    ) &&
                                  parseInt(
                                    CookieService.get("user_id"),
                                  ) !== inputData?.user_id
                                    ? true
                                    : false ||
                                        fromReport === true ||
                                        window.location.href.includes(
                                          "/meetingDetail",
                                        )
                                      ? true
                                      : false
                                }
                              >
                                {/* {copyBtnText} */}
                                {t("meeting.chart.buttons.copy")}
                              </button>
                            </div>
                          ) : (
                            <>
                              {isCopied ? (
                                <>
                                  <div>
                                    <Button
                                      variant="blue"
                                      disabled
                                      className="w-100"
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <button
                                    disabled={
                                      isDisabled ||
                                      fromReport ||
                                      // (parseInt(
                                      //   CookieService.get("user_id")
                                      // ) !== inputData?.user_id &&
                                      //   !inputData?.steps[selectedIndex]
                                      //     ?.userPID)
                                      (inputData?.steps[selectedIndex]
                                        ?.participant?.userPID !==
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) &&
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) !== inputData?.user_id)
                                        ? true
                                        : false
                                    }
                                    hidden={fromReport}
                                    className="btn btn-primary"
                                    onClick={handleCopyStep}
                                    style={{ width: "100%" }}
                                  >
                                    {/* {copyBtnText} */}
                                    {t("meeting.chart.buttons.copy")}
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {window.location.href.includes("/meetingDetail") ? (
                            <div>
                              <button
                                //  disabled={isDisabled}
                                className="btn btn-danger"
                                // onClick={handleModalDelete}
                                style={{ width: "100%" }}
                                disabled={
                                  // parseInt(
                                  //   CookieService.get("user_id")
                                  // ) !== inputData?.user_id &&
                                  // !inputData?.steps[selectedIndex]?.userPID
                                  inputData?.steps[selectedIndex]?.participant
                                    ?.userPID !==
                                    parseInt(
                                      CookieService.get("user_id"),
                                    ) &&
                                  parseInt(
                                    CookieService.get("user_id"),
                                  ) !== inputData?.user_id
                                    ? true
                                    : false ||
                                        window.location.href.includes(
                                          "/meetingDetail",
                                        ) ||
                                        fromReport
                                      ? true
                                      : false
                                }
                              >
                                {t("meeting.chart.buttons.delete")}
                              </button>
                            </div>
                          ) : (
                            <>
                              {isDeleted ? (
                                <>
                                  <div>
                                    <Button
                                      variant="dark"
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                      disabled
                                      className="w-100"
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <button
                                    disabled={
                                      isDisabled ||
                                      fromReport ||
                                      // (parseInt(
                                      //   CookieService.get("user_id")
                                      // ) !== inputData?.user_id &&
                                      //   !inputData?.steps[selectedIndex]
                                      //     ?.userPID)
                                      (inputData?.steps[selectedIndex]
                                        ?.participant?.userPID !==
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) &&
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) !== inputData?.user_id)
                                        ? true
                                        : false
                                    }
                                    className="btn btn-danger"
                                    onClick={handleModalDelete}
                                    style={{ width: "100%" }}
                                    hidden={fromReport}
                                  >
                                    {/* Supprimer */}
                                    {t("meeting.chart.buttons.delete")}
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {window.location.href.includes("/meetingDetail") ? (
                            <>
                              <div>
                                {selectedIndex <
                                  inputData?.steps?.length - 1 && (
                                  <button
                                    // disabled={isDisabled}
                                    className="btn btn-primary buttons"
                                    onClick={nextStep}
                                    style={{ width: "100%" }}
                                    // disabled={
                                    //   window.location.href.includes(
                                    //     "/meetingDetail"
                                    //   )
                                    //     ? true
                                    //     : false
                                    // }
                                  >
                                    {/* {nextBtnText} */}
                                    {t("meeting.chart.buttons.next")}
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <div>
                              {isEdited &&
                              selectedIndex < inputData?.steps.length - 1 ? (
                                <>
                                  <>
                                    <div>
                                      <Button
                                        variant="dark"
                                        disabled
                                        style={{
                                          backgroundColor: "#3aa5ed",
                                          border: "none",
                                        }}
                                        className="w-100"
                                      >
                                        <Spinner
                                          as="span"
                                          variant="light"
                                          size="sm"
                                          role="status"
                                          aria-hidden="true"
                                          animation="border"
                                        />
                                      </Button>
                                    </div>
                                  </>
                                </>
                              ) : (
                                selectedIndex <
                                  inputData?.steps?.length - 1 && (
                                  <button
                                    disabled={
                                      isDisabled
                                        ? // ||
                                          // (parseInt(
                                          //   CookieService.get("user_id")
                                          // ) !== inputData?.user_id &&
                                          //   !inputData?.steps[selectedIndex]
                                          //     ?.userPID)
                                          true
                                        : false
                                    }
                                    className="btn btn-primary buttons"
                                    // onClick={handleRightNavigation}
                                    onClick={() => {
                                      if (
                                        fromReport ||
                                        // (parseInt(
                                        //   CookieService.get("user_id")
                                        // ) !== inputData?.user_id &&
                                        //   !inputData?.steps[selectedIndex]
                                        //     ?.userPID)
                                        (inputData?.steps[selectedIndex]
                                          ?.participant?.userPID !==
                                          parseInt(
                                            CookieService.get("user_id"),
                                          ) &&
                                          parseInt(
                                            CookieService.get("user_id"),
                                          ) !== inputData?.user_id)
                                      ) {
                                        nextStep();
                                        return;
                                      }
                                      handleEdit();
                                    }}
                                    style={{ width: "100%" }}
                                  >
                                    {/* {nextBtnText} */}
                                    {t("meeting.chart.buttons.next")}
                                  </button>
                                )
                              )}
                            </div>
                          )}

                          {window.location.href.includes("/meetingDetail") ? (
                            <>
                              <div>
                                {selectedIndex > 0 && (
                                  <button
                                    className="btn btn-primary buttons"
                                    onClick={previousStep}
                                    style={{ width: "100%" }}
                                    // disabled={
                                    //   window.location.href.includes(
                                    //     "/meetingDetail"
                                    //   )
                                    //     ? true
                                    //     : false
                                    // }
                                  >
                                    {/* {prevBtnText} */}
                                    {t("meeting.chart.buttons.previous")}
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              {isUpdated ? (
                                <>
                                  <div>
                                    <Button
                                      variant="dark"
                                      disabled
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                      className="w-100"
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  {selectedIndex > 0 && (
                                    <button
                                      disabled={
                                        isDisabled
                                          ? // ||
                                            // (parseInt(
                                            //   CookieService.get("user_id")
                                            // ) !== inputData?.user_id &&
                                            //   !inputData?.steps[selectedIndex]
                                            //     ?.userPID)
                                            true
                                          : false
                                      }
                                      className="btn btn-primary buttons"
                                      // onClick={handleLeftNavigation}
                                      onClick={() => {
                                        if (
                                          fromReport ||
                                          // (parseInt(
                                          //   CookieService.get("user_id")
                                          // ) !== inputData?.user_id &&
                                          //   !inputData?.steps[selectedIndex]
                                          //     ?.userPID)
                                          (inputData?.steps[selectedIndex]
                                            ?.participant?.userPID !==
                                            parseInt(
                                              CookieService.get("user_id"),
                                            ) &&
                                            parseInt(
                                              CookieService.get("user_id"),
                                            ) !== inputData?.user_id)
                                        ) {
                                          previousStep();
                                          return;
                                        }
                                        handleLeftNavigation();
                                      }}
                                      style={{ width: "100%" }}
                                    >
                                      {/* {prevBtnText} */}
                                      {t("meeting.chart.buttons.previous")}
                                    </button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {window.location.href.includes("/meetingDetail") ? (
                          <>
                            {selectedIndex === inputData?.steps?.length - 1 &&
                            !fromReport ? (
                              <button
                                // disabled={isDisabled}
                                hidden={fromReport}
                                className="mt-3 btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={nextStep}
                              >
                                {/* {validateBtnText} */}
                                {t("meeting.chart.buttons.validate")}
                              </button>
                            ) : (
                              <button
                                // disabled={isDisabled}
                                className="mt-3 btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={closeModal}
                              >
                                {t("meeting.chart.buttons.close")}
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {selectedIndex === inputData?.steps?.length - 1 &&
                            !fromReport ? (
                              <>
                                {isEdited ? (
                                  <div>
                                    <Button
                                      variant="dark"
                                      disabled
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                      className="w-100 mt-3"
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    disabled={
                                      isDisabled ||
                                      // (parseInt(
                                      //   CookieService.get("user_id")
                                      // ) !== inputData?.user_id &&
                                      //   !inputData?.steps[selectedIndex]
                                      //     ?.userPID)
                                      (inputData?.steps[selectedIndex]
                                        ?.participant?.userPID !==
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) &&
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) !== inputData?.user_id)
                                        ? true
                                        : false
                                    }
                                    className="mt-3 btn btn-primary"
                                    style={{ width: "100%" }}
                                    onClick={handleEdit}
                                  >
                                    {/* {validateBtnText} */}
                                    {t("meeting.chart.buttons.validate")}
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                disabled={
                                  isDisabled ||
                                  (parseInt(
                                    CookieService.get("user_id"),
                                  ) !== inputData?.user_id &&
                                    !inputData?.steps[selectedIndex]?.userPID)
                                    ? true
                                    : false
                                }
                                className="mt-3 btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={closeModal}
                              >
                                {t("meeting.chart.buttons.close")}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {modalType === "Editeur" ? (
                        <div className="col-md-10">
                          {inputData?.steps?.map((step, index) => (
                            <div
                              key={index}
                              style={{
                                display:
                                  index === selectedIndex ? "block" : "none",
                              }}
                            >
                              <Editor
                                disabled={
                                  fromReport ||
                                  // (parseInt(
                                  //   CookieService.get("user_id")
                                  // ) !== inputData?.user_id &&
                                  //   !inputData?.steps[selectedIndex]?.userPID)
                                  (inputData?.steps[selectedIndex]?.participant
                                    ?.userPID !==
                                    parseInt(
                                      CookieService.get("user_id"),
                                    ) &&
                                    parseInt(
                                      CookieService.get("user_id"),
                                    ) !== inputData?.user_id)
                                    ? true
                                    : false
                                }
                                apiKey={TINYMCEAPI}
                                value={modifiedFileText[index]}
                                name="text"
                                init={{
                                  selector: "dfree-body",
                                  statusbar: false,
                                  branding: false,
                                  height: 600,
                                  menubar: true,
                                  language: "fr_FR",
                                  plugins:
                                    "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern quickbars",
                                  toolbar:
                                    "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                                  content_style:
                                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } img { max-width: 100%; height: 370px; }",
                                  file_picker_types: "image",
                                  importcss_append: true,
                                  quickbars_insert_toolbar:
                                    "image media quicktable",
                                  quickbars_selection_toolbar:
                                    "bold italic underline | blocks | blockquote quicklink",

                                  images_upload_handler:
                                    image_upload_handler_callback,
                                }}
                                onEditorChange={(content) => {
                                  const updatedModifiedFileText = [
                                    ...modifiedFileText,
                                  ];
                                  updatedModifiedFileText[index] = content;
                                  setModifiedFileText(updatedModifiedFileText);
                                }}
                                onInit={(evt, editor) => {
                                  editorRef.current = editor;
                                }}
                                onNodeChange={(e) => {
                                  if (
                                    e &&
                                    e.element.nodeName.toLowerCase() == "img"
                                  ) {
                                    editorRef.current.dom.setAttribs(
                                      e.element,
                                      {
                                        width: "700px",
                                        height: "394px",
                                      },
                                    );
                                  }
                                }}
                              />
                            </div>
                          ))}
                          <div></div>
                        </div>
                      ) : modalType === "File" ? (
                        <>
                          <div className="col-md-10">
                            {!isUpload ? (
                              <>
                                <div
                                  className={`d-flex align-items-center gap-4 ${
                                    fileName ? "" : "h-100"
                                  }`}
                                >
                                  <div
                                    {...getRootProps()}
                                    style={{
                                      border: "1px solid #cccccc",
                                      padding: "5px 7px",
                                      width: fileName ? "auto" : "100%", // Set width to auto when a file is uploaded
                                      borderRadius: "6px",
                                      outline: "none",
                                      margin: fileName ? "" : "0 auto",
                                      height: "100%",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input
                                      {...getInputProps()}
                                      disabled={
                                        // parseInt(
                                        //   CookieService.get("user_id")
                                        // ) !== inputData?.user_id &&
                                        // !inputData?.steps[selectedIndex]
                                        //   ?.userPID
                                        inputData?.steps[selectedIndex]
                                          ?.participant?.userPID !==
                                          parseInt(
                                            CookieService.get("user_id"),
                                          ) &&
                                        parseInt(
                                          CookieService.get("user_id"),
                                        ) !== inputData?.user_id
                                          ? true
                                          : false
                                      }
                                    />
                                    {isUpload ? (
                                      <p>Uploading...</p>
                                    ) : fileName ? (
                                      <div>Selected file: {fileName}</div>
                                    ) : (
                                      <p
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          height: "inherit",
                                        }}
                                      >
                                        Drag 'n' drop files here, or click to
                                        select files
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {fileName && (
                                  <div className="mt-2">
                                    <div className="pdf-preview">
                                      <iframe
                                        title="PDF Preview"
                                        // src={Assets_URL + fileName}
                                        src={`${Assets_URL}/${fileName}#toolbar=0&view=fitH`}
                                        width="100%"
                                        height="500px"
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <Spinner
                                  animation="border"
                                  role="status"
                                  className="center-spinner"
                                ></Spinner>
                              </>
                            )}
                          </div>
                        </>
                      ) : modalType === "Url" ? (
                        <>
                          <div className="col-md-10">
                            <div className="box">
                              <input
                                type="text"
                                placeholder="https://www.google.com"
                                value={link}
                                onChange={handleLinkUpload}
                                style={{ width: "50%" }}
                                name="url"
                              />
                              {/* <div className="text-center">
                                <button
                                  disabled={isDisabled}
                                  className="my-3 btn btn-danger"
                                  onClick={previewUrlResult}
                                >
                                  Afficher la page
                                </button>
                              </div> */}
                              {showPreview && (
                                <div className="preview-container mt-5">
                                  <iframe
                                    title="Preview"
                                    src={previewUrl}
                                    width="100%"
                                    height="500px"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chart;

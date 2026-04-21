import CookieService from '../../../../Utils/CookieService';
import React, { useEffect, useState, lazy, Suspense } from "react";
import { Container, Row, Col, Modal, Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import { useSteps } from "../../../../../context/Step";
import { toast } from "react-toastify";
import { HiUserCircle } from "react-icons/hi2";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
// const StepChart = lazy(() => import("../StepChart"));
import StepChart from "../StepChart";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";

const AddStpes = ({ setActiveTab, meeting }) => {
  console.log('meeting',meeting)
  const {
    formState,
    setFormState,
    handleInputBlur,
    checkId,
    solution,
    setSolution,
    getSolution,
    timeUnitsTotal,
    setIsDuplicate,
    setIsUpdated,
    handleCloseModal,
    isUpdated,
  } = useSolutionFormContext();
  const { solutionSteps, updateSolutionSteps } = useSteps();

  const [t] = useTranslation("global");
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const closeModal = () => setShow(false);
  const [id, setId] = useState(null);
  const [stepIndex, setStepIndex] = useState(null);

  const [isValidate, setIsValidate] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [stepId, setStepId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isDrop, setIsDrop] = useState(false);
  const iconStyle = {
    padding: " 8px 5px",
    borderRadius: "8px",
    textAlign: "center",
    margin: "3px",
  };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (checkId) {
      setLoading(true);
      getSolution(checkId)
        .then(() => {
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [checkId, show]);

  useEffect(() => {
    // If the meeting has steps, update the steps context
    if (solution?.solution_steps && solution?.solution_steps.length > 0) {
      updateSolutionSteps(solution?.solution_steps);
    }
  }, [solution, updateSolutionSteps]);

  const stepModal = async () => {
    // setIsDuplicate(false);
    // setIsUpdated(false);
    setIsDrop(true);
    setShow(true);
    setStepIndex(undefined);
  };

  //delete step
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/solution-steps/${stepId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        console.log("step deleted successfully");
        // updateSteps((prevSteps) =>
        //   prevSteps.filter((step) => step.id !== stepId)
        // );

        const updatedSteps = solutionSteps.filter((step) => step.id !== stepId);

        const reorderedSteps = updatedSteps.map((step, index) => ({
          ...step,
          order_no: index + 1,
        }));

        // Update the steps in state
        updateSolutionSteps(reorderedSteps);
        setSolution({ ...solution, solution_steps: reorderedSteps });

        // Call the reorder API to save the new order in the database
        await axios.post(
          `${API_BASE_URL}/solution-steps/reorder`,
          {
            solution_id: solution?.id,
            solution_steps: reorderedSteps.map((step) => ({
              id: step.id,
              order_no: step.order_no, // Pass updated order_no to API
            })),
            _method: "post",
          },
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        setShowConfirmation(false);
        setFormState({
          title: "",
          count1: "",
          count2: "",
          time_unit: "",
          time: "",
          editor_type: "",
          editor_content: "",
          order_no: "",
          assigned_to: "",
          status: "",
          file: null,
        });
      }
    } catch (error) {
      console.log("error while deleting step", error);
    } finally {
      setShowConfirmation(false);
    }
    // }
  };

  const handleCopyStep = async (item) => {
    const duplicateStepData = {
      // title: copiedSlide.title,
      // count1: copiedSlide.count1 || 0,
      // count2: copiedSlide.count2,
      // time_unit:
      //   data?.type === "Action1"
      //     ? "days"
      //     : data?.type === "Task"
      //     ? "hours"
      //     : data?.type === "Quiz"
      //     ? "seconds"
      //     : "minutes",

      // time: copiedSlide.count2,
      // editor_type: copiedSlide.editor_type,
      // editor_content:
      //   selectedStep.editor_type === "Editeur"
      //     ? optimizedEditorContent || ""
      //     : null,
      // order_no: selectedStep.order_no,
      // assigned_to: user,
      // status: "active",
      // file:
      //   selectedStep.editor_type === "File"
      //     ? fileName
      //       ? fileName
      //       : null
      //     : null,
      // url: selectedStep.editor_type === "Url" ? (link ? link : null) : null,
      ...item,
      _method: "put",
      duplicate: true,
      solution_id: checkId,
      sent: 0,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/solution-steps/${item?.id}`,
        duplicateStepData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const duplicatedStep = response?.data?.data;
        console.log("duplicated step", duplicatedStep);
        await getSolution(checkId);
        //   updateSteps((prevSteps) => [...prevSteps, duplicatedStep]);
        // // Update steps and meeting in one place
        // const updatedSteps = [...meeting?.steps, duplicatedStep];
        // setSolution({ ...meeting, steps: updatedSteps });

        // setPreviousId(response.data.data?.id);
        // setIsCopied(false);
        // setCopyBtnText("Copier l’étape");
        // // setChartData(formattedData);
        // updateTotalTime(newLastCountSum);
        // // setType(response.data?.data?.editor_content);
        // setFileName(response.data?.data?.file);
        // setLink(response.data?.data?.url);
        // // setFileUpload(response?.data?.data?.editor_content);
        // // setFileName(response?.data?.data?.editor_content);
        // setSelectedIndex(insertIndex);
        // setSelectedValue(response.data?.data.title);
        // setSelectedCount(copiedSlide.count2);
        // setUser(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      // toast.error("Échec de la copie de l'étape");
    } finally {
    }
  };

  const editStep = async (item, index) => {
    setId(item.id);
    setStepIndex(index);
    setShow(true);
    setIsDrop(false);

    // setIsUpdated(true);
  };

  const handleClose = () => setShow(false);
  const handleOpenConfirmation = (itemId) => {
    setStepId(itemId);
    setShowConfirmation(true); // Show the confirmation modal
  };

  const cancelDelete = () => {
    setStepId("");
    setShowConfirmation(false);
  };

  // const [items, setItems] = useState(steps); // Store the items in the state
  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    if (solution?.type === "Task") {
      return;
    }

    const reorderedItems = reorder(
      solutionSteps,
      result.source.index,
      result.destination.index
    );

    // Get the ID of the dragged step
    const draggedStepId = reorderedItems[result.destination.index].id;
    console.log("Dragged Step ID:", draggedStepId);

    // setItems(reorderedItems);

    // Call the API to save the new order after dragging
    try {
      const response = await axios.post(
        `${API_BASE_URL}/solution-steps/reorder`,
        {
          solution_id: solution?.id,
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
        await getSolution(checkId);
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

  const handleOrderChange = async (step, newOrderNo) => {
    const existingStep = solutionSteps.find((s) => s.order_no === newOrderNo);

    if (existingStep) {
      // Swap the order numbers in the steps context
      const updatedSteps = solutionSteps.map((s) =>
        s.id === step.id
          ? { ...s, order_no: newOrderNo }
          : s.id === existingStep.id
          ? { ...s, order_no: step.order_no }
          : s
      );

      // Update the steps in context
      updateSolutionSteps(updatedSteps);

      // Call API to update both steps' order numbers
      await updateStepOrderAPI([
        { id: step.id, order_no: newOrderNo },
        { id: existingStep.id, order_no: step.order_no },
      ]);
    } else {
      // If no swap is needed, just update the single step order
      const updatedSteps = solutionSteps.map((s) =>
        s.id === step.id ? { ...s, order_no: newOrderNo } : s
      );

      updateSolutionSteps(updatedSteps);

      // Update the single step order in the database
      await updateStepOrderAPI([{ id: step.id, order_no: newOrderNo }]);
    }
  };

  const updateStepOrderAPI = async (stepsToUpdate) => {
    try {
      await axios.post(
        `${API_BASE_URL}/solution-steps/reorder`,
        {
          _method: "post",
          solution_id: solution?.id,
          solution_steps: stepsToUpdate,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      console.log("Step order updated successfully");
      await getSolution(checkId);
    } catch (error) {
      console.error("Failed to update step order:", error);
    }
  };

  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <div className=" col-md-12 mt-1 p-4 modal-height">
      <div className="modal-body">
        <Row className="mb-4">
          <Col xs={12} sm={12} md={12} lg={12}>
            <div
              className="d-flex justify-content-between align-items-center modal-tab-button p-1 px-3"
              // onClick={handleShow}
              onClick={() => stepModal()}
            >
              <div className="d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="16"
                  viewBox="0 0 22 16"
                  fill="none"
                >
                  <path
                    d="M17 0.5H5C4.60218 0.5 4.22064 0.658035 3.93934 0.93934C3.65804 1.22064 3.5 1.60218 3.5 2V14C3.5 14.3978 3.65804 14.7794 3.93934 15.0607C4.22064 15.342 4.60218 15.5 5 15.5H17C17.3978 15.5 17.7794 15.342 18.0607 15.0607C18.342 14.7794 18.5 14.3978 18.5 14V2C18.5 1.60218 18.342 1.22064 18.0607 0.93934C17.7794 0.658035 17.3978 0.5 17 0.5ZM17 14H5V2H17V14ZM21.5 1.25V14.75C21.5 14.9489 21.421 15.1397 21.2803 15.2803C21.1397 15.421 20.9489 15.5 20.75 15.5C20.5511 15.5 20.3603 15.421 20.2197 15.2803C20.079 15.1397 20 14.9489 20 14.75V1.25C20 1.05109 20.079 0.860322 20.2197 0.71967C20.3603 0.579018 20.5511 0.5 20.75 0.5C20.9489 0.5 21.1397 0.579018 21.2803 0.71967C21.421 0.860322 21.5 1.05109 21.5 1.25ZM2 1.25V14.75C2 14.9489 1.92098 15.1397 1.78033 15.2803C1.63968 15.421 1.44891 15.5 1.25 15.5C1.05109 15.5 0.860322 15.421 0.71967 15.2803C0.579018 15.1397 0.5 14.9489 0.5 14.75V1.25C0.5 1.05109 0.579018 0.860322 0.71967 0.71967C0.860322 0.579018 1.05109 0.5 1.25 0.5C1.44891 0.5 1.63968 0.579018 1.78033 0.71967C1.92098 0.860322 2 1.05109 2 1.25Z"
                    fill="#3D57B5"
                  />
                </svg>
                <span
                  className="solutioncards"
                  style={{ color: "#3D57B5", marginLeft: "8px" }}
                >
                  {t("meeting.formState.step.AddStep")}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <g clipPath="url(#clip0_1_1041)">
                  <path
                    d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z"
                    fill="#3D57B5"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1_1041">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </Col>
        </Row>
        <h4
          className="mb-2 solutioncards"
          style={{ fontSize: "18px", fontWeight: "600" }}
        >
          {solutionSteps?.length > 0
            ? solutionSteps?.length +
              " " +
              t("meeting.formState.step.Steps added")
            : ""}
        </h4>
        <div class="table-responsive">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <table
                  class="table add-guest-table addsteptable"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {loading ? (
                    <Spinner
                      animation="border"
                      role="status"
                      className="center-spinner"
                    ></Spinner>
                  ) : (
                    <tbody>
                      {solutionSteps?.map((step, index) => (
                        <Draggable
                          key={step.id}
                          draggableId={step.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <tr
                              key={index}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <th
                                scope="row"
                                style={{
                                  textAling: "center",
                                  paddingTop: "16px",
                                }}
                                {...provided.dragHandleProps} // This makes the <th> the drag handle
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M6.75 2.25H9.75V5.25H6.75V2.25ZM14.25 2.25H17.25V5.25H14.25V2.25ZM6.75 7.75H9.75V10.75H6.75V7.75ZM14.25 7.75H17.25V10.75H14.25V7.75ZM6.75 13.25H9.75V16.25H6.75V13.25ZM14.25 13.25H17.25V16.25H14.25V13.25ZM6.75 18.75H9.75V21.75H6.75V18.75ZM14.25 18.75H17.25V21.75H14.25V18.75Z"
                                    fill="#8590A3"
                                  />
                                </svg>
                              </th>
                              {/* <td
                                style={{
                                  textAling: "center",
                                  paddingTop: "16px",
                                }}
                              >
                                {solution?.type === "Task" ? (
                                  <select
                                    className="form-select form-select-sm addstep-width"
                                    aria-label="Step Number"
                                    defaultValue={step.order_no}
                                    onChange={(e) =>
                                      handleOrderChange(step, e.target.value)
                                    }
                                  >
                                    {Array.from(
                                      { length: steps.length },
                                      (_, i) => i + 1
                                    ).map((order) => (
                                      <option key={order} value={order}>
                                        {order}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <select
                                    className="form-select form-select-sm addstep-width
                                  "
                                    aria-label="Step Number"
                                    defaultValue={step.order_no}
                                  >
                                    <option value={step?.order_no}>
                                      {step?.order_no}
                                    </option>
                                  </select>
                                )}
                              </td> */}
                              <td
                                className="addsteptd"
                                style={{
                                  textAling: "center",
                                  paddingTop: "16px",
                                }}
                              >
                                {step.title}
                              </td>
                              <td
                                style={{
                                  textAling: "center",
                                  paddingTop: "16px",
                                }}
                              >
                                <img
                                  src={
                                    step?.solution_step_creator?.image?.startsWith(
                                      "users/"
                                    )
                                      ? Assets_URL +
                                        "/" +
                                        step?.solution_step_creator?.image
                                      : step?.solution_step_creator?.image
                                  }
                                  alt={`${step.solution_step_creator?.full_name}'s avatar`}
                                  className="rounded-circle me-2"
                                  style={{
                                    width: "35px",
                                    height: "35px",
                                    objectFit: "cover",
                                    objectPosition: "top",
                                  }}
                                />
                                {step?.solution_step_creator?.full_name
                                  ? step?.solution_step_creator?.full_name
                                  : step?.solution_step_creator?.full_name}
                              </td>
                              <td
                                style={{
                                  textAling: "center",
                                  paddingTop: "16px",
                                }}
                              >
                             {solution.type === "Sprint" ? (
  // Show Story Point for Sprint type
  <>
    {step.count2} {t("Story points")}
  </>
) : (
  // Otherwise show time_unit logic
  <>
    {step.time_unit === "days" && step.count2 <= 1 ? (
      <>
        {step.count2 <= 1
          ? `${step.count2} ${t("time_unit.singleDay")}`
          : t(`time_unit.${step.time_unit}`)}
      </>
    ) : (
      <>
        {step.count2} {t(`time_unit.${step.time_unit}`)}
      </>
    )}
  </>
)}

                              
                              </td>
                              {/* <span>{t(`time_unit.${item.time_unit}`)}</span> */}

                              <td>
                                <span
                                  style={{
                                    ...iconStyle,
                                    backgroundColor: "#F5F8FF",
                                    color: "#3D57B5",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                  }}
                                  onClick={() => handleCopyStep(step)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <g clip-path="url(#clip0_1_1066)">
                                      <path
                                        d="M16.6667 6.66663H8.33335C7.41288 6.66663 6.66669 7.41282 6.66669 8.33329V16.6666C6.66669 17.5871 7.41288 18.3333 8.33335 18.3333H16.6667C17.5872 18.3333 18.3334 17.5871 18.3334 16.6666V8.33329C18.3334 7.41282 17.5872 6.66663 16.6667 6.66663Z"
                                        stroke="#687691"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                      <path
                                        d="M3.33335 13.3333C2.41669 13.3333 1.66669 12.5833 1.66669 11.6666V3.33329C1.66669 2.41663 2.41669 1.66663 3.33335 1.66663H11.6667C12.5834 1.66663 13.3334 2.41663 13.3334 3.33329"
                                        stroke="#687691"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_1_1066">
                                        <rect
                                          width="20"
                                          height="20"
                                          fill="white"
                                        />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                </span>
                                <span
                                  style={{
                                    ...iconStyle,
                                    backgroundColor: "#F5F8FF",
                                    color: "#3D57B5",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                  }}
                                  onClick={() => editStep(step, index)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <path
                                      d="M13.9751 3.90795L16.0921 6.02495M15.3361 2.04295L9.60909 7.76995C9.31318 8.06545 9.11137 8.44193 9.02909 8.85195L8.50009 11.4999L11.1481 10.9699C11.5581 10.8879 11.9341 10.6869 12.2301 10.3909L17.9571 4.66395C18.1292 4.49185 18.2657 4.28754 18.3588 4.06269C18.452 3.83783 18.4999 3.59683 18.4999 3.35345C18.4999 3.11007 18.452 2.86907 18.3588 2.64421C18.2657 2.41936 18.1292 2.21505 17.9571 2.04295C17.785 1.87085 17.5807 1.73434 17.3558 1.6412C17.131 1.54806 16.89 1.50012 16.6466 1.50012C16.4032 1.50012 16.1622 1.54806 15.9374 1.6412C15.7125 1.73434 15.5082 1.87085 15.3361 2.04295Z"
                                      stroke="#687691"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                    <path
                                      d="M16.5001 13.5V16.5C16.5001 17.0304 16.2894 17.5391 15.9143 17.9142C15.5392 18.2893 15.0305 18.5 14.5001 18.5H3.50009C2.96966 18.5 2.46095 18.2893 2.08588 17.9142C1.71081 17.5391 1.50009 17.0304 1.50009 16.5V5.5C1.50009 4.96957 1.71081 4.46086 2.08588 4.08579C2.46095 3.71071 2.96966 3.5 3.50009 3.5H6.50009"
                                      stroke="#687691"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                  </svg>
                                </span>
                                <span
                                  style={{
                                    ...iconStyle,
                                    backgroundColor: "#ffe5e5",
                                    color: "red",
                                    padding: "7px 5px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                  }}
                                  // onClick={() => handleDelete(step.id)}
                                  onClick={() =>
                                    handleOpenConfirmation(step.id)
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <path
                                      d="M8.4375 4.0625V4.375H11.5625V4.0625C11.5625 3.6481 11.3979 3.25067 11.1049 2.95765C10.8118 2.66462 10.4144 2.5 10 2.5C9.5856 2.5 9.18817 2.66462 8.89515 2.95765C8.60212 3.25067 8.4375 3.6481 8.4375 4.0625ZM7.1875 4.375V4.0625C7.1875 3.31658 7.48382 2.60121 8.01126 2.07376C8.53871 1.54632 9.25408 1.25 10 1.25C10.7459 1.25 11.4613 1.54632 11.9887 2.07376C12.5162 2.60121 12.8125 3.31658 12.8125 4.0625V4.375H17.5C17.6658 4.375 17.8247 4.44085 17.9419 4.55806C18.0592 4.67527 18.125 4.83424 18.125 5C18.125 5.16576 18.0592 5.32473 17.9419 5.44194C17.8247 5.55915 17.6658 5.625 17.5 5.625H16.5575L15.375 15.98C15.2878 16.7426 14.923 17.4465 14.3501 17.9573C13.7772 18.4682 13.0363 18.7504 12.2687 18.75H7.73125C6.96366 18.7504 6.22279 18.4682 5.64991 17.9573C5.07702 17.4465 4.7122 16.7426 4.625 15.98L3.4425 5.625H2.5C2.33424 5.625 2.17527 5.55915 2.05806 5.44194C1.94085 5.32473 1.875 5.16576 1.875 5C1.875 4.83424 1.94085 4.67527 2.05806 4.55806C2.17527 4.44085 2.33424 4.375 2.5 4.375H7.1875ZM5.8675 15.8375C5.91968 16.2949 6.13835 16.7172 6.48183 17.0238C6.82531 17.3304 7.26959 17.4999 7.73 17.5H12.2694C12.7298 17.4999 13.1741 17.3304 13.5175 17.0238C13.861 16.7172 14.0797 16.2949 14.1319 15.8375L15.3 5.625H4.70062L5.8675 15.8375ZM8.125 7.8125C8.29076 7.8125 8.44973 7.87835 8.56694 7.99556C8.68415 8.11277 8.75 8.27174 8.75 8.4375V14.6875C8.75 14.8533 8.68415 15.0122 8.56694 15.1294C8.44973 15.2467 8.29076 15.3125 8.125 15.3125C7.95924 15.3125 7.80027 15.2467 7.68306 15.1294C7.56585 15.0122 7.5 14.8533 7.5 14.6875V8.4375C7.5 8.27174 7.56585 8.11277 7.68306 7.99556C7.80027 7.87835 7.95924 7.8125 8.125 7.8125ZM12.5 8.4375C12.5 8.27174 12.4342 8.11277 12.3169 7.99556C12.1997 7.87835 12.0408 7.8125 11.875 7.8125C11.7092 7.8125 11.5503 7.87835 11.4331 7.99556C11.3158 8.11277 11.25 8.27174 11.25 8.4375V14.6875C11.25 14.8533 11.3158 15.0122 11.4331 15.1294C11.5503 15.2467 11.7092 15.3125 11.875 15.3125C12.0408 15.3125 12.1997 15.2467 12.3169 15.1294C12.4342 15.0122 12.5 14.8533 12.5 14.6875V8.4375Z"
                                      fill="#BB372F"
                                    />
                                  </svg>
                                </span>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
      <div className="d-flex align-items-center gap-3">
        <h6 className="m-0">
          {t("solution.newMeeting.labels.Estimated duration of the moment")}
        </h6>
        <span>
          {timeUnitsTotal.days ? timeUnitsTotal.days + ` ${t("days")} ` : ""}{" "}
          {timeUnitsTotal.hours ? timeUnitsTotal.hours + ` ${t("hours")}` : ""}{" "}
          {timeUnitsTotal.minutes ? timeUnitsTotal.minutes + " mins " : ""}{" "}
          {timeUnitsTotal.seconds
            ? " " + timeUnitsTotal.seconds + ` ${t("secs")} `
            : ""}
        </span>
      </div>
      <div
        className={`modal-footer d-flex justify-content-end modal-save-button gap-4`}
      >
        {isUpdated && (
          <Button
            variant="danger"
            // className="btn "
            onClick={()=>{
              // if (solutionSteps.length === 0 && (formState.location === "Google Meet" || formState.agenda === "Google Agenda" || formState.agenda === "Outlook Agenda")) {
              //   toast.error(t("For the Agenda Creation At least one step is required"));
              //   return;
              // }
              handleCloseModal();
            }}
            style={{ padding: "9px" }}
          >
            <>&nbsp;{t("meeting.formState.Save and Quit")}</>
          </Button>
        )}
        <button
          className={`btn moment-btn`}
          onClick={() => {
            // if (solutionSteps.length === 0 && (formState.location === "Google Meet" || formState.agenda === "Google Agenda" || formState.agenda === "Outlook Agenda")) {
            //   toast.error(t("For the Agenda Creation At least one step is required"));
            //   return;
            // }
            setActiveTab("tab7");

          }}
          style={{padding:'0px 10px '}}

        >
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
          </span>{" "}
        </button>
      </div>
      <Modal
        show={showConfirmation}
        onHide={handleClose}
        dialogClassName="custom-modal-size custom-modal-border modal-dialog-centered"
      >
        <Modal.Header
          closeButton
          className="border-0"
          onClick={cancelDelete}
        ></Modal.Header>
        <Modal.Body className="text-center p-4">
          <h2 className="w-100 text-center fs-5">
            {t("meeting.formState.step.Delete Step")}
          </h2>
          <p className="mb-4" style={{ color: "#92929D" }}>
            {t("meeting.formState.step.ConfirmDelete")}
          </p>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <Button
              variant="outline-danger"
              className="px-4 py-2 confirmation-delete"
              onClick={handleDelete}
            >
              {t("meeting.formState.step.ConfirmBtn")}
            </Button>
            <Button
              variant="primary"
              className="px-4 py-2 confirmation-save"
              onClick={cancelDelete}
            >
              {t("meeting.formState.step.CancelBtn")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <StepChart
        meetingId={checkId}
        id={id}
        show={show}
        setId={setId}
        closeModal={closeModal}
        meeting1={meeting}
        isDrop={isDrop}
        setIsDrop={setIsDrop}
        stepIndex={stepIndex}
      />
    </div>
    // </Suspense>
  );
};

export default AddStpes;

import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdKeyboardArrowDown } from "react-icons/md";
import { LuFileEdit } from "react-icons/lu";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReportDecisionCard = ({ data, meeting, disabled, refreshMeeting }) => {
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editorContent, setEditorContent] = useState(""); // Stores editor changes
  const [localData, setLocalData] = useState(data);
  const [t] = useTranslation("global");

  const handleClose = () => {
    setSelectedIndex(null);
    setEditorContent(""); // Reset editor content on modal close
  };

  useEffect(() => {
    setLocalData(data);
  }, [data]); // Update localData whenever the data prop changes

  const handleSave = async () => {
    try {
      const updatedSteps = meeting?.steps?.map((step, index) =>
        index === selectedIndex
          ? {
              ...step,
              decision: { ...step?.decision, decision: editorContent },
            }
          : step
      );
      // Update the `step_decision` array with the new decision content
      const updatedStepDecision = meeting?.step_decisions?.map(
        (decision, index) =>
          index === selectedIndex
            ? { ...decision, decision: editorContent }
            : decision
      );

      const payload = {
        ...meeting,
        steps: updatedSteps,
        step_decision: updatedStepDecision,
        _method: "put",
      };

      const response = await axios.post(
        `${API_BASE_URL}/meetings/${meeting?.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: ` Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        // Update localData to reflect changes
        refreshMeeting();
        setLocalData((prev) =>
          prev.map((item, index) =>
            index === selectedIndex
              ? {
                  ...item,
                  decision: { ...item.decision, decision: editorContent },
                }
              : item
          )
        );
        handleClose();
      }
    } catch (error) {
      console.log("error while save step", error);
    }
  };

  return (
    <Row className="g-3 gap-3">
      {localData?.map((item, index) => {
        if (!item || !item.decision) return null;

        // Ensure it's always an array
        const decisions = Array.isArray(item.decision)
          ? item.decision
          : [item.decision];

        return (
          <React.Fragment key={index}>
            {decisions.map((decisionItem, decisionIndex) => {
              if (!decisionItem || !decisionItem.decision) return null;

              return (
                <Col xs={12} sm={6} md={4} lg={3} key={decisionIndex}>
                  <Card className="mt-4 participant-card">
                    <Card.Body>
                      <div className="d-flex flex-column gap-3">
                        {/* Index and Decision Description */}
                        <div className="d-flex justify-content-start align-items-center">
                          <div className="numbers">
                            <div className="number">{decisionIndex + 1}</div>
                          </div>
                          <div
                            className="decision-paragraph"
                            style={{ marginLeft: "10px" }}
                          >
                            <div
                              dangerouslySetInnerHTML={{
                                __html: decisionItem?.decision || "",
                              }}
                            />
                          </div>
                        </div>

                        {/* Decision Apply */}
                        <div className="d-flex justify-content-center align-items-center">
                          <div className="team-btn">
                            {decisionItem?.decision_apply}
                          </div>
                        </div>

                        {/* Edit Icon at the bottom-right corner */}
                        <div className="d-flex justify-content-end">
                          <span>
                            <LuFileEdit
                              className="eye-icon"
                              color={
                                selectedIndex === decisionIndex
                                  ? "#20acd4"
                                  : "black"
                              }
                              size={18}
                              style={{
                                margin: "2px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setSelectedIndex(decisionIndex);
                                setEditorContent(decisionItem?.decision || ""); // Set editor content to current decision
                              }}
                            />
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {selectedIndex === index && (
                    <Modal show onHide={handleClose} size="lg">
                      <Modal.Body>
                        <Editor
                          onBlur={(value) => {
                            console.log("value", value);
                          }}
                          key={index}
                          apiKey={TINYMCEAPI}
                          value={editorContent} // Bind editorContent state to editor
                          init={{
                            statusbar: false,
                            branding: false,
                            height: 400,
                            menubar: true,
                            language: "fr_FR",
                            plugins:
                              "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                            toolbar:
                              "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                            image_advtab: true,
                            file_picker_types: "image",
                            file_picker_callback: function (
                              callback,
                              value,
                              meta
                            ) {
                              if (meta.filetype === "image") {
                                const input = document.createElement("input");
                                input.setAttribute("type", "file");
                                input.setAttribute("accept", "image/*");

                                input.onchange = function () {
                                  const file = input.files[0];
                                  const reader = new FileReader();

                                  reader.onload = function (e) {
                                    const img = new Image();
                                    img.src = e.target.result;

                                    img.onload = function () {
                                      const canvas =
                                        document.createElement("canvas");
                                      const ctx = canvas.getContext("2d");
                                      const maxWidth = 700;
                                      const maxHeight = 394;

                                      let newWidth = img.width;
                                      let newHeight = img.height;

                                      if (img.width > maxWidth) {
                                        newWidth = maxWidth;
                                        newHeight =
                                          (img.height * maxWidth) / img.width;
                                      }

                                      if (newHeight > maxHeight) {
                                        newHeight = maxHeight;
                                        newWidth =
                                          (img.width * maxHeight) / img.height;
                                      }

                                      canvas.width = newWidth;
                                      canvas.height = newHeight;

                                      ctx.drawImage(
                                        img,
                                        0,
                                        0,
                                        newWidth,
                                        newHeight
                                      );

                                      const resizedImageData = canvas.toDataURL(
                                        file.type
                                      );

                                      // Pass the resized image data to the callback function
                                      callback(resizedImageData, {
                                        alt: file.name,
                                      });
                                    };

                                    img.src = e.target.result;
                                  };

                                  reader.readAsDataURL(file);
                                };

                                input.click();
                              }
                            },
                          }}
                          onEditorChange={(content) =>
                            setEditorContent(content)
                          } // Update editorContent on changes
                        />
                      </Modal.Body>
                      <Modal.Footer className="justify-content-center">
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          disabled={disabled}
                        >
                          Modifier
                        </Button>
                        <Button variant="danger" onClick={handleClose}>
                          {t("buttons.cancel")}
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  )}
                </Col>
              );
            })}
          </React.Fragment>
        );
      })}
    </Row>
  );
};

export default ReportDecisionCard;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import { API_BASE_URL } from "../../../Apicongfig";
import CookieService from "../../../Utils/CookieService";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const MissionHistoryTab = ({ destinationId }) => {
  const [t] = useTranslation("global");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/destinations/${destinationId}/summary`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
              Accept: "application/json",
            },
          }
        );
        if (response.data && response.data.destinations_summary) {
          setSummary(response.data.destinations_summary);
        } else if (response.data && response.data.data && response.data.data.destinations_summary) {
          setSummary(response.data.data.destinations_summary);
        }
      } catch (error) {
        console.error("Error fetching mission history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (destinationId) {
      fetchSummary();
    }
  }, [destinationId]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const payload = {
        destinations_summary: summary,
      };

      const response = await axios.put(
        `${API_BASE_URL}/destinations/${destinationId}/summary`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(t("Success") || "Updated successfully!");
      } else {
        toast.error("Failed to update mission history.");
      }
    } catch (error) {
      console.error("Error updating mission history:", error);
      toast.error("Error updating mission history.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" role="status" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: "#fff", borderRadius: "8px" }}>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h5 className="m-0" style={{ fontWeight: "600", color: "#344054" }}>
          Mission History
        </h5>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={handleUpdate}
          disabled={isUpdating}
          style={{ padding: "8px 24px", borderRadius: "8px", fontWeight: "500" }}
        >
          {isUpdating ? (
            <Spinner animation="border" size="sm" className="me-2" />
          ) : null}
          {t("Update") || "Update"}
        </button>
      </div>

      <Editor
        apiKey={TINYMCEAPI}
        value={summary}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | help",
          content_style: "body { font-family:Inter,sans-serif; font-size:14px }",
        }}
        onEditorChange={(content) => setSummary(content)}
      />
    </div>
  );
};

export default MissionHistoryTab;

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useFormContext } from "../../../../../../context/CreateMeetingContext";

function AddIndividual({ participant, emailSuggestions }) {
  const { formState, setFormState, handleInputBlur } = useFormContext();
  const [t] = useTranslation("global");
  const [selectedTab, setSelectedTab] = useState("Individual");
  const [contributions, setContributions] = useState([
    { email: "", post: "", firstName: "", lastName: "", contribution: "" },
  ]);

  useEffect(() => {
    if (participant) {
      setContributions((prev) => {
        const updatedContributions = [...prev];
        updatedContributions[0] = {
          email: participant.email || "",
          post: participant.post || "",
          firstName: participant.first_name || "",
          lastName: participant.last_name || "",
          contribution: participant.contribution || "",
        };
        return updatedContributions;
      });
    }
  }, [participant]);

  const handleContributionChange = (index, field, value) => {
    const updatedContributions = [...contributions];
    updatedContributions[index][field] = value;
    setContributions(updatedContributions);
  };

  const areAllContributionsComplete = () => {
    return contributions.every(
      (contribution) =>
        contribution.email &&
        contribution.post &&
        contribution.firstName &&
        contribution.lastName &&
        contribution.contribution
    );
  };

  const addMoreContribution = () => {
    if (areAllContributionsComplete()) {
      setContributions([
        ...contributions,
        { email: "", post: "", firstName: "", lastName: "", contribution: "" },
      ]);
    } else {
      toast.error(
        "Please complete all the current contributions before adding a new one."
      );
    }
  };

  const handleSave = () => {
    setFormState((prevState) => ({
      ...prevState,
      participants: contributions,
    }));
    toast.success("Data saved successfully!");
  };
  

  return (
    <div className="col-md-12">
      <div className="create-moment-modal">
        {contributions.map((contribution, index) => (
          <div key={index}>
            <Row className="g-2">
              <Col xs={12} md={6} className="mb-2 form">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={contribution.email}
                  onChange={(e) =>
                    handleContributionChange(index, "email", e.target.value)
                  }
                  placeholder={t("Enter Email")}
                />
              </Col>
              <Col xs={12} md={6} className="mb-2 form">
                <label className="form-label">Post</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={contribution.post}
                  onChange={(e) =>
                    handleContributionChange(index, "post", e.target.value)
                  }
                  placeholder="Enter your post"
                />
              </Col>
            </Row>
            <Row className="g-2">
              <Col xs={12} md={6} className="mb-2 form">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={contribution.firstName}
                  onChange={(e) =>
                    handleContributionChange(index, "firstName", e.target.value)
                  }
                  placeholder={t("Enter Name")}
                />
              </Col>
              <Col xs={12} md={6} className="mb-2 form">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={contribution.lastName}
                  onChange={(e) =>
                    handleContributionChange(index, "lastName", e.target.value)
                  }
                  placeholder="Enter your Last Name"
                />
              </Col>
            </Row>
            <Row className="g-2">
              <Col xs={12} md={12} className="mb-2 form">
                <label className="form-label">Contribution</label>
                <textarea
                  type="text"
                  required
                  className="form-control"
                  rows={3}
                  value={contribution.contribution}
                  onChange={(e) =>
                    handleContributionChange(index, "contribution", e.target.value)
                  }
                  placeholder={"Placeholder"}
                />
              </Col>
            </Row>
          </div>
        ))}
      </div>

      <Row className="mt-1 mb-3">
        <Col xs={12}>
          <div
            className="d-flex justify-content-between align-items-center modal-tab-button"
            onClick={addMoreContribution}
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20.7 7C20.4 7.4 20 7.7 20 8C20 8.3 20.3 8.6 20.6 9C21.1 9.5 21.6 9.9 21.5 10.4C21.5 10.9 21 11.4 20.5 11.9L16.4 16L15 14.7L19.2 10.5L18.2 9.5L16.8 10.9L13 7.1L17 3.3C17.4 2.9 18 2.9 18.4 3.3L20.7 5.6C21.1 6 21.1 6.7 20.7 7ZM3 17.2L12.6 7.6L16.3 11.4L6.8 21H3V17.2ZM7 2V5H10V7H7V10H5V7H2V5H5V2H7Z"
                  fill="#2C48AE"
                />
              </svg>
              <span className="solutioncards" style={{ color: " #3D57B5" }}>
                Add more contribution
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
      <Button onClick={handleSave}>Save</Button>

    </div>
  );
}

export default AddIndividual;

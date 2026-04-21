import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  Dropdown,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";

const ZoomMeeting = () => {
  const [meetings, setMeetings] = useState([]);
  console.log("meetings", meetings);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // zoom ID -> zoom id from user
  const zoomId = "lM75Cqw_QSyBUQfyAgOdoA";

  // User ID -> _id from user 
  const userId = "67e2da6f5cd9abdb9f0094bc";


  useEffect(() => {
    const fetchZoomMeetings = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/zoom-meetings/${zoomId}/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch meetings");

        const data = await response.json();
        setMeetings(data.meetings || []);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchZoomMeetings();
  }, []);

  const handleEdit = (meeting) => {
    setSelectedMeeting(meeting);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (meetingId) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/zoom-meetings/${meetingId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete meeting");

        setMeetings(meetings.filter((m) => m.id !== meetingId));
      } catch (error) {
        console.error("Error deleting meeting:", error);
      }
    }
  };

  const handleUpdate = async () => {
    if (!selectedMeeting) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/zoom-meetings/${selectedMeeting.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: selectedMeeting.topic,
            start_time: selectedMeeting.start_time, // Ensure valid datetime format
            duration: selectedMeeting.duration, // Optional field
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update meeting");

      const updatedData = await response.json();

      setMeetings(
        meetings.map((meeting) =>
          meeting.id === selectedMeeting.id
            ? updatedData.updatedMeeting
            : meeting
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating meeting:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-primary">Zoom Meetings List</h2>

      {/* Total Meetings Count */}
      <h5 className="mb-4 text-secondary">Total Meetings: {meetings.length}</h5>

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        meetings.map((meeting) => (
          <Card key={meeting.id} className="mb-3 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title>{meeting.topic}</Card.Title>
                <Card.Text>
                  <strong>Start Time:</strong>{" "}
                  {new Date(meeting.start_time).toLocaleString()}
                  <br />
                  <a
                    href={meeting.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    Join Meeting
                  </a>
                </Card.Text>
              </div>

              {/* Options Dropdown */}
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  ⚙ Options
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleEdit(meeting)}>
                    ✏ Update
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleDelete(meeting.id)}
                    className="text-danger"
                  >
                    🗑 Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Body>
          </Card>
        ))
      )}

      {/* Edit Meeting Modal */}
      <Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMeeting ? (
            <Form>
              {/* Meeting Topic */}
              <Form.Group className="mb-3">
                <Form.Label>Meeting Topic</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedMeeting?.topic || ""}
                  onChange={(e) =>
                    setSelectedMeeting({
                      ...selectedMeeting,
                      topic: e.target.value,
                    })
                  }
                />
              </Form.Group>

              {/* Start Time */}
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={
                    selectedMeeting?.start_time
                      ? new Date(selectedMeeting.start_time)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedMeeting({
                      ...selectedMeeting,
                      start_time: e.target.value,
                    })
                  }
                />
              </Form.Group>

              {/* Duration */}
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={selectedMeeting?.duration || ""}
                  onChange={(e) =>
                    setSelectedMeeting({
                      ...selectedMeeting,
                      duration: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          ) : (
            <p className="text-danger">No meeting selected for editing.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={!selectedMeeting}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ZoomMeeting;

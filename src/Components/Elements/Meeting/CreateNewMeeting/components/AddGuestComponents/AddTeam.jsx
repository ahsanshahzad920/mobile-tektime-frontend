import CookieService from '../../../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Table } from "react-bootstrap";
import { Accordion, Image, ListGroup, Dropdown } from "react-bootstrap";
import { API_BASE_URL, Assets_URL } from "../../../../../Apicongfig";
import { toast } from "react-toastify";
import { getUserRoleID } from "../../../../../Utils/getSessionstorageItems";
import axios from "axios";
import { useFormContext } from "../../../../../../context/CreateMeetingContext";
import { HiUserCircle } from "react-icons/hi2";
import { formatDate, formatTime } from "../../../GetMeeting/Helpers/functionHelper";

const AddTeam = ({ handleClose }) => {
  const {
    loading,
    formState,
    setFormState,
    handleInputBlur,
    getMeeting,
    checkId,
    setTeamAdded,
  } = useFormContext();
  const [t] = useTranslation("global");
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Meeting location");
  const [expanded, setExpanded] = useState(false);
  const userID = CookieService.get("user_id");
  // const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const [addedTeams, setAddedTeams] = useState([]);

  const handleSelectTeam = (team) => {
    setSelectedTeams((prevSelected) => {
      const isAlreadySelected = prevSelected.some((t) => t.id === team.id);

      const updatedTeams = isAlreadySelected
        ? prevSelected.filter((t) => t.id !== team.id) // Deselect the team
        : [...prevSelected, team]; // Select the team

      // Update the form state with selected teams
      setFormState((prevState) => ({
        ...prevState,
        teams: updatedTeams, // Store the full team objects
        participants: [], // Reset participants when teams are updated
      }));

      return updatedTeams;
    });
  };

  const handleSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const iconStyle = {
    padding: " 8px 5px",
    borderRadius: "8px",
    textAlign: "center",
    margin: "3px",
  };

  // const teams = [
  //   { id: 1, name: "TekTime", logo: "path-to-logo" },
  //   { id: 2, name: "TekTime", logo: "path-to-logo" },
  // ];

  const getMeeting1 = async () => {
    try {
         const currentTime = new Date();
             const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
         
             const options = { timeZone: userTimeZone };
             const timeInUserZone = new Date(
               currentTime.toLocaleString("en-US", options)
             );
         
             const formattedTime = formatTime(timeInUserZone);
             const formattedDate = formatDate(timeInUserZone);
      const response = await axios.get(`${API_BASE_URL}/meetings/${checkId}?current_time=${formattedTime}&current_date=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.status === 200) {
        const teams = response?.data?.data?.teams;
        setAddedTeams(teams);

        // const teamIds = teams.map((team) => team.id);
        // setSelectedTeams(teamIds);
        // setFormState((prevState) => ({
        //   ...prevState,
        //   teams: teamIds,
        // }));
        // Set selected teams as the full team objects
        setSelectedTeams(teams);
        // Update form state with full team objects
        setFormState((prevState) => ({
          ...prevState,
          teams: teams, // Set the whole team objects here
        }));
      }
    } catch (error) {
    }
  };
  const user = JSON.parse(CookieService.get("user"));
  const userTeams = user?.teams || [];
  useEffect(() => {
    getMeeting1();

    const getTeams = async () => {
      const token = CookieService.get("token");
      try {
        // setLoading(true);

        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const allTeams = response?.data?.data;
          const teams = allTeams?.filter((team) =>
            userTeams.some((team1) => team?.id === team1?.id)
          );
          setTeams(teams);
        }
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error?.message));
        // console.log("error message", error);
      } finally {
        // setLoading(false);
      }
    };
    getTeams();
  }, [userID, checkId]);

  const handleDelete = async (team) => {
    try {
      const payload = {
        meeting_id: checkId,
        team_id: team.id,
      };
      const response = await axios.delete(
        `${API_BASE_URL}/delete-meeting-team`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
          data: payload,
        }
      );
      if (response.status === 200) {
        // toast.success('Team deleted successfully');
        // const updatedAddedTeams = addedTeams.filter((t) => t.id !== team.id);
        // setAddedTeams(updatedAddedTeams);

        await getMeeting1();
        await getMeeting(checkId);
        // setSelectedTeams(updatedAddedTeams);

        // setFormState((prevState) => ({
        //   ...prevState,
        //   teams: updatedAddedTeams, // Update teams in the form state
        // }));
      }
    } catch (error) {
      console.log("error", error);
    }
    // // Remove team from addedTeams
    // const updatedAddedTeams = addedTeams.filter((t) => t.id !== team.id);
    // setAddedTeams(updatedAddedTeams);

    // // Remove team from selectedTeams if it exists
    // const updatedSelectedTeams = selectedTeams.filter((id) => id !== team.id);
    // setSelectedTeams(updatedSelectedTeams);

    // // Update formState to reflect the changes
    // setFormState((prevState) => ({
    //   ...prevState,
    //   teams: updatedSelectedTeams, // Update teams in the form state
    // }));
  };

  // const handleSave = async () => {
  //   setTeamAdded(true);
  //   await handleInputBlur();
  //   // await getMeeting1();
  //   await getMeeting(checkId);

  //   handleClose();
  // };
  // const [isLoading,setIsLoading] = useState(false)
  const addTeams = async () => {
    const payload = {
      meeting_id: checkId,
      teams: selectedTeams.map((team) => team?.id) || [],
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-team-participants`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        console.log("team added successfully", response?.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleSave = async () => {
    setTeamAdded(true);

    // Call handleInputBlur after a delay
    await new Promise((resolve) => {
      const options = { updatedButton: false, quitAndUpdate: false };

      const newformstate = {
        ...formState,
        // participant_type: selectedTab,
      };
      setTimeout(async () => {
        // await handleInputBlur(newformstate, options);
        await addTeams();
        resolve();
      }, 1000);
    });

    await getMeeting(checkId);
    // handleClose();
  };
  return (
    <div>
      <Row>
        <Col md={12}>
          <Accordion className="mt-2 mb-2">
            <Accordion.Item eventKey="0">
              <Accordion.Header
                className={`custom-accordion-header ${
                  expanded ? "expanded" : ""
                }`}
                onClick={handleToggle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  {expanded ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <g clip-path="url(#clip0_1_978)">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8.25 9C8.84674 9 9.41903 8.76295 9.84099 8.34099C10.2629 7.91903 10.5 7.34674 10.5 6.75C10.5 6.15326 10.2629 5.58097 9.84099 5.15901C9.41903 4.73705 8.84674 4.5 8.25 4.5C7.65326 4.5 7.08097 4.73705 6.65901 5.15901C6.23705 5.58097 6 6.15326 6 6.75C6 7.34674 6.23705 7.91903 6.65901 8.34099C7.08097 8.76295 7.65326 9 8.25 9ZM8.25 11.25C9.44347 11.25 10.5881 10.7759 11.432 9.93198C12.2759 9.08807 12.75 7.94347 12.75 6.75C12.75 5.55653 12.2759 4.41193 11.432 3.56802C10.5881 2.72411 9.44347 2.25 8.25 2.25C7.05653 2.25 5.91193 2.72411 5.06802 3.56802C4.22411 4.41193 3.75 5.55653 3.75 6.75C3.75 7.94347 4.22411 9.08807 5.06802 9.93198C5.91193 10.7759 7.05653 11.25 8.25 11.25ZM3.7065 15.579C2.541 16.389 2.25 17.1735 2.25 17.538C2.25 18.207 2.793 18.75 3.462 18.75H13.038C13.3594 18.75 13.6677 18.6223 13.895 18.395C14.1223 18.1677 14.25 17.8594 14.25 17.538C14.25 17.172 13.959 16.3875 12.7935 15.579C11.688 14.8125 10.0785 14.25 8.25 14.25C6.423 14.25 4.812 14.8125 3.7065 15.579ZM0 17.538C0 14.769 3.7125 12 8.25 12C10.02 12 11.667 12.4215 13.0155 13.101C14.3069 12.3711 15.7666 11.9915 17.25 12C20.9625 12 24 14.307 24 16.6155C24 17.3805 23.6961 18.1142 23.1551 18.6551C22.6142 19.1961 21.8805 19.5 21.1155 19.5H15.891C15.267 20.406 14.2215 21 13.038 21H3.462C2.54382 21 1.66325 20.6353 1.014 19.986C0.364745 19.3368 0 18.4562 0 17.538ZM16.4865 17.25H21.1155C21.4665 17.25 21.75 16.965 21.75 16.6155C21.75 16.461 21.606 15.9075 20.718 15.2805C19.887 14.691 18.6555 14.25 17.25 14.25C16.4745 14.25 15.7515 14.385 15.12 14.604C15.909 15.405 16.401 16.323 16.4865 17.25ZM18.75 7.5C18.75 7.89782 18.592 8.27936 18.3107 8.56066C18.0294 8.84196 17.6478 9 17.25 9C16.8522 9 16.4706 8.84196 16.1893 8.56066C15.908 8.27936 15.75 7.89782 15.75 7.5C15.75 7.10218 15.908 6.72064 16.1893 6.43934C16.4706 6.15804 16.8522 6 17.25 6C17.6478 6 18.0294 6.15804 18.3107 6.43934C18.592 6.72064 18.75 7.10218 18.75 7.5ZM21 7.5C21 8.49456 20.6049 9.44839 19.9016 10.1517C19.1984 10.8549 18.2446 11.25 17.25 11.25C16.2554 11.25 15.3016 10.8549 14.5983 10.1517C13.8951 9.44839 13.5 8.49456 13.5 7.5C13.5 6.50544 13.8951 5.55161 14.5983 4.84835C15.3016 4.14509 16.2554 3.75 17.25 3.75C18.2446 3.75 19.1984 4.14509 19.9016 4.84835C20.6049 5.55161 21 6.50544 21 7.5Z"
                            fill="#E0E6F1"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_978">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </>
                  ) : (
                    <>
                      <g clip-path="url(#clip0_1_916)">
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M8.25 9C8.84674 9 9.41903 8.76295 9.84099 8.34099C10.2629 7.91903 10.5 7.34674 10.5 6.75C10.5 6.15326 10.2629 5.58097 9.84099 5.15901C9.41903 4.73705 8.84674 4.5 8.25 4.5C7.65326 4.5 7.08097 4.73705 6.65901 5.15901C6.23705 5.58097 6 6.15326 6 6.75C6 7.34674 6.23705 7.91903 6.65901 8.34099C7.08097 8.76295 7.65326 9 8.25 9ZM8.25 11.25C9.44347 11.25 10.5881 10.7759 11.432 9.93198C12.2759 9.08807 12.75 7.94347 12.75 6.75C12.75 5.55653 12.2759 4.41193 11.432 3.56802C10.5881 2.72411 9.44347 2.25 8.25 2.25C7.05653 2.25 5.91193 2.72411 5.06802 3.56802C4.22411 4.41193 3.75 5.55653 3.75 6.75C3.75 7.94347 4.22411 9.08807 5.06802 9.93198C5.91193 10.7759 7.05653 11.25 8.25 11.25ZM3.7065 15.579C2.541 16.389 2.25 17.1735 2.25 17.538C2.25 18.207 2.793 18.75 3.462 18.75H13.038C13.3594 18.75 13.6677 18.6223 13.895 18.395C14.1223 18.1677 14.25 17.8594 14.25 17.538C14.25 17.172 13.959 16.3875 12.7935 15.579C11.688 14.8125 10.0785 14.25 8.25 14.25C6.423 14.25 4.812 14.8125 3.7065 15.579ZM0 17.538C0 14.769 3.7125 12 8.25 12C10.02 12 11.667 12.4215 13.0155 13.101C14.3069 12.3711 15.7666 11.9915 17.25 12C20.9625 12 24 14.307 24 16.6155C24 17.3805 23.6961 18.1142 23.1551 18.6551C22.6142 19.1961 21.8805 19.5 21.1155 19.5H15.891C15.267 20.406 14.2215 21 13.038 21H3.462C2.54382 21 1.66325 20.6353 1.014 19.986C0.364745 19.3368 0 18.4562 0 17.538ZM16.4865 17.25H21.1155C21.4665 17.25 21.75 16.965 21.75 16.6155C21.75 16.461 21.606 15.9075 20.718 15.2805C19.887 14.691 18.6555 14.25 17.25 14.25C16.4745 14.25 15.7515 14.385 15.12 14.604C15.909 15.405 16.401 16.323 16.4865 17.25ZM18.75 7.5C18.75 7.89782 18.592 8.27936 18.3107 8.56066C18.0294 8.84196 17.6478 9 17.25 9C16.8522 9 16.4706 8.84196 16.1893 8.56066C15.908 8.27936 15.75 7.89782 15.75 7.5C15.75 7.10218 15.908 6.72064 16.1893 6.43934C16.4706 6.15804 16.8522 6 17.25 6C17.6478 6 18.0294 6.15804 18.3107 6.43934C18.592 6.72064 18.75 7.10218 18.75 7.5ZM21 7.5C21 8.49456 20.6049 9.44839 19.9016 10.1517C19.1984 10.8549 18.2446 11.25 17.25 11.25C16.2554 11.25 15.3016 10.8549 14.5983 10.1517C13.8951 9.44839 13.5 8.49456 13.5 7.5C13.5 6.50544 13.8951 5.55161 14.5983 4.84835C15.3016 4.14509 16.2554 3.75 17.25 3.75C18.2446 3.75 19.1984 4.14509 19.9016 4.84835C20.6049 5.55161 21 6.50544 21 7.5Z"
                          fill="#3D57B5"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1_916">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </>
                  )}
                </svg>
                <span
                  className="w-100 text-start solutioncards"
                  style={{ color: expanded ? "#E0E6F1" : "#3D57B5" }}
                >
                  {t("meeting.formState.moment_form_teams")}
                </span>
                {expanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_1_989)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.707 15.707C12.5195 15.8945 12.2652 15.9998 12 15.9998C11.7348 15.9998 11.4805 15.8945 11.293 15.707L5.63601 10.05C5.5405 9.95776 5.46431 9.84742 5.41191 9.72541C5.3595 9.60341 5.33191 9.47219 5.33076 9.33941C5.3296 9.20663 5.3549 9.07495 5.40519 8.95205C5.45547 8.82916 5.52972 8.7175 5.62361 8.62361C5.71751 8.52972 5.82916 8.45547 5.95205 8.40519C6.07495 8.3549 6.20663 8.3296 6.33941 8.33076C6.47219 8.33191 6.60341 8.3595 6.72541 8.41191C6.84742 8.46431 6.95776 8.5405 7.05001 8.63601L12 13.586L16.95 8.63601C17.1386 8.45385 17.3912 8.35305 17.6534 8.35533C17.9156 8.35761 18.1664 8.46278 18.3518 8.64819C18.5372 8.8336 18.6424 9.08441 18.6447 9.34661C18.647 9.6088 18.5462 9.86141 18.364 10.05L12.707 15.707Z"
                        fill="#8282AE"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_989">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_1_919)">
                      <path
                        d="M20 11.3333H12.6667V4.00001C12.6667 3.8232 12.5964 3.65363 12.4714 3.52861C12.3464 3.40358 12.1768 3.33334 12 3.33334C11.8232 3.33334 11.6536 3.40358 11.5286 3.52861C11.4036 3.65363 11.3333 3.8232 11.3333 4.00001V11.3333H4C3.82319 11.3333 3.65362 11.4036 3.5286 11.5286C3.40358 11.6536 3.33334 11.8232 3.33334 12C3.33005 12.0867 3.34537 12.173 3.37827 12.2532C3.41117 12.3334 3.46088 12.4057 3.52406 12.4651C3.58723 12.5244 3.6624 12.5696 3.74451 12.5975C3.82661 12.6254 3.91373 12.6353 4 12.6267H11.3333V20C11.3333 20.1768 11.4036 20.3464 11.5286 20.4714C11.6536 20.5964 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5964 12.4714 20.4714C12.5964 20.3464 12.6667 20.1768 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5964 20.4714 12.4714C20.5964 12.3464 20.6667 12.1768 20.6667 12C20.6667 11.8232 20.5964 11.6536 20.4714 11.5286C20.3464 11.4036 20.1768 11.3333 20 11.3333Z"
                        fill="#3D57B5"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_919">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <div className="list-group">
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <button
                        key={team.id}
                        className={`list-group-item list-group-item-action p-3 ${
                          selectedTeams.some((t) => t.id === team.id)
                            ? "border-primary"
                            : ""
                        }`}
                        onClick={() => handleSelectTeam(team)}
                      >
                        <span>
                          {team?.logo ? (
                            <img
                              src={
                                team?.logo?.startsWith("http")
                                  ? team?.logo
                                  : Assets_URL + "/" + team?.logo
                              }
                              alt={`${team.name}'s avatar`}
                              className="rounded-circle me-2"
                              style={{ width: "40px", height: "40px" }}
                            />
                          ) : (
                            <HiUserCircle size={"40px"} />
                          )}
                          {team.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p>No teams available</p>
                  )}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
      {!expanded && (
        <>
          <h4
            className="mb-2 solutioncards"
            style={{ fontSize: "18px", fontWeight: "600" }}
          >
            {addedTeams.length > 0
              ? addedTeams?.length
              : t("meeting.formState.step.No")}{" "}
            {t("meeting.formState.No Teams added")}
          </h4>
          <Table className="add-guest-table">
            <tbody>
              {addedTeams?.map((team, index) => (
                <tr key={team.id} className="align-middle">
                  <td width="5%">{index + 1}.</td>
                  <td width={"70%"}>
                    {team?.logo ? (
                      <img
                        src={Assets_URL + "/" + team?.logo}
                        alt={`${team.name}'s avatar`}
                        className="rounded-circle me-2"
                        style={{ width: "40px", height: "40px" }}
                      />
                    ) : (
                      <HiUserCircle size={"40px"} />
                    )}
                    {team.name}
                  </td>
                  <td width="10%">
                    {/* <span
                      style={{
                        ...iconStyle,
                        backgroundColor: "#F5F8FF",
                        color: "#3D57B5",
                      }}
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
                    </span> */}
                    <span
                      style={{
                        ...iconStyle,
                        backgroundColor: "#ffe5e5",
                        color: "red",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDelete(team)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
              ))}
            </tbody>
          </Table>
        </>
      )}
      <div
        className={`modal-fotter col-md-12 d-flex justify-content-end px-4 modal-save-button`}
      >
        {loading ? (
          <button className={`btn moment-btn px-2 py-0`}>
            <span
              class="spinner-border spinner-border-sm text-white"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        ) : (
          <button
            className={`btn moment-btn`}
            onClick={handleSave}
            disabled={loading}
          >
            &nbsp;
            {t("meeting.formState.Save and Continue")}
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
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AddTeam;

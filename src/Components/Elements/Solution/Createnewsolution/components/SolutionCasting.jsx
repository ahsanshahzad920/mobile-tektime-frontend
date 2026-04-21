import CookieService from '../../../../Utils/CookieService';

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, Spinner, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    API_BASE_URL,
    Assets_URL,
} from "../../../../../Components/Apicongfig";
import axios from "axios";
import { HiUserCircle } from "react-icons/hi2";
import { toast } from "react-toastify";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { RxCross2 } from "react-icons/rx";
import SolutionAddNewGuest from "./AddGuestComponents/SolutionAddNewGuest";

import SolutionEditGuest from "./AddGuestComponents/SolutionEditGuest";
import SolutionRegistrationModal from "./SolutionRegistrationModal";
import { Tooltip } from "antd";

const SolutionCasting = ({ setActiveTab }) => {
    const [t] = useTranslation("global");
    const {
        formState,
        setFormState,
        handleInputBlur,
        getSolution,
        checkId,
        isUpdated,
        handleCloseModal,
        solution,
    } = useSolutionFormContext();
    const [loading, setLoading] = useState(false);
    const [loadingQuit, setLoadingQuit] = useState(false);
    const [open, setOpen] = useState(false);
    const [show, setShow] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [selectedTab, setSelectedTab] = useState(formState?.casting_type || "Invitation");
    const navigate = useNavigate();

    useEffect(() => {
        if (formState?.type === "Newsletter" || solution?.type === "Newsletter") {
            if (formState?.casting_type !== "Subscription") {
                handleShowTab("Subscription");
            }
        } else if (formState?.casting_type) {
            setSelectedTab(formState.casting_type);
        }
    }, [formState?.casting_type, solution?.type, formState?.type]);

    const handleShowTab = (tab) => {
        setSelectedTab(tab);
        setFormState((prevState) => ({
            ...prevState,
            casting_type: tab,
        }));
    };

    const tabStyle = (isSelected) => ({
        borderRadius: "23px",
        padding: "18px",
        textAlign: "center",
        cursor: "pointer",
        background: "rgba(241, 245, 255, 0.70)",
        color: isSelected ? "#3D57B5" : "#687691",
        border: isSelected ? "2px solid #3D57B5" : "none",
        width: "100%",
        fontFamily: "IBM Plex Sans",
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "18.2px",
        textAlign: "left",
        display: "flex",
        gap: "8px",
    });

    const renderSVG = (isSelected, type) => {
        if (type === "Invitation") {
            return isSelected ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17.755 14C18.3514 14.0005 18.9232 14.2378 19.3447 14.6597C19.7663 15.0816 20.003 15.6536 20.003 16.25V16.825C20.003 17.719 19.683 18.584 19.103 19.263C17.533 21.096 15.146 22.001 12 22.001C8.85403 22.001 6.46803 21.096 4.90203 19.261C4.32264 18.5824 4.00424 17.7193 4.00403 16.827V16.249C4.00429 15.6526 4.24133 15.0807 4.66304 14.659C5.08475 14.2373 5.65664 14.0003 6.25303 14H17.755ZM17.755 15.5H6.25203C6.05312 15.5 5.86235 15.579 5.7217 15.7197C5.58105 15.8603 5.50203 16.0511 5.50203 16.25V16.827C5.50203 17.362 5.69403 17.88 6.04203 18.287C7.29503 19.756 9.26203 20.501 11.999 20.501C14.738 20.501 16.705 19.756 17.962 18.288C18.3107 17.8803 18.5022 17.3615 18.502 16.825V16.249C18.5018 16.0506 18.4229 15.8604 18.2827 15.72C18.1425 15.5796 17.9534 15.5005 17.755 15.5ZM12 2.005C12.6566 2.005 13.3068 2.13433 13.9134 2.38561C14.5201 2.63688 15.0713 3.00518 15.5356 3.46947C15.9999 3.93376 16.3682 4.48496 16.6194 5.09159C16.8707 5.69822 17 6.3484 17 7.005C17 7.66161 16.8707 8.31179 16.6194 8.91842C16.3682 9.52505 15.9999 10.0762 15.5356 10.5405C15.0713 11.0048 14.5201 11.3731 13.9134 11.6244C13.3068 11.8757 12.6566 12.005 12 12.005C10.6739 12.005 9.40218 11.4782 8.46449 10.5405C7.52681 9.60286 7.00003 8.33109 7.00003 7.005C7.00003 5.67892 7.52681 4.40715 8.46449 3.46947C9.40218 2.53179 10.6739 2.005 12 2.005ZM12 3.505C11.5404 3.505 11.0853 3.59554 10.6606 3.77143C10.236 3.94732 9.85016 4.20513 9.52515 4.53013C9.20015 4.85514 8.94234 5.24097 8.76645 5.66561C8.59056 6.09025 8.50003 6.54538 8.50003 7.005C8.50003 7.46463 8.59056 7.91976 8.76645 8.3444C8.94234 8.76904 9.20015 9.15487 9.52515 9.47988C9.85016 9.80488 10.236 10.0627 10.6606 10.2386C11.0853 10.4145 11.5404 10.505 12 10.505C12.9283 10.505 13.8185 10.1363 14.4749 9.47988C15.1313 8.8235 15.5 7.93326 15.5 7.005C15.5 6.07675 15.1313 5.18651 14.4749 4.53013C13.8185 3.87375 12.9283 3.505 12 3.505Z" fill="#3D57B5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17.755 14C18.3514 14.0005 18.9232 14.2378 19.3447 14.6597C19.7663 15.0816 20.003 15.6536 20.003 16.25V16.825C20.003 17.719 19.683 18.584 19.103 19.263C17.533 21.096 15.146 22.001 12 22.001C8.85403 22.001 6.46803 21.096 4.90203 19.261C4.32264 18.5824 4.00424 17.7193 4.00403 16.827V16.249C4.00429 15.6526 4.24133 15.0807 4.66304 14.659C5.08475 14.2373 5.65664 14.0003 6.25303 14H17.755ZM17.755 15.5H6.25203C6.05312 15.5 5.86235 15.579 5.7217 15.7197C5.58105 15.8603 5.50203 16.0511 5.50203 16.25V16.827C5.50203 17.362 5.69403 17.88 6.04203 18.287C7.29503 19.756 9.26203 20.501 11.999 20.501C14.738 20.501 16.705 19.756 17.962 18.288C18.3107 17.8803 18.5022 17.3615 18.502 16.825V16.249C18.5018 16.0506 18.4229 15.8604 18.2827 15.72C18.1425 15.5796 17.9534 15.5005 17.755 15.5ZM12 2.005C12.6566 2.005 13.3068 2.13433 13.9134 2.38561C14.5201 2.63688 15.0713 3.00518 15.5356 3.46947C15.9999 3.93376 16.3682 4.48496 16.6194 5.09159C16.8707 5.69822 17 6.3484 17 7.005C17 7.66161 16.8707 8.31179 16.6194 8.91842C16.3682 9.52505 15.9999 10.0762 15.5356 10.5405C15.0713 11.0048 14.5201 11.3731 13.9134 11.6244C13.3068 11.8757 12.6566 12.005 12 12.005C10.6739 12.005 9.40218 11.4782 8.46449 10.5405C7.52681 9.60286 7.00003 8.33109 7.00003 7.005C7.00003 5.67892 7.52681 4.40715 8.46449 3.46947C9.40218 2.53179 10.6739 2.005 12 2.005ZM12 3.505C11.5404 3.505 11.0853 3.59554 10.6606 3.77143C10.236 3.94732 9.85016 4.20513 9.52515 4.53013C9.20015 4.85514 8.94234 5.24097 8.76645 5.66561C8.59056 6.09025 8.50003 6.54538 8.50003 7.005C8.50003 7.46463 8.59056 7.91976 8.76645 8.3444C8.94234 8.76904 9.20015 9.15487 9.52515 9.47988C9.85016 9.80488 10.236 10.0627 10.6606 10.2386C11.0853 10.4145 11.5404 10.505 12 10.505C12.9283 10.505 13.8185 10.1363 14.4749 9.47988C15.1313 8.8235 15.5 7.93326 15.5 7.005C15.5 6.07675 15.1313 5.18651 14.4749 4.53013C13.8185 3.87375 12.9283 3.505 12 3.505Z" fill="#687691" />
                </svg>
            );
        } else if (type === "Registration") {
            return isSelected ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7ZM20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="#3D57B5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7ZM20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="#687691" />
                </svg>
            );
        } else if (type === "Subscription") {
            return isSelected ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_1_1041)">
                        <path d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z" fill="#3D57B5" />
                    </g>
                    <defs>
                        <clipPath id="clip0_1_1041">
                            <rect width="24" height="24" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_1_1041)">
                        <path d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z" fill="#687691" />
                    </g>
                    <defs>
                        <clipPath id="clip0_1_1041">
                            <rect width="24" height="24" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            );
        }
    };

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const handleDelete = async (guest) => {
        try {
            const payload = {
                email: guest.email,
                solution_id: checkId,
            };

            const response = await axios.delete(
                `${API_BASE_URL}/solution-participant/${guest.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${CookieService.get("token")}`,
                    },
                    data: payload,
                }
            );

            if (response.status === 200) {
                toast.success(t("Participant Deleted Successfully"));
                await getSolution(checkId);
            }
        } catch (error) {
            console.error("Error deleting guest:", error);
            toast.error(t("messages.guestDeleteError"));
        }
    };

    const handleEdit = (guest) => {
        setSelectedGuest(guest);
        setEditModal(true);
    };

    const handleEditClose = () => {
        setEditModal(false);
        setSelectedGuest(null);
    };

    const handleSaveAndContinue = async () => {
        setLoading(true);
        try {
            await handleInputBlur();
            setActiveTab("tab6");
        } catch (error) {
            toast.error("Error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndQuit = async () => {
        setLoadingQuit(true);
        try {
            await handleInputBlur();
            handleCloseModal();
        } catch (error) {
            toast.error("Error occurred");
        } finally {
            setLoadingQuit(false);
            navigate(`/solution/${checkId}`);
        }
    };

    return (
        <>
            <div className="tab-pane fade show active" id="tab3">
                <div className="row">
                    <div className="col-md-12">
                        <Row className="mb-4">
                            {formState?.type === "Newsletter" || solution?.type === "Newsletter" ? (
                                <Col xs={12} sm={12} md={12} lg={12}>
                                    <Tooltip title={t("Abonnement")}>
                                        <div
                                            className="d-flex justify-content-between align-items-center modal-tab-button p-3"
                                            onClick={() => handleShowTab("Subscription")}
                                            style={tabStyle(selectedTab === "Subscription")}
                                        >
                                            <div>
                                                {renderSVG(selectedTab === "Subscription", "Subscription")}
                                                <span
                                                    className="solutioncards"
                                                    style={{
                                                        color: selectedTab === "Subscription" ? "#3D57B5" : "#687691",
                                                        marginLeft: "8px"
                                                    }}
                                                >
                                                    {t("Abonnement")}
                                                </span>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </Col>
                            ) : (
                                <>
                                    <Col xs={12} sm={6} md={6} lg={6}>
                                        <Tooltip title={t("invitation_tooltip")}>
                                            <div
                                                className="d-flex justify-content-between align-items-center modal-tab-button p-3"
                                                onClick={() => handleShowTab("Invitation")}
                                                style={tabStyle(selectedTab === "Invitation")}
                                            >
                                                <div>
                                                    {renderSVG(selectedTab === "Invitation", "Invitation")}
                                                    <span className="solutioncards" style={{ color: selectedTab === "Invitation" ? "#3D57B5" : "#687691" }}>
                                                        {t("meeting.formState.Invitation")}
                                                    </span>
                                                </div>
                                                {/* SVG Arrow */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <g clipPath="url(#clip0_1_1041)">
                                                        <path d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z" fill={selectedTab === "Invitation" ? "#3D57B5" : "#687691"} />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_1_1041"><rect width="24" height="24" fill="white" /></clipPath>
                                                    </defs>
                                                </svg>
                                            </div>
                                        </Tooltip>
                                    </Col>
                                    <Col xs={12} sm={6} md={6} lg={6}>
                                        <Tooltip title={t("registration_tooltip")}>
                                            <div
                                                className="d-flex justify-content-between align-items-center modal-tab-button p-3"
                                                onClick={() => handleShowTab("Registration")}
                                                style={tabStyle(selectedTab === "Registration")}
                                            >
                                                <div>
                                                    {renderSVG(selectedTab === "Registration", "Registration")}
                                                    <span className="solutioncards" style={{ color: selectedTab === "Registration" ? "#3D57B5" : "#687691" }}>
                                                        {t("meeting.formState.Registration")}
                                                    </span>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <g clipPath="url(#clip0_1_1041)">
                                                        <path d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z" fill={selectedTab === "Registration" ? "#3D57B5" : "#687691"} />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_1_1041"><rect width="24" height="24" fill="white" /></clipPath>
                                                    </defs>
                                                </svg>
                                            </div>
                                        </Tooltip>
                                    </Col>
                                </>
                            )}
                        </Row>
                        {(selectedTab === "Invitation" || selectedTab === "Subscription") && (
                            <>
                                {/* <h4
                                    className="mt-2 mb-2 solutioncards"
                                    style={{ fontSize: "16px" }}
                                >
                                    {t("meeting.formState.Invitation")}
                                </h4> */}
                                <SolutionAddNewGuest show={show} handleClose={handleClose} editModal={editModal} />
                                <SolutionEditGuest show={editModal} handleClose={handleEditClose} guest={selectedGuest} />
                            </>
                        )}

                        {selectedTab === "Registration" && (
                            <SolutionRegistrationModal />
                        )}

                        {(selectedTab === "Invitation" || selectedTab === "Subscription") && (
                            <>

                                <h4
                                    className="mt-3 mb-2 solutioncards"
                                    style={{ fontSize: "18px", fontWeight: "600" }}
                                >
                                    {solution?.participants?.length > 0
                                        ? solution?.participants?.length
                                        : t("meeting.formState.step.No")}{" "}
                                    {t("meeting.formState.Guest List")}
                                </h4>
                                <Table
                                    className="add-guest-table align-middle"
                                    style={{ marginBottom: "0px" }}
                                    responsive
                                >
                                    <tbody>
                                        {solution?.participants?.length > 0 &&
                                            solution?.participants?.map((guest, index) => (
                                                <tr key={index}>
                                                    <td width="3%">{index + 1}.</td>
                                                    <td width={"20%"}>
                                                        {guest?.participant_image?.startsWith("http") ? (
                                                            <img
                                                                src={guest.participant_image}
                                                                alt=""
                                                                className="rounded-circle me-2"
                                                                width="30"
                                                                height="30"
                                                            />
                                                        ) : guest?.participant_image ? (
                                                            <img
                                                                src={`${Assets_URL}/${guest.participant_image}`}
                                                                alt=""
                                                                className="rounded-circle me-2"
                                                                width="30"
                                                                height="30"
                                                            />
                                                        ) : (
                                                            <HiUserCircle size={"30px"} className="me-2" />
                                                        )}
                                                        {guest.first_name} {guest.last_name}
                                                    </td>
                                                    <td width="30%">
                                                        <div className="text-muted small">{guest.email}</div>
                                                    </td>

                                                    <td style={{ textAlign: "center" }}>
                                                        {guest?.client?.client_logo && (
                                                            <img
                                                                src={
                                                                    guest?.client?.client_logo?.startsWith("http")
                                                                        ? guest?.client?.client_logo
                                                                        : Assets_URL + "/" + guest?.client?.client_logo
                                                                }
                                                                alt={`${guest?.client?.name}'s avatar`}
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                    objectFit: "cover",
                                                                    objectPosition: "top",
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: "start" }}>
                                                        {guest?.client?.name}
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
                                                        {guest?.post || "N/A"}
                                                    </td>
                                                    <td width="10%">
                                                        <span
                                                            style={{
                                                                padding: "8px 5px",
                                                                borderRadius: "8px",
                                                                textAlign: "center",
                                                                margin: "3px",
                                                                backgroundColor: "#F5F8FF",
                                                                color: "#3D57B5",
                                                                cursor: "pointer",
                                                                display: "inline-block",
                                                            }}
                                                            onClick={() => handleEdit(guest)}
                                                            title={t("Edit")}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="20"
                                                                height="20"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </span>
                                                        <span
                                                            style={{
                                                                padding: "8px 5px",
                                                                borderRadius: "8px",
                                                                textAlign: "center",
                                                                margin: "3px",
                                                                backgroundColor: "#ffe5e5",
                                                                color: "red",
                                                                cursor: "pointer",
                                                                display: "inline-block",
                                                            }}
                                                            onClick={() => handleDelete(guest)}
                                                            title={t("Delete")}
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
                    </div>
                </div>
                <div
                    className={`modal-footer d-flex justify-content-end modal-save-button gap-4 mt-4`}
                >
                    {isUpdated && (
                        <div
                            variant="danger"
                            // className="btn "
                            onClick={handleSaveAndQuit}
                            disabled={loadingQuit}
                            style={{ padding: "9px", cursor: 'pointer', background: '#dc3545', color: 'white', border: '1px solid #dc3545', borderRadius: '4px' }}
                        >
                            {loadingQuit ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        style={{
                                            textAlign: "center",
                                            fontWeight: "600",
                                            fontSize: "16px",
                                            color: "white",
                                            margin: "0 10px",
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    &nbsp;{t("meeting.formState.Save and Quit")}
                                </>
                            )}
                        </div>
                    )}
                    <button
                        className="btn moment-btn"
                        onClick={handleSaveAndContinue}
                        disabled={loading}
          style={{padding:'0px 10px '}}

                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        color: "white",
                                        margin: "0 10px",
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                &nbsp;{t("meeting.formState.Save and Continue")}
                                <span className="ms-2">
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
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default SolutionCasting;

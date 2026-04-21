import CookieService from '../../../../../Utils/CookieService';

import React, { useEffect, useState } from "react";
import { Button, Modal, Col, Row, Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import { useSolutionFormContext } from "../../../../../../context/CreateSolutionContext";
import { API_BASE_URL, Assets_URL } from "../../../../../Apicongfig";
import Creatable from "react-select/creatable";

const SolutionEditGuest = ({ show, handleClose, guest }) => {
    const [t] = useTranslation("global");
    const { checkId, getSolution, handleInputBlur, formState } = useSolutionFormContext();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        post: "",
        contribution: "",
        client_id: null,
        client: null,
    });

    useEffect(() => {
        if (guest) {
            setFormData({
                email: guest.email || "",
                first_name: guest.first_name || "",
                last_name: guest.last_name || "",
                post: guest.post || "",
                contribution: guest.contribution || "",
                client_id: guest.client_id || null,
                client: guest.client || null,
            });
            // Set initial selected client if available
            if (guest.client_id) {
                // Logic to set selectedClient based on client_id will be handled after fetching clients
            }
        }
    }, [guest]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
                    "user_id"
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${CookieService.get("token")}`,
                    },
                }
            );
            if (response?.data?.data) {
                const clientsData = response.data.data;

                const userClients = clientsData
                    .filter((client) => client.linked_to === "user")
                    .map((client) => ({
                        label: client.name,
                        value: client.id,
                        data: {
                            client_logo: client.client_logo,
                        },
                    }));

                const enterpriseClients = clientsData
                    .filter((client) => client.linked_to === "enterprise")
                    .map((client) => ({
                        label: client.name,
                        value: client.id,
                        data: {
                            client_logo: client.client_logo,
                        },
                    }));

                const groupedOptions = [
                    {
                        label: "Mon entreprise",
                        options: enterpriseClients,
                    },
                    {
                        label: "Nos clients",
                        options: userClients,
                    },
                ];
                setClients(groupedOptions);
            }

        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    useEffect(() => {
        if (clients.length > 0 && guest) {
            if (guest.client_id) {
                let foundClient = null;
                clients.forEach(group => {
                    const found = group.options.find(c => c.value === guest.client_id);
                    if (found) foundClient = found;
                });
                if (foundClient) setSelectedClient(foundClient);
            } else if (guest.client) {
                if (typeof guest.client === 'object' && guest.client.name) {
                    // If client is an object with name (and potentially id but distinct from client_id logic above)
                    // Try to find it in options first to get the enriched object
                    let foundClient = null;
                    clients.forEach(group => {
                        let found = group.options.find(c => c.label === guest.client.name);

                        if (!found && guest.client.id) {
                            found = group.options.find(opt => opt.value === guest.client.id);
                        }

                        if (found) foundClient = found;
                    });

                    if (foundClient) {
                        setSelectedClient(foundClient);
                    } else {
                        // Fallback to custom object
                        setSelectedClient({
                            label: guest.client.name,
                            value: guest.client.id || null,
                            data: { client_logo: guest.client.client_logo } // Preserve logo if available
                        });
                    }

                } else if (typeof guest.client === 'string') {
                    setSelectedClient({ label: guest.client, value: null });
                } else {
                    setSelectedClient(null);
                }
            } else {
                setSelectedClient(null);
            }
        }
    }, [clients, guest]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClientChange = (option, actionMeta) => {
        setSelectedClient(option);
        if (actionMeta.action === "create-option") {
            setFormData(prev => ({ ...prev, client: option.label, client_id: null }));
        } else if (option) {
            setFormData(prev => ({ ...prev, client_id: option.value, client: null }));
        } else {
            setFormData(prev => ({ ...prev, client_id: null, client: null }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            participant_id: guest?.id,
            email: formData.email,
            post: formData.post,
            first_name: formData.first_name,
            last_name: formData.last_name,
            contribution: formData.contribution,
            client_id: formData.client_id,
            client: formData.client_id ? null : formData.client,
        };

        try {
            // Optimistic update of formState to show feedback immediately?
            // No, let's wait for API.

            const response = await axios.put(
                `${API_BASE_URL}/solution-participant/${guest?.id}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CookieService.get("token")}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success(t("solution.success.guestUpdated"));
                await getSolution(checkId); // Refresh data
                handleClose();
            } else {
                toast.error(t("solution.error.updateFailed"));
            }
        } catch (error) {
            console.error("Error updating participant:", error);
            toast.error(t("solution.error.updateError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="custom-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title style={{ fontSize: "18px", fontWeight: "600" }}>{t("Edit Guest")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="g-2">
                    <Col xs={12} className="mb-2">
                        <label className="form-label">{t("meeting.formState.email")}</label>
                        <input
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col xs={12} className="mb-2">
                        <label className="form-label">{t("Organization")}</label>
                        <Creatable
                            className="my-select destination-select-dropdown"
                            classNamePrefix="select"
                            options={clients}
                            value={selectedClient}
                            onChange={handleClientChange}
                            isClearable
                            placeholder={t("Select or create organization")}
                            formatOptionLabel={(option, { context }) => (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    {option.data?.client_logo && (
                                        <img
                                            src={
                                                option.data.client_logo.startsWith("http")
                                                    ? option.data.client_logo
                                                    : `${Assets_URL}/${option.data.client_logo}`
                                            }
                                            alt={option.label}
                                            style={{
                                                width: "24px",
                                                height: "24px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                marginRight: "10px",
                                            }}
                                        />
                                    )}
                                    <span>{option.label}</span>
                                </div>
                            )}
                        />
                    </Col>
                    <Col xs={12} md={6} className="mb-2">
                        <label className="form-label">{t("meeting.formState.firstName")}</label>
                        <input
                            className="form-control"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col xs={12} md={6} className="mb-2">
                        <label className="form-label">{t("meeting.formState.lastName")}</label>
                        <input
                            className="form-control"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col xs={12} className="mb-2">
                        <label className="form-label">{t("meeting.formState.post")}</label>
                        <input
                            className="form-control"
                            name="post"
                            value={formData.post}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="secondary" onClick={handleClose}>
                    {t("Cancel")}
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading} style={{ background: "#3D57B5", borderColor: "#3D57B5" }}>
                    {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : t("Save")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SolutionEditGuest;

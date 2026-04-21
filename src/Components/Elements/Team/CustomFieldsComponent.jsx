import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import { Button, Form, Table, Badge, Row, Col, Spinner, Alert } from "react-bootstrap";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";

const CustomFieldsComponent = ({ onFieldsChange }) => {
  const [t] = useTranslation("global")
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: 'text',
  });

  // Field types configuration
  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
  ];

  // Fetch custom fields from API
const fetchCustomFields = async () => {
  try {
    setLoading(true);
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await axios.get(
      `${API_BASE_URL}/get-contacts-custom-fields`,
      {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`
        }
      }
    );
    
    if (response.data) {
      setCustomFields(response.data.data.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
      })));
    }
  } catch (err) {
    setError(err.response?.data?.message || "Failed to fetch custom fields");
    console.error("Error fetching custom fields:", err);
  } finally {
    setLoading(false);
  }
};

const saveCustomField = async (fieldData) => {
  try {
    let response;
    let payload;
    
    if (fieldData.id) {
      // Update existing field
      payload = {
        id: fieldData.id,
        name: fieldData.name,
        type: fieldData.type,
        _method: "PUT"
      };
      
      response = await axios.post(
        `${API_BASE_URL}/contacts/custom-fields/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`
          }
        }
      );
    } else {
      // Create new field
      payload = {
        custom_fields: [
          {
            name: fieldData.name,
            type: fieldData.type
          }
        ]
      };
      
      response = await axios.post(
        `${API_BASE_URL}/add-contacts-custom-fields`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`
          }
        }
      );
    }

    // Add better response handling
    if (response.data) {
      // Force a fresh fetch by adding a timestamp parameter
      await fetchCustomFields();
      if (onFieldsChange) onFieldsChange();
      return true;
    } else {
      setError(response.data?.message || "Operation failed without error message");
      return false;
    }
  } catch (err) {
    setError(err.response?.data?.message || "Failed to save custom field");
    console.error("Error saving custom field:", err);
    return false;
  }
};
  // Delete a custom field
  const deleteCustomField = async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/contacts/custom-fields/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`
          }
        }
      );

      if (response.data) {
        fetchCustomFields(); // Refresh the list
        if (onFieldsChange) onFieldsChange();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete custom field");
      console.error("Error deleting custom field:", err);
    }
  };

  // Initialize with API data
  useEffect(() => {
    fetchCustomFields();
  }, []);

  // Edit handlers
  const handleEditClick = (field) => {
    setEditingId(field.id);
    setEditFormData({
      name: field.name,
      type: field.type,
      value: field.value
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSaveClick = async (id) => {
    const success = await saveCustomField({
      id: id === 'new' ? null : id,
      name: editFormData.name,
      type: editFormData.type,
    });

    if (success) {
      setEditingId(null);
    }
  };

  // Helper to display field type as badge
  const getTypeBadge = (type) => {
    const typeInfo = fieldTypes.find(t => t.value === type);
    return typeInfo ? (
      <Badge bg="info" className="text-capitalize">
        {typeInfo.label}
      </Badge>
    ) : null;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        {error}
      </Alert>
    );
  }

  return (
    <div className="custom-fields-container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{t("Custom Fields")}</h4>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => {
            setEditingId('new');
            setEditFormData({
              name: '',
              type: 'text',
              value: ''
            });
          }}
          disabled={editingId === 'new'}
        >
          <FaPlus className="me-1" /> {t("Add Field")}
        </Button>
      </div>

      {editingId === 'new' && (
        <div className="edit-form mb-4 p-3 border rounded bg-light">
          <Row className="g-2 align-items-center">
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t("Field Name")}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  // placeholder="Enter field name"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t("Field Type")}</Form.Label>
                <Form.Select
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditFormChange}
                  required
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end" style={{marginTop:'2rem'}}>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleSaveClick('new')}
                className="me-1"
              >
                <FaCheck /> {t("Validate")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelClick}
              >
                <FaTimes /> {t("Cancel")}
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {customFields.length === 0 ? (
        <div className="text-center py-4 text-muted">
          {t("No custom fields have been created yet.")}
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>{t("Field Name")}</th>
              <th>{t("Type")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {customFields.map(field => (
              <tr key={field.id}>
                {editingId === field.id ? (
                  <>
                    <td>
                      <Form.Control
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditFormChange}
                        required
                      />
                    </td>
                    <td>
                      <Form.Select
                        name="type"
                        value={editFormData.type}
                        onChange={handleEditFormChange}
                        required
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    {/* <td>
                      <Form.Control
                        type={editFormData.type === 'number' ? 'number' : 'text'}
                        name="value"
                        value={editFormData.value}
                        onChange={handleEditFormChange}
                      />
                    </td> */}
                    <td className="d-flex">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleSaveClick(field.id)}
                        className="me-1"
                      >
                        <FaCheck /> {t("Validate")}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleCancelClick}
                      >
                        <FaTimes /> {t("Cancel")}
                      </Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{field.name}</td>
                    <td>{getTypeBadge(field.type)}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditClick(field)}
                        className="me-1"
                      >
                        <FaEdit /> {t("Edit")}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteCustomField(field.id)}
                      >
                        <FaTrash /> {t("Delete")}
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default CustomFieldsComponent;
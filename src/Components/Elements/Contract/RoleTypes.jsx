import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
import Select from "react-select";
import "./RoleTypes.scss";

// ─── Default emojis for roles ────────────────────────────────────────────────
const ROLE_EMOJIS = [
  { emoji: "🧠", label: "Brain / Project" },
  { emoji: "💼", label: "Briefcase / Sales" },
  { emoji: "🎯", label: "Target / Manager" },
  { emoji: "💻", label: "Laptop / Developer" },
  { emoji: "🎓", label: "Cap / Trainer" },
  { emoji: "🛠️", label: "Tools / Freelance" },
  { emoji: "🧪", label: "Lab / Other" },
  { emoji: "📱", label: "Mobile" },
  { emoji: "🎨", label: "Design" },
  { emoji: "📈", label: "Growth" },
  { emoji: "⚖️", label: "Legal" },
  { emoji: "🏥", label: "Health" },
];

const NEED_KEYS = [
  { key: "mission_need", label: "Mission" },
  { key: "meeting_need", label: "Moment" },
  { key: "action_need", label: "Action" },
  { key: "discussion_need", label: "Discussion" },
  { key: "solution_need", label: "Solution" },
];

const EMPTY_FORM = {
  title: "",
  emoji: "🧠",
  description: "",
  logo_file: null,
  mission_need: false,
  meeting_need: false,
  action_need: false,
  discussion_need: false,
  solution_need: false,
};

// ─── RoleTypeCard ──────────────────────────────────────────────────────────
const RoleTypeCard = ({ item, onEdit, onDelete, viewMode }) => {
  const [t] = useTranslation("global");
  const isCard = viewMode === "card";

  if (isCard) {
    return (
      <div className="rt-card">
        <div className="rt-card-icon-wrap">
          {item.role_icon || item.logo_file_url ? (
            <img 
              src={(item.role_icon || item.logo_file_url).startsWith('http') ? (item.role_icon || item.logo_file_url) : `${Assets_URL}/${item.role_icon || item.logo_file_url}`} 
              alt={item.title} 
              className="rt-card-logo-img" 
              style={{ width: 36, height: 36, objectFit: 'contain' }} 
            />
          ) : (
            <span className="rt-card-icon">{item.emoji || "🧠"}</span>
          )}
        </div>
        <div className="rt-card-body">
          <h6 className="rt-card-title">{item.title}</h6>
          <div className="rt-card-modules mb-2">
            {(() => {
              let modulesObj = {};
              try {
                modulesObj = typeof item.modules === 'string' ? JSON.parse(item.modules) : (item.modules || {});
              } catch (e) { modulesObj = {}; }
              
              return NEED_KEYS.map(need => (
                (modulesObj[need.key] ?? item[need.key]) ? (
                  <span key={need.key} className="badge bg-light text-primary border me-1" style={{ fontSize: '10px' }}>
                    {t(`modules.${need.label}`, need.label)}
                  </span>
                ) : null
              ));
            })()}
          </div>
          <p className="rt-card-desc">{item.description || <em className="text-muted">{t("roleTypes.noDescription", "No description")}</em>}</p>
        </div>
        <div className="rt-card-actions">
          <button className="rt-action-btn edit" onClick={() => onEdit(item)} title="Edit">
            <FaEdit />
          </button>
          <button className="rt-action-btn delete" onClick={() => onDelete(item)} title="Delete">
            <FaTrash />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rt-list-row">
      <div className="rt-list-icon">
        {item.role_icon || item.logo_file_url ? (
          <img 
            src={(item.role_icon || item.logo_file_url).startsWith('http') ? (item.role_icon || item.logo_file_url) : `${Assets_URL}/${item.role_icon || item.logo_file_url}`} 
            alt={item.title} 
            className="rt-list-logo-img" 
            style={{ width: 22, height: 22, objectFit: 'contain' }} 
          />
        ) : (
          <span className="rt-list-icon-inner">{item.emoji || "🧠"}</span>
        )}
      </div>
      <div className="rt-list-info">
        <div className="d-flex align-items-center gap-2">
          <span className="rt-list-title">{item.title}</span>
          <div className="rt-list-modules">
            {(() => {
              let modulesObj = {};
              try {
                modulesObj = typeof item.modules === 'string' ? JSON.parse(item.modules) : (item.modules || {});
              } catch (e) { modulesObj = {}; }

              return NEED_KEYS.map(need => (
                (modulesObj[need.key] ?? item[need.key]) ? (
                  <span key={need.key} className="badge bg-light text-primary border me-1" style={{ fontSize: '9px', padding: '2px 4px' }}>
                    {t(`modules.${need.label}`, need.label)}
                  </span>
                ) : null
              ));
            })()}
          </div>
        </div>
        <span className="rt-list-desc">{item.description || "—"}</span>
      </div>
      <div className="rt-list-actions">
        <button className="rt-action-btn edit" onClick={() => onEdit(item)} title="Edit">
          <FaEdit />
        </button>
        <button className="rt-action-btn delete" onClick={() => onDelete(item)} title="Delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// ─── RoleTypeModal ─────────────────────────────────────────────────────────
const RoleTypeModal = ({ show, onHide, onSaved, editItem }) => {
  const [t] = useTranslation("global");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);

  const isEdit = !!editItem;

  useEffect(() => {
    if (editItem) {
      let modulesObj = {};
      try {
        modulesObj = typeof editItem.modules === 'string' ? JSON.parse(editItem.modules) : (editItem.modules || {});
      } catch (e) { modulesObj = {}; }

      setForm({
        title: editItem.title || "",
        emoji: editItem.emoji || "🧠",
        description: editItem.description || "",
        logo_file: null,
        mission_need: !!(modulesObj.mission_need ?? editItem.mission_need),
        meeting_need: !!(modulesObj.meeting_need ?? editItem.meeting_need),
        casting_need: !!(modulesObj.casting_need ?? editItem.casting_need),
        action_need: !!(modulesObj.action_need ?? editItem.action_need),
        discussion_need: !!(modulesObj.discussion_need ?? editItem.discussion_need),
        solution_need: !!(modulesObj.solution_need ?? editItem.solution_need),
      });
      const existingIcon = editItem.role_icon || editItem.logo_file_url;
      setPreviewUrl(
        existingIcon
          ? (existingIcon.startsWith('http') ? existingIcon : `${Assets_URL}/${existingIcon}`)
          : null
      );
    } else {
      setForm(EMPTY_FORM);
      setPreviewUrl(null);
    }
  }, [editItem, show]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, logo_file: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(t("roleTypes.toasts.titleReq", "Role title is required."));
      return;
    }

    const token = CookieService.get("token");
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    
    // Append individual module needs (true/false)
    formData.append("mission_need", form.mission_need);
    formData.append("meeting_need", form.meeting_need);
    formData.append("casting_need", form.casting_need);
    formData.append("action_need", form.action_need);
    formData.append("discussion_need", form.discussion_need);
    formData.append("solution_need", form.solution_need);
    if (form.logo_file instanceof File) {
      formData.append("role_icon", form.logo_file);
    }

    try {
      setSaving(true);
      if (isEdit) {
        formData.append("_method", "put");
        await axios.post(`${API_BASE_URL}/role-types/${editItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success(t("roleTypes.toasts.updated", "Role updated!"));
      } else {
        await axios.post(`${API_BASE_URL}/role-types`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success(t("roleTypes.toasts.created", "Role created!"));
      }
      onSaved();
      onHide();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors || "Something went wrong.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md" className="rt-modal" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? t("roleTypes.edit", "Edit Role") : t("roleTypes.new", "New Role")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("roleTypes.titleField", "Title")} <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder={t("roleTypes.titlePlaceholder", "e.g. Project Manager")}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("roleTypes.iconField", "Role Icon (optional)")}</Form.Label>
            <div
              className="mt-upload-zone"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="mt-upload-preview" />
              ) : (
                <div className="mt-upload-placeholder">
                  <span>{t("roleTypes.uploadIcon", "Click to upload role icon")}</span>
                  <small className="text-muted d-block">{t("roleTypes.uploadSub", "PNG, JPG, SVG – max 2 MB")}</small>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {previewUrl && (
              <button
                type="button"
                className="btn btn-link btn-sm text-danger p-0 mt-1"
                onClick={() => { setPreviewUrl(null); setForm((p) => ({ ...p, logo_file: null })); }}
              >
                {t("roleTypes.removeImage", "Remove image")}
              </button>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("roleTypes.descriptionField", "Description (optional)")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t("roleTypes.descriptionPlaceholder", "Describe this role...")}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("roleTypes.modulesField", "Linked Modules")}</Form.Label>
            <div className="d-flex flex-wrap gap-3 mt-1">
              {NEED_KEYS.map((need) => (
                <Form.Check
                  key={need.key}
                  type="checkbox"
                  id={`module-${need.key}`}
                  label={t(`modules.${need.label}`, need.label)}
                  checked={form[need.key]}
                  onChange={(e) => {
                    const { checked } = e.target;
                    setForm((prev) => ({
                      ...prev,
                      [need.key]: checked,
                    }));
                  }}
                />
              ))}
            </div>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={saving}>{t("buttons.cancel", "Cancel")}</Button>
          <Button variant="primary" type="submit" disabled={saving} style={{ backgroundColor: "#3aa5ed", border: "none" }}>
            {saving ? <Spinner size="sm" animation="border" /> : isEdit ? t("buttons.Update", "Update") : t("roleTypes.createBtn", "Create Role")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ show, onHide, onConfirm, item, deleting }) => {
  const [t] = useTranslation("global");
  return (
  <Modal show={show} onHide={onHide} centered size="sm" backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>{t("roleTypes.deleteTitle", "Delete Role")}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {t("roleTypes.deleteConfirm1", "Are you sure you want to delete")} <strong>{item?.title}</strong>{t("roleTypes.deleteConfirm2", "? This action cannot be undone.")}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" onClick={onHide} disabled={deleting}>{t("buttons.cancel", "Cancel")}</Button>
      <Button variant="danger" onClick={onConfirm} disabled={deleting}>
        {deleting ? <Spinner size="sm" animation="border" /> : t("buttons.Delete", "Delete")}
      </Button>
    </Modal.Footer>
  </Modal>
  );
};

// ─── Main RoleTypes page ───────────────────────────────────────────────────────
const RoleTypes = () => {
  const [t] = useTranslation("global");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("card");

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = CookieService.get("token");
      const { data } = await axios.get(`${API_BASE_URL}/role-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      toast.error(t("roleTypes.toasts.loadFailed", "Failed to load roles."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDeleteRequest = (item) => {
    setDeleteTarget(item);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = CookieService.get("token");
      await axios.delete(`${API_BASE_URL}/role-types/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("roleTypes.toasts.deleted", "Role deleted."));
      setShowDelete(false);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      toast.error(t("roleTypes.toasts.deleteFailed", "Failed to delete role."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rt-page">
      <div className="rt-toolbar">
        <div className="rt-toolbar-left">
          <h5 className="rt-page-title">{t("roleTypes.title", "Roles")}</h5>
          <span className="rt-count-badge">{items.length}</span>
        </div>
        <div className="rt-toolbar-right">
          <div className="rt-view-toggle">
            <button
              className={`rt-view-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
              title={t("roleTypes.cardView", "Card View")}
            >
              <BsGrid3X3Gap />
            </button>
            <button
              className={`rt-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title={t("roleTypes.listView", "List View")}
            >
              <BsListUl />
            </button>
          </div>
          <Button
            className="rt-create-btn"
            onClick={() => { setEditItem(null); setShowForm(true); }}
          >
            <FaPlus className="me-2" />
            {t("roleTypes.new", "New Role")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rt-spinner-wrap">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rt-empty">
          <div className="rt-empty-icon">🧠</div>
          <h6 className="rt-empty-title">{t("roleTypes.noItems", "No Roles Yet")}</h6>
          <p className="rt-empty-sub">{t("roleTypes.noItemsDesc", "Create your first role to get started.")}</p>
          <Button
            className="rt-create-btn"
            onClick={() => { setEditItem(null); setShowForm(true); }}
          >
            <FaPlus className="me-2" />
            {t("roleTypes.createBtn", "Create Role")}
          </Button>
        </div>
      ) : viewMode === "card" ? (
        <div className="rt-grid">
          {items.map((item) => (
            <RoleTypeCard
              key={item.id}
              item={item}
              viewMode="card"
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="rt-list">
          {items.map((item) => (
            <RoleTypeCard
              key={item.id}
              item={item}
              viewMode="list"
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      <RoleTypeModal
        show={showForm}
        onHide={() => setShowForm(false)}
        onSaved={fetchItems}
        editItem={editItem}
      />
      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        item={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
};

export default RoleTypes;

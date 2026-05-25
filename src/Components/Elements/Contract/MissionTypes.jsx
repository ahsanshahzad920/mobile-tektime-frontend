import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { FaBookOpen, FaBullseye, FaChalkboardTeacher, FaPlus, FaEdit, FaTrash, FaCode, FaBullhorn, FaShoppingCart, FaUserTie, FaSearch, FaChessKnight } from "react-icons/fa";
import { AiOutlineAudit } from "react-icons/ai";
import { MdEventAvailable, MdOutlineSupport, MdWork, MdBrush, MdMessage, MdEvent } from "react-icons/md";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
import "./MissionTypes.scss";

// ─── Icon map (same set as AddDestination) ───────────────────────────────────
const getIcon = (value, size = 28) => {
  const style = { width: size, height: size };
  switch (value) {
    case "Business opportunity": return <IoIosBusiness style={style} />;
    case "Study":                return <FaBookOpen style={style} />;
    case "Audit":                return <AiOutlineAudit style={style} />;
    case "Project":              return <IoIosRocket style={style} />;
    case "Accompagnement":       return <MdOutlineSupport style={style} />;
    case "Event":                return <MdEventAvailable style={style} />;
    case "Formation":            return <FaChalkboardTeacher style={style} />;
    case "Recruitment":          return <MdWork style={style} />;
    case "Objective":            return <FaBullseye style={style} />;
    case "Design":               return <MdBrush style={style} />;
    case "Development":          return <FaCode style={style} />;
    case "Marketing":            return <FaBullhorn style={style} />;
    case "Sales":                return <FaShoppingCart style={style} />;
    case "Consulting":           return <FaUserTie style={style} />;
    case "Research":             return <FaSearch style={style} />;
    case "Strategy":             return <FaChessKnight style={style} />;
    case "Agenda":               return <MdEvent style={style} />;
    case "Messagerie":           return <MdMessage style={style} />;
    case "Other":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512" fill="currentColor">
          <path d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z" />
        </svg>
      );
    default: return <IoIosBusiness style={style} />;
  }
};

const getIconName = (value) => {
  switch (value) {
    case "Business opportunity": return "IoIosBusiness";
    case "Study":                return "FaBookOpen";
    case "Audit":                return "AiOutlineAudit";
    case "Project":              return "IoIosRocket";
    case "Accompagnement":       return "MdOutlineSupport";
    case "Event":                return "MdEventAvailable";
    case "Formation":            return "FaChalkboardTeacher";
    case "Recruitment":          return "MdWork";
    case "Objective":            return "FaBullseye";
    case "Design":               return "MdBrush";
    case "Development":          return "FaCode";
    case "Marketing":            return "FaBullhorn";
    case "Sales":                return "FaShoppingCart";
    case "Consulting":           return "FaUserTie";
    case "Research":             return "FaSearch";
    case "Strategy":             return "FaChessKnight";
    case "Agenda":               return "MdEvent";
    case "Messagerie":           return "MdMessage";
    case "Other":                return "Custom SVG";
    default:                     return "IoIosBusiness";
  }
};

// ─── Built-in type options ────────────────────────────────────────────────────
const BUILTIN_TYPES = [
  "Business opportunity",
  "Study",
  "Audit",
  "Project",
  "Accompagnement",
  "Event",
  "Formation",
  "Recruitment",
  "Objective",
  "Design",
  "Development",
  "Marketing",
  "Sales",
  "Consulting",
  "Research",
  "Strategy",
  "Agenda",
  "Messagerie",
  "Other",
];

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: "",
  logo: "",   // one of the BUILTIN_TYPES used as icon key
  description: "",
  logo_file: null,   // custom uploaded logo (File object or URL string)
};

// ─── MissionTypeCard ──────────────────────────────────────────────────────────
const MissionTypeCard = ({ item, onEdit, onDelete, viewMode }) => {
  const [t] = useTranslation("global");
  const isCard = viewMode === "card";

  if (isCard) {
    return (
      <div className="mt-card">
        <div className="mt-card-icon-wrap">
          { (item.mission_icon || item.logo_file_url) ? (
            <img 
              src={(item.mission_icon || item.logo_file_url).startsWith('http') ? (item.mission_icon || item.logo_file_url) : `${Assets_URL}/${item.mission_icon || item.logo_file_url}`} 
              alt={item.title} 
              className="mt-card-logo-img" 
            />
          ) : (
            <span className="mt-card-icon">{getIcon(item.logo || item.title || "Business opportunity", 36)}</span>
          )}
        </div>
        <div className="mt-card-body">
          <h6 className="mt-card-title">{item.title}</h6>
          <p className="mt-card-desc">{item.description || <em className="text-muted">{t("missionTypes.noDescription", "No description")}</em>}</p>
        </div>
        <div className="mt-card-actions">
          <button className="mt-action-btn edit" onClick={() => onEdit(item)} title="Edit">
            <FaEdit />
          </button>
          <button className="mt-action-btn delete" onClick={() => onDelete(item)} title="Delete">
            <FaTrash />
          </button>
        </div>
      </div>
    );
  }

  // List row
  return (
    <div className="mt-list-row">
      <div className="mt-list-icon">
        { (item.mission_icon || item.logo_file_url) ? (
          <img 
            src={(item.mission_icon || item.logo_file_url).startsWith('http') ? (item.mission_icon || item.logo_file_url) : `${Assets_URL}/${item.mission_icon || item.logo_file_url}`} 
            alt={item.title} 
            className="mt-list-logo-img" 
          />
        ) : (
          <span className="mt-list-icon-inner">{getIcon(item.logo || item.title || "Business opportunity", 22)}</span>
        )}
      </div>
      <div className="mt-list-info">
        <span className="mt-list-title">{item.title}</span>
        <span className="mt-list-desc">{item.description || "—"}</span>
      </div>
      <div className="mt-list-actions">
        <button className="mt-action-btn edit" onClick={() => onEdit(item)} title="Edit">
          <FaEdit />
        </button>
        <button className="mt-action-btn delete" onClick={() => onDelete(item)} title="Delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// ─── MissionTypeModal ─────────────────────────────────────────────────────────
const MissionTypeModal = ({ show, onHide, onSaved, editItem }) => {
  const [t] = useTranslation("global");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);

  const isEdit = !!editItem;


  useEffect(() => {
    if (editItem) {
      setForm({
        title: editItem.title || "",
        logo: editItem.logo || "",
        description: editItem.description || "",
        logo_file: null,
      });
      setPreviewUrl(
        editItem.mission_icon 
          ? (editItem.mission_icon.startsWith('http') ? editItem.mission_icon : `${Assets_URL}/${editItem.mission_icon}`)
          : (editItem.logo_file_url || null)
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
      toast.error(t("missionTypes.toasts.titleReq", "Mission type title is required."));
      return;
    }

    const token = CookieService.get("token");
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (form.logo_file instanceof File) {
      formData.append("mission_icon", form.logo_file);
    }

    try {
      setSaving(true);
      if (isEdit) {
        formData.append("_method", "put");
        await axios.post(`${API_BASE_URL}/mission-types/${editItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success(t("missionTypes.toasts.updated", "Mission type updated!"));
      } else {
        await axios.post(`${API_BASE_URL}/mission-types`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success(t("missionTypes.toasts.created", "Mission type created!"));
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
    <Modal show={show} onHide={onHide} centered size="md" className="mt-modal" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? t("missionTypes.edit", "Edit Mission Type") : t("missionTypes.new", "New Mission Type")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("missionTypes.titleField", "Title")} <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder={t("missionTypes.titlePlaceholder", "e.g. Business Development")}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </Form.Group>

          {/* Mission Icon Upload */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("missionTypes.iconField", "Mission Icon (optional)")}</Form.Label>
            <div
              className="mt-upload-zone"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="mt-upload-preview" />
              ) : (
                <div className="mt-upload-placeholder">
                  <span>{t("missionTypes.uploadIcon", "Click to upload mission icon")}</span>
                  <small className="text-muted d-block">{t("missionTypes.uploadSub", "PNG, JPG, SVG – max 2 MB")}</small>
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
                {t("missionTypes.removeImage", "Remove image")}
              </button>
            )}
          </Form.Group>



          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("missionTypes.descriptionField", "Description (optional)")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t("missionTypes.descriptionPlaceholder", "Describe this mission type...")}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={saving}>{t("buttons.cancel", "Cancel")}</Button>
          <Button variant="primary" type="submit" disabled={saving} style={{ backgroundColor: "#3aa5ed", border: "none" }}>
            {saving ? <Spinner size="sm" animation="border" /> : isEdit ? t("buttons.Update", "Update") : t("missionTypes.createBtn", "Create Mission Type")}
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
      <Modal.Title>{t("missionTypes.deleteTitle", "Delete Mission Type")}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {t("missionTypes.deleteConfirm1", "Are you sure you want to delete")} <strong>{item?.title}</strong>{t("missionTypes.deleteConfirm2", "? This action cannot be undone.")}
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

// ─── Main MissionTypes page ───────────────────────────────────────────────────
const MissionTypes = () => {
  const [t] = useTranslation("global");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // 'card' | 'list'

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = CookieService.get("token");
      const { data } = await axios.get(`${API_BASE_URL}/mission-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      toast.error(t("missionTypes.toasts.loadFailed", "Failed to load mission types."));
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
      await axios.delete(`${API_BASE_URL}/mission-types/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("missionTypes.toasts.deleted", "Mission type deleted."));
      setShowDelete(false);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      toast.error(t("missionTypes.toasts.deleteFailed", "Failed to delete mission type."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-page">
      {/* ── Toolbar ── */}
      <div className="mt-toolbar">
        <div className="mt-toolbar-left">
          <h5 className="mt-page-title">{t("missionTypes.title", "Mission Types")}</h5>
          <span className="mt-count-badge">{items.length}</span>
        </div>
        <div className="mt-toolbar-right">
          <div className="mt-view-toggle">
            <button
              className={`mt-view-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
              title={t("missionTypes.cardView", "Card View")}
            >
              <BsGrid3X3Gap />
            </button>
            <button
              className={`mt-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title={t("missionTypes.listView", "List View")}
            >
              <BsListUl />
            </button>
          </div>
          <Button
            className="mt-create-btn"
            onClick={() => { setEditItem(null); setShowForm(true); }}
          >
            <FaPlus className="me-2" />
            {t("missionTypes.new", "New Mission Type")}
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="mt-spinner-wrap">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-empty">
          <div className="mt-empty-icon">{getIcon("Business opportunity", 48)}</div>
          <h6 className="mt-empty-title">{t("missionTypes.noItems", "No Mission Types Yet")}</h6>
          <p className="mt-empty-sub">{t("missionTypes.noItemsDesc", "Create your first mission type to get started.")}</p>
          <Button
            className="mt-create-btn"
            onClick={() => { setEditItem(null); setShowForm(true); }}
          >
            <FaPlus className="me-2" />
            {t("missionTypes.createBtn", "Create Mission Type")}
          </Button>
        </div>
      ) : viewMode === "card" ? (
        <div className="mt-grid">
          {items.map((item) => (
            <MissionTypeCard
              key={item.id}
              item={item}
              viewMode="card"
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="mt-list">
          {items.map((item) => (
            <MissionTypeCard
              key={item.id}
              item={item}
              viewMode="list"
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <MissionTypeModal
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

export default MissionTypes;

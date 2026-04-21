import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Table, Button, Form } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const FacturationForm = ({
  destination,
  meetings,
  participants,
  loggedInUserId,
}) => {
  const [t] = useTranslation("global");
  const invoiceRef = useRef();
  const loggedInParticipant = participants?.find(
    (p) => p.user_id === loggedInUserId
  );
  const dynamicEnterprise = loggedInParticipant?.user?.enterprise;
  
  // State for billing type and TVA rates
  const [billingType, setBillingType] = useState("Facturation au TJM");
  const [tvaRates, setTvaRates] = useState([
    { value: 20, label: "20%" },
    { value: 10, label: "10%" },
    { value: 8.5, label: "8.5%" },
    { value: 5.5, label: "5.5%" },
    { value: 2.1, label: "2.1%" },
    { value: 0, label: "0%" },
  ]);
  
  const [enterprise, setEnterprise] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fetch enterprise data
  const getEnterpriseClient = async () => {
    const user = JSON.parse(CookieService.get("user"));
    const enterpriseId = user?.enterprise_id;
    const token = CookieService.get("token");
    try {
      setMemberLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/get-enterprise-with-client/${enterpriseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setEnterprise(response?.data?.data);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      setMemberLoading(false);
    }
  };

  // Fetch facturation data
  const getFacturationData = async () => {
    const token = CookieService.get("token");
    try {
      setMemberLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/destination-meetings-worktime/${destination?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setData(response?.data?.data?.meetings);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      setMemberLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    getEnterpriseClient();
    getFacturationData();
  }, []);

  // Update items when data or billing type changes
useEffect(() => {
  if (billingType === "Facturation au forfait") {
    setItems([{
      designation: destination?.destination_name || "Mission",
      tva: enterprise?.vat_number || 20,
      montantHT: Number(destination?.initial_budget) || 0
    }]);
  } else if (data) {
    setItems(data.map((meeting) => ({
      designation: meeting.title || "Ligne simple",
      tva: enterprise?.vat_number || 20,
      montantHT: Number(meeting?.total_work_time) || 0,
    })));
  }
}, [data, billingType, destination, enterprise]);

  // Handle TVA rate change for a specific item
  const handleTvaChange = (index, newTvaRate) => {
    const updatedItems = [...items];
    updatedItems[index].tva = parseFloat(newTvaRate);
    setItems(updatedItems);
  };

  // Calculate totals
const { totalHT, totalTVA, totalTTC } = items.reduce(
  (acc, item) => {
    const montantHT = Number(item.montantHT) || 0;
    const rate = (Number(item.tva) || 0) / 100;
    const tvaAmount = montantHT * rate;
    return {
      totalHT: acc.totalHT + montantHT,
      totalTVA: acc.totalTVA + tvaAmount,
      totalTTC: acc.totalTTC + montantHT + tvaAmount,
    };
  },
  { totalHT: 0, totalTVA: 0, totalTTC: 0 }
);
  // Generate PDF
  const generatePDF = async () => {
    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  // Export PDF handler
  const handleExportPDF = async () => {
    const pdf = await generatePDF();
    pdf.save("facture.pdf");
  };

  // Send email handler
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const pdf = await generatePDF();
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, "facture.pdf");

      const token = CookieService.get("token");
      const response = await axios.post(
        `${API_BASE_URL}/send-bill-via-email/${destination?.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success(t("invoice.email_sent_successfully"));
      }
    } catch (error) {
      toast.error(
        t(
          error?.response?.data?.errors[0] ||
            error?.message ||
            "invoice.email_send_failed"
        )
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Enterprise info
  const enterpriseInfo = {
    name: enterprise?.name,
    address: enterprise?.mailing_address,
    phone: enterprise?.user?.phone_number,
    email: enterprise?.user?.email,
    siren: enterprise?.siret_number || 0,
    tva: enterprise?.vat_number || 0,
    logo: enterprise?.logo || null,
  };

  // Client info
  const clientInfo = {
    name: destination?.clients?.name,
    address: destination?.clients?.mailing_address,
  };

  return (
    <Container className="py-4">
      {/* Billing type dropdown */}
      <div className="mb-3">
        <Form.Group controlId="billingType">
          <Form.Label>Type de facturation</Form.Label>
          <Form.Control
            as="select"
            value={billingType}
            onChange={(e) => setBillingType(e.target.value)}
            className="mb-3"
          >
            <option value="Facturation au TJM">Facturation au TJM</option>
            <option value="Facturation au forfait">Facturation au forfait</option>
          </Form.Control>
        </Form.Group>
      </div>

      <div
        ref={invoiceRef}
        className="p-4 bg-white"
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          border: "1px solid #e0e0e0",
          boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            margin: "-15px -15px 20px -15px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Row className="mb-4">
            <Col>
              <div className="mb-3">
                {enterpriseInfo.logo ? (
                  <img
                    src={
                      enterpriseInfo.logo.startsWith("http")
                        ? enterpriseInfo.logo
                        : `${Assets_URL}/${enterpriseInfo.logo}`
                    }
                    alt="Enterprise Logo"
                    style={{ height: "60px" }}
                  />
                ) : (
                  <div className="text-muted">Importer votre logo</div>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Company and Client Info */}
        <Row className="mb-4">
          <Col md={6}>
            <div style={{ color: "#343a40" }}>
              <h5 style={{ fontWeight: "600", color: "#2c3e50", marginBottom: "5px" }}>
                {enterpriseInfo?.name}
              </h5>
              {enterpriseInfo?.address && (
                <p style={{ whiteSpace: "pre-line", color: "#495057", marginBottom: "5px" }}>
                  {enterpriseInfo?.address}
                </p>
              )}
              {enterpriseInfo?.phone && (
                <p style={{ color: "#495057", marginBottom: "5px" }}>
                  <span style={{ color: "#6c757d" }}>Tel :</span> {enterpriseInfo?.phone}
                </p>
              )}
              {enterpriseInfo?.email && (
                <p style={{ color: "#495057" }}>
                  <span style={{ color: "#6c757d" }}>@ :</span> {enterpriseInfo?.email}
                </p>
              )}
            </div>
          </Col>
          <Col md={6}>
            <div
              style={{
                border: "1px solid #e0e0e0",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              <h6
                style={{
                  color: "#6c757d",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "15px",
                }}
              >
                Client
              </h6>
              <h5 style={{ color: "#2c3e50", fontWeight: "500", marginBottom: "10px" }}>
                {clientInfo?.name}
              </h5>
              <p style={{ whiteSpace: "pre-line", color: "#495057" }}>
                {clientInfo?.address}
              </p>
            </div>
          </Col>
        </Row>

        {/* Invoice Details */}
        <Row
          className="mb-4"
          style={{ paddingBottom: "15px", borderBottom: "1px solid #e0e0e0" }}
        >
          <Col md={6}>
            <div style={{ color: "#495057" }}>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "#6c757d" }}>Date d'émission</span>
                <span>{new Date().toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Invoice Table */}
        <Table
          bordered
          className="mb-4"
          style={{ borderColor: "#e0e0e0", marginBottom: "25px" }}
        >
          <thead style={{ backgroundColor: "#f8f9fa", borderColor: "#e0e0e0" }}>
            <tr style={{ borderBottom: "2px solid #2c3e50", color: "black" }}>
              <th style={{ borderColor: "#e0e0e0", color: "black", fontWeight: 600, background: "aliceblue" }}>
                Désignation
              </th>
              <th style={{ borderColor: "#e0e0e0", color: "black", fontWeight: 600, width: "100px", background: "aliceblue" }}>
                TVA
              </th>
              <th style={{ borderColor: "#e0e0e0", color: "black", fontWeight: 600, width: "120px", background: "aliceblue" }}>
                Montant HT
              </th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item, index) => (
              <tr key={index}>
                <td style={{ borderColor: "#e0e0e0", color: "#495057" }}>
                  {item?.designation}
                </td>
                <td style={{ borderColor: "#e0e0e0", color: "#495057", textAlign: "center" }}>
                  <Form.Control
                    as="select"
                    value={item.tva}
                    onChange={(e) => handleTvaChange(index, e.target.value)}
                    style={{ width: "80px", margin: "0 auto" }}
                  >
                    {tvaRates.map((rate) => (
                      <option key={rate.value} value={rate.value}>
                        {rate.label}
                      </option>
                    ))}
                  </Form.Control>
                </td>
               <td style={{ borderColor: "#e0e0e0", color: "#495057", textAlign: "right" }}>
  {Number(item?.montantHT || 0).toFixed(2).replace(".", ",")} €
</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Totals */}
        <Row>
          <Col md={{ span: 4, offset: 8 }}>
            <Table borderless style={{ marginBottom: "30px" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#6c757d", textAlign: "right", paddingRight: "10px" }}>
                    Total HT
                  </td>
                  <td style={{ color: "#495057", textAlign: "right", fontWeight: "500" }}>
                    {totalHT?.toFixed(2).replace(".", ",")} €
                  </td>
                </tr>
                <tr>
  <td style={{ color: "#6c757d", textAlign: "right", paddingRight: "10px" }}>
    TVA
  </td>
  <td style={{ color: "#495057", textAlign: "right", fontWeight: "500" }}>
    {totalTVA?.toFixed(2).replace(".", ",")} €
  </td>
</tr>
                <tr className="border-top">
                  <td style={{ color: "#2c3e50", textAlign: "right", paddingRight: "10px", fontWeight: "600", paddingTop: "10px" }}>
                    Total TTC
                  </td>
                  <td style={{ color: "#2c3e50", textAlign: "right", fontWeight: "600", paddingTop: "10px" }}>
                    {totalTTC?.toFixed(2).replace(".", ",")} €
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            margin: "0 -15px -15px -15px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <p style={{ color: "#6c757d", fontSize: "0.85rem", marginBottom: "15px" }}>
            En cas de retard de paiement, une pénalité de 3 fois le taux
            d'intérêt légal sera appliquée à laquelle s'ajoutera une indemnité
            forfaitaire pour frais de recouvrement de 40€.
          </p>
          <p style={{ color: "#495057", fontSize: "0.85rem", marginBottom: "0" }}>
            SIREN: {enterpriseInfo?.siren} <br />
            TVA intracommunautaire : {enterpriseInfo?.tva}
          </p>
        </div>
      </div>

      {/* Export Button */}
      <div className="text-center mt-4">
        <Button
          variant="primary"
          onClick={handleExportPDF}
          className="px-4 py-2"
          style={{ backgroundColor: "#2c3e50", borderColor: "#2c3e50" }}
        >
          Export PDF
        </Button>
        <Button
          variant="success"
          onClick={handleSendEmail}
          className="px-4 py-2 mx-2"
          disabled={isSendingEmail}
          style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
        >
          {t("send by mail")}
        </Button>
      </div>
    </Container>
  );
};

export default FacturationForm;
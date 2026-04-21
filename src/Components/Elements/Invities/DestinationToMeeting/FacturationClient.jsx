import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Card, Button, Spinner, Table, Image } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FacturationClient = ({ onViewDetails, client }) => {
  const [t] = useTranslation("global");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getBills = async () => {
    const token = CookieService.get("token");
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/client-destinations-worktime/${client?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        const destinations = response.data?.data?.destinations || [];
        setBills(destinations);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors?.[0] || error?.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBills();
  }, []);

  return (
    <div className="p-4">
      {/* Header */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : bills.length === 0 ? (
        <div
          className="text-center py-5"
          style={{ color: "#6c757d", fontSize: "1.1rem" }}
        >
          {t("bills.none")}
        </div>
      ) : (
        <Card
          className="shadow-sm border-0"
          style={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Table
            responsive
            hover
            className="align-middle mb-0"
            style={{
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >
            <thead>
              <tr style={{ background: "#F7F9FC", color: "#1E2A5E" }}>
                <th style={{ padding: "16px", fontWeight: 600 }}>
                  {t("bills.mission")}
                </th>
                <th style={{ padding: "16px", fontWeight: 600 }}>
                  {t("bills.date")}
                </th>
                <th style={{ padding: "16px", fontWeight: 600 }}>
                  {t("bills.total")}
                </th>
                <th style={{ padding: "16px", fontWeight: 600 }}>
                  {t("bills.creator")}
                </th>
                <th
                  style={{
                    padding: "16px",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {t("bills.action")}
                </th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr
                  key={bill.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <td style={{ padding: "16px", fontWeight: 500 }}>
                    {bill.destination_name}
                  </td>
                  <td style={{ padding: "16px", color: "#6c757d" }}>
                    {new Date(bill.created_at || Date.now()).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: 600,
                      color: "#1E2A5E",
                    }}
                  >
                    {Number(bill.total_work_time || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </td>

                  {/* ✅ Creator with image */}
                  <td style={{ padding: "16px", color: "#495057" }}>
                    <div className="d-flex align-items-center">
                      <Image
                        src={
                          bill?.user?.image?.startsWith("http") ?  bill.user.image:
                             `${Assets_URL}/${bill?.user?.image}`
                        }
                        alt="Creator"
                        roundedCircle
                        style={{
                          width: "36px",
                          height: "36px",
                          objectFit: "cover",
                          marginRight: "10px",
                          border: "1px solid #ddd",
                        }}
                      />
                      <span>{bill?.user?.full_name || "N/A"}</span>
                    </div>
                  </td>

                  <td style={{ textAlign: "center", padding: "16px" }}>
                   <Button
  variant="outline-primary"
  className="px-3 py-1"
  style={{
    borderRadius: "20px",
    fontWeight: "500",
    borderColor: "#2C3E50",
    color: "#2C3E50",
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.target.style.backgroundColor = "#2C3E50";
    e.target.style.color = "#fff";
    e.target.style.borderColor = "#2C3E50";
  }}
  onMouseLeave={(e) => {
    e.target.style.backgroundColor = "transparent";
    e.target.style.color = "#2C3E50";
    e.target.style.borderColor = "#2C3E50";
  }}
  onClick={() =>
    navigate(`/invitiesToMeeting/${bill?.id}`, {
      state: { from: "client" },
    })
  }
>
  {t("bills.view_details")}
</Button>

                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default FacturationClient;

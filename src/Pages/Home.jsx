import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Drawer,
  Typography,
  Card,
  Row,
  Col,
  Form,
  Input,
  Tag,
} from "antd";
import { FaGraduationCap, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import { ArrowRightOutlined, StarFilled } from "@ant-design/icons";
import { FaFacebookMessenger, FaSearch, FaVideo } from "react-icons/fa"; // Example icons
import {
  FacebookFilled,
  LinkedinFilled,
  InstagramFilled,
  MailOutlined,
} from "@ant-design/icons";
import { BsArrowRight } from "react-icons/bs";
import { UserOutlined, CodeOutlined, BulbOutlined } from "@ant-design/icons";

import "./Landing.scss";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../Components/Apicongfig";
// import landingImage from 'Assets/landing/landing1.jpeg';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const menuItems = [
  { key: "login", label: "Login" },
  { key: "about", label: "About Us" },
  { key: "contact", label: "Contact Us" },
  { key: "privacy-policy", label: "Privacy Policy" },
  { key: "terms-and-conditions", label: "Terms & Conditions" },
];

function Home() {
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize Crisp global if not present
    if (!window.$crisp) {
      window.$crisp = [];
    }
    window.CRISP_WEBSITE_ID = "a3f1edc3-bc94-4038-9037-50258aa2fb8b";

    // Helper to ensure chat is shown
    const ensureChatVisible = () => {
      try {
        window.$crisp.push(["do", "chat:show"]);
        window.$crisp.push(["do", "chat:close"]);
      } catch (e) {
        console.error("Crisp error:", e);
      }
    };

    // Check if script is already in the DOM
    const existingScript = document.querySelector(
      'script[src="https://client.crisp.chat/l.js"]',
    );

    if (!existingScript) {
      const s = document.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = 1;
      s.onload = () => {
        // Script loaded, trigger show
        ensureChatVisible();
      };
      document.getElementsByTagName("head")[0].appendChild(s);
    } else {
      // Script already exists, just show
      ensureChatVisible();
    }

    // Fallback retry to ensure it catches up if script was mid-load
    const intervalId = setInterval(() => {
      if (window.$crisp) {
        window.$crisp.push(["do", "chat:show"]);
      }
    }, 1000);

    // Clear interval after 5 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);

    // Hide chat when leaving landing page
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      if (window.$crisp) {
        window.$crisp.push(["do", "chat:hide"]);
      }
    };
  }, []);

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [allPlans, setAllPlans] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/landing-pages/by-type/Tektime`,
        );
        const result = await response.json();

        if (result.success && result.data) {
          const rawContracts = result?.data?.contracts || [];
          console.log("rawContracts", rawContracts);

          const mappedPlans = rawContracts.map((item) => {
            let currencySymbol = item.currency;
            if (
              item.currency === "Dollar" ||
              item.currency === "USD" ||
              item.currency === "usd"
            )
              currencySymbol = "$";
            else if (
              item.currency === "Euro" ||
              item.currency === "EUR" ||
              item.currency === "eur"
            )
              currencySymbol = "€";

            const paymentType = item.payment_type?.toLowerCase() || "";
            const isMonthly =
              paymentType.includes("mensuelle") ||
              paymentType.includes("monthly");
            const cycle = isMonthly ? "monthly" : "yearly";

            return {
              name: item.name,
              price: `${currencySymbol}${parseFloat(item.price).toFixed(0)}`,
              period: isMonthly
                ? t("pricing.per_month")
                : cycle === "yearly"
                  ? t("pricing.per_year")
                  : item.payment_type,
              description: item.description,
              licenses: item.no_of_licenses,
              billingCycle: cycle,
              features: [
                `${item.no_of_licenses} ${parseInt(item.no_of_licenses) > 1 ? t("pricing.licenses") : t("pricing.license")}`,
                `Module: ${Array.isArray(item.type) ? item.type.join(", ") : item.type?.replace(/[\[\]"]/g, "")}`,
                isMonthly
                  ? t("pricing.monthly_billing")
                  : cycle === "yearly"
                    ? t("pricing.annual_billing")
                    : item.payment_type,
              ].filter(Boolean),
              isPopular:
                item.name === "Pro" ||
                item.name === "Basic Messages" ||
                item.name === "TEKTIME_TEST_GRATUIT_1_MOIS",
              id: item.id,
            };
          });

          mappedPlans.push({
            name: t("pricing.enterprise.title"),
            price: t("pricing.enterprise.price_text"),
            // period: t('pricing.enterprise.bespoke_pricing'),
            features: t("pricing.enterprise.features", { returnObjects: true }),
            isPopular: false,
            isEnterprise: true,
            id: "enterprise",
            billingCycle: "both",
          });

          setAllPlans(mappedPlans);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Failed to fetch pricing:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t]);

  const hasMonthly = allPlans.some((p) => p.billingCycle === "monthly");
  const hasYearly = allPlans.some((p) => p.billingCycle === "yearly");
  const showToggle = hasMonthly && hasYearly;

  const filteredPlans = allPlans.filter(
    (plan) =>
      plan.billingCycle === "both" || plan.billingCycle === billingCycle,
  );

  useEffect(() => {
    if (!loading && window.location.hash === "#pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [loading]);
  const services = [
    {
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png" // 🗓️ Smart calendar management
          alt="Gestion de l’agenda"
          width="60"
          height="60"
        />
      ),
      title: t("landingPage.services.card1.title"),
      subtitle: t("landingPage.services.card1.subtitle"),
      items: [
        t("landingPage.services.card1.l1"),
        t("landingPage.services.card1.l2"),
        t("landingPage.services.card1.l3"),
        t("landingPage.services.card1.l4"),
      ],
    },
    {
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/6175/6175314.png" // 📊 Project strategy & tracking
          alt="Pilotage de projet"
          width="60"
          height="60"
        />
      ),
      title: t("landingPage.services.card2.title"),
      subtitle: t("landingPage.services.card2.subtitle"),
      items: [
        t("landingPage.services.card2.l1"),
        t("landingPage.services.card2.l2"),
        t("landingPage.services.card2.l3"),
        t("landingPage.services.card2.l4"),
      ],
    },
    {
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/942/942748.png" // 👥 Professional team management
          alt="Suivi de clients et équipes"
          width="60"
          height="60"
        />
      ),
      title: t("landingPage.services.card3.title"),
      subtitle: t("landingPage.services.card3.subtitle"),
      items: [
        t("landingPage.services.card3.l1"),
        t("landingPage.services.card3.l2"),
        t("landingPage.services.card3.l3"),
        t("landingPage.services.card3.l4"),
        t("landingPage.services.card3.l5"),
      ],
    },
    {
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/992/992700.png" // ✅ Task checklist management
          alt="Suivi des tâches"
          width="60"
          height="60"
        />
      ),
      title: t("landingPage.services.card4.title"),
      subtitle: t("landingPage.services.card4.subtitle"),
      items: [
        t("landingPage.services.card4.l1"),
        t("landingPage.services.card4.l2"),
        t("landingPage.services.card4.l3"),
        t("landingPage.services.card4.l4"),
      ],
    },
    {
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/942/942751.png" // 💬 Chat and support icon
          alt="Suivi de clients et équipes"
          width="60"
          height="60"
        />
      ),
      title: t("landingPage.services.card5.title"),
      subtitle: t("landingPage.services.card5.subtitle"),
      items: [
        t("landingPage.services.card5.l1"),
        t("landingPage.services.card5.l2"),
        t("landingPage.services.card5.l3"),
        t("landingPage.services.card5.l4"),
      ],
    },
    {
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/709/709496.png" // 🔄 Automation and process gear
          alt="Process & ModOp"
          width="60"
          height="60"
        />
      ),
      title: t("landingPage.services.card6.title"),
      subtitle: t("landingPage.services.card6.subtitle"),
      items: [
        t("landingPage.services.card6.l1"),
        t("landingPage.services.card6.l2"),
        t("landingPage.services.card6.l3"),
        t("landingPage.services.card6.l4"),
        t("landingPage.services.card6.l5"),
      ],
    },
  ];

  const projects = [
    {
      image:
        "https://res.cloudinary.com/drrk2kqvy/image/upload/v1760357848/voice_notes/Screenshot_2025-10-13_171456_qwxikz.png", // Replace with your actual path
      title: t("landingPage.solution.card1.title"),
      description: t("landingPage.solution.card1.desc"),
      tags: ["Generate Automatic Report", "AI-Powered", "Time-Saving"],
    },
    // {
    //   image:
    //     "https://cdn.prod.website-files.com/6854e99f2e0a3c80420debde/6864c87b76a432b3ff644774_project3-p-2000.webp", // Replace with your actual path
    //   title: "Aurum Real Estate Platform",
    //   description:
    //     "Built a sleek and seamless platform for luxury property listings.",
    //   tags: ["UI/UX DESIGN", "WEB DEVELOPMENT"],
    // },
  ];

  const ProjectCard = ({ project }) => {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    return (
      <div
        className="project-image-wrapper"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={project.image}
          alt={project.title}
          className="project-image"
        />

        {isHovering && (
          <div
            className="floating-icon"
            style={{
              top: `${cursorPos.y}px`,
              left: `${cursorPos.x}px`,
            }}
          >
            <BsArrowRight />
          </div>
        )}
      </div>
    );
  };

  const steps = [
    {
      title: t("landingPage.work.step1.title"),
      description: t("landingPage.work.step1.desc"),
      image:
        "https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/685508dccbe3fb361e3b4c4e_process-image1-p-500.webp",
    },
    {
      title: t("landingPage.work.step2.title"),
      description: t("landingPage.work.step2.desc"),
      image:
        "https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/685508dcad7adafc1fb270aa_process-image2-p-500.webp",
    },
    {
      title: t("landingPage.work.step3.title"),
      description: t("landingPage.work.step3.desc"),
      image:
        "https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/685508dc02adbbca42ab57da_process-image3-p-500.webp",
    },
    {
      title: t("landingPage.work.step4.title"),
      description: t("landingPage.work.step4.desc"),
      image:
        "https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/685508dc02adbbca42ab57da_process-image3-p-500.webp",
    },
    {
      title: t("landingPage.work.step5.title"),
      description: t("landingPage.work.step4.desc"),
      image:
        "https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/685508dc02adbbca42ab57da_process-image3-p-500.webp",
    },
  ];
  const values = [
    {
      title: t("landingPage.values.value1.title"),
      description: t("landingPage.values.value1.desc"),
    },
    {
      title: t("landingPage.values.value2.title"),
      description: t("landingPage.values.value2.desc"),
    },
    {
      title: t("landingPage.values.value3.title"),
      description: t("landingPage.values.value3.desc"),
    },
    {
      title: t("landingPage.values.value4.title"),
      description: t("landingPage.values.value4.desc"),
    },
  ];

  const testimonials = [
    {
      title: t("landingPage.testimonials.review1.title"),
      text: t("landingPage.testimonials.review1.desc"),
      image:
        "https://cdn.prod.website-files.com/68da9e32f495b6801915d287/68dd206fe26164171a153498_1564908244965.jpg",
      author: "Davy CHOUMILLE",
      role: t("landingPage.testimonials.review1.role"),
    },
    {
      title: t("landingPage.testimonials.review2.title"),
      text: t("landingPage.testimonials.review2.desc"),
      image:
        "https://cdn.prod.website-files.com/68da9e32f495b6801915d287/68dd21198b370c3d67647de0_testimonial3.png",
      author: "Romain Barbe",
      role: t("landingPage.testimonials.review2.role"),
    },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="new-landing-page">
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        {/* Content */}
        <Content>
          {/* Banner (Hero) Section */}
          <section
            id="home"
            className="hero-section"
            style={{
              position: "relative",
              backgroundImage: `url('https://res.cloudinary.com/drrk2kqvy/image/upload/v1759830958/voice_notes/WhatsApp_Image_2025-10-06_at_20.59.36_dpxvu5.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "100vh",
              display: "flex",
              alignItems: "flex-end",
              padding: "120px 24px 80px",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.45)", // Adjust darkness here (0.3–0.6 works best)
                zIndex: 1,
              }}
            ></div>
            <div
              className="container"
              style={{ position: "relative", zIndex: 2 }}
            >
              <Title
                level={1}
                style={{
                  color: "#FFFFFF",
                  fontSize: "80px",
                  fontWeight: 700,
                  marginBottom: 16,
                  lineHeight: 1.2, // keeps spacing balanced
                }}
              >
                {t("landingPage.hero.title1")}
                <br />
                {t("landingPage.hero.title2")}
                <br />
                {t("landingPage.hero.title3")}
              </Title>

              <Paragraph
                style={{ fontSize: 18, maxWidth: "auto", color: "#FFFFFF" }}
              >
                {t("landingPage.hero.desc1")}
                <br /> {t("landingPage.hero.desc2")}
              </Paragraph>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="services-section py-5 mt-5 mb-5">
            <div className="container">
              <Title level={5} className="text-uppercase text-muted">
                {t("landingPage.services.title")}
              </Title>

              <Title level={2} className="fw-bold mb-4">
                {t("landingPage.services.subtitle1")}
                <br />
                {t("landingPage.services.subtitle2")}
              </Title>

              <Row gutter={[24, 24]} justify="center" className="mt-5">
                {services.map((service, index) => (
                  <Col xs={24} md={12} lg={8} key={index}>
                    <Card
                      className="service-card text-start p-4 h-100 flex flex-col justify-between"
                      style={{
                        minHeight: "500px", // ensures consistent card height
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      {/* Icon */}
                      <div className="mb-3">{service.icon}</div>

                      {/* Title */}
                      <Title level={4} className="mb-2 ">
                        {service.title}
                      </Title>

                      {/* Subtitle */}
                      <Paragraph className="text-gray-600 mb-3">
                        {service.subtitle}
                      </Paragraph>

                      {/* Bullet list */}
                      <div className="service-lines mt-3 space-y-2 flex-grow">
                        {service.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start text-gray-700"
                            style={{ marginBottom: "6px" }}
                          >
                            <IoCheckmarkDoneOutline
                              className="text-blue-600 text-lg flex-shrink-0 mt-0.5"
                              style={{ marginRight: "8px" }} // adds space to right of icon
                            />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* Button */}
                      <Button
                        type="primary"
                        size="middle"
                        style={{
                          marginTop: "auto",
                          backgroundColor: "#0047FF",
                          borderColor: "#0047FF",
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: "8px",
                          padding: "8px 18px",
                          position: "absolute",
                          bottom: "5px",
                        }}
                        onClick={() => {
                          if (index === 0)
                            navigate(`/gate/moment?contract_id=${3}`);
                          else if (index === 1)
                            navigate(`/gate/mission?contract_id=${3}`);
                          // else if (index === 4) navigate("https://messages.tektime.io/");
                          else if (index === 4)
                            navigate("https://solutions.tektime.io/");
                          else navigate(`/register?contract_id=${3}`);
                        }}

                      >
                        {t("landingPage.button3")}
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* SCALE BRAND SECTION */}
          <section
            id="scale-brand"
            style={{
              backgroundColor: "#0047FF",
              padding: "80px 0",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="container px-3">
              <Row align="middle" justify="space-between" gutter={[32, 32]}>
                {/* LEFT COLUMN */}
                <Col xs={24} md={14}>
                  <div style={{ maxWidth: "550px" }}>
                    <h2
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "clamp(24px, 5vw, 42px)",
                        marginBottom: "16px",
                      }}
                    >
                      {t("landingPage.scaleBrand.title")}
                    </h2>
                    <h3
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontWeight: 500,
                        fontSize: "clamp(18px, 4vw, 32px)",
                        marginBottom: "32px",
                      }}
                    >
                      {t("landingPage.scaleBrand.desc")}
                    </h3>

                    <div>
                      <Button
                        size="large"
                        style={{
                          backgroundColor: "#fff",
                          color: "#0047FF",
                          borderRadius: "8px",
                          fontWeight: 600,
                          padding: "10px 28px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                        onClick={() => navigate(`/register?contract_id=${3}`)}
                      >
                        {t("landingPage.button2")} <ArrowRightOutlined />
                      </Button>
                    </div>

                    <div style={{ marginTop: "60px" }}>
                      <p
                        style={{
                          color: "#fff",
                          textTransform: "uppercase",
                          fontSize: "clamp(11px, 1.3vw, 13px)",
                          letterSpacing: "1px",
                          marginBottom: "20px",
                          fontWeight: 700,
                        }}
                      >
                        {t("landingPage.scaleBrand.desc2")}
                      </p>
                    </div>
                  </div>
                </Col>

                {/* RIGHT COLUMN (IMAGE with Floating Icons) */}
                <Col xs={24} md={10}>
                  <div style={{ position: "relative", textAlign: "center" }}>
                    <div
                      style={{
                        background: "white",
                        padding: "12px",
                        borderRadius: "12px",
                        display: "inline-block",
                        width: "100%",
                        maxWidth: "320px",
                      }}
                    >
                      <img
                        src="https://res.cloudinary.com/drrk2kqvy/image/upload/v1760357959/voice_notes/6853fb1a02d1124e4cefc3ff_join-with-image-p-1080_gv03o8.webp"
                        alt="Scale Brand"
                        style={{
                          borderRadius: "8px",
                          width: "100%",
                          height: "auto",
                        }}
                      />
                    </div>

                    {/* Floating Top Icon */}
                    <div className="floating-icon top">⚡</div>

                    {/* Floating Bottom Icon */}
                    <div className="floating-icon bottom">❤️</div>
                  </div>
                </Col>
              </Row>
            </div>

            <style>{`
    @keyframes floatUpDown {
      0%, 100% { transform: translate(-120%, 0px); }
      50% { transform: translate(-120%, -15px); }
    }
    @keyframes floatDownUp {
      0%, 100% { transform: translate(120%, 0px); }
      50% { transform: translate(120%, 15px); }
    }
    .floating-icon {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s ease;
    }
    .floating-icon.top {
      top: -20px;
      left: 50%;
      animation: floatUpDown 3s ease-in-out infinite;
    }
    .floating-icon.bottom {
      bottom: -20px;
      right: 50%;
      animation: floatDownUp 3s ease-in-out infinite;
    }
  `}</style>
          </section>

          {/* {Projcets Section */}
          <section
            className="projects-section py-5 mt-5 mb-5"
            id="projects"
            style={{
              paddingTop: "100px", // adds safe space below the top header on mobile
            }}
          >
            <div className="container text-center">
              <Title
                level={2}
                className="mb-6"
                style={{
                  fontSize: "clamp(22px, 3vw, 44px)",
                  fontWeight: 500,
                  lineHeight: "120%",
                }}
              >
                {t("landingPage.solution.title1")}
                <br /> {t("landingPage.solution.title2")}
              </Title>

              {/* ✅ En savoir plus Button */}
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: "#0047FF",
                  borderColor: "#0047FF",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: "8px",
                  padding: "10px 28px",
                  marginTop: "12px",
                  marginBottom: "40px",
                }}
                onClick={() => navigate(`https://solutions.tektime.io/`)} 
              >
                {t("landingPage.solution.button")}
              </Button>

            </div>
          </section>

          {/* How We Work Section */}
          <section
            id="how-we-work"
            style={{
              backgroundColor: "#0047FF",
              padding: "80px 0",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="container">
              <Row gutter={[48, 48]} align="middle">
                {/* Left Column */}
                <Col xs={24} md={12}>
                  <Title
                    level={2}
                    className="mb-2"
                    style={{
                      color: "#fff",
                      fontSize: "clamp(22px, 3vw, 44px)", // responsive scaling (mobile → desktop)
                      fontWeight: 500,
                      lineHeight: "1.2666666666666666",
                      marginBottom: 8,
                    }}
                  >
                    {t("landingPage.work.title")}
                  </Title>
                  <Paragraph
                    style={{
                      color: "#fff",
                      textTransform: "uppercase",
                      fontSize: "clamp(13px, 2.5vw, 16px)", // ✅ responsive paragraph
                      fontWeight: 500,
                    }}
                  >
                    {t("landingPage.work.desc")}
                  </Paragraph>
                  <Button
                    size="large"
                    style={{
                      backgroundColor: "#fff",
                      color: "#0047FF",
                      borderRadius: "8px",
                      fontWeight: 600,
                      padding: "10px 28px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={() => navigate(`/register?contract_id=${3}`)}
                  >
                    {t("landingPage.work.button")}
                  </Button>
                </Col>

                {/* Right Column */}
                <Col xs={24} md={12}>
                  <div className="steps-container">
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className="step-item animate-step"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        {/* Vertical connector line */}
                        {index !== steps.length - 1 && (
                          <div className="step-line" />
                        )}

                        <div className="step-content">
                          <div className="step-number">
                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                          </div>
                          <div>
                            <h4 className="step-title">{step.title}</h4>
                            <p className="step-description">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Horizontal divider after each step */}
                        {index !== steps.length - 1 && (
                          <hr className="step-divider" />
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          </section>

          {/* Testimonials Section */}
          <section
            id="testimonials"
            className="testimonials-section py-5 mt-5 mb-5"
          >
            <div className="container">
              {/* Section Header */}
              <Title level={5} className="text-uppercase text-muted">
                {t("landingPage.testimonials.title")}
              </Title>
              <Title level={2} className="fw-bold mb-3">
                {t("landingPage.testimonials.desc")}
              </Title>
              {/* <Paragraph
          style={{
            fontSize: 18,
            maxWidth: 800,
            // margin: "0 auto 48px",
            color: "#666",
          }}
        >
          Découvrez comment TekTIME aide les entreprises à gagner du temps,
          réduire les coûts et travailler plus intelligemment.
        </Paragraph> */}

              {/* Testimonials Grid */}
              <Row gutter={[24, 24]} justify="center" className="mt-5">
                {testimonials.map((t, i) => (
                  <Col
                    xs={24}
                    md={12}
                    lg={8}
                    key={i}
                    style={{ display: "flex" }}
                  >
                    <div style={{ flex: 1, display: "flex" }}>
                      <Card
                        hoverable
                        className="testimonial-card p-4"
                        style={{
                          borderRadius: 12,
                          background: "#fff",
                          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                          border: "none",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: 380, // 👈 ensures equal height
                        }}
                      >
                        {/* Header */}
                        <div
                          className="testimonial-header"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            marginBottom: 16,
                          }}
                        >
                          <img
                            src={t.image}
                            alt={t.author}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <Title
                              level={5}
                              style={{
                                marginBottom: 0,
                                fontWeight: 600,
                              }}
                            >
                              {t.author}
                            </Title>
                            <Paragraph
                              style={{
                                marginBottom: 0,
                                color: "#888",
                                fontSize: 14,
                              }}
                            >
                              {t.role}
                            </Paragraph>
                          </div>
                        </div>

                        {/* Stars */}
                        <div
                          style={{
                            color: "#FFD700",
                            marginBottom: 16,
                            fontSize: 18,
                          }}
                        >
                          <StarFilled /> <StarFilled /> <StarFilled />{" "}
                          <StarFilled /> <StarFilled />
                        </div>

                        {/* Title */}
                        <Title
                          level={4}
                          style={{
                            color: "#333",
                            fontSize: 18,
                            marginBottom: 12,
                          }}
                        >
                          {t.title}
                        </Title>

                        {/* Quote */}
                        <Paragraph
                          style={{
                            fontSize: 16,
                            color: "#444",
                            fontStyle: "italic",
                            lineHeight: 1.6,
                          }}
                        >
                          “{t.text}”
                        </Paragraph>
                      </Card>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* Our Values */}
          <section
            id="our-values"
            style={{
              background: "linear-gradient(180deg, #F9FBFF 0%, #FFFFFF 100%)",
              padding: "90px 0",
              color: "#0A0A0A",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="container">
              <Row gutter={[48, 48]} align="middle">
                {/* Left Column */}
                <Col xs={24} md={10}>
                  <Title
                    level={2}
                    className="mb-2"
                    style={{
                      color: "#0047FF",
                      fontSize: "clamp(22px, 3vw, 44px)",
                      fontWeight: 600,
                      lineHeight: 1.25,
                      marginBottom: 8,
                    }}
                  >
                    {t("landingPage.values.title")}
                  </Title>
                  <Paragraph
                    style={{
                      color: "#333",
                      textTransform: "uppercase",
                      fontSize: "clamp(13px, 2.5vw, 16px)",
                      fontWeight: 500,
                      letterSpacing: "0.5px",
                      marginBottom: 24,
                    }}
                  >
                    {t("landingPage.values.desc")}
                  </Paragraph>
                  <Button
                    size="large"
                    style={{
                      backgroundColor: "#0047FF",
                      color: "#fff",
                      borderRadius: "8px",
                      fontWeight: 600,
                      padding: "10px 28px",
                      boxShadow: "0 4px 10px rgba(0, 71, 255, 0.25)",
                    }}
                    onClick={() => navigate(`/register?contract_id=${3}`)}
                  >
                    {t("landingPage.values.button")}
                  </Button>
                </Col>

                {/* Right Column */}
                <Col xs={24} md={14}>
                  <Row gutter={[24, 24]}>
                    {values.map((value, index) => (
                      <Col xs={24} sm={12} key={index}>
                        <div
                          className="value-card"
                          style={{
                            background: "#fff",
                            borderRadius: "12px",
                            padding: "24px",
                            height: "100%",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                            borderLeft: "4px solid #0047FF",
                            transition: "all 0.3s ease",
                            transform: "translateY(0)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-6px)";
                            e.currentTarget.style.boxShadow =
                              "0 10px 20px rgba(0, 71, 255, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 18px rgba(0,0,0,0.05)";
                          }}
                        >
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: 700,
                              color: "#0047FF",
                              marginBottom: "10px",
                            }}
                          >
                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                          </div>
                          <h4
                            style={{
                              fontSize: "18px",
                              fontWeight: 600,
                              marginBottom: "8px",
                              color: "#0A0A0A",
                            }}
                          >
                            {value.title}
                          </h4>
                          <p
                            style={{
                              color: "#555",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              marginBottom: 0,
                            }}
                          >
                            {value.description}
                          </p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </div>
          </section>

          {/* Pricing Section */}
          <section
            className="pricing-section py-5 bg-light"
            id="pricing"
            style={{ padding: "90px 0" }}
          >
            <div className="container">
              <div className="text-center section-header mb-5">
                <h2
                  className="section-title"
                  style={{
                    fontSize: "clamp(22px, 3vw, 44px)",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {t("pricing.title")}
                </h2>
                <p className="subtitle text-muted" style={{ fontSize: 18 }}>
                  {t("pricing.subtitle")}
                </p>
              </div>

              {loading && (
                <div className="text-center py-5">
                  <p>{t("pricing.loading")}</p>
                </div>
              )}

              {error && (
                <div className="text-center py-5">
                  <p>{t("pricing.unavailable")}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  {showToggle && (
                    <div
                      className="pricing-toggle-container mb-5"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <div
                        className="pricing-toggle"
                        style={{
                          background: "#e2e8f0",
                          padding: "4px",
                          borderRadius: "50px",
                          display: "inline-flex",
                          position: "relative",
                        }}
                      >
                        <button
                          className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
                          onClick={() => setBillingCycle("yearly")}
                          style={{
                            padding: "8px 24px",
                            borderRadius: "50px",
                            border: "none",
                            background:
                              billingCycle === "yearly"
                                ? "white"
                                : "transparent",
                            color:
                              billingCycle === "yearly" ? "#0f172a" : "#64748b",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow:
                              billingCycle === "yearly"
                                ? "0 2px 4px rgba(0,0,0,0.1)"
                                : "none",
                          }}
                        >
                          {t("pricing.annual")}
                        </button>
                        <button
                          className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
                          onClick={() => setBillingCycle("monthly")}
                          style={{
                            padding: "8px 24px",
                            borderRadius: "50px",
                            border: "none",
                            background:
                              billingCycle === "monthly"
                                ? "white"
                                : "transparent",
                            color:
                              billingCycle === "monthly"
                                ? "#0f172a"
                                : "#64748b",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow:
                              billingCycle === "monthly"
                                ? "0 2px 4px rgba(0,0,0,0.1)"
                                : "none",
                          }}
                        >
                          {t("pricing.monthly")}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pricing-grid">
                    <Row gutter={[32, 32]} justify="center" align="stretch">
                      {filteredPlans.map((plan, idx) => (
                        <Col
                          xs={24}
                          md={8}
                          key={idx}
                          style={{ display: "flex" }}
                        >
                          <div
                            className={`pricing-card w-100 ${plan.isPopular ? "popular" : ""}`}
                            style={
                              plan.isEnterprise
                                ? {
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center",
                                    gap: "2rem",
                                    background: "#fff",
                                    borderRadius: "16px",
                                    padding: "2rem",
                                    border: "1px solid #f0f0f0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  }
                                : {
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#fff",
                                    borderRadius: "16px",
                                    padding: "2rem",
                                    border: "1px solid #f0f0f0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                    position: "relative",
                                  }
                            }
                          >
                            {plan.isPopular && (
                              <div className="popular-badge">
                                {t("pricing.most_popular")}
                              </div>
                            )}
                            <div
                              className="plan-header"
                              style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: plan.isEnterprise
                                  ? "center"
                                  : "stretch",
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: "1.2rem",
                                  fontWeight: 600,
                                  color: plan.isEnterprise
                                    ? "#0a1128"
                                    : "#0047FF",
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                  marginBottom: "1rem",
                                }}
                              >
                                {plan.name}
                              </h3>
                              {plan.isEnterprise ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "2.5rem",
                                      fontWeight: 800,
                                      color: "#0a1128",
                                      lineHeight: "1.2",
                                    }}
                                  >
                                    {plan.price}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "1rem",
                                      color: "#64748b",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {plan.period}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                  }}
                                >
                                  <div
                                    className="plan-price"
                                    style={{
                                      marginBottom: "0.25rem",
                                      width: "100%",
                                      fontSize: "3rem",
                                      fontWeight: 800,
                                      color: "#0a0a0a",
                                      display: "flex",
                                      alignItems: "baseline",
                                      gap: "4px",
                                    }}
                                  >
                                    {plan.price}
                                    <span
                                      className="plan-period"
                                      style={{
                                        fontSize: "1rem",
                                        color: "#64748b",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {plan.period}
                                    </span>
                                  </div>
                                  {plan.licenses && (
                                    <span
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "#6b7280",
                                        fontWeight: "500",
                                      }}
                                    >
                                      {t(
                                        plan.licenses > 1
                                          ? "pricing.for_licenses"
                                          : "pricing.for_license",
                                        { count: plan.licenses },
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {!plan.isEnterprise && (
                              <div
                                className="plan-features flex-grow-1"
                                style={{ margin: "2rem 0" }}
                              >
                                {plan.description ? (
                                  <div
                                    className="plan-description-content"
                                    dangerouslySetInnerHTML={{
                                      __html: plan.description,
                                    }}
                                    style={{
                                      textAlign: "left",
                                      color: "#444",
                                      lineHeight: 1.6,
                                    }}
                                  />
                                ) : (
                                  plan.features.map((feature, fIdx) => (
                                    <div
                                      key={fIdx}
                                      className="feature-item"
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                        marginBottom: "12px",
                                        textAlign: "left",
                                      }}
                                    >
                                      <FiCheck
                                        size={18}
                                        className="feature-check"
                                        style={{
                                          color: "#0047FF",
                                          flexShrink: 0,
                                          marginTop: "3px",
                                        }}
                                      />
                                      <span
                                        style={{
                                          color: "#444",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {feature}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}

                            {plan.isEnterprise && (
                              <div className="flex-grow-1"></div>
                            )}

                            <button
                              className={`btn ${plan.isPopular ? "btn-primary" : "btn-secondary"} w-100 mt-auto`}
                              style={{
                                background: plan.isPopular
                                  ? "#0047FF"
                                  : "#f0f5ff",
                                color: plan.isPopular ? "#fff" : "#0047FF",
                                border: "none",
                                padding: "14px",
                                borderRadius: "12px",
                                fontWeight: 700,
                                fontSize: "15px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() => {
                                if (plan.isEnterprise) {
                                  window.open(
                                    "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482",
                                    "_blank",
                                  );
                                  return;
                                }
                                if (plan.price === "Custom") return;
                                navigate(`/register?contract_id=${plan.id}`);
                              }}
                            >
                              {plan.isEnterprise
                                ? t("pricing.enterprise.speak_to_sales")
                                : plan.price === "Custom"
                                  ? t("pricing.contact_sales")
                                  : t("pricing.subscribe_8days")}
                            </button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ECOSYSTEM SECTION */}
          <section id="ecosystem" className="py-5 mt-5 mb-5 bg-white">
            <div className="container">
              {/* Title and Intro */}
              {/* <div className="text-center mb-5 px-3"> */}
              <Row align="start" justify="space-between" gutter={[32, 32]}>
                <Col
                  xs={24}
                  md={8}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Title
                    level={2}
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      // fontSize: "clamp(24px, 4vw, 36px)",
                      fontSize: "clamp(22px, 3vw, 44px)", // responsive scaling (mobile → desktop)
                    }}
                  >
                    {t("landingPage.ecosystem.title1")}
                  </Title>
                </Col>
                <Col xs={24} md={16}>
                  <Paragraph
                    style={{
                      color: "#555",
                      textTransform: "uppercase",
                      fontSize: "clamp(12px, 1.5vw, 14px)", // responsive scaling
                      fontWeight: 800,
                      lineHeight: "120%",
                      marginBottom: 8,
                    }}
                  >
                    {t("landingPage.ecosystem.title2")}
                  </Paragraph>
                  <Paragraph
                    style={{
                      color: "#555",
                      backgroundColor: "transparent",
                      marginTop: 0,
                      marginBottom: 0,
                      fontWeight: 500,
                      lineHeight: "120%",
                      fontSize: "clamp(16px, 2.5vw, 32px)", // responsive scaling
                      maxWidth: 850,
                      margin: "0 auto",
                    }}
                  >
                    {t("landingPage.ecosystem.desc1")}{" "}
                    <strong>{t("landingPage.ecosystem.desc2")}</strong>{" "}
                    {t("landingPage.ecosystem.desc3")}
                    {t("landingPage.ecosystem.desc4")}
                    <br />
                    {t("landingPage.ecosystem.desc5")}
                    {t("landingPage.ecosystem.desc6")}
                  </Paragraph>
                </Col>
              </Row>
            </div>
          </section>

          {/* Contact Section */}
        </Content>
      </Layout>
    </div>
  );
}

export default Home;

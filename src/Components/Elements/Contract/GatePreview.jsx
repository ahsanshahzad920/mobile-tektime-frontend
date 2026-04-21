import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion, useSpring } from 'framer-motion';
import { 
    ArrowRight, Play, User, MessageSquare, 
    CheckCircle, Shield, Rocket, HelpCircle, 
    Zap, Layout, Users, X, Globe, Menu, Bot, Lock, Server, EyeOff,
    PlusCircle, MinusCircle, Linkedin, Facebook, Instagram
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './GatePreview.scss';
import logo from '../../../Media/logo.png';

const GatePreview = ({ data }) => {
    const [t] = useTranslation("global");
    const objectUrlsRef = useRef([]);
    const [randomImage] = useState(`https://picsum.photos/1200/800?random=${Math.floor(Math.random() * 1000)}`);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        return () => {
            // Cleanup object URLs on unmount
            objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Mouse Parallax Logic
    const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        mouseX.set(x * 15);
        mouseY.set(y * 15);
    }

    if (!data) return null;

    const renderMedia = (mediaType, mediaFile, altText = '', className = '') => {
        if (!mediaFile) {
            return (
                <div className={`preview-media-placeholder d-flex align-items-center justify-content-center bg-light text-muted rounded-3 ${className}`} style={{ minHeight: '200px' }}>
                    <span>Media Placeholder</span>
                </div>
            );
        }

        let mediaUrl;
        if (mediaFile instanceof File) {
            mediaUrl = URL.createObjectURL(mediaFile);
            objectUrlsRef.current.push(mediaUrl);
        } else {
            mediaUrl = mediaFile;
        }

        if (mediaType === 'video') {
            return (
                <video src={mediaUrl} controls className={`preview-media-video rounded-3 ${className}`} autoPlay={data.heroAutoplay} muted={data.heroAutoplay} loop style={{ width: '100%' }} />
            );
        }
        return <img src={mediaUrl} alt={altText} className={`preview-media-img rounded-3 ${className}`} />;
    };

    const surroundingApps = [
        { name: 'Gmail', icon: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg", position: { top: '15%', left: '15%' }, path: "M 180 100 C 250 100, 350 200, 400 200" },
        { name: 'Outlook', icon: "https://cdn-icons-png.flaticon.com/512/732/732223.png", position: { top: '15%', right: '15%' }, path: "M 620 100 C 550 100, 450 200, 400 200" },
        { name: 'Ionos', icon: "https://cdn.worldvectorlogo.com/logos/ionos-1.svg", position: { top: '67%', left: '14%' }, path: "M 180 300 C 250 300, 350 200, 400 200" },
        { name: 'Cloud', icon: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg", position: { top: '75%', right: '15%' }, path: "M 620 300 C 550 300, 450 200, 400 200" },
    ];

    const securityStock = [
        { title: 'SOC2 Type 1', desc: 'We\'ve completed SOC 2 Type 1 examination, independently audited for security, availability, and confidentiality.', icon: <Shield size={20} /> },
        { title: 'Encryption', desc: 'Your emails are encrypted in transit and at rest using industry-leading protocols.', icon: <Lock size={20} /> },
        { title: 'Enterprise-Grade Infrastructure', desc: 'Built on secure cloud infrastructure with 99.9% uptime and redundant backups.', icon: <Server size={20} /> },
        { title: 'Privacy First', desc: 'We never train AI models on your data. Your information stays yours and is never shared.', icon: <EyeOff size={20} /> },
    ];

    const securityList = data.securityArgs && data.securityArgs.length > 0 ? data.securityArgs.map((arg, i) => ({
        title: arg,
        desc: 'Ensuring your business data remains private, secure, and accessible only to you.',
        icon: securityStock[i % 4].icon
    })) : securityStock;

    const splitTitle = (title) => {
        if (!title) return { first: 'Build Your Professional', second: 'Landing Page' };
        const words = title.split(' ');
        if (words.length <= 1) return { first: title, second: '' };
        const mid = Math.ceil(words.length / 2);
        return {
            first: words.slice(0, mid).join(' '),
            second: words.slice(mid).join(' ')
        };
    };

    const { first, second } = splitTitle(data.heroTitle);

    return (
        <div className="gate-preview-content">
            {/* --- NAVBAR --- */}
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-logo">
                        <img src={logo} alt="TekTIME" style={{ height: '40px' }} />
                    </div>
                    <div className="navbar-right">
                        <Button className="nav-btn nav-btn-primary d-none d-md-block">Login</Button>
                        <Button className="nav-btn nav-btn-primary d-none d-md-block">Pricing</Button>
                        <button className="menu-trigger">
                            <span className="menu-text">Menu</span>
                            <Menu className="ms-2" size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */ }
            <section
                className="section hero-section"
                id="home"
                onMouseMove={handleMouseMove}
            >
                <div className="hero-mesh-bg"></div>
                <Container className="hero-container relative">
                    <div className="hero-content text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="hero-title"
                        >
                            <span className="title-top d-block mb-2">{first}</span>
                            <span className="title-bottom text-primary-gradient d-block">{second}</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="hero-description"
                        >
                            {data.heroSubtitle || 'Transform your vision into reality with TekTIME. The all-in-one solution for your business growth.'}
                        </motion.p>

                        {(data.heroBenefits || []).some(b => b) && (
                            <motion.div 
                                className="hero-benefits-tags d-flex justify-content-center gap-2 mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {data.heroBenefits.map((benefit, i) => benefit && (
                                    <span key={i} className="benefit-tag">
                                        <CheckCircle size={14} className="me-1" /> {benefit}
                                    </span>
                                ))}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="hero-actions"
                        >
                            <Button 
                                className="btn btn-primary px-4 py-3" 
                                onClick={() => data.heroCtaPrimaryLink && window.open(data.heroCtaPrimaryLink, '_blank', 'noreferrer')}
                            >
                                {data.heroCtaPrimary || 'Get Started'} <ArrowRight size={18} className="ms-2" />
                            </Button>
                            <Button 
                                className="btn btn-secondary px-4 py-3"
                                onClick={() => data.heroCtaSecondaryLink && window.open(data.heroCtaSecondaryLink, '_blank', 'noreferrer')}
                            >
                                <Play size={16} fill="currentColor" className="me-2" />
                                {data.heroCtaSecondary || 'View Demo'}
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
                        className="hero-visuals"
                    >
                        <motion.div
                            className="dashboard-parallax-wrapper"
                            style={{ x: mouseX, y: mouseY }}
                        >
                            <div className="dashboard-wrapper">
                                {data.heroMediaFile ? renderMedia(data.heroMediaType, data.heroMediaFile, data.heroAltText, 'dashboard-img') : null}
                            </div>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* --- HOW IT WORKS SECTION --- */}
            <section className="section how-it-works-section">
                <Container>
                    <div className="text-center section-header">
                        <h2>How it <span className="text-primary">Works</span></h2>
                        <p className="subtitle">{data.howTitle || 'A simple process to elevate your business.'}</p>
                    </div>

                    <div className="steps-container">
                        <div className="steps-connector d-none d-lg-block">
                            <motion.div
                                className="connector-progress"
                                initial={{ width: '0%' }}
                                animate={{ width: ['0%', '100%', '100%', '0%'] }}
                                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                            ></motion.div>
                        </div>

                        <div className="steps-wrapper">
                            {(data.steps || []).slice(0, 3).map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    className="step-item"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                >
                                    <div className="step-card">
                                        {idx === 0 && (
                                            <motion.div className="floating-icon icon-user" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                                                <User color="#335CFF" fill="#335CFF" size={24} />
                                            </motion.div>
                                        )}
                                        {idx === 1 && (
                                            <motion.div className="floating-icon icon-integrations" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                                                <Zap color="#A855F7" fill="#A855F7" size={24} />
                                            </motion.div>
                                        )}
                                        {idx === 2 && (
                                            <motion.div className="floating-icon icon-bot" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                                                <MessageSquare color="#0EA5E9" fill="#0EA5E9" size={24} />
                                            </motion.div>
                                        )}

                                        <div className="card-mock-ui">
                                            <div className="mock-title">{step.title || `Step ${idx + 1}`}</div>
                                            <div className="mock-sub">{step.cardSubtitle || 'Quick action required'}</div>
                                            
                                            {step.mediaFile ? (
                                                <div className="step-media-container mt-3 w-100">
                                                    {renderMedia(step.mediaType, step.mediaFile, step.title, 'step-card-img')}
                                                </div>
                                            ) : (
                                                <>
                                                    {idx === 0 && (
                                                        <div className="mock-inputs w-100 px-3">
                                                            <div className="input-line mb-2"></div>
                                                            <div className="input-field mb-2"></div>
                                                            <div className="mock-btn mt-2">{step.cardBtn || 'Submit'}</div>
                                                        </div>
                                                    )}
                                                    {idx === 1 && (
                                                        <div className="mock-inputs w-100 px-3 d-flex flex-column align-items-center">
                                                            <div className="d-flex gap-3 mb-3">
                                                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="G" style={{ width: '30px' }} />
                                                                <img src="https://cdn-icons-png.flaticon.com/512/732/732223.png" alt="O" style={{ width: '30px' }} />
                                                            </div>
                                                            <div className="mock-btn">{step.cardBtn || 'Connect'}</div>
                                                        </div>
                                                    )}
                                                    {idx === 2 && (
                                                        <div className="w-100 p-2 d-flex flex-column align-items-center">
                                                            <div className="bg-light rounded p-2 mb-2 w-100" style={{ height: '80px' }}>
                                                                <div className="input-line w-75 mb-1"></div>
                                                                <div className="input-line w-50"></div>
                                                            </div>
                                                            <div className="mock-btn w-100">{step.cardBtn || 'Chat Now'}</div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="step-desc">
                                        <p>{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="section features-section" id="features">
                <Container>
                    <div className="text-center section-header">
                        <span className="badge-text">Features</span>
                        <h2 className="section-title">{data.solutionTitle || 'Everything you need to scale'}</h2>
                    </div>

                    <div className="bento-grid">
                        {(data.features || []).map((feature, idx) => {
                            const isLarge = idx % 4 === 0 || idx % 4 === 3;
                            const visualClass = ['visual-blue', 'visual-gray', 'visual-white', 'visual-purple'][idx % 4];
                            
                            return (
                                <motion.div
                                    key={idx}
                                    className={`bento-card ${isLarge ? 'card-large' : 'card-medium'}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: (idx % 4) * 0.1 }}
                                >
                                    <div className="card-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.desc}</p>
                                    </div>
                                    <div className={`card-visual ${visualClass}`}>
                                        {renderMedia(feature.mediaType, feature.mediaFile, '', 'feature-image')}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </Container>
            </section>

              {/* --- PROBLEM SECTION --- */}
            <section className="section preview-problem">
                <Container>
                    <Row className="align-items-center flex-row-reverse g-5">
                        <Col lg={6}>
                            <motion.h2 initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}>{data.problemTitle || 'The Problem'}</motion.h2>
                            <div className="mt-4">
                                {(data.problems || []).map((prob, idx) => (
                                    prob && (
                                        <div key={idx} className="problem-item d-flex align-items-center p-3 mb-3 bg-white shadow-sm border rounded-4">
                                            <div className="bg-danger rounded-circle me-3" style={{ width: '10px', height: '10px' }}></div>
                                            <p className="mb-0 fw-medium">{prob}</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="p-2 bg-white rounded-5 shadow-lg overflow-hidden">
                                {renderMedia(data.problemMediaType, data.problemMediaFile, data.problemMediaDesc, 'w-100')}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- SECURITY SECTION --- */}
            <section className="section security-section">
                <Container>
                    <div className="text-center section-header">
                        <h2 className="section-title">{data.securityTitle || 'Bank-level security for your peace of mind'}</h2>
                        <p className="subtitle">Secure. Private. Encrypted. Your data is safe with us.</p>
                    </div>

                    <div className="security-grid">
                        {securityList.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`security-card ${idx === 3 ? 'card-highlighted' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="security-icon-wrapper">
                                    {item.icon}
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* --- INTEGRATIONS SECTION --- */}
            <section className="section integrations-section">
                <Container>
                    <div className="text-center section-header">
                        <h2 className="section-title">{data.integrationsTitle || 'Seamless Integrations'}</h2>
                        <p className="subtitle">Connect TekTIME with your favorite tools and automate your workflow.</p>
                    </div>

                    <div className="hub-spoke-container">
                        <svg className="connections-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                            {surroundingApps.map((app, index) => (
                                <motion.path
                                    key={index}
                                    d={app.path}
                                    className="connection-line"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 + index * 0.1 }}
                                />
                            ))}
                        </svg>

                        <div className="hub-center">
                            <motion.div
                                className="hub-robot-circle"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.8 }}
                            >
                                <motion.div
                                    className="hub-pulse"
                                    animate={{ boxShadow: ["0 0 0 0px rgba(51, 92, 255, 0.4)", "0 0 0 20px rgba(51, 92, 255, 0)"] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <Bot size={48} color="white" />
                            </motion.div>
                        </div>

                        {surroundingApps.map((app, index) => (
                            <motion.div
                                key={index}
                                className="app-node"
                                style={app.position}
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                            >
                                <div className="app-icon-wrapper">
                                    <img src={app.icon} alt={app.name} style={{ width: '24px', height: '24px' }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* --- TESTIMONIALS SECTION --- */}
            {(data.testimonials || []).length > 0 && (
                <section className="section testimonials-section">
                    <Container>
                        <div className="text-center section-header">
                            <span className="badge-text">Success Stories</span>
                            <h2 className="section-title">{data.testimonialsTitle || 'Loved by industry leaders'}</h2>
                        </div>

                        <div className="testimonials-grid">
                            {data.testimonials.map((testi, idx) => (
                                <motion.div
                                    key={idx}
                                    className="testimonial-card"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="quote-icon">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                            <path d="M10 11H6C5.45 11 5 10.55 5 10V7C5 6.45 5.45 6 6 6H8C8.55 6 9 5.55 9 5V4C9 3.45 8.55 3 8 3H5C3.9 3 3 3.9 3 5V11C3 13.2 4.8 15 7 15H10V11ZM21 11H17C16.45 11 16 10.55 16 10V7C16 6.45 16.45 6 17 6H19C19.55 6 20 5.55 20 5V4C20 3.45 19.55 3 19 3H16C14.9 3 14 3.9 14 5V11C14 13.2 15.8 15 18 15H21V11Z" fill="#E2E8F0" />
                                        </svg>
                                    </div>
                                    <div className="stars">★★★★★</div>
                                    <h3 className="testimonial-title">{testi.headline || 'Impactful Result'}</h3>
                                    <p className="testimonial-text">"{testi.content || 'Great service and amazing team!'}"</p>
                                    <div className="testimonial-footer">
                                         {testi.authorImage && (
                                            <div className="author-img-wrapper">
                                                {renderMedia('image', testi.authorImage, testi.authorName, 'author-img')}
                                            </div>
                                         )}
                                        <div className="testimonial-info">
                                            <div className="testimonial-author">{testi.authorName || 'Anonymous'}</div>
                                            <div className="testimonial-role">{testi.authorRole || 'Valued Client'}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* --- FAQ SECTION --- */}
            <section className="section faq-section">
                <Container>
                    <div className="text-center section-header">
                        <h2>Frequently Asked Questions</h2>
                        <p className="subtitle">Everything you need to know about TekTIME.</p>
                    </div>

                    <div className="faq-list">
                        {(data.faqItems || []).map((faq, index) => (
                            faq.question && (
                                <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`} onClick={() => toggleFAQ(index)}>
                                    <div className="faq-question">
                                        <h3>{faq.question}</h3>
                                        <div className="faq-icon-wrapper">
                                            {openIndex === index ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
                                        </div>
                                    </div>
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                        {faq.mediaFile && <div className="mt-3">{renderMedia(faq.mediaType, faq.mediaFile, '', 'w-100')}</div>}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </Container>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="section cta-section">
                <Container>
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2>Ready to get started?</h2>
                            <p>Transform your customer experience with TekTIME. Join hundreds of businesses scaling their impact today.</p>
                            <div className="cta-form">
                                <Button className="btn btn-primary" onClick={() => window.open('https://calendly.com/tektime/tektime-qu-est-ce-que-c-est', '_blank', 'noreferrer')}>
                                    Book a Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

          

            <footer className="footer-section">
                <div className="container">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <a href="/" className="footer-logo">
                                <img src={logo} alt="TekTIME" style={{ height: '40px' }} />
                            </a>
                            <p>{t('footer.desc')}</p>
                            <div className="social-links">
                                <a href="https://www.linkedin.com/company/tektimesolutions/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
                                <a href="https://www.facebook.com/people/TekTime-Coaching/61554831273983/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
                                <a href="https://www.instagram.com/tektime.io/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
                            </div>
                        </div>

                        <div className="footer-links-col">
                            <h4>{t('footer.pages')}</h4>
                            <ul>
                                <li><a href="/pricing" onClick={(e) => e.preventDefault()}>{t('footer.pricing')}</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GatePreview;

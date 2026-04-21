import React from 'react';
import './Footer.css';
import { Linkedin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="footer-section">
            <div className="container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">TekTIME</a>
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
                            <li><Link to="/pricing">{t('footer.pricing')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                </div>
            </div>
        </footer>
    );
}

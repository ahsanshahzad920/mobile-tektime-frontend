import React, { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.png';
import './Navbar.scss';
import { BASE_URL } from '../apiConfig';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t } = useTranslation();

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    return (
        <>
            <nav className="navbar-landing">
                <div className="navbar-container">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <img src={logo} alt="TekTIME" className="logo-img-main" />
                    </Link>

                    {/* Right Side Actions */}
                    <div className="navbar-right">
                        {/* <div className="hidden md:block mr-4">
                            <LanguageSwitcher />
                        </div> */}
                        <Link to={BASE_URL + '/'} className="nav-btn nav-btn-primary">
                            {t('navbar.login')}
                        </Link>
                        <Link to={'/pricing'} className="nav-btn nav-btn-primary">
                            {t('navbar.pricing')}
                        </Link>

                        <button className="menu-trigger" onClick={() => setIsMenuOpen(true)}>
                            <span className="menu-text">{t('navbar.menu')}</span>
                            <img
                                src="https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/6853d4aa99a1acadf62b126a_toggle.svg"
                                alt="Menu"
                                className="menu-icon-img"
                            />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Side Drawer Overlay */}
            {isMenuOpen && (
                <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}></div>
            )}

            {/* Side Drawer */}
            <div className={`drawer ${isMenuOpen ? 'open' : ''} `}>
                <div className="drawer-header">
                    <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
                        <img src={logo} alt="TekTIME" className="logo-img-drawer" />
                    </Link>
                    <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className="drawer-links">
                    <Link to="/pricing" className="drawer-item" onClick={() => setIsMenuOpen(false)}>
                        {t('navbar.pricing')}
                    </Link>
                    <Link to="/" className="drawer-item" onClick={() => setIsMenuOpen(false)}>
                        {t('navbar.login')}
                    </Link>
                </div>

                <div className="language-toggle">
                    <Globe size={16} />
                    <span>{t('navbar.language')}</span>
                    <div className="ml-auto">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </>
    );
}

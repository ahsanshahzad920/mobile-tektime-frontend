import React from 'react';
import { useTranslation } from 'react-i18next';
import './Navbar.css'; // Reusing Navbar styles for consistency if possible, or we can create its own

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleLanguage}>
            <span className={`text-sm ${i18n.language === 'en' ? 'font-bold text-black' : 'text-gray-400'}`}>EN</span>
            <div className={`toggle-switch ${i18n.language === 'fr' ? 'active' : ''}`} style={{
                width: '40px',
                height: '20px',
                backgroundColor: i18n.language === 'fr' ? '#3b82f6' : '#e5e7eb', // Blue when FR (active)
                borderRadius: '9999px',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: i18n.language === 'fr' ? 'calc(100% - 18px)' : '2px', // Right when FR
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}></div>
            </div>
            <span className={`text-sm ${i18n.language === 'fr' ? 'font-bold text-black' : 'text-gray-400'}`}>FR</span>
        </div>
    );
}

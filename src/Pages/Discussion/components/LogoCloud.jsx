import React from 'react';
import { useTranslation } from 'react-i18next';
import './LogoCloud.css';

const logos = [
    { name: 'Webflow', url: 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/webflow.svg' },
    { name: 'Figma', url: 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/figma.svg' },
    { name: 'Zapier', url: 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/zapier.svg' },
    { name: 'Notion', url: 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/notion.svg' },
    { name: 'Slack', url: 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/slack-icon.svg' },
];

// Duplicate logos to create seamless loop
const marqueeLogos = [...logos, ...logos, ...logos, ...logos];

export default function LogoCloud() {
    const { t } = useTranslation("global");
    return (
        <section className="section logo-section">
            <div className="container-full">
                <p className="logo-title">{t('logo_cloud.title')}</p>
                <div className="marquee-wrapper">
                    <div className="marquee-content">
                        {marqueeLogos.map((logo, index) => (
                            <div key={index} className="logo-item">
                                <img
                                    src={logo.url}
                                    alt={logo.name}
                                    className="logo-img"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

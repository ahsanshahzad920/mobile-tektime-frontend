import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CTA from '../components/CTA';
import Reveal from '../components/Reveal';
import Features from '../components/Features';
import FAQ from '../components/FAQ';
import './PricingPage.css';
import { API_BASE_URL, BASE_URL } from '../apiConfig';
import Pricing from '../components/Pricing';

export default function PricingPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Note: PricingPage uses the standalone <Pricing /> component which handles its own data fetching.
    // Logic here is kept minimal or removed if unused.

    return (
        <div className="pricing-page-v2">
            <Reveal>
                {/* We can reuse the enhanced Pricing component or duplicate the logic if the designs diverge significantly.
                    Since PricingPage seems to just wrap components, let's see. 
                    Actually, PricingPage imports Pricing component at line 11.
                    However, line 90 uses <Pricing />. 
                    Wait, if PricingPage uses the `Pricing` component, then I don't need to duplicate the logic here UNLESS PricingPage renders its OWN custom pricing grid.
                    It looks like PricingPage renders <Pricing /> at line 90.
                    BUT, it also seems to have had its own `fetchPlans` logic in the previous version I saw?
                    Let's re-read the file content.
                    It has `useEffect` fetching plans, BUT it doesn't seem to USE `pricingPlans` in the JSX I saw earlier!
                    Let's check line 88-119 of the previous view_file.
                    It renders <Pricing /> inside <Reveal>.
                    It DOES NOT render the `pricingPlans` state anywhere in the returned JSX!
                    The `pricingPlans` logic in PricingPage.jsx seems to be DEAD CODE or vestigial if <Pricing /> handles its own data.
                    If <Pricing /> handles its own data (which it does), then `PricingPage.jsx` fetching logic is redundant.
                    So I should probably REMOVE the redundant logic from PricingPage instead of updating it, ensuring <Pricing /> is used.
                    Let's verify if `Pricing.jsx` is indeed autonomous. Yes, it fetches its own data.
                    So I will remove the unused code in `PricingPage.jsx` to clean it up.
                */}
                <Pricing />
            </Reveal>

            {/* Shared Features Section */}
            <Reveal>
                <Features />
            </Reveal>

            {/* Custom CTA Box */}
            <section className="container mb-24">
                <Reveal>
                    <div className="cta-box-v2">
                        <div className="cta-content-v2">
                            <h2>Ready to upgrade <br /> your customer service?</h2>
                            <p>Experience the power of TekTIME AI today.</p>
                            <div className="flex gap-4 mt-6 justify-center">
                                <button className="btn btn-secondary" onClick={() => window.open('https://tektime.io', '_blank')}>View Demo</button>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Shared FAQ Section */}
            <Reveal>
                <FAQ />
            </Reveal>

        </div>
    );
}

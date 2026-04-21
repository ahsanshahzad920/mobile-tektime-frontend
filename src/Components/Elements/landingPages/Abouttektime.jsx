import React from 'react';
import { FaArrowRight } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

function Abouttektime() {
    const { t } = useTranslation("global");

    return (
        <div className='mt-5 pt-5 about-tektime'>
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6 mt-3">
                        <p className="description fs-6 text-danger">{t('about_tektime')}</p>
                        <h3 className="main-heading fw-bold">{t('our_view')} <span className="darkblue-txtcolor">{t('view_world')}</span> {t('our_world')}</h3>
                        <p className="description fw-bold">{t('about_tektime_description')}</p>
                        <div className="d-flex gap-2 align-items-center">
                            <FaArrowRight className='text-danger' />
                            <span className="description fw-bold">{t('change_world')}</span>
                        </div>
                        <div className="d-flex gap-2 align-items-center mt-2">
                            <FaArrowRight className='text-danger' />
                            <span className="description fw-bold">{t('value_time')}</span>
                        </div>
                        <button className="btn signup-btn about-btn text-white mt-3">{t('get_free_demo')}</button>
                    </div>
                    <div className="col-md-6 mt-3 text-end">
                        <img src="Assets/landing/about-tektime.png" alt="" className="img-fluid" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Abouttektime;

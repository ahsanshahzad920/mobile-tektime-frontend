import React from 'react'
import { useTranslation } from "react-i18next";

function Contactus() {

    const { t } = useTranslation("global");

    return (
        <div className='mt-5 pt-5 contact_page'>
            <div className="why-choose-us py-4 pb-5">
                <div className="container pb-5" >
                    <div className="text-center">
                        <h5 className="main-heading fw-bold my-4">{t('contact_page.contact-heading')}</h5>
                        <p className="description">{t('contact_page.contact_description')} <br className="d-none d-md-block" /> {t('contact_page.contact_description1')}</p>
                    </div>
                    <div className="row my-5">
                        <div className="col-md-4 mt-4">
                            <div className="d-flex gap-2">
                                <div>
                                    <img src="Assets/landing/call.png" alt="" className="img-fluid" />
                                </div>
                                <div>
                                    <h5 className="main-heading fs-5 fw-bold">{t('contact_page.contact-call')}</h5>
                                    <p className="description fs-6 mb-0">+1-940-394-2948</p>
                                    <p className="description fs-6 mb-0">+1-389-385-3807</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-4">
                            <div className="d-flex gap-2">
                                <div>
                                    <img src="Assets/landing/mail.png" alt="" className="img-fluid" />
                                </div>
                                <div>
                                    <h5 className="main-heading fs-5 fw-bold">{t('contact_page.contact-email')}</h5>
                                    <p className="description fs-6 mb-0">info@tektime.io</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-4">
                            <div className="d-flex gap-2">
                                <div>
                                    <img src="Assets/landing/call.png" alt="" className="img-fluid" />
                                </div>
                                <div>
                                    <h5 className="main-heading fs-5 fw-bold">{t('contact_page.contact-visit')}</h5>
                                    <p className="description fs-6 mb-0">34 Madison Street, <br className="d-none d-md-block" />NY, USA 10005</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 rounded-3 mt-5 card-shadow mb-5 rounded-4" >
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mt-4">
                                    <div class="form-group">
                                        <label for="exampleFormControlSelect1" class="mb-1 fw-bold description">{t('contact_page.contact-namefield')}</label>
                                        <input
                                            type="text"
                                            placeholder="i.e. john dow"
                                            class="form-control description fs-6"
                                            id="exampleFormControlInput1"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 mt-4">
                                    <div class="form-group">
                                        <label for="exampleFormControlSelect1" class="mb-1 fw-bold description">{t('contact_page.contact-emailfield')}</label>
                                        <input
                                            type="text"
                                            placeholder="i.e. john@mail.com"
                                            class="form-control description fs-6"
                                            id="exampleFormControlInput1"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 mt-4">
                                    <div class="form-group">
                                        <label for="exampleFormControlSelect1" class="mb-1 fw-bold description">{t('contact_page.contact-phonefield')}</label>
                                        <input
                                            type="text"
                                            placeholder="i.e. +1-234-567-7890"
                                            class="form-control description fs-6"
                                            id="exampleFormControlInput1"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 mt-4">
                                    <div class="form-group">
                                        <label for="exampleFormControlSelect1" class="mb-1 fw-bold description">{t('contact_page.contact-subjectfield')}</label>
                                        <input
                                            type="text"
                                            placeholder={t("contact_page.contact-subjectplaceholderfield")}
                                            class="form-control description fs-6"
                                            id="exampleFormControlInput1"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="form-group mt-4">
                                <label for="exampleFormControlTextarea1" class="mb-1 description fw-bold">{t('contact_page.contact-messagefield')}</label>
                                <textarea
                                    class="form-control description fs-6"
                                    id="exampleFormControlTextarea1"
                                    placeholder={t("contact_page.contact-messageplaceholderfield")}
                                    rows="5"
                                ></textarea>
                            </div>
                            <button className="btn signup-btn text-white px-5 py-2 my-3 mt-4">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contactus
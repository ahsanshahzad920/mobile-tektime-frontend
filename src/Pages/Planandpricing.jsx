import React from 'react'
import Pricingandplans from '../Components/Elements/landingPages/Pricingandplans'
import Checkourfeatures from '../Components/Elements/landingPages/Checkourfeatures'
import { useTranslation } from 'react-i18next';

function Planandpricing() {
  const { t } = useTranslation("global");
  
  return (
    <div className='mt-5 pt-5'>
      <div className="why-choose-us py-5">
        <div className="text-center">
          <h5 className="main-heading fw-bold mb-4">{t("Pricing & Plans")}</h5>
          <p className="description p-0 m-0">{t("pricingPageHeading1")}</p>
          <p className="description p-0">{t("pricingPageHeading2")}</p>
        </div>
        <Pricingandplans/>
        <Checkourfeatures/>
      </div>
    </div>
  )
}

export default Planandpricing
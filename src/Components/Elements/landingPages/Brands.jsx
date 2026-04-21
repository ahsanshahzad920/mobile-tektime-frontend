import React from 'react'
import Marquee from "react-fast-marquee";

function Brands() {
    return (
        <div className='container mt-5'>
            <Marquee>
                <div className="d-flex gap-5">
                    <img src="Assets/landing/logo-1.png" alt="" className="img-fluid me-3" />
                    <img src="Assets/landing/logo-2.png" alt="" className="img-fluid me-3" />
                    <img src="Assets/landing/logo-3.png" alt="" className="img-fluid me-3" />
                    <img src="Assets/landing/logo-4.png" alt="" className="img-fluid me-3" />
                    <img src="Assets/landing/logo-5.png" alt="" className="img-fluid me-3" />
                    <img src="Assets/landing/logo-6.png" alt="" className="img-fluid" />
                </div>
            </Marquee>
            {/* <div className="row align-items-center">
                <div className="col-md-2 col-6 mt-4">
                    <img src="Assets/logo-1.png" alt="" className="img-fluid" />
                </div>
                <div className="col-md-2 col-6 mt-4">
                    <img src="Assets/logo-2.png" alt="" className="img-fluid" />
                </div>
                <div className="col-md-2 col-6 mt-4">
                    <img src="Assets/logo-3.png" alt="" className="img-fluid" />
                </div>
                <div className="col-md-2 col-6 mt-4">
                    <img src="Assets/logo-4.png" alt="" className="img-fluid" />
                </div>
                <div className="col-md-2 col-6 mt-4">
                    <img src="Assets/logo-5.png" alt="" className="img-fluid" />
                </div>
                <div className="col-md-2 col-6 mt-4">
                    <img src="Assets/logo-6.png" alt="" className="img-fluid" />
                </div>
            </div> */}
        </div>
    )
}

export default Brands
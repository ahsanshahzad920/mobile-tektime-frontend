import React, { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function BasePage(props) {
  const location = useLocation();
  const routesWithBasePage = [
    "/",
    "/register",
    "/gate/moment",
    "/gate/mission",
    "/gate/btp",
    "/gate/lawyers",
    "/about",
    "/contact",
    "/privacy",
    "/privacy-policy",
    "/terms-and-conditions",
    "/gate/:name",
    // "/docs/zoom-integration-guide",
    // "/pricing",
    // "/useCase/1",
    // "/useCase/2",
    // "/useCase/3",
    // "/useCase/4",
  ];

  const shouldShowHeaderFooter = routesWithBasePage.some((route) =>
    matchPath({ path: route, end: true }, location.pathname),
  );

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }, [location]);

  return (
    <div>
      {shouldShowHeaderFooter && <Navbar />}
      {props.children}
      {shouldShowHeaderFooter && <Footer />}
    </div>
  );
}

export default BasePage;

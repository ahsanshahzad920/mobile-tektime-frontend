import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AddProfile from "./AddProfile";
import ViewProfile from "./ViewProfile";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import { getUserRoleID } from "./../../Utils/getSessionstorageItems";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

const Profile = () => {
  const [view, setView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [t] = useTranslation("global");
  const { setProfileImage } = useHeaderTitle();

  const handleView = () => setView((prevView) => !prevView);

  const userID = CookieService.get("user_id");
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const getUserDataFromAPI = async () => {
    // setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      const user = response?.data?.data;
      if (user) {
        setProfileImage(user?.image)
        setUser(user);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      // setLoading(false);
    }
  };
  useEffect(() => {
    getUserDataFromAPI();
  }, [userID]);

  useEffect(()=>{
    const getTeams = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const allTeams = response?.data?.data;
          const userTeams = user?.teams || [];
          const teams = allTeams?.filter((team)=> userTeams.some(team1 => team?.id === team1?.id))
          setTeams(teams);
     
        
        }
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error?.message));
        // console.log("error message", error);
      } finally {
        // setLoading(false);
      }
    };
    if (user) {
      getTeams();
    }
  },[user,view])

  return (
    <div className="visiting-card mt-3">
      <Container fluid>
        <Row>
          <Col md={6} xs={6} className="visiting-card-heading viewprofile-contact-font">
            <h3>{t("profile.visitingCard")}</h3>
          </Col>
          <Col md={6} xs={6} className="visiting-card-header">
            {view ? (
              <div className="view-btn" onClick={handleView}>
                <img src="/Assets/profile_view_icon.svg" alt="" />
                <h5 className="casting-member">{t("profile.viewVisitingCard")}</h5>
              </div>
            ) : (
              <div className="view-btn" onClick={handleView}>
                <img src="/Assets/profile_close_icon.svg" alt="" />
                <h5 className="casting-member">{t("profile.exitView")}</h5>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {view ? (
        <AddProfile
          user={user}
          teams={teams}
          isLoading={loading}
          refreshUserData={getUserDataFromAPI}
          setView={setView}
        />
      ) : (
        <ViewProfile user={user} />
      )}
    </div>
  );
};

export default Profile;

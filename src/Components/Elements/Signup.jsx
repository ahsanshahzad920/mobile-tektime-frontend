import CookieService from '../Utils/CookieService';
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BiShow, BiHide } from "react-icons/bi";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../Apicongfig";
function Signup() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [c_password, setC_Password] = useState("");

  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();

    if (password !== c_password) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit comporter au moins 8 caractères");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name: name,
        email: email,
        password: password,
        c_password: c_password,
        // user_id: userID,
      });
      if (response.status === 200 && response.data.success) {
        const token = JSON.stringify(response.data);
        CookieService.set("auth", token);
        toast.success("Inscrivez-vous avec succès");
        navigate("/");
      } else {
        // console.log("i am response", response);
        toast.error("Échec de l'inscription");
      }
    } catch (error) {
      if (
        error.response.data.data.email[0] == "Le couriel a déja été pris en compte."
      ) {
        toast.error(error.response.data.data.email[0]);
      } else {
        toast.error("Les données que vous avez saisies sont déjà enregistrées");

      }
    }
  };

  return (
    <div className="Signup">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card px-5 py-4">
              <div className="">
                <div>
                  <div className="text-center">
                    <img src="/Assets/logo2.png" alt="" width={130} />
                    <p className="">S'inscrire</p>
                  </div>
                  <form onSubmit={handleSignupSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Nom
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        E-mail
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        aria-describedby="emailHelp"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label pass-lab">
                        Mot de passe
                        <button
                          type="button"
                          className="btn btn-secondary"
                          aria-label={
                            passwordVisible ? "Hide Password" : "Show Password"
                          }
                          onClick={togglePasswordVisibility}
                        >
                          {passwordVisible ? (
                            <BiHide color="#145CB8" />
                          ) : (
                            <BiShow color="#145CB8" />
                          )}
                        </button>
                      </label>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="confirm-password"
                        className="form-label pass-lab"
                      >
                        Confirmez le mot de passe
                        <button
                          type="button"
                          className="btn btn-secondary"
                          aria-label={
                            passwordVisible1 ? "Hide Password" : "Show Password"
                          }
                          onClick={togglePasswordVisibility1}
                        >
                          {passwordVisible1 ? (
                            <BiHide color="#145CB8" />
                          ) : (
                            <BiShow color="#145CB8" />
                          )}
                        </button>
                      </label>
                      <input
                        type={passwordVisible1 ? "text" : "password"}
                        className="form-control"
                        id="confirm-password"
                        value={c_password}
                        onChange={(e) => setC_Password(e.target.value)}
                      />
                    </div>
                    <div className="text-center">
                      <button type="submit" className="btn btn-login">
                        S'inscrire
                      </button>
                    </div>
                  </form>
                  <div className="text-center ">
                    <hr />
                    <label>Déjà sur tektime</label>
                    <br />
                    <Link to="/">
                      <button type="button" className="btn btn-link">
                        Connexion
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

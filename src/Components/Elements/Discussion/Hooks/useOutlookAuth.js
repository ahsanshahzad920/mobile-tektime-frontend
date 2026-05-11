import CookieService from '../../../Utils/CookieService';
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../Apicongfig";
import { userTimeZone } from "../../Meeting/GetMeeting/Helpers/functionHelper";
import { useHeaderTitle } from "../../../../context/HeaderTitleContext";

const useOutlookAuth = ({ onSuccess }) => {
    const [isOutlookSyncing, setIsOutlookSyncing] = useState(false);
    const { setUser, user, setCallUser } = useHeaderTitle();

    const onOutlookLoginSuccess = async () => {
        try {
            const userId = CookieService.get("user_id");
            const token = CookieService.get("token");

            if (!userId || !token) {
                toast.error("User session not found.");
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data?.data;
            console.log("✅ User data fetched after Outlook login:", data);

            if (!data) {
                toast.error("User data not found.");
                return;
            }

            const { mail, displayName } = data?.outlook_user_info || {};
            if (!mail || !displayName) {
                toast.error("Incomplete Outlook user information.");
                return;
            }

            const updatedUser = {
                ...user,
                integration_links: [
                    ...user.integration_links.filter(
                        (link) => link.platform !== "Outlook Agenda"
                    ),
                    { platform: "Outlook Agenda", value: displayName },
                ],
                visioconference_links: [
                    ...user.visioconference_links.filter(
                        (link) => link.platform !== "Microsoft Teams"
                    ),
                    { platform: "Microsoft Teams", value: displayName },
                ],
                email_links: [
                    ...user.email_links.filter((link) => link.platform !== "Outlook"),
                    { platform: "Outlook", value: mail },
                ],
            };
            setUser(updatedUser);

            const formData = new FormData();

            formData.append("_method", "PUT");
            formData.append("title", user?.title || "");
            formData.append("name", user?.name || "");
            formData.append("last_name", user?.last_name || "");
            formData.append("email", user?.email || "");
            formData.append("phoneNumber", user?.phoneNumber || "");
            formData.append("enterprise_id", user?.enterprise?.id || "");
            formData.append("bio", user?.bio || "");
            formData.append("post", user?.post || "");
            formData.append("role_id", user?.role_id || "");
            formData.append("timezone", userTimeZone || "Europe/Paris");
            formData.append("visibility", user?.visibility || "public");

            user?.social_links?.forEach((link, index) => {
                if (link.id) {
                    formData.append(`social_links[${index}][id]`, link.id);
                }
                formData.append(`social_links[${index}][platform]`, link.platform);
                formData.append(`social_links[${index}][link]`, link.link);
            });

            user?.websites?.forEach((site, index) => {
                if (site.id) {
                    formData.append(`websites[${index}][id]`, site.id);
                }
                formData.append(`websites[${index}][title]`, site.title);
                formData.append(`websites[${index}][link]`, site.link);
            });

            user?.affiliation_links?.forEach((site, index) => {
                if (site.id) {
                    formData.append(`affiliation_links[${index}][id]`, site.id);
                }
                formData.append(`affiliation_links[${index}][title]`, site.title);
                formData.append(`affiliation_links[${index}][link]`, site.link);
            });

            updatedUser.integration_links.forEach((link, index) => {
                if (link.id) {
                    formData.append(`integration_links[${index}][id]`, link.id);
                }
                formData.append(`integration_links[${index}][platform]`, link.platform);
                formData.append(`integration_links[${index}][value]`, link.value);
            });

            updatedUser.visioconference_links.forEach((link, index) => {
                if (link.id) {
                    formData.append(`visioconference_links[${index}][id]`, link.id);
                }
                formData.append(
                    `visioconference_links[${index}][platform]`,
                    link.platform
                );
                formData.append(`visioconference_links[${index}][value]`, link.value);
            });

            updatedUser.email_links.forEach((link, index) => {
                if (link.id) {
                    formData.append(`email_links[${index}][id]`, link.id);
                }
                formData.append(`email_links[${index}][platform]`, link.platform);
                formData.append(`email_links[${index}][value]`, link.value);
            });

            user?.teams?.forEach((team) => {
                formData.append("team_id[]", team.id);
            });

            if (user?.image?.startsWith("data:image/")) {
                const blob = await (await fetch(user.image)).blob();
                formData.append("image", blob, "profile-image.jpg");
            } else if (user?.image) {
                formData.append("image", user.image);
            }

            if (user?.profile_banner?.startsWith("data:image/")) {
                const blob = await (await fetch(user.profile_banner)).blob();
                formData.append("profile_banner", blob, "profile-banner.jpg");
            } else if (user?.profile_banner) {
                formData.append("profile_banner", user.profile_banner);
            }

            if (user?.video?.startsWith("blob:")) {
                const blob = await (await fetch(user.video)).blob();
                formData.append("video", blob, "video-preview.mp4");
            } else if (user?.video) {
                formData.append("video", user.video);
            }

            const profileResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${CookieService.get("token")}`,
                },
            });

            if (!profileResponse.ok) {
                throw new Error(
                    `Failed to update user profile: ${profileResponse.status}`
                );
            }

            const responseData = await profileResponse.json();
            setUser(responseData?.data?.data || updatedUser);
            setCallUser((prev) => !prev);

            sessionStorage.setItem(
                "outlook_access_token",
                data?.outlook_access_token
            );
            sessionStorage.setItem(
                "outlook_refresh_token",
                data?.outlook_refresh_token
            );
            CookieService.set(
                "outlook_access_token",
                data?.outlook_access_token
            );
            CookieService.set(
                "outlook_refresh_token",
                data?.outlook_refresh_token
            );

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("❌ Error fetching user data after Outlook login:", error);
            toast.error(
                error?.response?.data?.message || "Failed to fetch Outlook data."
            );
        }
    };

    const outlookLoginAndSaveProfile = async () => {
        return new Promise((resolve, reject) => {
            try {
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.innerWidth - width) / 2;
                const top = window.screenY + (window.innerHeight - height) / 2;

                const popup = window.open(
                    `${process.env.REACT_APP_API_BASE_URL}/outlook-login?user_id=${CookieService.get("user_id")}`,
                    "Outlook Login",
                    `width=${width},height=${height},top=${top},left=${left}`
                );

                if (!popup) {
                    toast.error("Popup was blocked. Please allow popups for this site.");
                    reject(new Error("Popup blocked"));
                    return;
                }

                const messageHandler = async (event) => {
                    if (event.origin !== process.env.REACT_APP_API_BASE_URL) return;

                    const { type } = event.data || {};

                    if (type === "outlook-login-success") {
                        window.removeEventListener("message", messageHandler);
                        clearInterval(interval);
                        if (!popup.closed) popup.close();

                        try {
                            await onOutlookLoginSuccess();
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    } else if (type === "outlook-login-failed") {
                        window.removeEventListener("message", messageHandler);
                        clearInterval(interval);
                        if (!popup.closed) popup.close();
                        toast.error("Connexion Outlook échouée");
                        reject(new Error("Login failed"));
                    }
                };

                window.addEventListener("message", messageHandler);

                const interval = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(interval);
                        window.removeEventListener("message", messageHandler);
                        reject(new Error("Popup closed by user"));
                    }
                }, 500);

                setTimeout(() => {
                    if (!popup.closed) {
                        reject(new Error("Login timeout"));
                        popup.close();
                    }
                }, 5 * 60 * 1000);

            } catch (error) {
                reject(error);
            }
        });
    };

    const loginOutlookAndSaveProfileData = async () => {
        setIsOutlookSyncing(true);

        try {
            await outlookLoginAndSaveProfile();
            toast.success("Outlook synchronisé avec succès!");
        } catch (error) {
            console.error("Outlook sync failed:", error);
            toast.error("Échec de la synchronisation Outlook");
        } finally {
            setIsOutlookSyncing(false);
        }
    };

    return { loginOutlookAndSaveProfileData, isOutlookSyncing };
};

export default useOutlookAuth;

import CookieService from './CookieService';
export const getUserID = () => {
  return CookieService.get("user_id") || sessionStorage.getItem("user_id");
};

export const getLoggedInUser = () => {
  try {
    const user = CookieService.get("user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Error parsing user cookie", e);
    return null;
  }
};

export const getUserRoleID = () => {
  const user = getLoggedInUser();
  return user ? user.role_id : null;
};

export const getLoggedInUserId = () => {
  const user = getLoggedInUser();
  return user ? user.id : null;
};

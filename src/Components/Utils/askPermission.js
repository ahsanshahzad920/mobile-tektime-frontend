export const askPermission = (message) => {
    // Display a confirmation dialog with the provided message
    const isConfirmed = window.confirm(message);
    // Return true if confirmed, false otherwise
    return isConfirmed;
};

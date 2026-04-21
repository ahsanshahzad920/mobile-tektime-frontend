// Development Server
// const API_BASE_URL = "https://tektime-mo.digitalisolutions.net/api";
// const Assets_URL = "https://tektime-mo.digitalisolutions.net/";
// const NODE_API = `https://file.tektime.io/api/upload`;
//NODE_API(CLOUDINARY)
const NODE_API = `https://tektime-cloudinary-api.onrender.com/api/upload`;
//CLOUDINARY_API(FRONTEND)
const Cloudinary_URL = 'https://api.cloudinary.com/v1_1/drrk2kqvy/upload'

// Stage Server
// const API_BASE_URL = "https://stage-tektime.digitalisolutions.net/api"
// const Assets_URL = "https://stage-tektime.digitalisolutions.net/";

// Production Server
const API_BASE_URL = "https://api.tektime.io/api";
// const API_BASE_URL = "https://iziworlds.com/api";

const Assets_URL = "https://tektime-storage.s3.eu-north-1.amazonaws.com";


const CLIENT_ID = "e5a1a99f-9e33-4e5d-a7a9-1e2b1d9c36fa"; //Official Id
const REDIRECT_URI = "http://localhost:3000/auth/callback"; //For Localhost
// const REDIRECT_URI = "https://tektime-admin-eight.vercel.app/"; //for Admin Tektime

export { API_BASE_URL, Assets_URL, NODE_API, Cloudinary_URL, CLIENT_ID, REDIRECT_URI, };
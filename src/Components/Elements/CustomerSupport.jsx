import CookieService from '../Utils/CookieService';
// import React, { useEffect, useState } from "react";
// import { FiUploadCloud } from "react-icons/fi";
// import { API_BASE_URL, Assets_URL } from "../Apicongfig";
// import { toast } from "react-toastify";
// import axios from "axios";
// import {
//   Dropdown,
//   DropdownButton,
//   Table,
//   Modal,
//   Spinner,
//   Button,
// } from "react-bootstrap";
// import { MdDeleteOutline, MdModeEditOutline } from "react-icons/md";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaCheck } from "react-icons/fa";

// const CustomerSupport = () => {
//   const userId = CookieService.get("user_id");
//   console.log("userId", userId);
//   const [subject, setSubject] = useState("");
//   const [message, setMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [tickets, setTickets] = useState([]);
//   const [open, setOpen] = useState(false);
//   console.log("open", open);
//   const [ticketStatus, setTicketStatus] = useState({});
//   const [editingTicket, setEditingTicket] = useState(null);

//   // State to handle full-screen image preview
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [imageToPreview, setImageToPreview] = useState(null);

//   const getTickets = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/support/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${CookieService.get("token")}`,
//         },
//       });

//       if (response.status) {
//         console.log("response", response);
//         setTickets(response?.data?.data);
//         setTicketStatus(
//           response?.data?.data.reduce(
//             (acc, ticket) => ({ ...acc, [ticket.id]: ticket.status }),
//             {}
//           )
//         );
//         setLoading(false);
//       }
//     } catch (error) {
//       console.log("error while getting tickets", error);
//     }
//   };
//   useEffect(() => {
//     getTickets();
//   }, [userId]);
//   const validateForm = () => {
//     const errors = {};
//     if (!subject) {
//       errors.subject = "Subject is required.";
//       toast.error("Subject is required.");
//     }
//     if (!message) {
//       errors.message = "Message is required.";
//       toast.error("Message is required.");
//     }
//     // if (!file) {
//     //   errors.file = "File is required.";
//     //   toast.error("File is required.");
//     // }
//     setErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const [submit, setSubmit] = useState(false);
//   const handleSubmit = async (e) => {
//     setSubmit(true);
//     e.preventDefault();

//     if (!validateForm()) {
//       setSubmit(false);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("user_id", userId);
//     formData.append("subject", subject);
//     formData.append("message", message);

//     axios
//       .post(`${API_BASE_URL}/support`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${CookieService.get("token")}`,
//         },
//       })
//       .then(async (response) => {
//         toast.success("Support request submitted successfully.");
//         setOpen(false);
//         setSubmit(false);

//         setSubject("");
//         setMessage("");
//         setFile(null);
//         setPreview(null);
//         //   // Add the new ticket to the tickets state
//         //   setTickets((prevTickets) => [
//         //     ...prevTickets,
//         //     {
//         //       id: response?.data?.data?.id,
//         //       subject,
//         //       message,
//         //       file: response?.data?.data?.file,
//         //       status: "Pending", // Assuming the new ticket's status is "Pending"
//         //     },
//         //   ]);
//         //   setTicketStatus((prevStatus) => ({
//         //     ...prevStatus,
//         //     [response?.data?.data?.id]: "Pending", // Assuming the new ticket's status is "Pending"
//         //   }));
//         await getTickets();
//       })

//       .catch((error) => {
//         console.error("There was a problem with the submission:", error);
//         toast.error("There was a problem submitting your request.");
//         setSubmit(false);
//       });
//   };
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFile(file);
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setPreview(null);
//     }
//   };
//   const handleStatusChange = (ticketId, newStatus) => {
//     axios
//       .put(
//         `${API_BASE_URL}/support/${ticketId}`,
//         { status: newStatus },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${CookieService.get("token")}`,
//           },
//         }
//       )
//       .then((response) => {
//         console.log("Status updated:", response.data);
//         setTicketStatus({ ...ticketStatus, [ticketId]: newStatus });
//         setEditingTicket(null);
//       })
//       .catch((error) => {
//         console.error("Error updating status:", error);
//         toast.error("Error updating status");
//         setEditingTicket(null);
//       });
//   };

//   const handleEditClick = (ticketId) => {
//     setEditingTicket(ticketId);
//   };

//   const handleStatusInputChange = (e, ticketId) => {
//     setTicketStatus({ ...ticketStatus, [ticketId]: e.target.value });
//   };

//   const handleDeleteTicket = async (ticketId) => {
//     try {
//       const response = await axios.delete(
//         `${API_BASE_URL}/support/${ticketId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${CookieService.get("token")}`,
//           },
//         }
//       );
//       if (response.status) {
//         console.log("ticket deleted successfully");
//         setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   const toggleMenu = () => {
//     setOpen((prev) => !prev);
//   };

//   const openImageModal = (imageUrl) => {
//     setImageToPreview(imageUrl);
//     setShowImageModal(true);
//   };

//   const closeImageModal = () => {
//     setShowImageModal(false);
//     setImageToPreview(null);
//   };

//   const role = CookieService.get("type");

//   return (
//     <>
//       {loading ? (
//         <>
//           <Spinner
//             animation="border"
//             role="status"
//             className="center-spinner"
//           ></Spinner>
//         </>
//       ) : (
//         <div className="customer_support">
//           <div className="container">
//             {open || tickets?.length === 0 ? (
//               <>
//                 {tickets?.length !== 0 && (
//                   <div className="d-flex justify-content-end">
//                     <button
//                       className="ticket-btn"
//                       onClick={() => setOpen(false)}
//                     >
//                       View tickets
//                     </button>
//                   </div>
//                 )}
//                 <div
//                   // initial={{ opacity: 0, y: 20 }}
//                   // animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
//                   // exit={{ opacity: 0, y: 20 }}
//                   className="form"
//                 >
//                   <form onSubmit={handleSubmit}>
//                     <div className="email">
//                       <input
//                         type="text"
//                         placeholder="Subject"
//                         value={subject}
//                         onChange={(e) => setSubject(e.target.value)}
//                       />
//                     </div>
//                     <div className="message">
//                       <textarea
//                         placeholder="Message"
//                         value={message}
//                         onChange={(e) => setMessage(e.target.value)}
//                       ></textarea>
//                     </div>

//                     <div className="file">
//                       <label htmlFor="fileId">
//                         <h6>Upload Image</h6>
//                       </label>
//                       <input
//                         type="file"
//                         id="fileId"
//                         multiple
//                         onChange={handleFileChange}
//                       />
//                     </div>
//                     {preview && (
//                       <div className="preview">
//                         <img
//                           src={preview}
//                           alt="Preview"
//                           className="img-preview"
//                         />
//                       </div>
//                     )}
//                     <div className="submit">
//                       {submit ? (
//                         <>
//                           <div>
//                             <Button
//                               variant="dark"
//                               disabled
//                               style={{
//                                 backgroundColor: "#f0f0f0",
//                                 border: "none",
//                               }}
//                               className="w-100"
//                             >
//                               <Spinner
//                                 as="span"
//                                 variant="dark"
//                                 size="sm"
//                                 role="status"
//                                 aria-hidden="true"
//                                 animation="border"
//                               />
//                             </Button>
//                           </div>
//                         </>
//                       ) : (
//                         <button type="submit">Submit</button>
//                       )}
//                     </div>
//                   </form>
//                 </div>
//               </>
//             ) : (
//               <motion.div
//                 // initial={{ opacity: 0, y: 20 }}
//                 // animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
//                 // exit={{ opacity: 0, y: 20 }}
//                 className="listing"
//                 style={{ display: open ? "none" : "block" }}
//               >
//                 {role === "User" && (
//                   <div className="d-flex justify-content-end">
//                     <button
//                       className="ticket-btn"
//                       onClick={() => setOpen(true)}
//                     >
//                       Create ticket
//                     </button>
//                   </div>
//                 )}
//                 {tickets?.length > 0 && (
//                   <div className="row mt-4">
//                     <div className="col-md-12">
//                       <Table bordered>
//                         <thead>
//                           <tr className="table-row">
//                             <th>#</th>
//                             <th>Subject</th>
//                             <th>Message</th>
//                             <th>File</th>
//                             <th>Status</th>
//                           {role !== "User" && <th className="text-center">Action</th>}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {tickets?.map((user, index) => (
//                             <tr className="table-data" key={user?.id}>
//                               <td>{index + 1}</td>
//                               <td>{user?.subject}</td>
//                               <td>{user?.message}</td>
//                               <td className="preview">
//                                 <motion.img
//                                   className="img-preview"
//                                   src={Assets_URL + "/" + user?.file}
//                                   alt="img"
//                                   onClick={() =>
//                                     openImageModal(
//                                       Assets_URL + "/" + user?.file
//                                     )
//                                   }
//                                   style={{ cursor: "pointer" }}
//                                 />
//                               </td>
//                               <td>
//                                 {/* <span
//                             className={
//                               user.status === "Resolved" ? "green" : "red"
//                             }
//                           >
//                             {user.status}
//                           </span> */}
//                                 {editingTicket === user.id && role !== "User"   ? (
//                                   <input
//                                     type="text"
//                                     value={ticketStatus[user.id]}
//                                     onChange={(e) =>
//                                       handleStatusInputChange(e, user.id)
//                                     }
//                                     onBlur={() =>
//                                       handleStatusChange(
//                                         user.id,
//                                         ticketStatus[user.id]
//                                       )
//                                     }
//                                     autoFocus
//                                     style={{
//                                       padding: "1px 5px",
//                                       border: 0,
//                                       boxShadow: "0px 0px 2px 0px black",
//                                       fontSize: "16px",
//                                       fontFamily: "Roboto",
//                                       fontWeight: 400,
//                                       outline: "none",
//                                     }}
//                                   />
//                                 ) : (
//                                   <span
//                                     onClick={() => handleEditClick(user.id)}
//                                     // className={
//                                     //   user.status === "resolved"
//                                     //     ? "green"
//                                     //     : "red"
//                                     // }
//                                     className={ticketStatus[user.id] === "resolved" ? "green" : "red"}
//                                     style={{  cursor: role !== "User" && "pointer" }}
//                                   >
//                                     {ticketStatus[user.id]}
//                                   </span>
//                                 )}
//                               </td>
//                              {role !== "User" &&  <td className="text-center">
//                                 <div className="actions-list gap-2">
//                                   <MdDeleteOutline
//                                     color="red"
//                                     size={24}
//                                     style={{ cursor: "pointer" }}
//                                     onClick={() => handleDeleteTicket(user.id)}
//                                   />
                                 
//                                 </div>
                                
//                               </td>}
//                             </tr>
//                           ))}
//                         </tbody>
//                       </Table>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             )}
//           </div>

//           <Modal
//             show={showImageModal}
//             onHide={closeImageModal}
//             size="xl"
//             // dialogClassName="image-modal"
//             centered
//             style={{ height: "auto" }}
//             className="modal-fade customer-modal" /* Add this class for transparency */
//           >
//             <Modal.Header closeButton></Modal.Header>
//             <Modal.Body>
//               <img
//                 src={imageToPreview}
//                 alt="Preview"
//                 height="auto"
//                 width="100%"
//                 className="full-screen-img"
//                 style={{
//                   maxHeight: "80vh",
//                   width: "100%",
//                   objectFit: "contain",
//                 }}
//               />
//             </Modal.Body>
//           </Modal>
//         </div>
//       )}
//     </>
//   );
// };

// export default CustomerSupport;

// const users = [
//   {
//     id: 1,
//     subject: "Name",
//     email: "abc@mail.com",
//     message: "Please enter any message",
//     status: "pending",
//   },
//   {
//     id: 2,
//     subject: "Name",
//     email: "abc@mail.com",
//     message: "Please enter any message",
//     status: "pending",
//   },
//   {
//     id: 3,
//     subject: "Name",
//     email: "abc@mail.com",
//     message: "Please enter any message",
//     status: "pending",
//   },
//   {
//     id: 4,
//     subject: "Name",
//     email: "abc@mail.com",
//     message: "Please enter any message",
//     status: "Resolved",
//   },
//   {
//     id: 5,
//     subject: "Name",
//     email: "abc@mail.com",
//     message: "Please enter any message",
//     status: "Resolved",
//   },
//   // {
//   //   id: 6,
//   //   name: "Name",
//   //   email: "abc@mail.com",
//   //   phone: "+1 234 456 7899",
//   //   status: "Inactive",
//   //   lastSeen: "4 days ago",
//   // },
//   // {
//   //   id: 7,
//   //   name: "Name",
//   //   email: "abc@mail.com",
//   //   phone: "+1 234 456 7899",
//   //   status: "Active",
//   //   lastSeen: "4 days ago",
//   // },
//   // {
//   //   id: 8,
//   //   name: "Name",
//   //   email: "abc@mail.com",
//   //   phone: "+1 234 456 7899",
//   //   status: "Active",
//   //   lastSeen: "4 days ago",
//   // },
//   // {
//   //   id: 9,
//   //   name: "Name",
//   //   email: "abc@mail.com",
//   //   phone: "+1 234 456 7899",
//   //   status: "Inactive",
//   //   lastSeen: "4 days ago",
//   // },
//   // {
//   //   id: 10,
//   //   name: "Name",
//   //   email: "abc@mail.com",
//   //   phone: "+1 234 456 7899",
//   //   status: "Active",
//   //   lastSeen: "4 days ago",
//   // },
// ];

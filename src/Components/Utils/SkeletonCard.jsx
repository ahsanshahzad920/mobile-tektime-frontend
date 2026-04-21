// import { Avatar } from "antd";
// import { Card } from "react-bootstrap";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// const SkeletonCards = () => {
//     const placeholderData = [1, 2]; // Array with 2 items to map
  
//     return (
//       <>
//         {placeholderData.map((item, index) => (
//           <Card key={index} className="my-3">
//             <div className="row">
//               <div className="col-md-12 col-lg-12 first-row">
//                 <div className="first">
//                   <span className="destination_name">
//                     <span className="destination_status">
//                       <span>
//                         <Skeleton />
//                       </span>
//                     </span>
//                   </span>
  
//                   <div className="options">
//                     <span>
//                       <Skeleton />
//                     </span>
//                     <div className="dropdown dropstart">
//                       <Skeleton />
//                     </div>
//                   </div>
//                 </div>
//                 <span
//                   style={{
//                     fontFamily: "Roboto",
//                     fontSize: "14px",
//                     fontWeight: 700,
//                     lineHeight: "16.41px",
//                     textAlign: "left",
//                     color: "#5c5c5c",
//                   }}
//                 >
//                   <Skeleton />
//                 </span>
//               </div>
//               <div className="col-md-12 col-lg-12 second-row">
//                 <div className="second">
//                   <p className="description">
//                     <Skeleton />
//                   </p>
//                 </div>
//               </div>
//               <div className="col-md-12 col-lg-12 third-row">
//                 <div className="row">
//                   <div className="col-md-6">
//                     <Skeleton />
//                   </div>
//                   <div className="col-md-6"></div>
//                   <div className="col-md-6 d-flex align-items-center">
//                     <div className="guide">
//                       <Avatar
//                         size="large"
//                         style={{ backgroundColor: "#ebebeb" }}
//                       />
//                       <Skeleton />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </>
//     );
//   };
  
//   export default SkeletonCards;
  
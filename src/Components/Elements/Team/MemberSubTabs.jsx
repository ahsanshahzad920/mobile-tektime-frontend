import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import CurrentTeamsSubTabs from './CurrentTeamsSubTabs';

const MemberSubTabs = () => {
      const [tab, setTab] = useState("tab1");
      const [t] = useTranslation("global");
    
  return (
     <div className="tabs-container">
         <div className="border-bottom tabs-meeting">
           <div className="tabs" style={{ overflowX: "auto" }}>
             <div className="d-flex">
               <button
                 className={`tab ${tab === "tab1" ? "active" : ""}`}
                 onClick={() => setTab("tab1")}
               >
                 {t("team.ourteams_subtabs.currentteams")}
                 <span className={tab === "tab1" ? "future" : "draft"}>
                   {/* {activeMeetingCount} */}
                 </span>
               </button>
               <button
                 className={`tab ${tab === "tab2" ? "active" : ""}`}
                 onClick={() => setTab("tab2")}
               >
                 {t("team.ourteams_subtabs.archivedteams")}
                 <span className={tab === "tab2" ? "future" : "draft"}>
                   {/* {closedMeetingCount} */}
                 </span>
               </button>
             
             </div>
           </div>
         </div>
   
         <div className="content">
           {tab === "tab1" && (
             <div>
<CurrentTeamsSubTabs/>
             </div>
           )}
           {tab === "tab2" && (
             <div>
               {/* <CompletedMeetings
                 allClosedMeetings={closedFilteredMeetings}
                 calendar={calendar}
                 activeTab={tab}
               /> */}
             </div>
           )}
         </div>
       </div>
  )
}

export default MemberSubTabs

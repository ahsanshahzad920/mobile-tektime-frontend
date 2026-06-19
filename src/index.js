import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-toastify/dist/ReactToastify.css";

import "./style/main.scss";
import "antd/dist/reset.css";
import { HeaderTitleProvider } from "./context/HeaderTitleContext";
import { DraftMeetingsProvider } from "./context/DraftMeetingContext";
import { TotalTimeProvider } from "./context/TotalTimeContext";
import { StepProvider } from "./context/stepContext";
import { StepProvider1 } from "./context/Step";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MeetingsProvider } from "./context/MeetingsContext";
import { TabsProvider } from "./context/TabContext";
import { UserProvider } from "./context/UserContext";
import { DestinationTabsProvider } from "./context/DestinationTabContext";
import { MeetingTabsProvider } from "./context/MeetingTabsContext";
import { SidebarProvider } from "./context/SidebarContext";
import { DestinationsProvider } from "./context/DestinationsContext";
import { SolutionsProvider } from "./context/SolutionsContext";
import { FormProvider } from "./context/CreateMeetingContext";
import { SolutionFormProvider } from "./context/CreateSolutionContext";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { RecordingProvider } from "./context/RecordingContext";
import { SnackbarProvider } from "notistack";
import { EnterpriseCountProvider } from "./context/EnterpriseUserCountContext";
import { StepCounterContextProvider } from "./Components/Elements/Meeting/context/StepCounterContext";
import { WakeLockProvider } from "./context/WakeLockContext";
import { Assets_URL, Assets_URL_B3 } from "./Components/Apicongfig";

// Global capture-phase error listener for asset fallback handling
window.addEventListener(
  "error",
  (e) => {
    const element = e.target;
    if (element && (element.tagName === "IMG" || element.tagName === "VIDEO" || element.tagName === "AUDIO")) {
      // Prevent infinite loops if both S3 and B2 URLs fail
      if (element.dataset.fallbackAttempted) {
        return;
      }
      
      const currentSrc = element.src;
      if (currentSrc && currentSrc.includes(Assets_URL)) {
        const target = currentSrc.includes(Assets_URL + "/") ? Assets_URL + "/" : Assets_URL;
        const newSrc = currentSrc.replace(target, Assets_URL_B3);
        
        if (element.src !== newSrc) {
          element.dataset.fallbackAttempted = "true";
          element.src = newSrc;
          
          // For video and audio elements, calling load() is required to reload the source
          if (typeof element.load === "function") {
            element.load();
          }
        }
      }
    }
  },
  true // Capture phase to intercept error events which do not bubble
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
    autoHideDuration={5000}
  >
    <GoogleOAuthProvider clientId="870894360285-luupi2ab19n5npi26mueq5bevuejht1d.apps.googleusercontent.com">
      <I18nextProvider i18n={i18next}>
        <BrowserRouter>
          <WakeLockProvider>
            <StepCounterContextProvider>
              <SidebarProvider>
                <RecordingProvider>
                  <EnterpriseCountProvider>
                    <DestinationsProvider>
                      <SolutionsProvider>
                        <MeetingsProvider>
                          <TabsProvider>
                            <MeetingTabsProvider>
                              <DestinationTabsProvider>
                                <UserProvider>
                                  <StepProvider1>
                                    <StepProvider>
                                      <TotalTimeProvider>
                                        <DraftMeetingsProvider>
                                          <HeaderTitleProvider>
                                            <SolutionFormProvider>
                                              <FormProvider>
                                                <App />
                                              </FormProvider>
                                            </SolutionFormProvider>
                                          </HeaderTitleProvider>
                                        </DraftMeetingsProvider>
                                      </TotalTimeProvider>
                                    </StepProvider>
                                  </StepProvider1>
                                </UserProvider>
                              </DestinationTabsProvider>
                            </MeetingTabsProvider>
                          </TabsProvider>
                        </MeetingsProvider>
                      </SolutionsProvider>
                    </DestinationsProvider>
                  </EnterpriseCountProvider>
                </RecordingProvider>
              </SidebarProvider>
            </StepCounterContextProvider>
          </WakeLockProvider>
        </BrowserRouter>
      </I18nextProvider>

    </GoogleOAuthProvider>
  </SnackbarProvider>
);

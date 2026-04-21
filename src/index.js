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

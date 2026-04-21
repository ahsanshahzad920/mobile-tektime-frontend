import React from "react";
import "./PlayMeeting.scss";
import CounterContainer from "./components/CounterContainer";
import { useParams } from "react-router-dom";
import { useCounterContext } from "../context/CounterContext";

// COMPONENT STARTS HERE.
const PlayMeeting = () => {
  console.log('play 2')
  const {
    meetingData,
    savedTime,
    setMeetingData,
    activeStepIndex,
    setActiveStepIndex,
  } = useCounterContext();
  const { id } = useParams();

  // HANDLER FUNCTIONS:
  const btnNextClickHandler = () => {
    const stepsArray = meetingData.steps;
    if (activeStepIndex !== stepsArray?.length - 1) {
      let stepsArray = meetingData.steps;
      const activeStep = stepsArray[activeStepIndex];
      activeStep.savedTime = parseInt(savedTime);
      stepsArray[activeStepIndex] = activeStep;
      setMeetingData((prevState) => {
        return {
          ...prevState,
          steps: stepsArray,
        };
      });

      // STEP 2: SET ACTIVE STEP:
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
    } else {
      return;
    }
  };
  const btnPreviousClickHandler = () => {
    if (activeStepIndex !== 0) {
      let stepsArray = meetingData.steps;
      const activeStep = stepsArray[activeStepIndex];
      activeStep.savedTime = parseInt(savedTime);
      stepsArray[activeStepIndex] = activeStep;
      setMeetingData((prevState) => {
        return {
          ...prevState,
          steps: stepsArray,
        };
      });
      //STEP@: SET ACTIVE STEP:
      const previousIndex = activeStepIndex - 1;
      setActiveStepIndex(previousIndex);
    }
  };

  return (
    <main className="card play__meeting tektime">
      <header className="text-center my-4">
        <h4>
          Perferendis consecte &gt; Anim aut rerum itaqu &gt;
          {Array.isArray(meetingData.steps) &&
            meetingData.steps?.length > 0 &&
            meetingData.steps[activeStepIndex].title}
        </h4>
      </header>
      {/* GRID */}
      <div className="row p-4">
        {/* LEFT __DANGEROUS HTML */}
        <section className="col-md-8 html-wrapper">
          <div
            className="html-content displaycard"
            dangerouslySetInnerHTML={{
              __html:
                Array.isArray(meetingData.steps) &&
                meetingData.steps?.length > 0 &&
                meetingData.steps[activeStepIndex].editor_content,
            }}
          ></div>
        </section>
        {/* RIGHT COUNTERS */}
        <section className="col-md-4">
          {/* COUNTERS CONTAINER */}
          <CounterContainer />
          {/* MEETING INFO */}
          <div className="col gap-4">
            <label htmlFor="stepName" className="form-label">
              Prochaine étape
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Prochaine étape"
            />
            <label>Temps prévu de la prochaine étape</label>
            <input
              type="text"
              className="form-control"
              placeholder="circle   Temps prévu de la prochaine étape"
            />
          </div>
          {/* BUTTONS CONTAINER NEXT/PREVIUS STEP */}
          <div className="d-flex gap-2 w-100 justify-content-center mt-4">
            <button
              className="btn btn-lg btn-primary"
              onClick={btnPreviousClickHandler}
            >
              Previous
            </button>
            <button
              className="btn btn-lg btn-primary"
              onClick={btnNextClickHandler}
            >
              Next
            </button>
          </div>
          {/* Notes Container */}
          <div>
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              className="form-control"
              placeholder="Notes"
              rows={5}
            ></textarea>
          </div>
          {/* Decisions Container */}
          <div>
            <label htmlFor="decisions" className="form-label">
              Decisions
            </label>
            <textarea
              className="form-control"
              placeholder="Decisions"
              rows={5}
            ></textarea>
          </div>
          {/* PlandActions Container */}
          <div></div>
        </section>
      </div>
    </main>
  );
};

export default PlayMeeting;

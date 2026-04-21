import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const StepContext = createContext();

export const useSteps = () => useContext(StepContext);

export const StepProvider1 = ({ children }) => {
  const [steps, setSteps] = useState([]);
  const [solutionSteps, setSolutionSteps] = useState([]);
  const [solutionId, setSolutionId] = useState(null);
  const [solutionType, setSolutionType] = useState(null);
  const [solutionNote, setSolutionNote] = useState('Manual');
  const [solutionNoteTaker, setSolutionNoteTaker] = useState(false);
  const [solutionShareBy, setSolutionShareBy] = useState(null);
  const [solutionAlarm, setSolutionAlarm] = useState(false);
  const [solutionFeedback, setSolutionFeedback] = useState(false);
  const [solutionRemainder, setSolutionRemainder] = useState(false);
  const [solutionNotification, setSolutionNotification] = useState(false);
  const [solutionMessageManagement, setSolutionMessageManagement] = useState(false);
  const [solutionTitle, setSolutionTitle] = useState(null);
  const [solutionPlayback, setSolutionPlayback] = useState("manual");
  const [solutionAutostart, setSolutionAutostart] = useState(false);
  const [solutionAutomaticStrategy, setSolutionAutomaticStrategy] = useState(false);
  const [solutionAutomaticInstruction, setSolutionAutomaticInstruction] = useState(false);

  const updateSteps = useCallback((newSteps) => {
    setSteps(newSteps);
  }, []);

  const updateSolutionSteps = useCallback((newSolutionSteps) => {
    setSolutionSteps(newSolutionSteps);
  }, []);

  const contextValue = useMemo(() => ({
    steps,
    updateSteps,
    solutionSteps,
    updateSolutionSteps,
    setSolutionType,
    solutionType,
    setSolutionNote,
    solutionNote,
    solutionNoteTaker,
    setSolutionNoteTaker,
    setSolutionShareBy,
    solutionShareBy,
    setSolutionAlarm,
    solutionFeedback,
    setSolutionFeedback,
    solutionRemainder,
    setSolutionRemainder,
    solutionNotification,
    setSolutionNotification,
    solutionAlarm,
    solutionTitle,
    setSolutionTitle,
    solutionPlayback,
    setSolutionPlayback,
    solutionAutostart,
    setSolutionAutostart,
    solutionAutomaticStrategy,
    setSolutionAutomaticStrategy,
    setSolutionMessageManagement,
    solutionMessageManagement,
    setSolutionId,
    solutionId,
    solutionAutomaticInstruction,
    setSolutionAutomaticInstruction
  }), [
    steps, updateSteps, solutionSteps, updateSolutionSteps, solutionType, solutionNote, 
    solutionNoteTaker, solutionShareBy, solutionAlarm, solutionFeedback, solutionRemainder, 
    solutionNotification, solutionTitle, solutionPlayback, solutionAutostart, 
    solutionAutomaticStrategy, solutionMessageManagement, solutionId, solutionAutomaticInstruction
  ]);

  return (
    <StepContext.Provider value={contextValue}>
      {children}
    </StepContext.Provider>
  );
};

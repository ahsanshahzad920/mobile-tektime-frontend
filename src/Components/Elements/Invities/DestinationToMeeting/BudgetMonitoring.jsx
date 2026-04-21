import React, { useEffect, useState } from "react";
import CostChart from "./Chart";
import { useTranslation } from "react-i18next";
import { formatMissionDate } from "../../../Utils/MeetingFunctions";

const BudgetMonitoring = ({
  budget,
  destination,
  meetings,
  participants,
  loggedInUserId,
  activeTab,
}) => {
  const [t] = useTranslation("global");
  //For Total
  const [totalCosts, setTotalCosts] = useState({});
  //For COmpleted
  const [completedCosts, setCompletedCosts] = useState({});
  //For Remaining
  const [remainingCosts, setRemainingCosts] = useState({});

  // -------------------------------------------------------FOR TOTAL
  function calculateParticipantTotalDaysAndCost(meetings, participants) {
  if (!meetings?.length || !participants?.length) {
    return { participantTimes: {}, participantCosts: {} }; // safe fallback
  }

    // Objects to store total days and total cost for each participant
    const participantTimes = {};
    const participantCosts = {};

    // Iterate through all meetings
    meetings.forEach((meeting) => {
      meeting.steps?.forEach((step) => {
        console.clear();

        const participantId = step.userPID;
        // const dailyCost = step.daily_cost || 0; // Default to 0 if no cost provided
        // Find the participant in the `participants` array
        const participant = participants?.find(
          (p) => p.user_id === participantId
        );
        const dailyCost = participant ? participant.daily_rates : 0; // Use 0 if no participant found

        // Initialize participant's time and cost if not exists
        if (!participantTimes[participantId]) {
          participantTimes[participantId] = 0;
          participantCosts[participantId] = 0;
        }

        let timeInDays = 0;

        // Handle different step statuses
        if (
          step.step_status === "completed" ||
          step.step_status === "in_progress"
        ) {
          if (step.time_taken) {
            const timeParts = step.time_taken.split(" - ");
            timeParts.forEach((part) => {
              const [value, unit] = part.split(" ");
              const numValue = parseFloat(value);

              switch (unit.toLowerCase()) {
                case "day":
                case "days":
                  timeInDays += numValue;
                  break;
                case "hour":
                case "hours":
                  timeInDays += numValue / 24;
                  break;
                case "min":
                case "mins":
                case "minute":
                case "minutes":
                  timeInDays += numValue / (24 * 60);
                  break;
                case "sec":
                case "secs":
                case "second":
                case "seconds":
                  timeInDays += numValue / (24 * 60 * 60);
                  break;
              }
            });
          }
        } else if (step.step_status === null || step.step_status === "todo") {
          let convertedValue = step.count2 || 0;
          switch (step.time_unit?.toLowerCase()) {
            case "days":
              timeInDays += convertedValue;
              break;
            case "hours":
              timeInDays += convertedValue / 24;
              break;
            case "minutes":
              timeInDays += convertedValue / (24 * 60);
              break;
            case "seconds":
              timeInDays += convertedValue / (24 * 60 * 60);
              break;
          }
        }

        participantTimes[participantId] += timeInDays;
        participantCosts[participantId] += timeInDays * Number(dailyCost); // Multiply by daily cost

      });
    });

    // Round to 2 decimal places
    Object.keys(participantTimes).forEach((participantId) => {
      participantTimes[participantId] = Number(participantTimes[participantId]);
      participantCosts[participantId] = Number(participantCosts[participantId]);
    });

    return { participantTimes, participantCosts };
  }

  //Total Cost
  useEffect(() => {
    if (meetings?.length > 0 || participants?.length > 0) {
      const { participantCosts } =
        calculateParticipantTotalDaysAndCost(meetings, participants);
      setTotalCosts(participantCosts);
    }
  }, [meetings, participants, activeTab]);

  // -------------------------------------------------------FOR COMPLETED
  function calculateParticipantCompletedDaysAndCost(meetings, participants) {
    if (!meetings?.length || !participants?.length) return;

    // Objects to store total days and total cost for each participant
    const participantTimes = {};
    const participantCosts = {};

    // Iterate through all meetings
    meetings.forEach((meeting) => {
      meeting.steps?.forEach((step) => {
        if (step.step_status !== "completed") return; //  Only consider completed steps

        const participantId = step.userPID;

        // Find the participant in the `participants` array
        const participant = participants.find(
          (p) => p.user_id === participantId
        );
        const dailyCost = participant ? Number(participant.daily_rates) : 0; // Use 0 if no participant found

        // Initialize participant's time and cost if not exists
        if (!participantTimes[participantId]) {
          participantTimes[participantId] = 0;
          participantCosts[participantId] = 0;
        }

        let timeInDays = 0;

        // Process `time_taken` if available
        if (step.time_taken) {
          const timeParts = step.time_taken.split(" - ");
          timeParts.forEach((part) => {
            const [value, unit] = part.split(" ");
            const numValue = parseFloat(value);

            switch (unit.toLowerCase()) {
              case "day":
              case "days":
                timeInDays += numValue;
                break;
              case "hour":
              case "hours":
                timeInDays += numValue / 24;
                break;
              case "min":
              case "mins":
              case "minute":
              case "minutes":
                timeInDays += numValue / (24 * 60);
                break;
              case "sec":
              case "secs":
              case "second":
              case "seconds":
                timeInDays += numValue / (24 * 60 * 60);
                break;
            }
          });
        }

        // Update totals
        participantTimes[participantId] += timeInDays;
        participantCosts[participantId] += timeInDays * dailyCost; // Multiply by daily cost

      });
    });

    // Round values to 2 decimal places
    Object.keys(participantTimes).forEach((participantId) => {
      participantTimes[participantId] = Number(participantTimes[participantId]);
      participantCosts[participantId] = Number(participantCosts[participantId]);
    });

    return { participantTimes, participantCosts };
  }

  //CompletedCosts
  useEffect(() => {
    if (meetings?.length > 0 && participants?.length > 0) {
      const { participantCosts } =
        calculateParticipantCompletedDaysAndCost(meetings, participants);
      setCompletedCosts(participantCosts); 
    }
  }, [meetings, participants, activeTab]);

  // -------------------------------------------------------FOR REMAINING
  function calculateParticipantRemainingDaysAndCost(meetings, participants) {
    if (!meetings?.length || !participants?.length) return;

    // Objects to store total days and total cost for each participant
    const participantTimes = {};
    const participantCosts = {};

    // Iterate through all meetings
    meetings.forEach((meeting) => {
      meeting.steps?.forEach((step) => {
        if (step.step_status !== "todo" && step.step_status !== null) return; //  Only consider "todo" and null steps

        const participantId = step.userPID;

        // Find the participant in the `participants` array
        const participant = participants.find(
          (p) => p.user_id === participantId
        );
        const dailyCost = participant ? Number(participant.daily_rates) : 0; // Use 0 if no participant found

        // Initialize participant's time and cost if not exists
        if (!participantTimes[participantId]) {
          participantTimes[participantId] = 0;
          participantCosts[participantId] = 0;
        }

        let timeInDays = 0;

        let convertedValue = step.count2 || 0;
        switch (step.time_unit?.toLowerCase()) {
          case "days":
            timeInDays += convertedValue;
            break;
          case "hours":
            timeInDays += convertedValue / 24;
            break;
          case "minutes":
            timeInDays += convertedValue / (24 * 60);
            break;
          case "seconds":
            timeInDays += convertedValue / (24 * 60 * 60);
            break;
        }

        // Update totals
        participantTimes[participantId] += timeInDays;
        participantCosts[participantId] += timeInDays * dailyCost; // Multiply by daily cost
      });
    });

    // Round values to 2 decimal places
    Object.keys(participantTimes).forEach((participantId) => {
      participantTimes[participantId] = Number(participantTimes[participantId]);
      participantCosts[participantId] = Number(participantCosts[participantId]);
    });

    return { participantTimes, participantCosts };
  }

  // setRemainingCosts
  useEffect(() => {
    if (meetings?.length > 0 && participants?.length > 0) {
      const { participantCosts } =
        calculateParticipantRemainingDaysAndCost(meetings, participants);
      setRemainingCosts(participantCosts); // Assuming you have a setRemainingCosts state
    }
  }, [meetings, participants, activeTab]);

 const formatCost = (cost) => {
  // Handle undefined/null/empty cases
  if (cost === undefined || cost === null) return;
  
  // Convert to number if it's a string
  const numericCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  
  // Handle NaN cases after conversion
  if (isNaN(numericCost)) return;
  
  // Explicit check for 0
  if (numericCost === 0) return "0";
  
  // Handle very small non-zero values
  if (numericCost < 0.01 && numericCost > 0) {
    return numericCost.toFixed(4); // Round to 4 decimal places
  }
  
  // Default case - round to 2 decimal places
  return numericCost.toFixed(2);
};

  const totalCostSum = Object.values(totalCosts).reduce(
    (acc, cost) => acc + cost,
    0
  );
  const completedCostSum = Object.values(completedCosts).reduce(
    (acc, cost) => acc + cost,
    0
  );
  const remainingCostSum = Object.values(remainingCosts).reduce(
    (acc, cost) => acc + cost,
    0
  );

  return (
    <div>
       {/* {destination?.initial_budget && (
      <>
        <p className="fw-bold">
          {t("budget.Initial Budget")}: {destination?.initial_budget}{" "}
          {destination?.currency || "EUR"}
        </p>
      </>
    )} */}

      {/* <div>
        <p className="fw-bold">
          {t("budget.Total Estimated Cost")}: {formatCost(budget?.destination?.total_cost)} {destination?.currency}
        </p>

        <p className="fw-bold">
          {t("budget.Cost Consume")}: {formatCost(budget?.destination?.consumed_cost)} {destination?.currency}
        </p>

        <p className="fw-bold">
          {t("budget.Cost Remaining")}: {formatCost(budget?.destination?.remaining_cost)} {destination?.currency}
        </p>
      </div> */}

      <CostChart
        initialBudget={Number(destination?.initial_budget)}
        totalBudget={formatCost(budget?.destination?.total_cost)}
        usedBudget={formatCost(budget?.destination?.consumed_cost)}
        remainingBudget={formatCost(budget?.destination?.remaining_cost)}
        startDate={formatMissionDate(destination?.meeting_start_date)}
        endDate={formatMissionDate(destination?.meeting_end_date)}
        budgetHistory={destination?.budget_histories}
        destination={destination}
      />
    </div>
  );
};

export default BudgetMonitoring;

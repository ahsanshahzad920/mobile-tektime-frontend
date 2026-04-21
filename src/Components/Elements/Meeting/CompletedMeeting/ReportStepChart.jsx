import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";

import { useTranslation } from "react-i18next";

import {
  convertCount2ToSeconds,
  parseTimeTaken,
} from "../../../Utils/MeetingFunctions";
import moment from "moment";

const ReportStepChart = ({ data, meeting }) => {
  const [t] = useTranslation("global");

  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (meeting) {
      const { steps } = meeting;
      let accumulatedCount2 = steps?.length > 0 ? steps[0]?.count2 : 0;
      let storedTime = moment(meeting?.start_time, "HH:mm"); // Initialize stored time
      const formattedData = steps
        ?.map((step, index) => {
          let count1 = 0;
          let count2 = step.count2;

          if (index > 0) {
            accumulatedCount2 += step.count2;
            count1 = accumulatedCount2 - count2;
          }

          // Calculate new stored time if selectedIndex > 0
          if (index === selectedIndex) {
            storedTime.add(count1, "minutes");
          }

          return {
            x: step.title,
            y: [count1, count1 + count2, count2],
            // unit: step.time_unit,
          };
        })
        .reverse();
      setChartData(formattedData);
    }
  }, [meeting, selectedIndex]);

  const colors = useMemo(() => {
    if (!meeting?.steps) return [];
    return meeting.steps
      .map((step) => {
        const timeTakenInSeconds = parseTimeTaken(step?.time_taken);
        const count2InSeconds = convertCount2ToSeconds(
          step?.count2,
          step?.time_unit
        );
        return timeTakenInSeconds > count2InSeconds ? "#FF4560" : "#00E396";
      })
      .reverse();
  }, [meeting]);
  const localizeTimeTaken = (timeTaken) => {
    if (!timeTaken) return;
    const timeUnits = t("time_unit", { returnObjects: true });
    return timeTaken
      .split(" - ")
      .map((part) => {
        const [count, ...unitParts] = part.split(" ");
        const unit = unitParts.join(" ");
        console.log("units", unit);
        return `${count} ${timeUnits[unit] || unit}`;
      })
      .join(" - ");
  };

  const options = {
    xaxis: {
      type: "category",
      labels: {
        show: false,
        formatter: function (val, index, opts) {
          const step = meeting?.steps[index];
          const timeTaken = step?.time_taken || "";
          const firstValue = timeTaken.split(" - ")[0]; // Get the first value before the dash

          return firstValue;
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        formatter: function (val, index) {
          return val;
        },
      },
    },
    chart: {
      height: 650,
      zoom: false,
      type: "rangeBar",
      events: {
        click: (event, chartContext, config) => {
          const { dataPointIndex } = config;
          if (dataPointIndex >= 0 && dataPointIndex < chartData.length) {
            const updatedSelectedIndex = chartData.length - 1 - dataPointIndex;
            setSelectedIndex(updatedSelectedIndex);
            navigate(`/step/${meeting?.steps[updatedSelectedIndex]?.id}`, {
              state: { meeting: meeting },
            });
          }
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 15,
        barHeight: 35,
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      intersect: true,
      x: {
        show: true,
        formatter: function (val, opts) {
          return val; // Or any specific logic for x-axis tooltip
        },
      },
      y: {
        formatter: function (val, opts) {
          let step;
          let sanitizedTimeTaken = 0; // Default message

          if (meeting?.steps && opts && opts.dataPointIndex !== undefined) {
            const reversedIndex =
              meeting?.steps?.length - 1 - opts.dataPointIndex;
            step = meeting?.steps[reversedIndex];
          }
          return sanitizedTimeTaken && sanitizedTimeTaken;
        },
      },
    },
    grid: { row: { colors: ["#fff", "#fff"], opacity: 1 } },
    dataLabels: {
      enabled: true,
      style: { colors: ["black"] },
      formatter: (val, opts) => {
        const reversedIndex = meeting?.steps?.length - 1 - opts.dataPointIndex;
        const step = meeting?.steps[reversedIndex];
        if (step) {
          const localizedTimeTaken =
            localizeTimeTaken(step.time_taken?.replace("-", "")) || "";
          const count2 = step.count2 || "";
          const timeUnit = t(`time_unit.${step.time_unit}`) || "";
          return `${localizedTimeTaken} ${
            meeting?.type === "Special" || meeting?.type === "Law" ? " " : "/"
          } ${count2} ${timeUnit}`.trim();
        }
        return "";
      },
    },

    colors: colors,
  };

  return (
    <>
      <div
        id="chart-container"
        className="chart-content"
        style={{
          width: "100%",
          height: "auto",
          overflow: "hidden",
          border: "1px solid #ececec",
          borderRadius: "15px",
          marginTop: "40px",
          padding: "10px",
        }}
      >
        <ReactApexChart
          options={options}
          key={meeting?.steps && JSON.stringify(meeting?.steps)}
          series={[{ data: chartData }]}
          type="rangeBar"
          height={500}
        />
      </div>
    </>
  );
};

export default ReportStepChart;

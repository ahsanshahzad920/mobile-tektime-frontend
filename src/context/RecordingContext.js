import React, { createContext, useRef, useState, useContext } from "react";
import { getBrowserInfo, getDeviceType } from "../Helpers/Recording";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const RecordingContext = createContext();

export const RecordingProvider = ({ children }) => {
  const [t] = useTranslation("global");
  const micStream = useRef(null);
  const systemStream = useRef(null);
  const recorder = useRef(null);
  const audioContext = useRef(null);
  const gainNode = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordedChunks = useRef([]);

  const startRecording = async () => {
    const browser = getBrowserInfo();
    console.log(
      `You are using ${browser.name} version ${browser.version} and platform ${browser.platform}`
    );

    const deviceType = getDeviceType();

    try {
      if (deviceType === "Mobile") {
        micStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (!micStream.current) {
          throw new Error("Failed to get microphone stream.");
        }

        audioContext.current = new AudioContext();
        const micSource = audioContext.current.createMediaStreamSource(
          micStream.current
        );

        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.setValueAtTime(
          1,
          audioContext.current.currentTime
        );

        micSource.connect(gainNode.current);

        const dest = audioContext.current.createMediaStreamDestination();
        gainNode.current.connect(dest);

        const mixedStream = dest.stream;
        recorder.current = new MediaRecorder(mixedStream);
        recorder.current.start();

        recorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
          }
        };

        setIsRecording(true);
      } else {
        if (browser.name === "Chrome" || browser.name === "Edge") {
          systemStream.current = await navigator.mediaDevices.getDisplayMedia({
            video: {
              displaySurface: "monitor",
            },
            audio: true,
          });

          micStream.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          if (!systemStream.current || !micStream.current) {
            throw new Error("Failed to get screen or microphone stream.");
          }

          audioContext.current = new AudioContext();
          const systemSource = audioContext.current.createMediaStreamSource(
            systemStream.current
          );
          const micSource = audioContext.current.createMediaStreamSource(
            micStream.current
          );

          gainNode.current = audioContext.current.createGain();
          gainNode.current.gain.setValueAtTime(
            1,
            audioContext.current.currentTime
          );

          systemSource.connect(gainNode.current);
          micSource.connect(gainNode.current);

          const dest = audioContext.current.createMediaStreamDestination();
          gainNode.current.connect(dest);

          const mixedStream = dest.stream;
          recorder.current = new MediaRecorder(mixedStream);
          recorder.current.start();

          recorder.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunks.current.push(event.data);
            }
          };

          setIsRecording(true);
        } else if (
          browser.name === "Firefox" ||
          browser.name === "Safari" ||
          browser.name === "Opera"
        ) {
          micStream.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          if (!micStream.current) {
            throw new Error("Failed to get microphone stream.");
          }

          audioContext.current = new AudioContext();
          const micSource = audioContext.current.createMediaStreamSource(
            micStream.current
          );

          gainNode.current = audioContext.current.createGain();
          gainNode.current.gain.setValueAtTime(
            1,
            audioContext.current.currentTime
          );

          micSource.connect(gainNode.current);

          const dest = audioContext.current.createMediaStreamDestination();
          gainNode.current.connect(dest);

          const mixedStream = dest.stream;
          recorder.current = new MediaRecorder(mixedStream);
          recorder.current.start();

          recorder.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunks.current.push(event.data);
            }
          };
          setIsRecording(true);
        } else {
          throw new Error(t("Unsupported browser. Please use Chrome or Edge for better experience."));
        }
      }
      return true;
    } catch (error) {
      console.error("Error capturing audio:", error);

      if (micStream.current) {
        micStream.current.getTracks().forEach((track) => track.stop());
        micStream.current = null;
      }
      if (systemStream.current) {
        systemStream.current.getTracks().forEach((track) => track.stop());
        systemStream.current = null;
      }
      setIsRecording(false);
      throw new Error(t("Check MicroPhone and Audio Sharing Permissions of your browser"));
    }
  };

  return (
    <RecordingContext.Provider
      value={{
        micStream,
        systemStream,
        recorder,
        audioContext,
        gainNode,
        isRecording,
        setIsRecording,
        recordedChunks,
        startRecording,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => {
  return useContext(RecordingContext);
};
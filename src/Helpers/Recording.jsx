export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const browserInfo = {
    name: "Unknown",
    version: "Unknown",
    platform: "Desktop",
  };

  // Detect browser name and version
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg/")) {
    browserInfo.name = "Chrome";
    browserInfo.version = userAgent.match(/Chrome\/(\d+)/)?.[1];
  } else if (userAgent.includes("Edg/")) {
    browserInfo.name = "Edge";
    browserInfo.version = userAgent.match(/Edg\/(\d+)/)?.[1];
  } else if (userAgent.includes("Firefox")) {
    browserInfo.name = "Firefox";
    browserInfo.version = userAgent.match(/Firefox\/(\d+)/)?.[1];
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browserInfo.name = "Safari";
    browserInfo.version = userAgent.match(/Version\/(\d+)/)?.[1];
  }

  return browserInfo;
};

export const getDeviceType = () => {
  // Check for mobile devices using common mobile user agent patterns
  const userAgent = navigator.userAgent.toLowerCase();

  // Using matchMedia to check for screen size
  const isMobile = window.matchMedia("(max-width: 800px)").matches; // Check if screen width <= 800px

  if (
    isMobile ||
    /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    )
  ) {
    return "Mobile";
  }

  return "Desktop";
};

// Function to compress audio
export const compressAudio = async (audioBlob, targetSampleRate = 16000) => {
  try {
    const audioContext = new AudioContext();
    const originalBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(originalBuffer);

    // Create an offline audio context with the target sample rate
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      (audioBuffer.duration * targetSampleRate) | 0,
      targetSampleRate
    );

    // Copy the source buffer into the offline context
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    // Render the audio to a new buffer
    const renderedBuffer = await offlineContext.startRendering();

    // Convert the buffer to a Blob
    const compressedBlob = await encodeAudioBufferToBlob(
      audioContext,
      renderedBuffer
    );

    return compressedBlob;
  } catch (error) {
    console.error("Error compressing audio:", error);
    return null;
  }
};

// Helper function to encode AudioBuffer to Blob
export const encodeAudioBufferToBlob = async (audioContext, audioBuffer) => {
  return new Promise((resolve) => {
    const wavEncoder = (buffer, sampleRate) => {
      const encodeWAV = (samples) => {
        const bufferLength = 44 + samples.length * 2;
        const buffer = new ArrayBuffer(bufferLength);
        const view = new DataView(buffer);

        const writeString = (view, offset, string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };

        // Write WAV headers
        writeString(view, 0, "RIFF");
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, "data");
        view.setUint32(40, samples.length * 2, true);

        // Write PCM data
        let offset = 44;
        for (let i = 0; i < samples.length; i++) {
          view.setInt16(offset, samples[i] * 0x7fff, true);
          offset += 2;
        }

        return buffer;
      };

      const samples = buffer.getChannelData(0);
      const wavData = encodeWAV(samples);
      return new Blob([wavData], { type: "audio/wav" });
    };

    const blob = wavEncoder(audioBuffer, audioContext.sampleRate);
    resolve(blob);
  });
};

// Helper function to create a WAV header
const createWavHeader = (length, sampleRate, numberOfChannels) => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // Write WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length, true); // File length
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numberOfChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, sampleRate * numberOfChannels * 2, true); // Byte rate
  view.setUint16(32, numberOfChannels * 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, length, true); // Subchunk2Size

  return header;
};

// Helper function to write a string to a DataView
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};
// Helper function to check if the transcription is meaningless or includes irrelevant phrases
export const isMeaninglessTranscription = (transcription) => {
  // List of keywords commonly associated with meaningless or unintelligible speech
  const meaninglessKeywords = [
    "silence",
    "no speech",
    "unintelligible",
    "background noise",
    "garbled speech",
    "inaudible",
    "could not understand",
    "error",
    "unknown",
    "background chatter",
    "muffled",
    "static",
    "noise",
    "no data",
    "empty",
    "too quiet",
    "bye",
    "you",
    "goodbye",
    "thank you",
  ];

  // Check if the transcription contains any of the meaningless keywords
  return meaninglessKeywords.some((keyword) =>
    transcription.toLowerCase().startsWith(keyword)
  );
};

// Helper function to fetch audio file if URL is given
export const fetchAudioFile = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], "audio.mp3", { type: "audio/mpeg" });
};

// export const compressAudio = async (file) => {
//   const ffmpeg = new FFmpeg({ log: true }); // Enable logging for debugging
//   await ffmpeg.load();

//   // Load the file into FFmpeg
//   const arrayBuffer = await fetchURL(file);
//   const uint8Array = new Uint8Array(arrayBuffer);
//   ffmpeg.FS('writeFile', 'input.mp3', uint8Array);

//   // Compress the audio using FFmpeg
//   await ffmpeg.run(
//     '-i', 'input.mp3',
//     '-acodec', 'libmp3lame',
//     '-b:a', '64k', // Adjust bitrate for compression
//     'output.mp3'
//   );

//   // Retrieve the compressed audio file
//   const data = ffmpeg.FS('readFile', 'output.mp3');

//   // Convert the file to a Blob for further processing
//   const compressedFile = new Blob([data.buffer], { type: 'audio/mp3' });

//   return compressedFile;
// };

const fetchURL = async (url) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
};

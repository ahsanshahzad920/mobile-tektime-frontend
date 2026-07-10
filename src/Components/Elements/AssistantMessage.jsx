import React from "react";
import DOMPurify from "dompurify";

const AssistantMessage = ({ htmlContent, className = "", style = {} }) => {
  // Sanitize the HTML content received from the backend/assistant
  // Specifically allow standard text tags, links, and ensure target="_blank" can be handled safely
  const sanitizedHtml = DOMPurify.sanitize(htmlContent || "", {
    ADD_ATTR: ["target", "rel"],
  });

  return (
    <div
      className={`assistant-message-html ${className}`}
      style={{
        wordBreak: "break-word",
        lineHeight: "1.5",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default AssistantMessage;

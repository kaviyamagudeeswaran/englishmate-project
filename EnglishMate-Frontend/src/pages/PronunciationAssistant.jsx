import { useEffect } from "react";

const PronunciationAssistant = () => {
  useEffect(() => {
    // Load ElevenLabs Widget Script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ marginTop: "50px", textAlign: "center" }}>
      <h2>🎤 Pronunciation Practice Assistant</h2>
      <p>Practice pronunciation with our AI-powered assistant below!</p>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}
      >
        <elevenlabs-convai agent-id="agent_2801k7eh5ge7ef2ve5tsbathfbgf"></elevenlabs-convai>
      </div>
    </div>
  );
};

export default PronunciationAssistant;

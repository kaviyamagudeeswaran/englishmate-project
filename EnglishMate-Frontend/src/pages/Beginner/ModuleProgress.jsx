import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ModuleProgress() {
  const { user, generateCertificate } = useAuth();

  const [progress, setProgress] = useState({
    listening: false,
    reading: false,
    speaking: false,
    writing: false,
  });

  const allDone =
    progress.listening &&
    progress.reading &&
    progress.speaking &&
    progress.writing;

  const handleUnlock = async () => {
    const res = await generateCertificate(progress);
    if (res) {
      window.location.href = "/beginner/certificate";
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Beginner Level Progress</h1>

      <div style={{ marginTop: 20 }}>
        <p>
          Listening: {progress.listening ? "✔ Completed" : "❌ Not Completed"}
        </p>
        <p>Reading: {progress.reading ? "✔ Completed" : "❌ Not Completed"}</p>
        <p>
          Speaking: {progress.speaking ? "✔ Completed" : "❌ Not Completed"}
        </p>
        <p>Writing: {progress.writing ? "✔ Completed" : "❌ Not Completed"}</p>
      </div>

      {!allDone ? (
        <button disabled style={{ marginTop: 20, padding: 10 }}>
          🔒 Certificate Locked — Finish All Modules
        </button>
      ) : (
        <button
          style={{
            marginTop: 20,
            padding: "12px 30px",
            background: "#009688",
            color: "white",
            borderRadius: 8,
            cursor: "pointer",
          }}
          onClick={handleUnlock}
        >
          🔓 Unlock Certificate
        </button>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../assets/icon.png";
import MenuDrawer from "./MenuDrawer"; // <-- FIXED: use ./MenuDrawer instead of ../MenuDrawer

export default function ProviderDashboard() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPage, setMenuPage] = useState("main");
  const [recordings, setRecordings] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [activeTranscript, setActiveTranscript] = useState(null);
  const [notes, setNotes] = useState([]); // SOAP notes
  const [summaries, setSummaries] = useState([]); // Patient summaries
  const [accountInfo, setAccountInfo] = useState({
    name: "Hoang Ho",
    email: "hoangmho2000@gmail.com",
    phone: "(806) 319-0138"
  });
  // Inline account change states
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState("");
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // Ensure theme is applied from localStorage on load
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  return (
    <>
      {/* Menu open button */}
      <button
        className="fixed top-4 right-6 z-50 text-3xl text-gray-700 dark:text-white hover:text-blue-600 focus:outline-none"
        onClick={() => setIsMenuOpen(true)}
        title="Open Menu"
      >
        ☰
      </button>
      <div className="absolute top-4 left-6 text-3xl font-bold text-blue-600 dark:text-blue-400 z-50">
        Aerho
      </div>
      <MenuDrawer
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuPage={menuPage}
        setMenuPage={setMenuPage}
        accountInfo={accountInfo}
        showChangeEmail={showChangeEmail}
        setShowChangeEmail={setShowChangeEmail}
        showChangePassword={showChangePassword}
        setShowChangePassword={setShowChangePassword}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        isTranscribing={isTranscribing}
        setIsTranscribing={setIsTranscribing}
        theme={theme}
        toggleTheme={toggleTheme}
        navigate={navigate}
      />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-12 h-12">
        <img src={icon} alt="Aerho Icon" className="h-full w-auto object-contain" />
      </div>
      <main className={`min-h-screen bg-white dark:bg-gray-900 p-4 pt-20 transition duration-300 ${isMenuOpen ? "blur-sm" : "blur-0"}`}>
        <h1 className="text-3xl font-bold uppercase text-gray-900 dark:text-gray-100 mb-4 mt-0 text-left">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl shadow h-[calc(100vh-10rem)] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">Notes</h2>
            <ul className="space-y-2">
              {notes.length === 0 ? null : (
                notes.map((note, idx) => (
                  <li
                    key={idx}
                    className="bg-white dark:bg-gray-700 px-4 py-2 rounded-full text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setActiveTranscript({ name: `Note ${idx + 1}`, full: note, idx, type: "note" });
                      setEditableText(note);
                      setIsEditing(false);
                    }}
                  >
                    • {note.slice(0, 90)}...
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl shadow h-[calc(100vh-10rem)] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2">
              Recordings / Transcript
              {isTranscribing && (
                <svg
                  className="animate-spin h-4 w-4 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
            </h2>
            <input
              type="file"
              accept=".mp3,.wav,.m4a"
              multiple
              ref={fileInputRef}
              onChange={async (e) => {
                const files = Array.from(e.target.files).filter(Boolean);
                if (files.length === 0) return;
                setIsTranscribing(true);
                setProgress(0);
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const response = await fetch("http://localhost:4242/transcribe", {
                      method: "POST",
                      body: formData,
                    });
                    if (!response.ok) {
                      throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    const { mergedTranscript, notes: soapNote, summary: polishedTranscript } = data;

                    if (!mergedTranscript || mergedTranscript.length === 0 || !soapNote || !polishedTranscript) {
                      alert("No transcript was returned. Please try a different audio file.");
                      continue;
                    }

                    setRecordings((prev) => [...prev, file]);
                    setNotes((prev) => [...prev, soapNote]);
                    setSummaries((prev) => [...prev, polishedTranscript]);
                    setTranscripts((prev) => [
                      ...prev,
                      { name: file.name, full: mergedTranscript, summary: polishedTranscript },
                    ]);
                    setProgress(Math.round(((i + 1) / files.length) * 100));
                  } catch (error) {
                    console.error("Transcription failed:", error);
                    alert(`Transcription failed: ${error.message || error}`);
                  }
                }
                setIsTranscribing(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="mb-3 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     dark:file:bg-gray-700 dark:file:text-white dark:hover:file:bg-gray-600"
            />
            {/* Uploaded file list removed */}
            {/* Transcript summaries with toggle */}
            <ul className="space-y-2 mt-4">
              {transcripts.map((item, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-gray-700 px-4 py-2 rounded-full text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    setActiveTranscript({ ...item, idx, type: "transcript" });
                    setEditableText(item.full);
                    setIsEditing(false);
                  }}
                >
                  • Summary: {item.summary.slice(0, 90)}...
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl shadow h-[calc(100vh-10rem)] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">Patient Summaries</h2>
            <ul className="space-y-2">
              {summaries.length === 0 ? null : (
                summaries.map((summary, idx) => (
                  <li
                    key={idx}
                    className="bg-white dark:bg-gray-700 px-4 py-2 rounded-full text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setActiveTranscript({ name: `Summary ${idx + 1}`, full: summary, idx, type: "summary" });
                      setEditableText(summary);
                      setIsEditing(false);
                    }}
                  >
                    • {summary.slice(0, 90)}...
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
            {/* Transcript popup bubble */}
      {activeTranscript && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-start justify-center"
          onClick={() => setActiveTranscript(null)}
        >
          <div
            className="relative bg-white dark:bg-gray-800 mt-24 max-w-[95vw] w-full max-h-[93vh] overflow-y-auto rounded-3xl shadow-2xl px-8 py-6 text-black dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header/title */}
            <div className="mb-4 text-xl font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              {activeTranscript.name}
            </div>
            <button
              className="absolute top-4 right-6 flex items-center text-2xl text-gray-600 dark:text-gray-300 hover:text-red-500 transition-all duration-200 group z-20"
              onClick={() => setActiveTranscript(null)}
              title="Close"
            >
              <span className="block group-hover:hidden">×</span>
              <span className="hidden group-hover:inline text-base ml-2 transition-all duration-200">Close</span>
            </button>
            {/* Copy, Edit and Zoom controls - unified row */}
            <div className="flex justify-end items-center gap-3 mb-4">
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
                onClick={() => navigator.clipboard.writeText(editableText)}
              >
                Copy
              </button>
              <button
                onClick={() => {
                  if (isEditing) {
                    if (activeTranscript.type === "note") {
                      setNotes(prev => {
                        const newNotes = [...prev];
                        newNotes[activeTranscript.idx] = editableText;
                        return newNotes;
                      });
                    } else if (activeTranscript.type === "summary") {
                      setSummaries(prev => {
                        const newSummaries = [...prev];
                        newSummaries[activeTranscript.idx] = editableText;
                        return newSummaries;
                      });
                    } else if (activeTranscript.type === "transcript") {
                      setTranscripts(prev => {
                        const newTranscripts = [...prev];
                        newTranscripts[activeTranscript.idx] = {
                          ...newTranscripts[activeTranscript.idx],
                          full: editableText,
                        };
                        return newTranscripts;
                      });
                    }
                    setIsEditing(false);
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-sm rounded-full hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                {isEditing ? "Done" : "Edit"}
              </button>
              <button
                onClick={() => setZoomLevel(zoomLevel + 0.1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                A+
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                A-
              </button>
            </div>
            {/* Scrollable transcript content */}
            <div>
              {isEditing ? (
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 text-black dark:text-white border rounded-lg p-4"
                  rows={15}
                />
              ) : (
                <p
                  className="text-base leading-relaxed whitespace-pre-wrap max-w-prose mx-auto"
                  style={{ fontSize: `${zoomLevel}rem` }}
                >
                  {editableText}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      </main>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-500 z-40 ${isMenuOpen ? 'opacity-30 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
}
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Assessment from "./components/Assessment";
import ProfileSetup from "./components/ProfileSetup";
import Dashboard from "./components/Dashboard";

// Pages
import PronunciationAssistant from "./pages/PronunciationAssistant";
import BeginnerLevel from "./pages/Beginner/BeginnerLevel";
import IntermediateLevel from "./pages/Intermediate/IntermediateLevel";
import AdvancedLevel from "./pages/Advance/AdvancedLevel";



// Beginner Submodules
import ListeningModule from "./pages/Beginner/ListeningModule";
import SpeakingModule from "./pages/Beginner/SpeakingModule";
import ReadingModule from "./pages/Beginner/ReadingModule";
import WritingModule from "./pages/Beginner/WritingModule";
import Listening from "./pages/Intermediate/Listening";
import Speaking from "./pages/Intermediate/Speaking";
import Writing from "./pages/Intermediate/Writing";
import Reading from "./pages/Intermediate/Reading";
import ListeningAdvanced  from "./pages/Advance/ListeningAdvanced";
import SpeakingAdvanced from "./pages/Advance/SpeakingAdvanced";
import ReadingAdvanced from "./pages/Advance/ReadingAdvanced";
import WritingAdvanced from "./pages/Advance/WritingAdvanced"
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Levels */}
          <Route
            path="/beginner"
            element={
              <ProtectedRoute>
                <BeginnerLevel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intermediate"
            element={
              <ProtectedRoute>
                <IntermediateLevel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advanced" // <-- this is the correct path
            element={
              <ProtectedRoute>
                <AdvancedLevel />
              </ProtectedRoute>
            }
          />

          {/* Beginner Submodules */}
          <Route
            path="/beginner/listening"
            element={
              <ProtectedRoute>
                <ListeningModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beginner/speaking"
            element={
              <ProtectedRoute>
                <SpeakingModule />
              </ProtectedRoute>
            }
          />
          {/* Uncomment when created */}
          <Route
            path="/beginner/reading"
            element={
              <ProtectedRoute>
                <ReadingModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beginner/writing"
            element={
              <ProtectedRoute>
                <WritingModule />
              </ProtectedRoute>
            }
          />

          <Route
            path="/intermediate/listening"
            element={
              <ProtectedRoute>
                <Listening />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intermediate/Speaking"
            element={
              <ProtectedRoute>
                <Speaking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intermediate/Writing"
            element={
              <ProtectedRoute>
                <Writing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intermediate/Reading"
            element={
              <ProtectedRoute>
                <Reading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advance/ListeningAdvanced"
            element={
              <ProtectedRoute>
                <ListeningAdvanced />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advance/SpeakingAdvanced"
            element={
              <ProtectedRoute>
                <SpeakingAdvanced />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advance/ReadingAdvanced"
            element={
              <ProtectedRoute>
                <ReadingAdvanced />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advance/WritingAdvanced"
            element={
              <ProtectedRoute>
                <WritingAdvanced />
              </ProtectedRoute>
            }
          />
          {/* Pronunciation Assistant */}
          <Route
            path="/pronunciation-assistant"
            element={<PronunciationAssistant />}
          />
        </Routes>
        {/* CERTIFICATE LOGIC */}
        {/* <Route
          path="/certificate"
          element={<CertificateGate userEmail={user.email} />}
        />
        <Route
          path="/final-certificate"
          element={<FinalCertificate userEmail={user.email} />}
        /> */}
        {/* <Route path="/profilesetup" element={<ProfileSetup />} />
        <Route path="/beginner" element={<BeginnerLevel />} /> */}
      </AuthProvider>
    </Router>
  );
}

export default App; 
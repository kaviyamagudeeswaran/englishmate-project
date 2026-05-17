// src/pages/ProfileSetup.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GOALS } from "../constants/goals";
import { useAuth } from "../context/AuthContext";
import { Zap, Briefcase, GraduationCap, Search } from "lucide-react";

const STEPS = { ROLE: 1, GOAL: 2, LEVEL: 3 };

export default function ProfileSetup() {
  const { updateProfile } = useAuth(); // ✅ Correct placement inside component
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(STEPS.ROLE);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [preferences, setPreferences] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.suggestedLevel) {
      setSelectedLevel(location.state.suggestedLevel);
      setCurrentStep(STEPS.LEVEL);
    }
  }, [location]);

  const handleRoleSelect = (role) => setSelectedRole(role);

  const handleGoalToggle = (goalId) =>
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );

  const handleNext = () => {
    if (currentStep === STEPS.ROLE && selectedRole) setCurrentStep(STEPS.GOAL);
    else if (currentStep === STEPS.GOAL && selectedGoals.length > 0)
      setCurrentStep(STEPS.LEVEL);
  };

  const handleBack = () => {
    if (currentStep === STEPS.GOAL) setCurrentStep(STEPS.ROLE);
    else if (currentStep === STEPS.LEVEL) setCurrentStep(STEPS.GOAL);
  };

  const handleSubmit = async () => {
    if (!selectedRole || !selectedLevel || selectedGoals.length === 0) {
      alert("Please complete all selections.");
      return;
    }

    setLoading(true);
    try {
      const response = await updateProfile({
        role: selectedRole,
        currentLevel: selectedLevel,
        goals: selectedGoals,
        preferences,
      });

      if (!response.success) {
        alert("Update failed: " + response.error?.message || "Unknown error");
        return;
      }

      // Navigate based on level
      if (selectedLevel === "beginner") navigate("/beginner");
      else if (selectedLevel === "intermediate") navigate("/intermediate");
      else if (selectedLevel === "advanced") navigate("/advanced");
      else navigate("/dashboard");
    } catch (err) {
      alert("Update failed: " + err.message);
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: "student",
      label: "Student",
      description: "For students learning English",
      icon: GraduationCap,
    },
    {
      id: "employee",
      label: "Employee",
      description: "For professionals learning English",
      icon: Briefcase,
    },
    {
      id: "job_seeker",
      label: "Job Seeker",
      description: "For job seekers learning English",
      icon: Search,
    },
  ];

  const levelOptions = [
    { id: "beginner", label: "Beginner", subtitle: "A1-A2" },
    { id: "intermediate", label: "Intermediate", subtitle: "B1-B2" },
    { id: "advanced", label: "Advanced", subtitle: "C1-C2" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-800">
              English Mate
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-teal-800 text-center mb-12">
            Set Up Your Profile
          </h1>

          {/* Step: Role */}
          {currentStep === STEPS.ROLE && (
            <>
              <h2 className="text-2xl font-bold text-teal-800 text-center mb-8">
                Select Your Role
              </h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`p-6 rounded-xl border-2 transition hover:shadow-lg ${
                        selectedRole === role.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 bg-white hover:border-teal-300"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Icon className="w-16 h-16 mb-4 text-teal-600" />
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {role.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleNext}
                disabled={!selectedRole}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                Continue
              </button>
            </>
          )}

          {/* Step: Goals */}
          {currentStep === STEPS.GOAL && (
            <>
              <h2 className="text-2xl font-bold text-teal-800 text-center mb-8">
                Select Your Goals
              </h2>

              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`px-4 py-3 rounded-lg border-2 transition text-left flex items-center gap-3 ${
                      selectedGoals.includes(goal.id)
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="font-medium text-gray-900">
                      {goal.label}
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Tell us more about your focus areas..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                rows={3}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedGoals.length === 0}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Step: Level */}
          {currentStep === STEPS.LEVEL && (
            <>
              <h2 className="text-2xl font-bold text-teal-800 text-center mb-8">
                Choose Your Level
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {levelOptions.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`p-6 rounded-xl border-2 transition hover:shadow-lg ${
                      selectedLevel === level.id
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {level.label}
                      </h3>
                      <p className="text-sm text-gray-600">{level.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedLevel || loading}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

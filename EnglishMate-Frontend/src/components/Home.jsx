import { useNavigate } from 'react-router-dom';
import { Zap, BookOpen, Target, TrendingUp } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-teal-600" />
              <span className="text-xl font-bold text-teal-800">
                English Mate
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign up
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                profilesetup
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Levels
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master English with
            <span className="block text-teal-600">Personalized Learning</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're a student, professional, or job seeker, English Mate
            adapts to your goals and learning style.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-xl"
          >
            Start Learning Free
          </button>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Personalized Path
              </h3>
              <p className="text-gray-600">
                Get a custom learning curriculum based on your role, level, and
                goals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Quality Content
              </h3>
              <p className="text-gray-600">
                Access curated lessons from grammar basics to advanced business
                English.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Monitor your improvement and celebrate milestones along the way.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-teal-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of learners improving their English every day
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg"
            >
              Create Free Account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
} 
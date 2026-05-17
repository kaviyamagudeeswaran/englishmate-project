import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Zap, LogOut, User, Clock, PlayCircle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.profile) {
      navigate('/profile-setup');
      return;
    }

    loadLessonsAndProgress();
  }, [user, navigate]);

  const loadLessonsAndProgress = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('lessons')
        .select('*')
        .eq('level', user.profile.currentLevel);

      if (user.profile.role) {
        query = query.or(`role.is.null,role.eq.${user.profile.role}`);
      }

      const { data: lessons, error: lessonsError } = await query.order('created_at', { ascending: true });

      if (lessonsError) throw lessonsError;

      setRecommendedLessons(lessons || []);

      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (progressError) throw progressError;

      const completedIds = new Set(progress?.map(p => p.lesson_id) || []);
      setCompletedLessons(completedIds);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleLessonComplete = async (lessonId) => {
    const isCompleted = completedLessons.has(lessonId);
    const newCompleted = new Set(completedLessons);

    try {
      if (isCompleted) {
        const { error } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);

        if (error) throw error;
        newCompleted.delete(lessonId);
      } else {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'user_id,lesson_id' });

        if (error) throw error;
        newCompleted.add(lessonId);
      }

      setCompletedLessons(newCompleted);
    } catch (error) {
      console.error('Error toggling lesson completion:', error);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (!user?.profile) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading lessons...</div>
      </div>
    );
  }

  const progress = recommendedLessons.length > 0
    ? Math.round((completedLessons.size / recommendedLessons.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-teal-600" />
              <span className="text-xl font-bold text-teal-800">English Mate</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Continue your English learning journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Your Role</h3>
            <p className="text-2xl font-bold text-teal-600 capitalize">
              {user.profile.role.replace('_', ' ')}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Current Level</h3>
            <p className="text-2xl font-bold text-teal-600 capitalize">
              {user.profile.currentLevel}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Progress</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-teal-600">{progress}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recommended Lessons for You
          </h2>

          {recommendedLessons.length === 0 ? (
            <p className="text-gray-600">No lessons available at the moment.</p>
          ) : (
            <div className="space-y-6">
              {recommendedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`border-2 rounded-xl overflow-hidden transition ${
                    completedLessons.has(lesson.id)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-teal-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <PlayCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {lesson.title}
                            </h3>
                            <p className="text-gray-600 mb-3">{lesson.description}</p>
                            <div className="flex flex-wrap gap-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                {lesson.duration} min
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                                {lesson.category}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                                {lesson.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleLessonComplete(lesson.id)}
                        className={`ml-4 p-2 rounded-lg transition ${
                          completedLessons.has(lesson.id)
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={getYouTubeEmbedUrl(lesson.video_url)}
                        title={lesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

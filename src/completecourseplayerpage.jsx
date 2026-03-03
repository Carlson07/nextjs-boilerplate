// ===============================
// 🎥 COMPLETE COURSE PLAYER PAGE
// ===============================

const CoursePlayerPage = memo(({ courseId }) => {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [quizResults, setQuizResults] = useState({});

  const videoRef = useRef();
  const { user } = useAuth();
  const { processMicroPayment } = usePayment();

  useEffect(() => {
    loadCourseData();
    initializeProgressTracking();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const courseData = await UniLinkAPI.courses.getById(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to load course:', error);
    }
  };

  const initializeProgressTracking = async () => {
    // Load user's progress for this course
    const progressData = await UniLinkAPI.progress.getCourseProgress(courseId);
    setProgress(progressData.overallProgress);
    setCurrentLesson(progressData.currentLesson || 0);
  };

  const handleLessonComplete = async () => {
    // Process micro-payment for watched content
    const lesson = course.lessons[currentLesson];
    const paymentResult = await processMicroPayment({
      userId: user.id,
      videoId: lesson.id,
      minutesWatched: lesson.duration,
      userType: user.educationLevel || 'university'
    });

    if (paymentResult.success) {
      // Update progress
      const newProgress = ((currentLesson + 1) / course.lessons.length) * 100;
      setProgress(newProgress);
      
      // Save progress to backend
      await UniLinkAPI.progress.updateLessonProgress(courseId, lesson.id, {
        completed: true,
        timeSpent: lesson.duration,
        cost: paymentResult.cost
      });

      // Move to next lesson if available
      if (currentLesson < course.lessons.length - 1) {
        setCurrentLesson(prev => prev + 1);
      }
    }
  };

  const handleNoteSave = async () => {
    await UniLinkAPI.notes.save({
      courseId,
      lessonId: course.lessons[currentLesson].id,
      content: userNotes,
      timestamp: videoRef.current?.currentTime || 0
    });
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const currentLessonData = course.lessons[currentLesson];

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <div className="bg-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-neutral-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">{course.title}</h1>
            <p className="text-neutral-400 text-sm">
              Lesson {currentLesson + 1} of {course.lessons.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Progress */}
          <div className="text-right">
            <div className="text-sm text-neutral-400">Progress</div>
            <div className="font-bold">{Math.round(progress)}%</div>
          </div>

          {/* Cost Display */}
          <div className="text-right">
            <div className="text-sm text-neutral-400">This Lesson</div>
            <div className="font-bold text-green-400">
              ${(currentLessonData.duration * 0.008).toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black relative">
            {/* Video Element */}
            <video
              ref={videoRef}
              src={currentLessonData.videoUrl}
              className="w-full h-full"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleLessonComplete}
              playbackRate={playbackRate}
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 rounded-xl p-3">
              <button
                onClick={() => setPlaybackRate(prev => Math.max(0.5, prev - 0.25))}
                className="px-3 py-1 bg-neutral-700 rounded-lg text-sm"
              >
                {playbackRate}x
              </button>
              
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="px-3 py-1 bg-neutral-700 rounded-lg text-sm"
              >
                📝 Notes
              </button>

              <button
                onClick={handleLessonComplete}
                className="px-4 py-1 bg-green-600 rounded-lg text-sm font-medium"
              >
                Mark Complete
              </button>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-neutral-800 p-6">
            <h2 className="text-xl font-bold mb-2">{currentLessonData.title}</h2>
            <p className="text-neutral-400">{currentLessonData.description}</p>
            
            {/* Lesson Navigation */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setCurrentLesson(prev => Math.max(0, prev - 1))}
                disabled={currentLesson === 0}
                className="px-4 py-2 bg-neutral-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentLesson(prev => Math.min(course.lessons.length - 1, prev + 1))}
                disabled={currentLesson === course.lessons.length - 1}
                className="px-4 py-2 bg-green-600 rounded-lg disabled:opacity-50"
              >
                Next Lesson
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-neutral-800 border-l border-neutral-700 flex flex-col">
          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="font-semibold">Course Content</h3>
            </div>
            
            <div className="p-4 space-y-2">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLesson(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentLesson
                      ? 'bg-green-600 text-white'
                      : 'bg-neutral-700 hover:bg-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      index === currentLesson ? 'bg-white text-green-600' : 'bg-neutral-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{lesson.title}</div>
                      <div className="text-xs opacity-75">
                        {lesson.duration}min • ${(lesson.duration * 0.008).toFixed(3)}
                      </div>
                    </div>
                    {lesson.completed && (
                      <div className="text-green-400">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Panel */}
          {showNotes && (
            <div className="border-t border-neutral-700 p-4">
              <h4 className="font-semibold mb-3">My Notes</h4>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Take notes for this lesson..."
                className="w-full h-32 bg-neutral-700 border border-neutral-600 rounded-lg p-3 text-sm resize-none"
              />
              <button
                onClick={handleNoteSave}
                className="w-full mt-2 py-2 bg-green-600 rounded-lg font-medium"
              >
                Save Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
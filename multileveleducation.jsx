// ===============================
// 🏫 MULTI-LEVEL EDUCATION SYSTEM
// ===============================

// Education Level Management
const educationLevels = {
  primary: {
    name: 'Primary School',
    grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
    subjects: ['Mathematics', 'English', 'Shona/Ndebele', 'Science', 'Social Studies', 'Agriculture', 'Arts'],
    color: 'blue',
    icon: '🧒'
  },
  secondary: {
    name: 'High School',
    grades: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'],
    subjects: {
      'Mathematics': ['Mathematics', 'Additional Mathematics'],
      'Sciences': ['Physics', 'Chemistry', 'Biology', 'Combined Science'],
      'Languages': ['English', 'Shona', 'Ndebele', 'French'],
      'Humanities': ['History', 'Geography', 'Commerce', 'Accounts', 'Economics'],
      'Technical': ['Computer Science', 'Woodwork', 'Metalwork', 'Fashion & Fabrics'],
      'Arts': ['Art', 'Music', 'Drama']
    },
    color: 'green',
    icon: '🎓'
  },
  university: {
    name: 'University',
    faculties: {
      'Arts & Humanities': ['English', 'History', 'Philosophy', 'Languages', 'Religious Studies'],
      'Sciences': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
      'Social Sciences': ['Psychology', 'Sociology', 'Political Science', 'Economics'],
      'Business': ['Accounting', 'Finance', 'Marketing', 'Management', 'Entrepreneurship'],
      'Engineering': ['Civil', 'Mechanical', 'Electrical', 'Chemical', 'Computer'],
      'Medicine': ['Medicine', 'Nursing', 'Pharmacy', 'Dentistry'],
      'Law': ['Law', 'Criminology'],
      'Education': ['Teaching', 'Educational Psychology', 'Curriculum Studies']
    },
    color: 'purple',
    icon: '🏛️'
  },
  professional: {
    name: 'Professional Development',
    categories: {
      'Technology': ['Programming', 'Web Development', 'Data Science', 'Cybersecurity'],
      'Business': ['Project Management', 'Digital Marketing', 'Leadership', 'Finance'],
      'Creative': ['Graphic Design', 'Video Editing', 'Photography', 'Writing'],
      'Vocational': ['Plumbing', 'Electrical', 'Carpentry', 'Hairdressing'],
      'Certifications': ['Microsoft', 'Google', 'Cisco', 'AWS']
    },
    color: 'orange',
    icon: '💼'
  }
};

// Enhanced Course Management System
class CourseManager {
  constructor() {
    this.courses = new Map();
    this.enrollments = new Map();
    this.progress = new Map();
  }

  // Create a new course
  async createCourse(courseData) {
    const {
      title,
      description,
      educationLevel,
      subject,
      grade,
      lecturerId,
      priceTier = 'standard',
      content = [],
      learningObjectives = [],
      prerequisites = [],
      duration,
      thumbnail,
      language = 'English'
    } = courseData;

    const courseId = 'course_' + Date.now();

    const course = {
      id: courseId,
      title,
      description,
      educationLevel,
      subject,
      grade,
      lecturerId,
      priceTier,
      content,
      learningObjectives,
      prerequisites,
      duration,
      thumbnail,
      language,
      status: 'published',
      ratings: {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      enrolledStudents: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.courses.set(courseId, course);
    return course;
  }

  // Enroll student in course
  async enrollStudent(courseId, studentId) {
    const course = this.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    const enrollmentId = `${courseId}_${studentId}`;
    
    const enrollment = {
      id: enrollmentId,
      courseId,
      studentId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completed: false,
      lastAccessed: new Date().toISOString(),
      certificates: [],
      grades: {}
    };

    this.enrollments.set(enrollmentId, enrollment);
    course.enrolledStudents += 1;

    // Initialize progress tracking
    this.initializeProgressTracking(courseId, studentId);

    return enrollment;
  }

  // Track student progress
  async updateProgress(courseId, studentId, contentId, progressData) {
    const progressKey = `${courseId}_${studentId}`;
    
    if (!this.progress.has(progressKey)) {
      this.progress.set(progressKey, {
        courseId,
        studentId,
        contentProgress: new Map(),
        overallProgress: 0,
        timeSpent: 0,
        lastActivity: new Date().toISOString()
      });
    }

    const studentProgress = this.progress.get(progressKey);
    studentProgress.contentProgress.set(contentId, {
      ...progressData,
      lastUpdated: new Date().toISOString()
    });

    // Calculate overall progress
    studentProgress.overallProgress = this.calculateOverallProgress(courseId, studentProgress);
    studentProgress.timeSpent += progressData.timeSpent || 0;
    studentProgress.lastActivity = new Date().toISOString();

    // Update enrollment progress
    const enrollmentId = `${courseId}_${studentId}`;
    const enrollment = this.enrollments.get(enrollmentId);
    if (enrollment) {
      enrollment.progress = studentProgress.overallProgress;
      
      // Check if course is completed
      if (studentProgress.overallProgress >= 100 && !enrollment.completed) {
        enrollment.completed = true;
        enrollment.completedAt = new Date().toISOString();
        
        // Generate certificate
        await this.generateCertificate(courseId, studentId);
      }
    }

    return studentProgress;
  }

  // Generate certificate upon course completion
  async generateCertificate(courseId, studentId) {
    const course = this.courses.get(courseId);
    const enrollment = this.enrollments.get(`${courseId}_${studentId}`);
    
    if (!course || !enrollment) return null;

    const certificate = {
      id: 'cert_' + Date.now(),
      courseId,
      studentId,
      courseTitle: course.title,
      issuedAt: new Date().toISOString(),
      certificateUrl: `https://certificates.unilink-africa.com/${courseId}/${studentId}`,
      verificationCode: Math.random().toString(36).substring(2, 15).toUpperCase()
    };

    enrollment.certificates.push(certificate);
    return certificate;
  }

  // Calculate overall progress
  calculateOverallProgress(courseId, studentProgress) {
    const course = this.courses.get(courseId);
    if (!course || !course.content.length) return 0;

    let completedContent = 0;
    studentProgress.contentProgress.forEach((progress, contentId) => {
      if (progress.completed) completedContent++;
    });

    return (completedContent / course.content.length) * 100;
  }

  initializeProgressTracking(courseId, studentId) {
    const progressKey = `${courseId}_${studentId}`;
    this.progress.set(progressKey, {
      courseId,
      studentId,
      contentProgress: new Map(),
      overallProgress: 0,
      timeSpent: 0,
      lastActivity: new Date().toISOString()
    });
  }
}

// Enhanced Course Discovery Component
const CourseDiscovery = memo(({ userLevel, selectedGrade, interests = [] }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  const courseManager = useRef(new CourseManager());

  useEffect(() => {
    loadCourses();
  }, [userLevel, selectedGrade]);

  useEffect(() => {
    filterCourses();
  }, [courses, selectedSubject, priceRange, sortBy]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // Simulate API call to get courses
      const mockCourses = await generateMockCourses(userLevel, selectedGrade);
      setCourses(mockCourses);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(course => 
        course.subject === selectedSubject
      );
    }

    // Filter by price range
    filtered = filtered.filter(course => {
      const price = getCoursePrice(course);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.enrolledStudents - a.enrolledStudents;
        case 'rating':
          return b.ratings.average - a.ratings.average;
        case 'price-low':
          return getCoursePrice(a) - getCoursePrice(b);
        case 'price-high':
          return getCoursePrice(b) - getCoursePrice(a);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  const getCoursePrice = (course) => {
    const pricing = advancedRevenueModel.pricingTiers[course.educationLevel];
    const totalMinutes = course.content.reduce((total, item) => total + (item.duration || 0), 0);
    return totalMinutes * pricing.videoPerMinute;
  };

  const getLevelColor = (level) => {
    const colors = {
      primary: 'blue',
      secondary: 'green',
      university: 'purple',
      professional: 'orange'
    };
    return colors[level] || 'gray';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 animate-pulse">
            <div className="w-full h-40 bg-neutral-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Subjects</option>
              {educationLevels[userLevel]?.subjects && 
                Object.keys(educationLevels[userLevel].subjects).map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))
              }
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Education Level Badge */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Education Level</label>
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-${getLevelColor(userLevel)}-100 text-${getLevelColor(userLevel)}-800 text-sm font-medium`}>
              {educationLevels[userLevel]?.icon} {educationLevels[userLevel]?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 mx-auto mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No courses found</h3>
          <p className="text-neutral-600">Try adjusting your filters to find more courses.</p>
        </div>
      )}
    </div>
  );
});

// Course Card Component
const CourseCard = memo(({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const price = advancedRevenueModel.pricingTiers[course.educationLevel].videoPerMinute * 
    course.content.reduce((total, item) => total + (item.duration || 0), 0);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const courseManager = new CourseManager();
      await courseManager.enrollStudent(course.id, user.id);
      navigate(`/course/${course.id}`);
    } catch (error) {
      alert('Failed to enroll: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Course Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 relative">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl">
            {educationLevels[course.educationLevel]?.icon}
          </div>
        )}
        
        {/* Education Level Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${
            getLevelColor(course.educationLevel)
          }-100 text-${
            getLevelColor(course.educationLevel)
          }-800`}>
            {educationLevels[course.educationLevel]?.name}
          </span>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-neutral-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
          <span>{course.content.length} lessons</span>
          <span>•</span>
          <span>{course.enrolledStudents} students</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(course.ratings.average) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-neutral-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-neutral-600">
            {course.ratings.average.toFixed(1)} ({course.ratings.count})
          </span>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-green-600">${price.toFixed(2)}</span>
            <div className="text-xs text-neutral-500">
              {advancedRevenueModel.pricingTiers[course.educationLevel].videoPerMinute * 100}¢/min
            </div>
          </div>
          
          <button
            onClick={handleEnroll}
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
});

// Helper function to generate mock courses
const generateMockCourses = async (level, grade) => {
  // This would be replaced with actual API calls
  return [...Array(12)].map((_, i) => ({
    id: `course_${i}`,
    title: `Sample ${level} Course ${i + 1}`,
    description: `Comprehensive ${level} level course covering essential topics for ${grade || 'students'}.`,
    educationLevel: level,
    subject: Object.keys(educationLevels[level]?.subjects || {})[i % 3] || 'General',
    grade: grade,
    content: [...Array(15)].map((_, j) => ({
      id: `content_${j}`,
      title: `Lesson ${j + 1}`,
      duration: 30 + Math.random() * 30, // 30-60 minutes
      type: 'video'
    })),
    enrolledStudents: Math.floor(Math.random() * 1000),
    ratings: {
      average: 3.5 + Math.random() * 1.5,
      count: Math.floor(Math.random() * 500),
      distribution: { 1: 10, 2: 20, 3: 100, 4: 200, 5: 170 }
    },
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

// Helper function to get level color
const getLevelColor = (level) => {
  const colors = {
    primary: 'blue',
    secondary: 'green',
    university: 'purple',
    professional: 'orange'
  };
  return colors[level] || 'gray';
};
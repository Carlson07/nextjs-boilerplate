// ===============================
// 🏢 SCHOOL/INSTITUTION MANAGEMENT
// ===============================

// School Management System
class SchoolManager {
  constructor() {
    this.schools = new Map();
    this.teachers = new Map();
    this.students = new Map();
    this.classes = new Map();
  }

  // Register a new school
  async registerSchool(schoolData) {
    const {
      name,
      type, // 'primary', 'secondary', 'university', 'training_center'
      address,
      contact,
      adminUserId,
      subscriptionPlan = 'school_premium',
      maxStudents = 1000,
      features = {}
    } = schoolData;

    const schoolId = 'school_' + Date.now();

    const school = {
      id: schoolId,
      name,
      type,
      address,
      contact,
      adminUserId,
      subscriptionPlan,
      maxStudents,
      features: {
        customBranding: true,
        analytics: true,
        bulkEnrollment: true,
        parentPortal: true,
        ...features
      },
      teachers: [],
      students: [],
      classes: [],
      billing: {
        monthlyFee: advancedRevenueModel.subscriptionPlans[schoolPlan].price,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: null
      },
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    this.schools.set(schoolId, school);
    return school;
  }

  // Add teacher to school
  async addTeacher(schoolId, teacherData) {
    const school = this.schools.get(schoolId);
    if (!school) throw new Error('School not found');

    const teacher = {
      id: 'teacher_' + Date.now(),
      schoolId,
      userId: teacherData.userId,
      subjects: teacherData.subjects,
      grades: teacherData.grades,
      joinDate: new Date().toISOString(),
      status: 'active',
      permissions: teacherData.permissions || ['create_content', 'manage_students']
    };

    school.teachers.push(teacher);
    this.teachers.set(teacher.id, teacher);

    return teacher;
  }

  // Enroll student in school
  async enrollStudent(schoolId, studentData) {
    const school = this.schools.get(schoolId);
    if (!school) throw new Error('School not found');

    if (school.students.length >= school.maxStudents) {
      throw new Error('School has reached maximum student capacity');
    }

    const student = {
      id: 'student_' + Date.now(),
      schoolId,
      userId: studentData.userId,
      grade: studentData.grade,
      enrollmentDate: new Date().toISOString(),
      status: 'active',
      parentEmail: studentData.parentEmail,
      emergencyContact: studentData.emergencyContact
    };

    school.students.push(student);
    this.students.set(student.id, student);

    return student;
  }

  // Create class/grade level
  async createClass(schoolId, classData) {
    const school = this.schools.get(schoolId);
    if (!school) throw new Error('School not found');

    const classObj = {
      id: 'class_' + Date.now(),
      schoolId,
      name: classData.name,
      grade: classData.grade,
      teacherId: classData.teacherId,
      students: [],
      schedule: classData.schedule,
      subjects: classData.subjects,
      createdAt: new Date().toISOString()
    };

    school.classes.push(classObj);
    this.classes.set(classObj.id, classObj);

    return classObj;
  }

  // Bulk enrollment for schools
  async bulkEnrollStudents(schoolId, studentsData) {
    const results = {
      successful: [],
      failed: []
    };

    for (const studentData of studentsData) {
      try {
        const student = await this.enrollStudent(schoolId, studentData);
        results.successful.push(student);
      } catch (error) {
        results.failed.push({
          data: studentData,
          error: error.message
        });
      }
    }

    return results;
  }

  // Generate school analytics
  async generateAnalytics(schoolId, period = 'monthly') {
    const school = this.schools.get(schoolId);
    if (!school) throw new Error('School not found');

    const analytics = {
      schoolId,
      period,
      generatedAt: new Date().toISOString(),
      overview: {
        totalStudents: school.students.length,
        totalTeachers: school.teachers.length,
        totalClasses: school.classes.length,
        enrollmentGrowth: this.calculateEnrollmentGrowth(schoolId),
        activeUsers: this.calculateActiveUsers(schoolId)
      },
      academic: {
        averageProgress: this.calculateAverageProgress(schoolId),
        completionRate: this.calculateCompletionRate(schoolId),
        topPerformingClasses: this.getTopPerformingClasses(schoolId)
      },
      financial: {
        totalSpent: this.calculateTotalSpent(schoolId),
        averageSpendPerStudent: this.calculateAverageSpend(schoolId),
        subscriptionValue: this.calculateSubscriptionValue(schoolId)
      }
    };

    return analytics;
  }

  // Utility methods for analytics
  calculateEnrollmentGrowth(schoolId) {
    // Implementation for calculating enrollment growth
    return 0.15; // 15% growth
  }

  calculateActiveUsers(schoolId) {
    // Implementation for calculating active users
    const school = this.schools.get(schoolId);
    return Math.floor(school.students.length * 0.75); // 75% active
  }

  calculateAverageProgress(schoolId) {
    // Implementation for calculating average progress
    return 65; // 65% average progress
  }

  calculateCompletionRate(schoolId) {
    // Implementation for calculating completion rate
    return 0.42; // 42% completion rate
  }

  getTopPerformingClasses(schoolId) {
    // Implementation for getting top performing classes
    return [];
  }

  calculateTotalSpent(schoolId) {
    // Implementation for calculating total spent
    return 1250.75;
  }

  calculateAverageSpend(schoolId) {
    const school = this.schools.get(schoolId);
    return this.calculateTotalSpent(schoolId) / school.students.length;
  }

  calculateSubscriptionValue(schoolId) {
    const school = this.schools.get(schoolId);
    return advancedRevenueModel.subscriptionPlans[school.subscriptionPlan].price;
  }
}

// Parent Portal Component
const ParentPortal = memo(({ schoolId, studentId }) => {
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [messages, setMessages] = useState([]);

  const schoolManager = useRef(new SchoolManager());

  useEffect(() => {
    loadStudentData();
  }, [schoolId, studentId]);

  const loadStudentData = async () => {
    // Load student information, progress, attendance, etc.
    const studentData = await schoolManager.current.getStudent(studentId);
    setStudent(studentData);

    // Load additional data
    const [progressData, attendanceData, classesData] = await Promise.all([
      schoolManager.current.getStudentProgress(studentId),
      schoolManager.current.getAttendance(studentId),
      schoolManager.current.getUpcomingClasses(studentId)
    ]);

    setProgress(progressData);
    setAttendance(attendanceData);
    setUpcomingClasses(classesData);
  };

  const sendMessageToTeacher = async (teacherId, message) => {
    // Implementation for sending message to teacher
    console.log(`Sending message to teacher ${teacherId}: ${message}`);
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{student.name}</h1>
            <p className="text-neutral-600">{student.grade} • {student.schoolName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{progress.overallProgress}%</div>
            <div className="text-sm text-neutral-600">Overall Progress</div>
          </div>
        </div>

        {/* Progress by Subject */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(progress.subjects || {}).map(([subject, subjectProgress]) => (
            <div key={subject} className="text-center p-4 border border-neutral-200 rounded-xl">
              <div className="text-lg font-semibold text-neutral-900">{subject}</div>
              <div className="text-2xl font-bold text-green-600 mt-2">{subjectProgress}%</div>
              <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${subjectProgress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Attendance</h3>
          <div className="space-y-3">
            {attendance.slice(0, 5).map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl">
                <div>
                  <div className="font-medium text-neutral-900">{record.date}</div>
                  <div className="text-sm text-neutral-600">{record.subject}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'present' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upcoming Classes</h3>
          <div className="space-y-3">
            {upcomingClasses.slice(0, 5).map(classItem => (
              <div key={classItem.id} className="p-3 border border-neutral-200 rounded-xl">
                <div className="font-medium text-neutral-900">{classItem.subject}</div>
                <div className="text-sm text-neutral-600 mb-2">{classItem.teacher}</div>
                <div className="flex items-center justify-between text-sm">
                  <span>{classItem.time}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    classItem.type === 'live' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {classItem.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium text-neutral-900">View Report Card</div>
          </button>
          <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-medium text-neutral-900">Message Teacher</div>
          </button>
          <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-neutral-900">Progress Report</div>
          </button>
          <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
            <div className="text-2xl mb-2">🎫</div>
            <div className="font-medium text-neutral-900">Request Meeting</div>
          </button>
        </div>
      </div>
    </div>
  );
});

// School Admin Dashboard
const SchoolAdminDashboard = memo(({ schoolId }) => {
  const [school, setSchool] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  const schoolManager = useRef(new SchoolManager());

  useEffect(() => {
    loadSchoolData();
  }, [schoolId]);

  const loadSchoolData = async () => {
    const schoolData = await schoolManager.current.getSchool(schoolId);
    setSchool(schoolData);

    const analyticsData = await schoolManager.current.generateAnalytics(schoolId);
    setAnalytics(analyticsData);
  };

  if (!school) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* School Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{school.name}</h1>
            <p className="text-neutral-600">{school.address}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${analytics.financial?.subscriptionValue}/month
            </div>
            <div className="text-sm text-neutral-600">Subscription</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{analytics.overview?.totalStudents}</div>
          <div className="text-sm text-neutral-600">Total Students</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{analytics.overview?.totalTeachers}</div>
          <div className="text-sm text-neutral-600">Teachers</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{analytics.academic?.averageProgress}%</div>
          <div className="text-sm text-neutral-600">Avg Progress</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{analytics.academic?.completionRate}%</div>
          <div className="text-sm text-neutral-600">Completion Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Monthly Subscription</span>
              <span className="font-semibold">${analytics.financial?.subscriptionValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Platform Spending</span>
              <span className="font-semibold">${analytics.financial?.totalSpent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Avg Spend per Student</span>
              <span className="font-semibold">${analytics.financial?.averageSpendPerStudent}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">School Management</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium text-sm">Manage Students</div>
            </button>
            <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
              <div className="text-2xl mb-2">👨‍🏫</div>
              <div className="font-medium text-sm">Manage Teachers</div>
            </button>
            <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-sm">View Analytics</div>
            </button>
            <button className="p-4 border border-neutral-200 rounded-xl hover:border-green-500 transition-colors text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium text-sm">Billing</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
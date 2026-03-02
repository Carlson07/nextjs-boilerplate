--- app/courses/page.tsx (原始)


+++ app/courses/page.tsx (修改后)
'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { useRouter } from 'next/navigation';

// Mock data for courses
const mockCourses = [
  {
    id: '1',
    title: 'Introduction to Programming',
    level: 'university',
    instructor: 'Prof. Jane Smith',
    duration: '12 hours',
    pricePerMinute: 0.12,
    rating: 4.8,
    enrolled: 1250,
    thumbnail: '/api/placeholder/300/200',
  },
  {
    id: '2',
    title: 'Advanced Mathematics',
    level: 'secondary',
    instructor: 'Mr. John Doe',
    duration: '8 hours',
    pricePerMinute: 0.08,
    rating: 4.9,
    enrolled: 890,
    thumbnail: '/api/placeholder/300/200',
  },
  {
    id: '3',
    title: 'Basic Science Concepts',
    level: 'primary',
    instructor: 'Ms. Emily Johnson',
    duration: '6 hours',
    pricePerMinute: 0.04,
    rating: 4.7,
    enrolled: 2100,
    thumbnail: '/api/placeholder/300/200',
  },
];

const CoursesPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // In a real app, this would come from an API
    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, [user, router]);

  useEffect(() => {
    let result = courses;

    if (searchTerm) {
      result = result.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      result = result.filter(course => course.level === levelFilter);
    }

    setFilteredCourses(result);
  }, [searchTerm, levelFilter, courses]);

  const getLevelDisplayName = (level: string) => {
    switch(level) {
      case 'primary': return 'Primary';
      case 'secondary': return 'Secondary';
      case 'university': return 'University';
      default: return level;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}!</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {user.role === 'student'
              ? `Available Courses for ${user.studentType === 'university_student' ? `${user.universityProgram || 'General'} Students` : `${user.studentType?.replace('_', ' ')}s`}`
              : `Courses for ${user.teacherType === 'lecturer' ? 'University Students' : `${user.teacherType?.replace('_', ' ')}`s}`}
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>

            <div className="flex space-x-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="university">University</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getLevelDisplayName(course.level)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">Instructor: {course.instructor}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{course.duration} • {course.enrolled} enrolled</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461c.687 0 1.175-.98 1.175-1.81l-.001-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm text-gray-600">{course.rating}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">${course.pricePerMinute}/min</p>
                    <button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursesPage;
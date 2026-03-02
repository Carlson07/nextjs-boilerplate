--- app/components/SignupForm.tsx (原始)


+++ app/components/SignupForm.tsx (修改后)
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthStore } from '../store';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher']),
  studentType: z.enum(['primary_student', 'secondary_student', 'university_student']).optional(),
  teacherType: z.enum(['primary_teacher', 'secondary_teacher', 'lecturer']).optional(),
  universityProgram: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      studentType: undefined,
      teacherType: undefined,
      universityProgram: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      // In a real app, this would be an API call to register the user
      // For now, we'll simulate a successful registration
      const mockUser = {
        id: '2',
        email: data.email,
        name: data.name,
        role: data.role,
        ...(data.role === 'student' && data.studentType && { studentType: data.studentType }),
        ...(data.role === 'teacher' && data.teacherType && { teacherType: data.teacherType }),
        ...(data.role === 'student' && data.studentType === 'university_student' && data.universityProgram && { universityProgram: data.universityProgram }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      login(mockUser);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle registration error (show toast, etc.)
    }
  };

  return (
    <div className="form-container">
      <div className="text-center">
        <h2 className="form-title">Create your UniLink account</h2>
        <p className="form-subtitle">Join our personalized learning community</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="form-field">
                <FormLabel className="form-label">Full Name</FormLabel>
                <FormControl>
                  <Input className="form-input" placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage className="form-message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="form-field">
                <FormLabel className="form-label">Email address</FormLabel>
                <FormControl>
                  <Input className="form-input" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage className="form-message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="form-field">
                <FormLabel className="form-label">Password</FormLabel>
                <FormControl>
                  <Input className="form-input" type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage className="form-message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="form-field">
                <FormLabel className="form-label">Account Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedRole(value as 'student' | 'teacher');
                      // Reset dependent fields when role changes
                      if (value === 'student') {
                        form.setValue('teacherType', undefined);
                      } else {
                        form.setValue('studentType', undefined);
                        form.setValue('universityProgram', '');
                      }
                    }}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <label htmlFor="student">Student</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teacher" id="teacher" />
                      <label htmlFor="teacher">Teacher</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="form-message" />
              </FormItem>
            )}
          />

          {selectedRole === 'student' && (
            <>
              <FormField
                control={form.control}
                name="studentType"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="form-label">Education Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary_student">Primary Student</SelectItem>
                        <SelectItem value="secondary_student">Secondary Student</SelectItem>
                        <SelectItem value="university_student">University Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="form-message" />
                  </FormItem>
                )}
              />

              {form.watch('studentType') === 'university_student' && (
                <FormField
                  control={form.control}
                  name="universityProgram"
                  render={({ field }) => (
                    <FormItem className="form-field">
                      <FormLabel className="form-label">University Program</FormLabel>
                      <FormControl>
                        <Input className="form-input" placeholder="e.g., Computer Science, Medicine, Law" {...field} />
                      </FormControl>
                      <FormMessage className="form-message" />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          {selectedRole === 'teacher' && (
            <FormField
              control={form.control}
              name="teacherType"
              render={({ field }) => (
                <FormItem className="form-field">
                  <FormLabel className="form-label">Teaching Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your teaching level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="primary_teacher">Primary Teacher</SelectItem>
                      <SelectItem value="secondary_teacher">Secondary Teacher</SelectItem>
                      <SelectItem value="lecturer">University Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="form-message" />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="btn-primary">
            Create Account
          </Button>
        </form>
      </Form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="btn-link"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
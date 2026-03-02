--- app/components/LoginForm.tsx (原始)


+++ app/components/LoginForm.tsx (修改后)
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '../store';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // In a real app, this would be an API call to authenticate the user
      // For now, we'll simulate a successful login
      const mockUser = {
        id: '1',
        email: data.email,
        name: 'John Doe',
        role: 'student' as const,
        studentType: 'university_student',
        universityProgram: 'Computer Science',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      login(mockUser);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (show toast, etc.)
    }
  };

  return (
    <div className="form-container">
      <div className="text-center">
        <h2 className="form-title">Sign in to UniLink</h2>
        <p className="form-subtitle">Access your personalized learning experience</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <Button type="submit" className="btn-primary">
            Sign in
          </Button>
        </form>
      </Form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="btn-link"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
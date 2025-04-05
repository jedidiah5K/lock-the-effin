import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaGoogle, FaEnvelope, FaLockOpen, FaUser } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore.js';

const Register = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { register, loginWithGoogle, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;
    if (!validatePassword()) return;

    setIsSubmitting(true);
    try {
      await register(email, password, displayName);
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
            <FaLock className="text-3xl text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Join Lock The Eff In and boost your productivity
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-start">
            <div className="flex-1">{error}</div>
            <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">
              &times;
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-slate-400" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLockOpen className="text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input pl-10 w-full ${passwordError ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <FaLock className="mr-2" />
              )}
              Create Account
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                <FaGoogle className="mr-2 text-red-500" />
                Google
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

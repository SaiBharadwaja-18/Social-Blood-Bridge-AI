import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                Send Reset Link
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-success-600 dark:text-success-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Check your inbox and click the link to reset your password. The link will expire in 24 hours.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="block w-full rounded-lg border-2 border-primary-600 px-4 py-2.5 font-semibold text-primary-600 hover:bg-primary-50 transition-colors dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20"
              >
                Try Another Email
              </button>
              <Link
                to="/login"
                className="block rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                Back to Sign In
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or{' '}
              <Link
                to="/contact"
                className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                contact support
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

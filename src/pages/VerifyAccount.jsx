import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, PhoneAuthProvider, signInWithCredential, applyActionCode } from 'firebase/auth';

const VerifyAccount = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const verificationId = location.state?.verificationId;

  // Check for email verification or email recovery link on mount
  useEffect(() => {
    const auth = getAuth();
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (!mode || !oobCode) return;

    switch (mode) {
      case 'verifyEmail':
        applyActionCode(auth, oobCode)
          .then(() => {
            setSuccess(true);
            setError('');
          })
          .catch(() => {
            setError('Invalid or expired verification link.');
          });
        break;
      case 'recoverEmail':
        auth.checkActionCode(oobCode)
          .then((info) => {
            return auth.applyActionCode(oobCode);
          })
          .then(() => {
            setSuccess(true);
            setError('');
          })
          .catch(() => {
            setError('Unable to recover email. The link may be invalid or expired.');
          });
        break;
      default:
        break;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.trim().length === 6) {
      const auth = getAuth();
      try {
        const credential = PhoneAuthProvider.credential(verificationId, code);
        await signInWithCredential(auth, credential);
        setSuccess(true);
        setError('');
      } catch (err) {
        setError('Invalid or expired verification code. Please try again.');
      }
    } else {
      setError('Please enter a valid 6-digit verification code.');
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/provider-dashboard'); // Redirect after email verification or recovery (update if role logic needed)
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Verify Your Account</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Enter the 6-digit code sent to your phone to complete verification.
        </p>
        {/* Email verification status messages */}
        {success && (
          <div className="mb-4 text-green-600 dark:text-green-400">
            Email verified successfully! Redirecting...
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
            placeholder="Enter verification code"
          />
          {/* Keep phone code error/success below input for phone verification */}
          {/* Only show if not email verification */}
          {!window.location.search.includes('mode=verifyEmail') && error && (
            <p className="text-red-500">{error}</p>
          )}
          {!window.location.search.includes('mode=verifyEmail') && success && (
            <div>
              <p className="text-green-500">Account verified successfully!</p>
              <p className="text-sm text-gray-400 mt-1">Redirecting...</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Submit Code
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
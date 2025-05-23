

import React, { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Enroll2FA = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const formatPhoneNumber = (number) => {
    if (!number.startsWith('+1')) {
      return '+1' + number.replace(/[^\d]/g, '');
    }
    return number;
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => handleSendCode()
      }, auth);
    }
  };

  const handleSendCode = async () => {
    setupRecaptcha();
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setMessage('Verification code sent!');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) return;

    try {
      await confirmationResult.confirm(verificationCode);
      setMessage('Phone number verified successfully!');
      navigate('/provider-dashboard'); // Adjust path if needed
    } catch (error) {
      setMessage('Invalid verification code.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Verify Your Phone</h2>

        <input
          type="text"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded text-black"
        />
        <button
          onClick={handleSendCode}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-4"
        >
          Send Verification Code
        </button>

        <input
          type="text"
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded text-black"
        />
        <button
          onClick={handleVerifyCode}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Verify Code
        </button>

        <div id="recaptcha-container"></div>

        {message && (
          <p className="text-center mt-4 text-red-500 dark:text-red-400">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Enroll2FA;
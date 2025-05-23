

import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountCreated = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/verify');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Account Created Successfully!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please check your email for a verification code and enter it to complete the signup process.
        </p>
        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Go to Verification Page
        </button>
      </div>
    </div>
  );
};

export default AccountCreated;
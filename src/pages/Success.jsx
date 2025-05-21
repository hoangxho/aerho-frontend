import React from 'react';

export default function Success() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-center p-10">
      <h1 className="text-2xl font-bold text-green-600">Subscription Successful!</h1>
      <p className="mt-4 mb-6">Thanks for subscribing to Aerho. You can now access all features.</p>
      <a
        href="/provider-dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Return to Dashboard
      </a>
    </div>
  );
}
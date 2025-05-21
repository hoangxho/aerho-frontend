import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [showContent, setShowContent] = useState(false);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500 px-4 pt-28 pb-10 flex flex-col items-center justify-between relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900 opacity-10 pointer-events-none z-0" />

      {/* Top Navigation */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-5 py-4 z-10">
        <div className="text-xl font-bold tracking-widest text-blue-500 dark:text-blue-400">
          AERHO
        </div>
        <button
          onClick={toggleDarkMode}
          className="text-sm border px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      {/* Logo */}
      <img
        src={logo}
        alt="Aerho Logo"
        className={`w-80 sm:w-96 h-auto object-contain z-10 transition-all duration-1000 ease-in-out transform ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      />

      {/* Main Content */}
      <div
        className={`flex flex-col items-center space-y-6 z-10 mt-[-20px] transition-all duration-1000 ease-in-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <p className="text-center text-md sm:text-lg text-gray-600 dark:text-gray-300">
          The future of care — simplified.
        </p>

        <div className="flex flex-col items-center space-y-2">
          <span className="text-xl font-semibold">Login:</span>
          <div className="w-1/2 border-b border-black dark:border-white max-w-xs sm:max-w-md" />
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login/provider')}
            className="border border-blue-500 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white font-semibold rounded-full transition w-full sm:w-auto px-6 py-2 transform hover:scale-[1.02] active:scale-95"
          >
            Provider
          </button>
          <span className="text-lg font-medium">or</span>
          <button
            onClick={() => navigate('/login/patient')}
            className="border border-blue-500 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white font-semibold rounded-full transition w-full sm:w-auto px-6 py-2 transform hover:scale-[1.02] active:scale-95"
          >
            Patient
          </button>
        </div>

        {/* Create Account */}
        <button
          onClick={() => navigate('/create-account')}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2"
        >
          Create Account
        </button>
      </div>

      {/* CTA + Footer */}
      <div
        className={`flex flex-col items-center space-y-3 mt-16 z-10 transition-all duration-1000 ease-in-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <p className="text-sm text-gray-400 dark:text-gray-500">
          New to Aerho?{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 underline">
            Learn more
          </a>
        </p>

        <footer className="text-sm text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Aerho. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
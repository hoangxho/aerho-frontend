import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firebase';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [retypePassword, setRetypePassword] = useState('');
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [role, setRole] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [referral, setReferral] = useState('');
  const [error, setError] = useState('');
  const [terms, setTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  // Password strength function
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return '';
    if (pwd.length < 6) return 'Weak';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 'Strong';
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) return 'Medium';
    return 'Weak';
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    setPasswordStrength(checkPasswordStrength(val));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!terms) {
      setError('You must accept the terms and conditions.');
      return;
    }
    if (password !== retypePassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        name,
        phone,
        email,
        role,
        referral,
      };
      if (role === 'provider') {
        userData.clinicName = clinicName;
        userData.specialty = specialty;
      }
      await setDoc(doc(db, 'users', userCred.user.uid), userData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not create account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Create Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign up to get started</p>
        </div>

        <form
          onSubmit={handleSignUp}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-6 py-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-xs text-blue-600 dark:text-blue-400"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className={`mt-1 text-xs font-semibold ${
              passwordStrength === 'Strong'
                ? 'text-green-500'
                : passwordStrength === 'Medium'
                ? 'text-yellow-500'
                : passwordStrength === 'Weak'
                ? 'text-red-500'
                : 'text-gray-400'
            }`}>
              {passwordStrength && `Password Strength: ${passwordStrength}`}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Retype Password</label>
            <div className="relative">
              <input
                type={showRetypePassword ? 'text' : 'password'}
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-xs text-blue-600 dark:text-blue-400"
                onClick={() => setShowRetypePassword((v) => !v)}
                tabIndex={-1}
              >
                {showRetypePassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Choose account type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md shadow-none appearance-none"
            >
              <option value="">Choose one</option>
              <option value="patient">Patient</option>
              <option value="provider">Provider</option>
            </select>
          </div>
          {role === 'provider' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Referral Code (optional)</label>
            <input
              type="text"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={terms}
              onChange={() => setTerms((v) => !v)}
              required
              className="mr-2"
            />
            <span className="text-xs text-gray-600 dark:text-gray-300">
              I agree to the <a href="#" className="text-blue-600 dark:text-blue-400 underline">Terms and Conditions</a>
            </span>
          </div>
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition active:scale-95"
          >
            Create Account
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
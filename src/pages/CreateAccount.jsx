import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firebase';
import { PhoneAuthProvider, signInWithPhoneNumber } from 'firebase/auth';
import { getRecaptchaVerifier } from '../firebase';

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
  const [countryCode, setCountryCode] = useState('+1');

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = getRecaptchaVerifier();
      window.recaptchaVerifier.render().then((widgetId) => {
        console.log("reCAPTCHA rendered:", widgetId);
      });
    }
  }, []);

  const setUpRecaptcha = (number) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = getRecaptchaVerifier();
    }
    return signInWithPhoneNumber(auth, number, window.recaptchaVerifier);
  };

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
      console.log('Terms not accepted');
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
        createdAt: new Date().toISOString(),
      };
      if (role === 'provider') {
        userData.clinicName = clinicName;
        userData.specialty = specialty;
      }
      await setDoc(doc(db, 'users', userCred.user.uid), userData);
      // Redirect to verify-account after account creation
      console.log('User account created, navigating to verify-account with email:', email);
      // 1. Fix countryCode formatting
      const fullPhoneNumber = `${countryCode}${phone}`;
      // 3. Move getRecaptchaVerifier().render() before submit
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = getRecaptchaVerifier();
        await window.recaptchaVerifier.render();
      }
      // 2. Strengthen recaptchaVerifier handling
      const appVerifier = window.recaptchaVerifier || getRecaptchaVerifier();
      console.log("Using phone number:", fullPhoneNumber);
      console.log("App verifier object:", appVerifier);
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      navigate('/verify-account', { state: { verificationId: confirmationResult.verificationId } });
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
            <div className="flex space-x-2">
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                value={phone.replace(/\D/g, '').slice(0, 10)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(digits);
                }}
                placeholder="e.g., 1234567890"
                required
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            disabled={!terms}
            className={`w-full py-2 rounded-md transition active:scale-95 ${
              terms ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
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
      <div id="recaptcha-container"></div>
    </div>
  );
}
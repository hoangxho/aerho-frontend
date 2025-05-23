import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ProviderLogin from './pages/ProviderLogin';
import PatientLogin from './pages/PatientLogin';
import CreateAccount from './pages/CreateAccount';
import ProviderDashboard from './pages/ProviderDashboard';
import VerifyAccount from './pages/VerifyAccount';
// import PatientDashboard from './pages/PatientDashboard';
import Success from './pages/Success';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/provider" element={<ProviderLogin />} />
      <Route path="/login/patient" element={<PatientLogin />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      <Route path="/verify-account" element={<VerifyAccount />} />
      {/* <Route path="/patient-dashboard" element={<PatientDashboard />} /> */}
      <Route path="/success" element={<Success />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';
import Intro from "./home/intro";
import Login from "./authentication/seekerlogin";
import Seeker_register from "./authentication/seeker_register";
import { GoogleOAuthProvider } from "@react-oauth/google";
import EmailResend from "./authentication/email_resend";
import VerifyEmailPage from "./authentication/confirmation";
import AdminDashboard from "./adminpages/dashboard";
import Login_protector from "./protuctedrouters/login_protector";
import ProtectedRoute from "./protuctedrouters/Protuctedroute";
import HrDashboard from "./hrpages/dashboard";
import Sidebar from "./adminpages/sidebar";
import HR_details from "./adminpages/hr_details";
import SetupMFA from "./authentication/enable_mfa";
import DisableMFA from "./authentication/disable-mfa";
import CandidateProfile from "./profiles/candidate";
import CandidateDashboard from "./candidatepages/dashboard";
import ForgotPassword from "./authentication/forgot_password";
import ResetPassword from "./authentication/reset_password";
import HRRegister from "./authentication/hr_register";
import HROutlet from "./hrpages/sidebar_outlet/outlet";
import HRJobs from "./hrpages/jobs/jobs";
import CreateJob from "./hrpages/jobs/createjob";
import InviteManagement from "./hrpages/invitation/invite";
import InvitationRegister from "./hrpages/invitation/inviteregister";
import SecuritySettings from "./hrpages/security/menus";

function App() {
  const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Login_protector><Intro /></Login_protector>} />
          <Route path="/login" element={<Login_protector><Login /></Login_protector>} />
          <Route path="/register" element={<Login_protector><Seeker_register /></Login_protector>} />
          <Route path="/hr/register" element={<Login_protector><HRRegister /></Login_protector>} />
          <Route path="/resend/link" element={ <Login_protector><EmailResend /></Login_protector>} />
           <Route path="/verify-email/:uidb64/:token" element={<Login_protector><VerifyEmailPage /></Login_protector>} />
          <Route path="/forgot/password" element={<Login_protector><ForgotPassword /></Login_protector>} />
          <Route path="/reset-password/:uid/:token" element={<Login_protector><ResetPassword /></Login_protector>} />
          <Route path="/register/:token" element={<Login_protector><InvitationRegister /></Login_protector>} />
          

          <Route path="/hr/setup-mfa" element={<SetupMFA />} />
          <Route path="/hr/disable-mfa" element={<DisableMFA />} />

          {/* ---- candidate pages ---- */}

          <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateProfile /></ProtectedRoute>} />

          {/* ---- hr pages ---- */}
          
          <Route path="/hr" element={<ProtectedRoute allowedRoles={['HR']}><HROutlet /></ProtectedRoute>} >
          <Route path="dashboard" element={<HrDashboard />} />
          <Route path="jobs" element={<HRJobs />} />
          <Route path="create-job" element={<CreateJob />} />
          <Route path="all-users" element={<InviteManagement />} />
          <Route path="security" element={<SecuritySettings />} />
          </Route>
          
          
          {/* ---- admin pages ---- */}
          <Route path="/admin" element={<Sidebar />}>


          <Route path="hr/details" element={<ProtectedRoute allowedRoles={['ADMIN']}><HR_details /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          </Route>

          

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

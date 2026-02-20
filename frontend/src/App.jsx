import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';
import Intro from "./home/intro";
import Seekerlogin from "./authentication/seekerlogin";
import Hrlogin from "./authentication/hrlogin";
import Seeker_register from "./authentication/seeker_register";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Seeker_home from "./home/seeker_home";
import EmailResend from "./authentication/email_resend";
import VerifyEmailPage from "./authentication/confirmation";
import Options from "./authentication/options";
import HrProfile from "./profiles/hr_profile";
import Hr_companydetails from "./profiles/hr_companydetails";
import LoginOptions from "./authentication/loginoptions";
import AdminDashboard from "./adminpages/dashboard";
import Login_protector from "./protuctedrouters/login_protector";
import ProtectedRoute from "./protuctedrouters/Protuctedroute";
import HrDashboard from "./hrpages/dashboard";
import Sidebar from "./adminpages/sidebar";
import HR_details from "./adminpages/hr_details";
function App() {
  const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


  return (
    <GoogleOAuthProvider clientId={GOOGLE_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Login_protector><Intro /></Login_protector>} />
          <Route path="/login" element={<Login_protector><Seekerlogin /></Login_protector>} />
          <Route path="/register" element={<Login_protector><Seeker_register /></Login_protector>} />
          <Route path="/resend/link" element={ <Login_protector><EmailResend /></Login_protector>} />
          <Route path="/hr/login" element={<Login_protector><Hrlogin /></Login_protector>} />
           <Route path="/verify-email/:uidb64/:token" element={<Login_protector><VerifyEmailPage /></Login_protector>} />
          <Route path="/options" element={<Login_protector><Options /></Login_protector>} />
          <Route path="/hr/profile" element={<Login_protector><HrProfile /></Login_protector>} />
          <Route path="/hr/company-details" element={<Login_protector><Hr_companydetails /></Login_protector>} />
          <Route path="/login/options" element={<Login_protector><LoginOptions /></Login_protector>} />

          {/* ---- candidate pages ---- */}

          <Route path="/home" element={<ProtectedRoute allowedRoles={['HR','CANDIDATE',"ADMIN"]}><Seeker_home /></ProtectedRoute>} />

          {/* ---- hr pages ---- */}
          <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR',"ADMIN"]}><HrDashboard /></ProtectedRoute>} />
          
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

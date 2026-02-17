import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';
import Intro from "./home/intro";
import Seekerlogin from "./authentication/seekerlogin";
import Hrlogin from "./authentication/hrlogin";
import Seeker_register from "./authentication/seeker_register";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


  return (
    <GoogleOAuthProvider clientId={GOOGLE_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Seekerlogin />} />
          <Route path="/register" element={<Seeker_register />} />
          <Route path="/hrlogin" element={<Hrlogin />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

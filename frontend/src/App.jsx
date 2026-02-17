import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"

import './App.css'
import Intro from "./home/intro"
import Seekerlogin from "./authentication/seekerlogin"
import Hrlogin from "./authentication/hrlogin"
import Seeker_register from "./authentication/seeker_register"
function App() {
  return (
    <Router>


        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Seekerlogin />} />
          <Route path="/register" element={<Seeker_register />} />
          <Route path="/hrlogin" element={<Hrlogin />} />
          {/* <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} /> */}
        </Routes>
    </Router>
  )
}

export default App

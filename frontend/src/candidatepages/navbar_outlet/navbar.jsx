import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; 
import api from "../../api/api";

export default function CandidateNavbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("management/candidate/profile/"); 
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Helper function for NavLink styles to keep the JSX clean
  const navLinkStyles = ({ isActive }) => 
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
      isActive 
        ? "border-blue-500 text-gray-900" 
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">HireFlow</Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink to="/candidate/jobs" className={navLinkStyles}>
                Find Jobs
              </NavLink>

              {/* Added: My Jobs (Applied Jobs) */}
              <NavLink to="/candidate/my-applications" className={navLinkStyles}>
                My Applications
              </NavLink>

              {/* Added: Saved Jobs */}
              <NavLink to="/candidate/saved-jobs" className={navLinkStyles}>
                Saved Jobs
              </NavLink>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Notifications */}
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Profile Dropdown Area */}
            <div className="ml-3 relative flex items-center">
              <div className="text-right mr-3 hidden md:block">
                {loading ? (
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.user?.username || "Guest User"}
                    </p>
                    <p className="text-[10px] text-blue-500 font-medium uppercase tracking-wider">Candidate</p>
                  </>
                )}
              </div>
              
              <button 
                onClick={() => navigate("/candidate/profile")} 
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-105"
              >
                <img
                  className="h-9 w-9 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                  /* Updated to use profile_image from your model. 
                    Cloudinary URLs will load here automatically.
                  */
                  src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.user?.username || 'User'}&background=0D8ABC&color=fff`}
                  alt="Profile"
                />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
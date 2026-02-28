import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; 
import api from "../../api/api";

export default function CandidateNavbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
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

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">HireFlow</Link>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink
                to="/candidate/jobs"
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300"
                  }`
                }
              >
                Find Jobs
              </NavLink>
          
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

           
            <div className="ml-3 relative flex items-center">
              <div className="text-right mr-3">
                {loading ? (
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">
                      {user?.user.username || "Guest User"}
                    </p>
                    <p className="text-xs text-gray-500">Candidate</p>
                  </>
                )}
              </div>
              <button onClick={()=>navigate("/candidate/profile")} className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <img
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  src={user?.profilePicture || "https://ui-avatars.com/api/?name=" + user?.user.username}
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
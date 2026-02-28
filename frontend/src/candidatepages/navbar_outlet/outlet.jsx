import React from "react";
import { Outlet } from "react-router-dom";
import CandidateNavbar from "./navbar";

export default function CandidateOutlet() {
  return (
    // min-h-screen ensures the background covers the whole page
    // bg-gray-50 is a standard "Job Board" background color
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Sticky Top Navbar */}
      <div className="sticky top-0 z-50">
        <CandidateNavbar />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* This is where your Find Jobs / Applications pages will render */}
          <Outlet />
        </div>
      </main>

      {/* Optional: Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2026 HireMe Job Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
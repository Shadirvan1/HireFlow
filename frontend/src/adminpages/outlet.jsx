import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'

export default function AdminOutlet() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 1. Permanent Sidebar */}
      <Sidebar />

      {/* 2. Main Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* 3. Top Navbar (Optional but recommended) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, Admin</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
              AD
            </div>
          </div>
        </header>

        {/* 4. Scrollable Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          <div className="max-w-7xl mx-auto">
            {/* This is where your nested routes (Dashboard, Users, etc.) will appear */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
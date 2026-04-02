import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'



export default function AdminOutlet() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Simplified Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-8">
           <div className="flex items-center gap-2">
             <span className="text-sm text-gray-500">Admin</span>
             <div className="w-8 h-8 rounded-full bg-blue-600" />
           </div>
        </header>

        {/* Main content - removed 'relative' to prevent ghosting */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
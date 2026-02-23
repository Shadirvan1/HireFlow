import React from "react";
import { Outlet } from "react-router-dom";
import HRSidebar from "./sidebar";

export default function HROutlet() {
  return (
    <div className="flex h-screen bg-gray-200">
      <HRSidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
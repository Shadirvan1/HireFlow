import React from "react";
import { Outlet } from "react-router-dom";
import HRSidebar from "./sidebar";
import AIChatButton from "../../ai_chat/AiChatIcon";
export default function HROutlet() {
  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      <HRSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
        <AIChatButton />
      </div>
    </div>
  );
}
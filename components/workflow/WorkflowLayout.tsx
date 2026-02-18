"use client";

import Sidebar from "./Sidebar";
import SidebarNavigation from "./SidebarNavigation";

export default function WorkflowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarNavigation />
      </Sidebar>

      {/* Main Content (EditorPage will render here) */}
      <div className="flex-1 relative">
        {children}
      </div>

    </div>
  );
}

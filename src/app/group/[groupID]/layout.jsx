"use client";

import NavPanel from "@/components/NavPanel";
import { useParams } from "next/navigation";

export default function Layout({ children }) {
    const {groupID} =  useParams();
  return (
    <div className="flex min-h-screen w-full">
      {/* NavPanel is rendered once. It shows a fixed sidebar on md+ and a hamburger on smaller screens */}
      <NavPanel groupID = {groupID} />
      
      {/* 
          On md+ screens, add left margin to account for the fixed sidebar (e.g. 16rem, which is md:w-64).
          On mobile, no extra margin is needed.
      */}
      <main className="flex-1 p-2 bg-gray-100">
        {children}
      </main>
    </div>
  );
}

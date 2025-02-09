"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

// Define your navigation items and their corresponding sub-paths
const navItems = [
  { label: "Summary 📊", path: "" },
  { label: "My Dues 😢", path: "myDues" },
  { label: "Who Owes Me 🤨", path: "whoOwesMe" },
  { label: "All Expenses 💵", path: "allExpenses" },
  { label: "Timeline(AI) 🤖", path: "timeline" },
  { label: "Settle UP 🤝", path: "settleUp" },
];

export default function NavPanel({ groupID }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  // Base URL for links using the dynamic groupID.
  const base = `/group/${groupID}`;

  // Render the navigation links with active highlighting and smooth animations.
  const renderNavLinks = () => (
    <nav className="flex flex-col space-y-2 justify-center">
      {navItems.map((item) => {
        // Build the link href. If the item's path is empty, it simply uses the base.
        const linkHref = `${base}${item.path ? `/${item.path}` : ""}`;
        // Check if the current pathname matches this link for active highlighting.
        const isActive = pathname === linkHref;
        return (
          <Link key={item.path} href={linkHref}>
            <span
              className={`block px-4 py-3 rounded-md transition-transform duration-200 ease-in-out cursor-pointer 
              ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-800 hover:bg-blue-100"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Sidebar for medium screens and up */}
      <aside className="hidden md:block md:w-64 bg-white p-6 shadow-xl rounded-lg">
        {renderNavLinks()}
      </aside>

      {/* Hamburger button for small screens */}
      <div className="md:hidden top-20 fixed right-0">
        <Button onClick={() => setDrawerOpen(true)} variant="outline">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </Button>
      </div>

      {/* Drawer for mobile navigation */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="p-6 rounded-lg shadow-xl">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              Navigation
            </DrawerTitle>
            <DrawerDescription className="text-gray-500">
              Select a page to navigate
            </DrawerDescription>
          </DrawerHeader>
          {renderNavLinks()}
        </DrawerContent>
      </Drawer>
    </>
  );
}

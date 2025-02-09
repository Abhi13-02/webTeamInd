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
  { label: "Summary", path: "" },
  { label: "My Dues", path: "myDues" },
  { label: "Who Owes Me", path: "whoOwesMe" },
  { label: "All Expenses", path: "allExpenses" },
  { label: "Timeline", path: "timeline" },
  { label: "Settle UP", path: "settleUp" },
];

export default function NavPanel({groupID}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Determine a base URL for our links.
  // For simplicity, we assume that the current pathname is the base (without a trailing slash).
  const base = `/group/${groupID}`;

  // Function to render the list of nav links
  const renderNavLinks = () => (
    <nav className="flex flex-col h-full space-y-2 bg-blue-300">
      {navItems.map((item) => (
        <Link key={item.path} href={`${base}/${item.path}`}>
          {/* Note: When using Next.js 13, you can pass className directly to Link */}
          <span className="block px-4 py-2 rounded hover:bg-gray-200 cursor-pointer">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Sidebar visible on medium screens and up */}
      <aside className="hidden md:block md:w-64 bg-white p-4 shadow-md">
        {renderNavLinks()}
      </aside>

      {/* Hamburger button for small screens */}
      <div className="md:hidden p-4">
        <Button onClick={() => setDrawerOpen(true)} variant="outline">
          {/* Inline SVG hamburger icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          <span className="ml-2">Menu</span>
        </Button>
      </div>

      {/* Drawer for mobile navigation */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="p-6">
          <DrawerHeader>
            <DrawerTitle>Navigation</DrawerTitle>
            <DrawerDescription>Select a page to navigate</DrawerDescription>
          </DrawerHeader>
          {renderNavLinks()}
        </DrawerContent>
      </Drawer>
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Main Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
        Welcome to Expense Tracker
      </h1>
      
      {/* Get Started Button */}
      <Link href="/sign-in">
        <Button variant="default" size="lg" className="mb-12">
          Get Started
        </Button>
      </Link>

      {/* Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Card 1: Track Expenses */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Track Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            Log your shared expenses quickly and accurately.
          </CardContent>
        </Card>
        
        {/* Card 2: Visual Reports */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Visual Reports</CardTitle>
          </CardHeader>
          <CardContent>
            Analyze your spending with interactive charts and graphs.
          </CardContent>
        </Card>
        
        {/* Card 3: Secure & Private */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Secure & Private</CardTitle>
          </CardHeader>
          <CardContent>
            Your data is protected with industry-standard security measures.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

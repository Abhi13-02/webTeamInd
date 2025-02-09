"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      {/* Heading */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 text-center">
        Welcome to <span className="text-blue-600">Expense Tracker</span>
      </h1>

      {/* Get Started Button */}
      <Link href="/sign-in">
        <Button
          variant="default"
          size="lg"
          className="mb-12 px-6 py-3 text-lg font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 transition-all duration-300"
        >
          🚀 Get Started
        </Button>
      </Link>

      {/* Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {features.map((feature, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-white border">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold text-gray-800">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-center text-md px-6 pb-6">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Features Data
const features = [
  { title: "📊 Track Expenses", description: "Log your shared expenses quickly and accurately." },
  { title: "📈 Visual Reports", description: "Analyze your spending with interactive charts and graphs." },
  { title: "🤖 AI-Powered Insights", description: "Get smart tips & expense summaries with our AI-powered generator." },
];

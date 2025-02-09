"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { createGroup, deleteGroup , getGroupsForUser } from "@/serverActions/dashboardActions";

export default function Dashboard() {
  // State to store groups
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState(null);

  // Drawer state for creating a new group
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form state for the create group form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goalBudget: "",
  });
  const [loading, setLoading] = useState(false);

  // Get the current user from Clerk
  const { user } = useUser();

  // Manually fetch groups for the current user
  const fetchGroups = async () => {
    if (!user || !user.id) return;
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const res = await getGroupsForUser();
      if (!res.success) {
        throw new Error("Failed to fetch groups");
      }
      const data =  res.data;
      setGroups(data);
    } catch (error) {
      setGroupsError(error);
      toast.error(error.message);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Fetch groups when the user data is available
  useEffect(() => {
    if (user && user.id) {
      fetchGroups();
    }
  }, [user]);

  // Handle input changes for the create group form
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle create group form submission
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createGroup(formData);
      if (!res.success) {
        throw new Error("Failed to create group");
      }
      toast.success("Group created successfully");
      setDrawerOpen(false);
      // Clear form and refresh groups list
      setFormData({ name: "", description: "", goalBudget: "" });
      fetchGroups();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async (groupId) => {
    try {
      const res = await deleteGroup(groupId);
      if (!res.success) {
        throw new Error("Failed to delete group");
      }
      toast.success("Group deleted successfully");
      fetchGroups();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="h-screen mt-28 p-4 bg-gray-100">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => setDrawerOpen(true)}>Create New Group</Button>
      </header>

      <section>
        {groupsLoading ? (
          <p>Loading groups...</p>
        ) : groupsError ? (
          <p className="text-red-500">Error: {groupsError.message}</p>
        ) : groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              // Determine the current user's role in the group
              const memberInfo = group.members.find(
                (m) => m.user.id === group.createdBy
              );
              const role = memberInfo ? memberInfo.role : "Unknown";
              return (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{group.description || "No description provided."}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Members: {group.members.length} | Your Role: {role}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Link href={`/group/${group.id}`}>
                      <Button variant="outline" size="sm">
                        View Group
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <p>No groups found. Create a new group to get started!</p>
        )}
      </section>

      {/* Drawer for Creating a New Group */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="p-6">
          <DrawerHeader>
            <DrawerTitle>Create New Group</DrawerTitle>
            <DrawerDescription>
              Fill out the form below to create a new group.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Goal Budget
              </label>
              <input
                type="number"
                name="goalBudget"
                value={formData.goalBudget}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.01"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

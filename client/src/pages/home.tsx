import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StoryChain from "@/components/story-chain";
import StoryInput from "@/components/story-input";
import RoomManager from "@/components/room-manager";
import CommunityStats from "@/components/community-stats";
import { Cookie, Calendar, Users, Plus, Menu, User, Bookmark, Heart, MessageCircle, Share, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { PageLoader } from "@/components/loading-spinner";
import type { StoryChain as StoryChainType, Theme, CommunityStats as CommunityStatsType } from "@shared/schema";

import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"global" | "themed">("global");

  // All hooks must be called before conditional returns
  // Initialize WebSocket connection
  const websocketConnection = currentUser ? useWebSocket(currentUser.id, "global") : null;

  // Fetch story chains
  const { data: storyChains = [], isLoading: chainsLoading } = useQuery<StoryChainType[]>({
    queryKey: ["/api/stories/chains"],
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: isAuthenticated && !!currentUser,
  });

  // Fetch daily theme
  const { data: dailyTheme } = useQuery<Theme>({
    queryKey: ["/api/themes/daily"],
    enabled: isAuthenticated && !!currentUser,
  });

  // Fetch community stats
  const { data: communityStats } = useQuery<CommunityStatsType>({
    queryKey: ["/api/community/stats"],
    refetchInterval: 60000, // Refetch every minute
    enabled: isAuthenticated && !!currentUser,
  });

  // Submit story mutation
  const submitStoryMutation = useMutation({
    mutationFn: api.submitStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories/chains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/stats"] });
      toast({
        title: "Story added!",
        description: "Your contribution has been added to the chain.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit story",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  // Show loading while authentication is being determined
  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmitStory = (content: string) => {
    if (!currentUser) return;

    const currentChain = storyChains[0];

    submitStoryMutation.mutate({
      content,
      authorId: currentUser.id,
      authorName: currentUser.username || currentUser.email || "Anonymous",
      chainId: currentChain?.chainId || 1,
      roomId: null,
    });
  };

  const currentStoryChain = storyChains[0]; // Use first available chain for now

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-light-beige/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warm-teal to-warm-brown rounded-full flex items-center justify-center text-white text-xl float-animation">
                <Cookie className="w-5 h-5 icon-animate" />
              </div>
              <div>
                <h1 className="font-serif font-semibold text-xl text-gray-800 dark:text-white">
                  Cookie's
                </h1>
                <p className="font-serif text-sm text-gray-600 dark:text-gray-300 -mt-1">
                  Someone Somewhere
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Inspired by Nemrah Ahmed
                </p>
              </div>
            </div>

            {/* Navigation and User Actions */}
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
                  Home
                </Link>
                <Link href="/community" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
                  Community
                </Link>
                <Link href="/rooms" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
                  Rooms
                </Link>
                <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
                  Profile
                </Link>
              </nav>

              {/* User Actions */}
              <div className="flex items-center space-x-3">
                <div className="theme-toggle">
                  <ThemeToggle />
                </div>
                <div className="flex items-center space-x-3">
                  {currentUser && <UserProfile user={currentUser} compact />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Story Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-white/60 dark:bg-gray-800/60 p-1 backdrop-blur-sm border border-orange-200/30 dark:border-gray-700/30">
            <button
              onClick={() => setActiveTab("global")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === "global"
                  ? "bg-gradient-to-r from-warm-teal to-warm-brown text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-warm-teal dark:hover:text-warm-teal"
              }`}
            >
              Global Story
            </button>
            <button
              onClick={() => setActiveTab("themed")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === "themed"
                  ? "bg-gradient-to-r from-warm-teal to-warm-brown text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-warm-teal dark:hover:text-warm-teal"
              }`}
            >
              Today's Theme
            </button>
          </div>
        </div>

        {/* Daily Theme Banner - Only show on themed tab */}
        {activeTab === "themed" && dailyTheme && (
          <Card className="mb-8 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 border-orange-200 dark:border-orange-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                    Today's Theme: {dailyTheme.title}
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 mt-1">
                    {dailyTheme.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Story Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Story Chain */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-0">
                {chainsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading story...</p>
                  </div>
                ) : currentStoryChain ? (
                  <StoryChain
                    chain={currentStoryChain}
                    currentUser={currentUser}
                    onContinue={handleSubmitStory}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {activeTab === "global" ? "Start the Global Story!" : "Begin Today's Theme!"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {activeTab === "global" 
                        ? "Be the first to contribute to our community story."
                        : `Start a story inspired by today's theme: ${dailyTheme?.title || 'Loading...'}`
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Story Input */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <StoryInput
                  onSubmit={handleSubmitStory}
                  isSubmitting={submitStoryMutation.isPending}
                  placeholder={
                    activeTab === "global"
                      ? "Continue the global story..."
                      : dailyTheme
                      ? `Write a story inspired by "${dailyTheme.title}"...`
                      : "Write your story..."
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <CommunityStats stats={communityStats} />

            {/* Room Manager */}
            <RoomManager currentUser={currentUser} />
          </div>
        </div>
      </main>
    </div>
  );
}
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
import {
  Cookie,
  Calendar,
  Users,
  Plus,
  Menu,
  User,
  Bookmark,
  Heart,
  MessageCircle,
  Share,
  Book,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { PageLoader } from "@/components/loading-spinner";
import type {
  StoryChain as StoryChainType,
  Theme,
  CommunityStats as CommunityStatsType,
} from "@shared/schema";

import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"global" | "themed">("global");

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

  // Initialize WebSocket connection
  useWebSocket(currentUser.id, "global");

  // Fetch story chains
  const { data: storyChains = [], isLoading: chainsLoading } = useQuery<
    StoryChainType[]
  >({
    queryKey: ["/api/stories/chains"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch daily theme
  const { data: dailyTheme } = useQuery<Theme>({
    queryKey: ["/api/themes/daily"],
  });

  // Fetch community stats
  const { data: communityStats } = useQuery<CommunityStatsType>({
    queryKey: ["/api/community/stats"],
    refetchInterval: 60000, // Refetch every minute
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
        title: "Error",
        description: "Failed to add your story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStorySubmit = async (content: string, chainId?: number) => {
    if (!content.trim()) return;

    try {
      // Get next chain ID if starting a new chain
      const finalChainId = chainId || (await api.getNextChainId());

      // Determine sequence number
      const existingChain = chainId
        ? storyChains.find((c) => c.chainId === chainId)
        : null;
      const sequence = existingChain ? existingChain.stories.length + 1 : 1;

      await submitStoryMutation.mutateAsync({
        chainId: finalChainId,
        content,
        roomId: null, // Global room
        authorId: currentUser.id,
        authorName: currentUser.username || "Anonymous",
      });
    } catch (error) {
      console.error("Failed to submit story:", error);
    }
  };

  return (
    <div className="min-h-screen bg-soft-cream dark:bg-gray-900 transition-colors duration-300">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="bg-story-gradient rounded-3xl p-8 mb-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Someone somewhere is...
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join our storytelling community and continue the endless chain of
              imagination. Every line builds upon another, creating beautiful
              stories together.
            </p>

            {/* Story Input */}
            <StoryInput
              onSubmit={handleStorySubmit}
              isSubmitting={submitStoryMutation.isPending}
              user={currentUser!}
              currentStory={
                storyChains.length > 0
                  ? storyChains[0].stories.map((s) => s.content).join(" ")
                  : ""
              }
            />

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button
                variant="outline"
                className="border-warm-teal text-warm-teal hover:bg-warm-teal hover:text-white btn-animate"
                onClick={() => (window.location.href = "/rooms")}
              >
                <Users className="w-4 h-4 mr-2 icon-animate" />
                Create Private Room
              </Button>
              <Button
                className="bg-warm-brown text-white hover:bg-warm-brown/90 btn-animate"
                onClick={() => (window.location.href = "/rooms")}
              >
                <Plus className="w-4 h-4 mr-2 icon-animate" />
                Join Room
              </Button>
              <Button
                variant="outline"
                className="border-warm-brown text-warm-brown hover:bg-warm-brown hover:text-white btn-animate"
                onClick={() => (window.location.href = "/community")}
              >
                <Book className="w-4 h-4 mr-2 icon-animate" />
                Browse Stories
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Actions - Key Features from initial.md */}
        <section className="mb-12">
          <h3 className="font-serif text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
            🍪 Cookie's Storytelling Hub
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Create Story Rooms */}
            <Card
              className="card-hover cursor-pointer"
              onClick={() => (window.location.href = "/rooms")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-warm-teal rounded-full flex items-center justify-center mx-auto mb-4 icon-animate">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Create Story Rooms
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Start private rooms with friends or join public storytelling
                  spaces
                </p>
                <Button className="w-full bg-warm-teal text-white hover:bg-warm-teal/90 btn-animate">
                  <Plus className="w-4 h-4 mr-2 icon-animate" />
                  Create Room
                </Button>
              </CardContent>
            </Card>

            {/* Join Collaborative Storytelling */}
            <Card
              className="card-hover cursor-pointer"
              onClick={() => (window.location.href = "/community")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-warm-brown rounded-full flex items-center justify-center mx-auto mb-4 icon-animate">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Collaborative Stories
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Continue where others left off and build amazing stories
                  together
                </p>
                <Button className="w-full bg-warm-brown text-white hover:bg-warm-brown/90 btn-animate">
                  <Heart className="w-4 h-4 mr-2 icon-animate" />
                  Join Stories
                </Button>
              </CardContent>
            </Card>

            {/* Manage Profile */}
            <Card
              className="card-hover cursor-pointer"
              onClick={() => (window.location.href = "/profile")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-warm-teal to-warm-brown rounded-full flex items-center justify-center mx-auto mb-4 icon-animate">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Your Profile
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Track contributions, earn badges, and see your storytelling
                  journey
                </p>
                <Button className="w-full bg-gradient-to-r from-warm-teal to-warm-brown text-white btn-animate">
                  <Bookmark className="w-4 h-4 mr-2 icon-animate" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Active Story Chains */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-2xl font-semibold text-gray-800">
              Active Story Chains
            </h3>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "global" ? "default" : "ghost"}
                onClick={() => setActiveTab("global")}
                className={
                  activeTab === "global"
                    ? "bg-warm-teal text-white"
                    : "text-gray-600"
                }
              >
                Global Room
              </Button>
              <Button
                variant={activeTab === "themed" ? "default" : "ghost"}
                onClick={() => setActiveTab("themed")}
                className={
                  activeTab === "themed"
                    ? "bg-warm-teal text-white"
                    : "text-gray-600"
                }
              >
                Themed
              </Button>
            </div>
          </div>

          {/* Story Chain Display */}
          <div className="space-y-4">
            {chainsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-teal mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading stories...</p>
              </div>
            ) : storyChains.length > 0 ? (
              storyChains.map((chain) => (
                <StoryChain
                  key={chain.chainId}
                  chain={chain}
                  currentUser={currentUser}
                  onContinue={handleStorySubmit}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Cookie className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No story chains yet. Be the first to start one!
                  </p>
                  <Button
                    onClick={() =>
                      handleStorySubmit(
                        "Someone somewhere is beginning a new adventure...",
                      )
                    }
                    className="bg-warm-teal text-white hover:bg-warm-teal/90"
                  >
                    Start First Story
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Load More */}
          {storyChains.length > 0 && (
            <div className="text-center mt-6">
              <Button
                variant="ghost"
                className="text-warm-teal hover:text-warm-brown"
              >
                Load more stories
              </Button>
            </div>
          )}
        </section>

        {/* Community Features Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Cookie's Picks */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white">
                  <Cookie className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-lg text-gray-800">
                    Cookie's Picks
                  </h4>
                  <p className="text-sm text-gray-600">This week's favorites</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-sm text-gray-800 mb-2">
                    "Someone somewhere is reading this and smiling, not knowing
                    they're exactly where they need to be."
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      by Mahnoor_philosopher
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-600"
                    >
                      <Cookie className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full mt-4 text-orange-600 hover:text-orange-700"
              >
                View all picks
              </Button>
            </CardContent>
          </Card>

          {/* Daily Theme */}
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-lg text-gray-800">
                    Today's Theme
                  </h4>
                  <p className="text-sm text-gray-600">Nemrah Ahmed Inspired</p>
                </div>
              </div>
              {dailyTheme && (
                <div className="bg-white/80 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-800 font-medium mb-2">
                    "{dailyTheme?.title}"
                  </p>
                  <p className="text-xs text-gray-600">{dailyTheme?.prompt}</p>
                </div>
              )}
              <Button className="w-full bg-teal-100 text-teal-700 hover:bg-teal-200">
                Join themed stories
              </Button>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <CommunityStats stats={communityStats} />
        </section>

        {/* Room Management Section */}
        <RoomManager currentUser={currentUser!} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-light-beige/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-warm-teal to-warm-brown rounded-full flex items-center justify-center text-white">
                  <Cookie className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-xl text-gray-800">
                  Cookie's Someone Somewhere
                </h3>
              </div>
              <Card className="bg-story-gradient">
                <CardContent className="p-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Special Thanks
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This app is inspired by the creativity of{" "}
                    <strong>Nemrah Ahmed</strong>, who gave us endless stories
                    and ideas to imagine beyond boundaries. Thank you for
                    inspiring readers and dreamers everywhere. This community is
                    built out of love, fun, and cookies 🍪.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    How to Play
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    Community Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    Cookie's Picks Archive
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    Featured Stories
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    Report Content
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-warm-teal transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 Cookie's Someone Somewhere. Made with ❤️ for storytellers
              everywhere.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-warm-teal"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-warm-teal text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all"
        onClick={() =>
          handleStorySubmit(
            "Someone somewhere is about to share something beautiful...",
          )
        }
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}

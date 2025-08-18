import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Heart, 
  MessageCircle, 
  Trophy, 
  Star, 
  BookOpen, 
  Calendar,
  Award,
  TrendingUp,
  Edit,
  Menu,
  Coffee,
  Home,
  Cookie
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { PageLoader } from "@/components/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { Story } from "@shared/schema";

export default function Profile() {
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Show loading while authentication is being determined
  if (isLoading) {
    return <PageLoader />;
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-light-beige/50 dark:border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
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
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-orange-600 text-white hover:bg-orange-700 btn-animate"
                >
                  Sign In to View Profile
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="py-8 text-center">
              <User className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Storytelling Journey</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sign in to view your profile, track your progress, and see your storytelling achievements.
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // In a real app, these would be actual API calls
  const { data: userStories = [] } = useQuery<Story[]>({
    queryKey: ["/api/users", currentUser.id, "stories"],
    queryFn: () => Promise.resolve([]), // Mock empty for now
  });

  const getBadgeInfo = (badgeId: string) => {
    const badges = {
      "first-story": { name: "First Story", icon: "📝", description: "Wrote your first story" },
      "heart-giver": { name: "Heart Giver", icon: "💝", description: "Gave 10 hearts to other stories" },
      "storyteller": { name: "Storyteller", icon: "📚", description: "Contributed to 5 story chains" },
      "daily-writer": { name: "Daily Writer", icon: "✍️", description: "Wrote stories for 7 consecutive days" },
      "community-favorite": { name: "Community Favorite", icon: "⭐", description: "Received 50 hearts" },
    };
    return badges[badgeId as keyof typeof badges] || { name: badgeId, icon: "🎖️", description: "Special achievement" };
  };

  const nextLevelXP = currentUser.level * 100;
  const currentLevelXP = (currentUser.level - 1) * 100;
  const progressToNextLevel = ((currentUser.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

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

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <div className="theme-toggle">
                <ThemeToggle />
              </div>
              <div className="flex items-center space-x-3">
                <UserProfile user={currentUser} compact />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20 border-4 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    {(currentUser.username || currentUser.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{currentUser.username || "Anonymous"}</h2>
                  <div className="flex items-center space-x-4 text-orange-100 mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none">
                      Level {currentUser.level}
                    </Badge>
                    <span className="text-sm">
                      Storyteller since {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress to Level {currentUser.level + 1}</span>
                      <span>{currentUser.experiencePoints} XP / {nextLevelXP} XP</span>
                    </div>
                    <Progress value={progressToNextLevel} className="bg-white/20" />
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Stories Written</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.heartsReceived || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Hearts Received</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Collaborations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Current Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stories">My Stories</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Start writing stories to see your activity here!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Favorite Genres */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-orange-500" />
                    Favorite Genres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-200">Fantasy</Badge>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">Romance</Badge>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">Adventure</Badge>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">Mystery</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No stories yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Start writing your first story!</p>
                  <Link href="/">
                    <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                      Write Your First Story
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-orange-500" />
                  Achievements & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Sample badges */}
                  <div className="text-center p-4 border rounded-lg opacity-50">
                    <div className="text-3xl mb-2">📝</div>
                    <h4 className="font-medium text-gray-900 dark:text-white">First Story</h4>
                    <p className="text-xs text-gray-500">Write your first story</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg opacity-50">
                    <div className="text-3xl mb-2">💝</div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Heart Giver</h4>
                    <p className="text-xs text-gray-500">Give 10 hearts to other stories</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg opacity-50">
                    <div className="text-3xl mb-2">📚</div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Storyteller</h4>
                    <p className="text-xs text-gray-500">Contribute to 5 story chains</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

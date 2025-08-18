import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Crown, Trophy, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { CookiesPick, CommunityStats } from "@shared/schema";

export default function Community() {
  const [activeTab, setActiveTab] = useState<"picks" | "stats" | "themes">("picks");

  // Fetch Cookie's Picks
  const { data: cookiesPicks = [] } = useQuery<CookiesPick[]>({
    queryKey: ["/api/community/cookies-picks"],
  });

  // Fetch community stats
  const { data: communityStats } = useQuery<CommunityStats>({
    queryKey: ["/api/community/stats"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-warm-beige">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-warm-brown/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-warm-brown">Community Hub</h1>
            <p className="text-warm-brown/70">Discover amazing stories and celebrate our storytellers</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === "picks" ? "default" : "outline"}
            onClick={() => setActiveTab("picks")}
            className="flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Cookie's Picks
          </Button>
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => setActiveTab("stats")}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Community Stats
          </Button>
          <Button
            variant={activeTab === "themes" ? "default" : "outline"}
            onClick={() => setActiveTab("themes")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Nemrah Ahmed Themes
          </Button>
        </div>

        {/* Cookie's Picks Tab */}
        {activeTab === "picks" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-warm-brown mb-2">🍪 Cookie's Picks</h2>
              <p className="text-warm-brown/70">Highlighting the most creative and heartwarming stories from our community</p>
            </div>

            {cookiesPicks.length === 0 ? (
              <Card className="p-8 text-center">
                <Crown className="w-16 h-16 mx-auto mb-4 text-warm-teal" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
                <p className="text-gray-600">Cookie's Picks will feature the best community stories each week.</p>
                <p className="text-sm text-gray-500 mt-2">Keep writing amazing stories to get featured here!</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {cookiesPicks.map((pick) => (
                  <Card key={pick.id} className="relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-warm-teal text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="pr-20">Story #{pick.storyId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{pick.reason}</p>
                      <div className="text-sm text-gray-500">
                        Featured on {new Date(pick.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Community Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-warm-brown mb-2">📊 Community Stats</h2>
              <p className="text-warm-brown/70">See how our storytelling community is growing</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
                  <div className="text-2xl font-bold text-warm-brown">{communityStats?.totalStories || 0}</div>
                  <div className="text-sm text-gray-600">Total Stories</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
                  <div className="text-2xl font-bold text-warm-brown">{communityStats?.activeUsers || 0}</div>
                  <div className="text-sm text-gray-600">Active Storytellers</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
                  <div className="text-2xl font-bold text-warm-brown">{communityStats?.totalHearts || 0}</div>
                  <div className="text-sm text-gray-600">Hearts Given</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
                  <div className="text-2xl font-bold text-warm-brown">{communityStats?.dailyContributions || 0}</div>
                  <div className="text-sm text-gray-600">Today's Stories</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Nemrah Ahmed Themes Tab */}
        {activeTab === "themes" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-warm-brown mb-2">✨ Nemrah Ahmed Themes</h2>
              <p className="text-warm-brown/70">Stories inspired by the beloved novelist's works</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-warm-teal" />
                    Jannat Kay Pattay Vibes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Stories about finding home in people, not places. Explore themes of belonging, 
                    family bonds, and the journey to discover where your heart truly feels at peace.
                  </p>
                  <Badge variant="secondary">Currently Active</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-warm-teal" />
                    Mystery & Secrets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Inspired by the intrigue in Nemrah's novels. Create stories with hidden truths, 
                    family mysteries, and revelations that change everything the characters thought they knew.
                  </p>
                  <Badge variant="outline">Weekly Theme</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-warm-teal" />
                    Love & Relationships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Explore the complexities of human connections, from first love to lasting friendships, 
                    and the beautiful mess that is caring for someone deeply.
                  </p>
                  <Badge variant="outline">Community Favorite</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-warm-teal" />
                    Coming of Age
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Stories about growth, self-discovery, and those pivotal moments that shape who we become. 
                    Perfect for exploring character development and emotional depth.
                  </p>
                  <Badge variant="outline">Monthly Special</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Acknowledgment Footer */}
      <footer className="bg-warm-brown/5 border-t border-warm-brown/20 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-warm-brown mb-2">Special Thanks</h3>
          <p className="text-warm-brown/70 max-w-2xl mx-auto">
            This app is inspired by the creativity of <strong>Nemrah Ahmed</strong>, who gave us endless stories 
            and ideas to imagine beyond boundaries. Thank you for inspiring us, readers, and dreamers. 
            This community is built out of love, fun, and cookies 🍪.
          </p>
        </div>
      </footer>
    </div>
  );
}
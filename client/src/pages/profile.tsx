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
  Edit
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Story, User as UserType } from "@shared/schema";

// Mock user data (in real app this would come from auth context)
const mockUser: UserType = {
  id: "user-1",
  username: "Sarah",
  email: "sarah@example.com",
  avatar: "",
  contributionsCount: 12,
  heartsReceived: 45,
  experiencePoints: 340,
  level: 4,
  badges: ["first-story", "heart-giver", "storyteller"],
  preferences: {},
  createdAt: new Date("2024-01-15"),
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");

  // In a real app, these would be actual API calls
  const { data: userStories = [] } = useQuery<Story[]>({
    queryKey: ["/api/users", mockUser.id, "stories"],
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

  const nextLevelXP = mockUser.level * 100;
  const currentLevelXP = (mockUser.level - 1) * 100;
  const progressToNextLevel = ((mockUser.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-warm-beige">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-warm-brown/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-warm-brown">My Profile</h1>
            <p className="text-warm-brown/70">Track your storytelling journey</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="text-2xl bg-warm-teal text-white">
                  {mockUser.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-warm-brown">{mockUser.username}</h2>
                  <Badge className="bg-warm-teal text-white">
                    Level {mockUser.level}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-4">Storyteller since {mockUser.createdAt.toLocaleDateString()}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress to Level {mockUser.level + 1}</span>
                    <span>{mockUser.experiencePoints}/{nextLevelXP} XP</span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2" />
                </div>
              </div>

              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
              <div className="text-2xl font-bold text-warm-brown">{mockUser.contributionsCount}</div>
              <div className="text-sm text-gray-600">Stories Written</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
              <div className="text-2xl font-bold text-warm-brown">{mockUser.heartsReceived}</div>
              <div className="text-sm text-gray-600">Hearts Received</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
              <div className="text-2xl font-bold text-warm-brown">{mockUser.experiencePoints}</div>
              <div className="text-sm text-gray-600">Experience Points</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-warm-teal" />
              <div className="text-2xl font-bold text-warm-brown">{mockUser.badges.length}</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stories">My Stories</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-warm-teal" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warm-teal rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Added a story to "Mystery Chain #3"</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warm-teal rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Received 3 hearts on your story</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warm-teal rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Joined "Romance Theme Room"</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-warm-teal" />
                    Favorite Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Romance</span>
                      <Badge variant="secondary">8 stories</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mystery</span>
                      <Badge variant="secondary">3 stories</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Adventure</span>
                      <Badge variant="secondary">1 story</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            {userStories.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-warm-teal" />
                <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
                <p className="text-gray-600 mb-4">Start writing to see your stories here!</p>
                <Button>Write Your First Story</Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {userStories.map((story) => (
                  <Card key={story.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Story Chain #{story.chainId}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{story.hearts} hearts</Badge>
                          <Badge variant="outline">{story.comments} comments</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{story.content}</p>
                      <div className="text-sm text-gray-500">
                        Written {new Date(story.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-warm-teal" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockUser.badges.map((badgeId) => {
                    const badge = getBadgeInfo(badgeId);
                    return (
                      <div key={badgeId} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <div className="font-semibold text-sm">{badge.name}</div>
                          <div className="text-xs text-gray-600">{badge.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["daily-writer", "community-favorite"].map((badgeId) => {
                    const badge = getBadgeInfo(badgeId);
                    return (
                      <div key={badgeId} className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
                        <div className="text-2xl grayscale">{badge.icon}</div>
                        <div>
                          <div className="font-semibold text-sm">{badge.name}</div>
                          <div className="text-xs text-gray-600">{badge.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-xs text-gray-600 mb-2">Receive updates about your stories and community</p>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">New hearts and comments</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Weekly community highlights</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Privacy</label>
                  <p className="text-xs text-gray-600 mb-2">Control who can see your profile and stories</p>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Public profile</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Show contribution stats</span>
                  </div>
                </div>

                <Button className="mt-4">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
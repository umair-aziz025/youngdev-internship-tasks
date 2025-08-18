import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart } from "lucide-react";
import type { CommunityStats as CommunityStatsType } from "@shared/schema";

interface CommunityStatsProps {
  stats?: CommunityStatsType;
}

export default function CommunityStats({ stats }: CommunityStatsProps) {
  if (!stats) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-lg text-gray-800">Community</h4>
              <p className="text-sm text-gray-600">Loading stats...</p>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif font-semibold text-lg text-gray-800">Community</h4>
            <p className="text-sm text-gray-600">Active storytellers</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.totalStories.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Stories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.activeUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Writers</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-purple-100">
          <p className="text-xs text-center text-gray-600">
            <Heart className="w-3 h-3 text-red-400 mr-1 inline" />
            <span className="font-medium">{stats.totalHearts.toLocaleString()}</span> hearts given this week
          </p>
          {stats.dailyContributions > 0 && (
            <p className="text-xs text-center text-gray-600 mt-1">
              <span className="font-medium">{stats.dailyContributions}</span> new stories today
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

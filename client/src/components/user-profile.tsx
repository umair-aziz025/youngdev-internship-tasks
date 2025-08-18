import { User, Star, Heart, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { User as UserType } from "@shared/schema";

interface UserProfileProps {
  user: UserType;
  compact?: boolean;
}

export function UserProfile({ user, compact = false }: UserProfileProps) {
  const levelProgress = ((user.experiencePoints % 100) / 100) * 100;
  
  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-warm-teal rounded-full flex items-center justify-center text-white text-sm">
          <User className="w-4 h-4" />
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Level {user.level}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-story border border-light-beige/30 dark:border-gray-700/30">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-warm-teal rounded-full flex items-center justify-center text-white text-lg">
          <User className="w-8 h-8" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.username}</h3>
            <Badge variant="secondary" className="bg-warm-teal/20 text-warm-teal">
              Level {user.level}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>{user.contributionsCount} stories</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{user.heartsReceived} hearts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{user.experiencePoints} XP</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progress to Level {user.level + 1}</span>
                <span>{user.experiencePoints % 100}/100 XP</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
            
            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="text-xs">
                    {badge.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
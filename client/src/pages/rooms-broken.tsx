import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, Lock, Globe, Calendar, Search, Menu, User, Coffee, Home, Cookie } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/loading-spinner";
import { Link } from "wouter";
import type { Room } from "@shared/schema";

const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(50, "Room name too long"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(200, "Prompt too long"),
  isPrivate: z.boolean().default(false),
  isThemed: z.boolean().default(false),
  theme: z.string().optional(),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

export default function Rooms() {
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

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
                  Sign In to Join
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join Story Rooms</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sign in to create and join collaborative story rooms with other writers.
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

  // Fetch public rooms
  const { data: publicRooms = [], isLoading: isRoomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms/public"],
  });

  // Create room form
  const form = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      prompt: "",
      isPrivate: false,
      isThemed: false,
      theme: "",
    },
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: api.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/public"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Room created!",
        description: "Your storytelling room is ready for contributors.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create room",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateRoomForm) => {
    createRoomMutation.mutate({
      ...data,
      creatorId: currentUser.id,
    });
  };

  const filteredRooms = publicRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {currentUser && <UserProfile user={currentUser} compact />}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Story Rooms</h1>
            <p className="text-gray-600 dark:text-gray-300">Create or join collaborative storytelling sessions</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Create Room Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create a New Story Room</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter room name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Story Prompt</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter the story prompt..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <Button
                        type="submit"
                        disabled={createRoomMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchTerm ? "Try adjusting your search" : "Be the first to create a story room!"}
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{room.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {room.isPrivate ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-500" />
                      )}
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {room.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{room.memberCount || 0} writers</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => {
                        // Handle join room logic here
                        toast({
                          title: "Joining room...",
                          description: "Room functionality coming soon!",
                        });
                      }}
                    >
                      Join Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

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
import { Users, Plus, Lock, Globe, Calendar, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  // Fetch public rooms
  const { data: publicRooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms/public"],
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

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: api.joinRoom,
    onSuccess: (room) => {
      setShowJoinDialog(false);
      setJoinCode("");
      toast({
        title: "Joined room!",
        description: `You're now part of "${room.name}".`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to join room",
        description: "Please check the room code and try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleCreateRoom = (data: CreateRoomForm) => {
    createRoomMutation.mutate(data);
  };

  const handleJoinRoom = () => {
    if (joinCode.trim()) {
      joinRoomMutation.mutate(joinCode.trim());
    }
  };

  const filteredRooms = publicRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-warm-beige">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-warm-brown/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-warm-brown">Storytelling Rooms</h1>
            <p className="text-warm-brown/70">Join a room or create your own storytelling space</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Join Private Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Private Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Room Code</label>
                    <Input
                      placeholder="Enter 6-character room code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    onClick={handleJoinRoom}
                    disabled={joinCode.length !== 6 || joinRoomMutation.isPending}
                    className="w-full"
                  >
                    {joinRoomMutation.isPending ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateRoom)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Storytelling Room" {...field} />
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
                          <FormLabel>Starting Prompt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Someone somewhere is beginning an adventure..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPrivate"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Private Room</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isThemed"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Themed Room</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("isThemed") && (
                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <FormControl>
                              <Input placeholder="Nemrah Ahmed inspired, Romance, Mystery..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button 
                      type="submit" 
                      disabled={createRoomMutation.isPending}
                      className="w-full"
                    >
                      {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-warm-teal" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "No rooms found" : "No public rooms yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Be the first to create a storytelling room!"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}>
                Create First Room
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {room.isPrivate ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-green-500" />
                      )}
                      {room.isThemed && (
                        <Badge variant="secondary" className="text-xs">
                          {room.theme || "Themed"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {room.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.memberCount} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(room.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant="outline">
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
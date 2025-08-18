import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Book, Users, Heart, Sparkles, Coffee, Globe, Cookie } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [location, setLocation] = useLocation();

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
              <Button 
                onClick={() => setLocation('/auth')}
                className="bg-orange-600 hover:bg-orange-700 text-white btn-animate"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
            Inspired by Nemrah Ahmed's Literary Universe
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Where Stories Come Alive
            <br />
            <span className="text-orange-600 dark:text-orange-400">Together</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Join a global community of storytellers creating beautiful, collaborative narratives. 
            Each story builds upon the last, creating magical tales that evolve through shared imagination.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation('/auth')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg btn-animate"
            >
              Start Your Story Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/community')}
              className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-8 py-4 text-lg btn-animate"
            >
              Explore Community Stories
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-orange-200 dark:border-orange-800 card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4 icon-animate">
                  <Book className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Join a Story Chain</CardTitle>
                <CardDescription>
                  Pick up where someone else left off and add your unique voice to ongoing narratives.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800 card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4 icon-animate">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Connect with Writers</CardTitle>
                <CardDescription>
                  Share hearts, comments, and build lasting connections through collaborative storytelling.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800 card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4 icon-animate">
                  <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Get Featured</CardTitle>
                <CardDescription>
                  Outstanding contributions get featured in "Cookie's Picks" and community highlights.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Stats Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Join Our Growing Community
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">1,500+</div>
              <div className="text-gray-600 dark:text-gray-300">Stories Written</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">350+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Writers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">25+</div>
              <div className="text-gray-600 dark:text-gray-300">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">5,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Hearts Given</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Coffee className="h-6 w-6 text-orange-400" />
              <span className="text-lg font-semibold">Someone Somewhere</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <span>Inspired by Nemrah Ahmed</span>
              <Globe className="h-4 w-4" />
              <span>A global storytelling community</span>
              <Button 
                variant="link" 
                className="text-xs text-gray-500 hover:text-gray-300 p-0"
                onClick={() => setLocation('/admin-setup')}
              >
                Admin Setup
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, User, LogOut, MapPin, Bell, Heart, MessageSquare, Plus, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function Header() {
  const router = useRouter();
  const { user, login, signup, logout, isAuthenticated, loading } = useAuth();
  const { connectionStatus, isConnected } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Calgary');
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      setShowLoginDialog(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar - Compact */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-8 text-xs">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              {/* Connection Status Indicator */}
              {isAuthenticated && (
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600 hidden sm:inline">Connected</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 hidden sm:inline">{connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}</span>
                    </>
                  )}
                </div>
              )}
              <Link href="/help" className="text-gray-600 hover:text-gray-800 hidden md:inline">
                Help
              </Link>
              <Link href="/safety" className="text-gray-600 hover:text-gray-800 hidden md:inline">
                Safety
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Compact */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo - Compact */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="EasyBuySale" className="h-9 w-auto object-contain" />
            </Link>
          </div>

          {/* Search Bar - Compact */}
          <div className="flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="flex">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-l-md rounded-r-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-9 text-sm"
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 rounded-l-none rounded-r-md px-4 h-9"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Right Navigation - Compact */}
          <div className="flex items-center space-x-2">
            {/* Favorites - Compact */}
            <Link href="/favorites">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 h-8 px-2">
                <Heart className="h-4 w-4" />
                <span className="hidden xl:block ml-1 text-xs">Favourites</span>
              </Button>
            </Link>

            {/* Messages - Compact */}
            <Link href="/messages">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 h-8 px-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden xl:block ml-1 text-xs">Messages</span>
              </Button>
            </Link>

            {/* Notifications - Compact */}
            {isAuthenticated && <NotificationDropdown />}

            {/* User Account - Compact */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 h-8 px-2">
                    <User className="h-4 w-4" />
                    <span className="hidden xl:block ml-1 text-xs">{user?.username || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-3 py-2">
                    <p className="font-medium">{user?.username}</p>
                    {user?.email && (
                      <p className="text-sm text-gray-500">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-ads">My Ads</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved">Saved Searches</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-1">
                <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 h-8 px-3 text-xs">
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Sign in to your account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-3">
                      <div>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Email address"
                          required
                          className="w-full h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          name="password"
                          type="password"
                          placeholder="Password"
                          required
                          className="w-full h-9 text-sm"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 h-9 text-sm">
                        Sign In
                      </Button>
                    </form>
                    <div className="text-center mt-3">
                      <p className="text-xs text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-blue-500 hover:text-blue-600" onClick={() => setShowLoginDialog(false)}>
                          Register
                        </Link>
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Link href="/signup">
                  <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50 h-8 px-3 text-xs">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Post Ad Button - Compact */}
            <Link href="/post-ad">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-3 h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Post Ad
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <form onSubmit={handleSearch} className="flex">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" className="ml-2">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>

                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="border-b pb-2">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Link href="/my-ads" className="block py-2 text-gray-700">My Ads</Link>
                      <Link href="/favorites" className="block py-2 text-gray-700">Favourites</Link>
                      <Link href="/messages" className="block py-2 text-gray-700">Messages</Link>
                      <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600">
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button onClick={() => setShowLoginDialog(true)} className="w-full">
                        Sign In
                      </Button>
                      <Link href="/signup">
                        <Button variant="outline" className="w-full">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Link href="/post-ad">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Post Ad
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category Navigation - Compact */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center space-x-4 h-9 overflow-x-auto text-xs">
            <Link href="/search?category=Cars" className="text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Cars & Vehicles
            </Link>
            <Link href="/search?category=Property" className="text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Real Estate
            </Link>
            <Link href="/search?category=Jobs" className="text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Jobs
            </Link>
            <Link href="/search?category=Services" className="text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Services
            </Link>
            <Link href="/search?category=Pets" className="text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Pets
            </Link>
            <Link href="/search?category=Buy-Sell" className="text-gray-600 hover:text-gray-800 whitespace-nowrap">
              Buy & Sell
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Sword, Calendar, Coins, User, Info, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowCurrentUser, Connect } from '@onflow/react-sdk';

export const Navigation = () => {
  const location = useLocation();
  const { user } = useFlowCurrentUser();
  
  const navItems = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/battle", icon: Sword, label: "Battle" },
    { path: "/upcoming", icon: Calendar, label: "Upcoming" },
    { path: "/staking", icon: Coins, label: "Stake" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/about", icon: Info, label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-battle flex items-center justify-center shadow-neon">
              <Sword className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-battle bg-clip-text text-transparent">
              dBattle
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-2 transition-all",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flow-connect-wrapper">
            {user?.loggedIn ? (
              <Button className="bg-black text-white hover:bg-black/90 transition-opacity shadow-glow">
                <Wallet className="w-4 h-4 mr-2" />
                {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
              </Button>
            ) : (
              <Connect />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 p-2">
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

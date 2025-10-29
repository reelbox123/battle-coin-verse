import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Sword, Calendar, Coins, User, Info, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowUser } from "@/hooks/useFlowUser";
import { useTokenBalance } from "@/hooks/useTokenBalance";

export const Navigation = () => {
  const location = useLocation();
  const { user, logIn, logOut } = useFlowUser();
  const { balance, claimTokens } = useTokenBalance();
  
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
            <span className="text-2xl font-bold bg-gradient-battle bg-clip-text text-transparent">
              DBATTLE
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

          <div className="flex items-center gap-3">
            {user?.loggedIn ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
                  <Coins className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-semibold text-secondary">
                    {balance.toLocaleString()} DBT
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono text-primary">
                    {user.addr && `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}`}
                  </span>
                </div>
              </>
            ) : (
              <Button 
                onClick={async () => {
                  await logIn();
                  setTimeout(() => claimTokens(), 1000);
                }}
                className="bg-gradient-battle hover:opacity-90"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
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

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Coins, Users, Edit, Settings, Share2, Crown, Video, LogOut, Wallet } from "lucide-react";
import { GoLiveDialog } from "@/components/GoLiveDialog";
import { toast } from "@/hooks/use-toast";
import { useFlowUser } from "@/hooks/useFlowUser";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false);
  const { user, logOut } = useFlowUser();
  const { balance, claimTokens, loading } = useTokenBalance();
  const [userStats, setUserStats] = useState({
    battles: 0,
    wins: 0,
    followers: 0,
    following: 0,
  });
  const [recentBattles, setRecentBattles] = useState<any[]>([]);

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user profile stats
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('flow_address', user.addr)
        .maybeSingle();

      if (profileData) {
        setUserStats({
          battles: 0,
          wins: 0,
          followers: 0,
          following: 0,
        });
      }

      // Load recent battles from livestream_gifts only if we have a valid user_id
      if (profileData?.user_id) {
        const { data: giftsData } = await supabase
          .from('livestream_gifts')
          .select('*, livestreams(*)')
          .eq('from_user_id', profileData.user_id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (giftsData) {
          setRecentBattles(giftsData);
          setUserStats(prev => ({ ...prev, battles: giftsData.length }));
        }
      } else {
        setRecentBattles([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const achievements = [
    { title: "Battle Master", description: "Win 30 battles", icon: Trophy, unlocked: userStats.wins >= 30 },
    { title: "Streak King", description: "10 wins in a row", icon: Flame, unlocked: false },
    { title: "Generous", description: "Send 1000 gifts", icon: Coins, unlocked: false },
    { title: "Popular", description: "10K followers", icon: Users, unlocked: userStats.followers >= 10000 },
  ];

  return (
    <div className="pt-20 pb-24 md:pb-8 px-4 container mx-auto max-w-7xl">
      {/* Profile Header */}
      <Card className="p-6 mb-6 border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarFallback className="bg-gradient-battle text-3xl font-bold">
              BM
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">BattleMaster</h1>
              <Badge className="bg-gradient-battle">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">
              Professional battle streamer | Top 200 Global
            </p>
            
            {user.loggedIn && user.addr && (
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Wallet className="w-4 h-4 text-primary" />
                <code className="px-2 py-1 bg-muted rounded font-mono">
                  {user.addr}
                </code>
              </div>
            )}

            <div className="flex flex-wrap gap-6 mb-4">
              <div>
                <p className="text-2xl font-bold">{userStats.followers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.following.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.battles.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Battles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{userStats.wins.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="bg-gradient-to-r from-destructive to-primary hover:opacity-90"
                onClick={() => setShowGoLiveDialog(true)}
              >
                <Video className="w-4 h-4 mr-2" />
                Go Live
              </Button>
              <Button 
                className="bg-gradient-battle hover:opacity-90"
                onClick={() => toast({ title: "Edit Profile", description: "Profile editor coming soon!" })}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline"
                onClick={() => toast({ title: "Profile Shared!", description: "Link copied to clipboard" })}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              {user.loggedIn && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    logOut();
                    toast({ title: "Logged Out", description: "Flow wallet disconnected" });
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Total Earned</h3>
          </div>
          <p className="text-3xl font-bold bg-gradient-battle bg-clip-text text-transparent">
            {balance.toLocaleString()} DBT
          </p>
          <p className="text-sm text-muted-foreground">Battle earnings</p>
        </Card>

        <Card className="p-6 border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-semibold">Token Balance</h3>
          </div>
          <p className="text-3xl font-bold">{balance.toLocaleString()} DBT</p>
          <p className="text-sm text-muted-foreground">dBattle Tokens</p>
          {user.loggedIn && (
            <Button 
              onClick={claimTokens}
              disabled={loading}
              className="mt-3 w-full"
              variant="outline"
              size="sm"
            >
              Claim Tokens
            </Button>
          )}
        </Card>

        <Card className="p-6 border-accent/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold">Win Rate</h3>
          </div>
          <p className="text-3xl font-bold">
            {userStats.battles > 0 ? ((userStats.wins / userStats.battles) * 100).toFixed(1) : "0.0"}%
          </p>
          <p className="text-sm text-muted-foreground">{userStats.wins} / {userStats.battles} battles won</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="battles" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="battles">Recent Battles</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="battles" className="mt-6">
          <Card className="border-primary/20">
            {recentBattles.length > 0 ? (
              <div className="divide-y divide-border">
                {recentBattles.map((battle, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>DB</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{battle.livestreams?.title || 'Battle'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(battle.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="bg-primary">
                          Gift Sent
                        </Badge>
                        <p className="text-sm font-semibold mt-1 text-primary">
                          {battle.amount} DBT
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No battle history yet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 ${
                    achievement.unlocked
                      ? "border-primary/20 bg-gradient-glow"
                      : "border-border opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        achievement.unlocked
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          achievement.unlocked ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {achievement.unlocked && (
                        <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <Card className="p-12 text-center border-primary/20">
            <p className="text-muted-foreground">No videos yet</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Go Live Dialog */}
      <GoLiveDialog 
        open={showGoLiveDialog} 
        onOpenChange={setShowGoLiveDialog}
      />
    </div>
  );
};

export default Profile;

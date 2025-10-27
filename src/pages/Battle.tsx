import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Flame, Gift, Users, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Battle = () => {
  const currentBattles = [
    {
      id: 1,
      creator1: { name: "BattleMaster", points: 15420, avatar: "BM" },
      creator2: { name: "CryptoQueen", points: 12380, avatar: "CQ" },
      viewers: 2543,
      duration: "12:34",
      status: "LIVE",
    },
    {
      id: 2,
      creator1: { name: "StreamKing", points: 8920, avatar: "SK" },
      creator2: { name: "TokenWarrior", points: 9105, avatar: "TW" },
      viewers: 1876,
      duration: "08:15",
      status: "LIVE",
    },
  ];

  return (
    <div className="pt-20 pb-24 md:pb-8 px-4 container mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-battle bg-clip-text text-transparent">
          Live Battles
        </h1>
        <p className="text-muted-foreground">Watch creators compete in real-time</p>
      </div>

      <div className="grid gap-6">
        {currentBattles.map((battle) => (
          <Card key={battle.id} className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all">
            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 p-6">
              {/* Creator 1 */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarFallback className="bg-gradient-battle text-lg">
                    {battle.creator1.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{battle.creator1.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {battle.creator1.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-battle blur-xl opacity-50"></div>
                  <Badge className="relative px-6 py-2 text-xl font-bold bg-gradient-battle border-0">
                    VS
                  </Badge>
                </div>
              </div>

              {/* Creator 2 */}
              <div className="flex items-center gap-4 md:flex-row-reverse">
                <Avatar className="w-16 h-16 border-2 border-secondary">
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-lg">
                    {battle.creator2.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 md:text-right">
                  <h3 className="font-bold text-lg">{battle.creator2.name}</h3>
                  <div className="flex items-center gap-2 mt-1 md:justify-end">
                    <span className="text-2xl font-bold text-secondary">
                      {battle.creator2.points.toLocaleString()}
                    </span>
                    <Zap className="w-4 h-4 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Progress */}
            <div className="px-6 pb-4">
              <Progress 
                value={(battle.creator1.points / (battle.creator1.points + battle.creator2.points)) * 100} 
                className="h-2"
              />
            </div>

            {/* Battle Info */}
            <div className="px-6 pb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-destructive text-destructive flex items-center gap-1">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  {battle.status}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {battle.viewers.toLocaleString()} watching
                </div>
                <div className="text-sm text-muted-foreground">{battle.duration}</div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-battle hover:opacity-90">
                  <Gift className="w-4 h-4 mr-2" />
                  Send Gift
                </Button>
                <Button variant="outline">Watch Battle</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Battle Stats */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Top Winner</h3>
          </div>
          <p className="text-2xl font-bold">BattleMaster</p>
          <p className="text-sm text-muted-foreground">15 wins today</p>
        </Card>

        <Card className="p-6 border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-semibold">Hottest Battle</h3>
          </div>
          <p className="text-2xl font-bold">2.5K viewers</p>
          <p className="text-sm text-muted-foreground">BM vs CQ</p>
        </Card>

        <Card className="p-6 border-accent/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold">Total Gifts</h3>
          </div>
          <p className="text-2xl font-bold">45.2K DCoin</p>
          <p className="text-sm text-muted-foreground">Sent this hour</p>
        </Card>
      </div>
    </div>
  );
};

export default Battle;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Bell, Users, Trophy } from "lucide-react";

const Upcoming = () => {
  const upcomingBattles = [
    {
      id: 1,
      creator1: { name: "BattleMaster", avatar: "BM", followers: "125K" },
      creator2: { name: "StreamKing", avatar: "SK", followers: "98K" },
      scheduledTime: "Today, 8:00 PM",
      prizePool: "50K DCoin",
      category: "Featured",
      registered: 3420,
    },
    {
      id: 2,
      creator1: { name: "CryptoQueen", avatar: "CQ", followers: "87K" },
      creator2: { name: "TokenWarrior", avatar: "TW", followers: "65K" },
      scheduledTime: "Tomorrow, 3:00 PM",
      prizePool: "25K DCoin",
      category: "Community",
      registered: 1876,
    },
    {
      id: 3,
      creator1: { name: "NeonNinja", avatar: "NN", followers: "156K" },
      creator2: { name: "PixelPro", avatar: "PP", followers: "142K" },
      scheduledTime: "Saturday, 6:00 PM",
      prizePool: "100K DCoin",
      category: "Championship",
      registered: 8920,
    },
  ];

  return (
    <div className="pt-20 pb-24 md:pb-8 px-4 container mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-battle bg-clip-text text-transparent">
          Upcoming Battles
        </h1>
        <p className="text-muted-foreground">Schedule your battles and set reminders</p>
      </div>

      <div className="grid gap-6">
        {upcomingBattles.map((battle) => (
          <Card key={battle.id} className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Badge className={
                    battle.category === "Championship" 
                      ? "bg-gradient-battle" 
                      : battle.category === "Featured"
                      ? "bg-primary"
                      : "bg-secondary"
                  }>
                    {battle.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {battle.scheduledTime}
                  </div>
                </div>
                <Button className="bg-gradient-battle hover:opacity-90">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminder
                </Button>
              </div>

              <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-center mb-6">
                {/* Creator 1 */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarFallback className="bg-gradient-battle text-lg font-bold">
                      {battle.creator1.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{battle.creator1.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {battle.creator1.followers} followers
                    </p>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-battle blur-xl opacity-50 animate-pulse-slow"></div>
                    <Badge className="relative px-6 py-2 text-xl font-bold bg-gradient-battle border-0">
                      VS
                    </Badge>
                  </div>
                </div>

                {/* Creator 2 */}
                <div className="flex items-center gap-4 md:flex-row-reverse">
                  <Avatar className="w-16 h-16 border-2 border-secondary">
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-lg font-bold">
                      {battle.creator2.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="md:text-right">
                    <h3 className="font-bold text-lg">{battle.creator2.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {battle.creator2.followers} followers
                    </p>
                  </div>
                </div>
              </div>

              {/* Battle Details */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Prize Pool</p>
                    <p className="font-bold">{battle.prizePool}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Registered</p>
                    <p className="font-bold">{battle.registered.toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="outline" className="ml-auto">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Battle CTA */}
      <Card className="mt-8 p-8 text-center border-primary/20 bg-gradient-glow">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Want to host a battle?</h2>
          <p className="text-muted-foreground mb-6">
            Challenge other creators and compete for prizes in front of thousands of viewers
          </p>
          <Button size="lg" className="bg-gradient-battle hover:opacity-90 shadow-glow">
            Create Your Battle
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Upcoming;

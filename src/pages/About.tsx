import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sword, Coins, Users, Shield, Zap, Trophy } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Sword,
      title: "Live Battle Streaming",
      description: "Watch creators compete in real-time battles with thousands of viewers",
    },
    {
      icon: Coins,
      title: "DCoin Token Economy",
      description: "Use DCoin to buy gifts, stake for rewards, and support your favorite creators",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a vibrant community of creators and fans shaping the platform",
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "Built on blockchain technology ensuring fairness and transparency",
    },
    {
      icon: Zap,
      title: "Instant Rewards",
      description: "Earn rewards instantly through battles, staking, and engagement",
    },
    {
      icon: Trophy,
      title: "Competitive Rankings",
      description: "Climb the global leaderboard and prove you're the best",
    },
  ];

  return (
    <div className="pt-20 pb-24 md:pb-8 px-4">
      {/* Hero Section */}
      <div className="container mx-auto max-w-7xl mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-battle bg-clip-text text-transparent">
            Welcome to dBattle
          </h1>
          <p className="text-xl text-muted-foreground">
            The ultimate platform for creator battles, live streaming, and crypto rewards
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          <Card className="p-6 text-center border-primary/20">
            <p className="text-4xl font-bold bg-gradient-battle bg-clip-text text-transparent mb-2">
              100K+
            </p>
            <p className="text-muted-foreground">Active Users</p>
          </Card>
          <Card className="p-6 text-center border-secondary/20">
            <p className="text-4xl font-bold bg-gradient-battle bg-clip-text text-transparent mb-2">
              50K+
            </p>
            <p className="text-muted-foreground">Daily Battles</p>
          </Card>
          <Card className="p-6 text-center border-accent/20">
            <p className="text-4xl font-bold bg-gradient-battle bg-clip-text text-transparent mb-2">
              10M+
            </p>
            <p className="text-muted-foreground">DCoin Staked</p>
          </Card>
          <Card className="p-6 text-center border-primary/20">
            <p className="text-4xl font-bold bg-gradient-battle bg-clip-text text-transparent mb-2">
              $2M+
            </p>
            <p className="text-muted-foreground">Rewards Paid</p>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-battle flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-8 border-primary/20 bg-gradient-glow mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How dBattle Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Create or Watch</h3>
              <p className="text-muted-foreground">
                Start streaming battles or watch your favorite creators compete live
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-secondary">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Engage & Support</h3>
              <p className="text-muted-foreground">
                Send gifts, stake tokens, and vote for your favorite in battles
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-accent">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-muted-foreground">
                Get DCoin rewards through staking, winning battles, and community engagement
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Battle?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Connect your wallet and start your journey to becoming a legendary creator
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-battle hover:opacity-90 shadow-glow">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

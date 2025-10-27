import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Lock, Unlock, Gift, Zap, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Staking = () => {
  const stakingPools = [
    {
      id: 1,
      name: "Battle Legends",
      apy: "85%",
      minStake: "100 DCoin",
      totalStaked: "2.5M DCoin",
      yourStake: "0 DCoin",
      duration: "30 days",
      rewards: "Daily",
      perks: ["Priority battle access", "Exclusive gifts", "2x voting power"],
    },
    {
      id: 2,
      name: "Creator Support",
      apy: "45%",
      minStake: "50 DCoin",
      totalStaked: "1.8M DCoin",
      yourStake: "0 DCoin",
      duration: "14 days",
      rewards: "Weekly",
      perks: ["Support your favorite creators", "Special badges", "Early access"],
    },
    {
      id: 3,
      name: "Community Growth",
      apy: "120%",
      minStake: "500 DCoin",
      totalStaked: "5.2M DCoin",
      yourStake: "0 DCoin",
      duration: "90 days",
      rewards: "Monthly",
      perks: ["Maximum APY", "Governance rights", "VIP status"],
    },
  ];

  return (
    <div className="pt-20 pb-24 md:pb-8 px-4 container mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-battle bg-clip-text text-transparent">
          Stake DCoin
        </h1>
        <p className="text-muted-foreground">Earn rewards while supporting the platform</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Total Balance</h3>
          </div>
          <p className="text-3xl font-bold">0 DCoin</p>
          <p className="text-sm text-muted-foreground mt-1">≈ $0.00 USD</p>
        </Card>

        <Card className="p-6 border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-semibold text-sm">Staked</h3>
          </div>
          <p className="text-3xl font-bold">0 DCoin</p>
          <p className="text-sm text-muted-foreground mt-1">$0.00 locked</p>
        </Card>

        <Card className="p-6 border-accent/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-sm">Rewards Earned</h3>
          </div>
          <p className="text-3xl font-bold">0 DCoin</p>
          <p className="text-sm text-muted-foreground mt-1">Claim anytime</p>
        </Card>

        <Card className="p-6 border-border bg-gradient-glow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">APY</h3>
          </div>
          <p className="text-3xl font-bold bg-gradient-battle bg-clip-text text-transparent">
            Up to 120%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Max returns</p>
        </Card>
      </div>

      {/* Staking Pools */}
      <div className="space-y-6">
        {stakingPools.map((pool) => (
          <Card key={pool.id} className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{pool.name}</h2>
                    <Badge className="bg-gradient-battle">
                      {pool.apy} APY
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      {pool.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      {pool.rewards} rewards
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Min Stake</p>
                      <p className="font-semibold">{pool.minStake}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Staked</p>
                      <p className="font-semibold">{pool.totalStaked}</p>
                      <Progress value={65} className="h-2 mt-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pool Benefits</p>
                  <div className="space-y-2">
                    {pool.perks.map((perk, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Amount to Stake
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="text-lg"
                  />
                </div>
                <Button size="lg" className="bg-gradient-battle hover:opacity-90 shadow-glow">
                  <Lock className="w-4 h-4 mr-2" />
                  Stake Now
                </Button>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="text-muted-foreground">Your current stake:</span>{" "}
                  <span className="font-semibold">{pool.yourStake}</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="mt-8 p-6 border-primary/20 bg-gradient-glow">
        <h3 className="text-xl font-bold mb-4">How Staking Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Lock Your Tokens</h4>
            <p className="text-sm text-muted-foreground">
              Choose a pool and stake your DCoin for the specified duration
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="font-semibold mb-2">Earn Rewards</h4>
            <p className="text-sm text-muted-foreground">
              Receive staking rewards based on APY and your stake amount
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <Unlock className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-semibold mb-2">Unlock & Claim</h4>
            <p className="text-sm text-muted-foreground">
              After the lock period, claim your rewards and unstake anytime
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Staking;

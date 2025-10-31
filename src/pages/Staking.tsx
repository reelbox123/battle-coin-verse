import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Lock, Unlock, Gift, Zap, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useStaking } from "@/hooks/useStaking";
import { useState } from "react";

const Staking = () => {
  const {
    pools,
    userStakes,
    totalStaked,
    totalRewards,
    dcoinBalance,
    stdcoinBalance,
    loading,
    stakeTokens,
    claimRewards,
  } = useStaking();

  const [stakeAmounts, setStakeAmounts] = useState<{ [key: string]: string }>({});

  const handleStake = async (poolId: string) => {
    const amount = parseFloat(stakeAmounts[poolId] || "0");
    if (amount <= 0) return;

    const success = await stakeTokens(poolId, amount);
    if (success) {
      setStakeAmounts({ ...stakeAmounts, [poolId]: "" });
    }
  };

  const getUserStakeForPool = (poolId: string) => {
    const stakes = userStakes.filter((s) => s.pool_id === poolId);
    return stakes.reduce((sum, s) => sum + s.amount, 0);
  };

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
          <p className="text-3xl font-bold">{dcoinBalance.toFixed(2)} dCoin</p>
          <p className="text-sm text-muted-foreground mt-1">{stdcoinBalance.toFixed(2)} stdCoin</p>
        </Card>

        <Card className="p-6 border-secondary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-semibold text-sm">Staked</h3>
          </div>
          <p className="text-3xl font-bold">{totalStaked.toFixed(2)} dCoin</p>
          <p className="text-sm text-muted-foreground mt-1">${(totalStaked * 0.1).toFixed(2)} locked</p>
        </Card>

        <Card className="p-6 border-accent/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-sm">Rewards Earned</h3>
          </div>
          <p className="text-3xl font-bold">{totalRewards.toFixed(4)} stdCoin</p>
          <p className="text-sm text-muted-foreground mt-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={claimRewards}
              disabled={loading || totalRewards === 0}
              className="h-6 px-2 text-xs"
            >
              Claim now
            </Button>
          </p>
        </Card>

        <Card className="p-6 border-border bg-gradient-glow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">APY</h3>
          </div>
          <p className="text-3xl font-bold bg-gradient-battle bg-clip-text text-transparent">
            Up to {Math.max(...pools.map(p => p.boosted_apy), 25)}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">With auto-compound</p>
        </Card>
      </div>

      {/* Staking Pools */}
      <div className="space-y-6">
        {pools.map((pool) => {
          const userStakeAmount = getUserStakeForPool(pool.id);
          const poolProgress = pool.total_staked > 0 ? Math.min((pool.total_staked / 10000000) * 100, 100) : 0;

          return (
            <Card key={pool.id} className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{pool.name}</h2>
                      <Badge className="bg-gradient-battle">
                        {pool.base_apy}% → {pool.boosted_apy}% APY
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{pool.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        {pool.duration_days} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        {pool.reward_frequency} rewards
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-primary" />
                        Auto-compound
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Min Stake</p>
                        <p className="font-semibold">{pool.min_stake} dCoin</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Staked</p>
                        <p className="font-semibold">{pool.total_staked.toLocaleString()} dCoin</p>
                        <Progress value={poolProgress} className="h-2 mt-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Pool Benefits</p>
                    <div className="space-y-2">
                      {pool.perks.map((perk: string, index: number) => (
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
                      value={stakeAmounts[pool.id] || ""}
                      onChange={(e) =>
                        setStakeAmounts({ ...stakeAmounts, [pool.id]: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-battle hover:opacity-90 shadow-glow"
                    onClick={() => handleStake(pool.id)}
                    disabled={loading || !stakeAmounts[pool.id]}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Stake Now
                  </Button>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Your current stake:</span>{" "}
                    <span className="font-semibold">{userStakeAmount.toFixed(2)} dCoin</span>
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
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

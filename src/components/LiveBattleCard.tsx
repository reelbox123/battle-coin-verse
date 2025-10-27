import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Users, Trophy } from "lucide-react";
import { GiftDialog } from "./GiftDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LiveBattleCardProps {
  livestream: any;
}

export const LiveBattleCard = ({ livestream }: LiveBattleCardProps) => {
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [viewers] = useState(Math.floor(Math.random() * 10000) + 1000);

  useEffect(() => {
    // Load current round data
    loadRoundData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`livestream-${livestream.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'livestream_rounds',
          filter: `livestream_id=eq.${livestream.id}`,
        },
        (payload) => {
          console.log('Round update:', payload);
          loadRoundData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'livestream_gifts',
          filter: `livestream_id=eq.${livestream.id}`,
        },
        (payload) => {
          console.log('Gift received:', payload);
          // Show AR effect or animation
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [livestream.id]);

  const loadRoundData = async () => {
    const { data } = await supabase
      .from('livestream_rounds')
      .select('*')
      .eq('livestream_id', livestream.id)
      .eq('status', 'active')
      .single();

    if (data) {
      setCurrentRound(data);
      
      // Check if milestone reached
      if (data.status === 'completed') {
        toast({
          title: "Round Complete! 🏆",
          description: `Starting Round ${data.round_number + 1}...`,
        });
      }
    }
  };

  const handleSendGift = (creatorId: string) => {
    setSelectedCreator(creatorId);
    setShowGiftDialog(true);
  };

  const creatorProgress = currentRound 
    ? (currentRound.creator_score / currentRound.milestone) * 100 
    : 0;
  const collaboratorProgress = currentRound
    ? (currentRound.collaborator_score / currentRound.milestone) * 100
    : 0;

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video/Thumbnail */}
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400"
          loop
          autoPlay
          muted
          playsInline
        >
          <source src="/videos/dbattle-sample.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-destructive/90 backdrop-blur-sm rounded-full flex items-center gap-2 animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <Users className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-semibold">{viewers.toLocaleString()}</span>
      </div>

      {/* Round Indicator */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary/90 backdrop-blur-sm rounded-full">
        <span className="text-white text-sm font-semibold">
          Round {currentRound?.round_number || 1}
        </span>
      </div>

      {/* Battle Gauge */}
      <div className="absolute top-20 left-0 right-0 px-4">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 space-y-3">
          {/* Creator 1 */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary">
              <img src={livestream.creator?.avatar_url || "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=100"} alt={livestream.creator?.username} />
              <AvatarFallback>{livestream.creator?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-semibold">{livestream.creator?.username}</span>
                <span className="text-primary text-sm font-bold">{currentRound?.creator_score || 0}</span>
              </div>
              <Progress value={creatorProgress} className="h-2" />
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>

          {/* Creator 2 */}
          {livestream.collaborator && (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-secondary">
                <img src={livestream.collaborator?.avatar_url || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100"} alt={livestream.collaborator?.username} />
                <AvatarFallback>{livestream.collaborator?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-semibold">{livestream.collaborator?.username}</span>
                  <span className="text-secondary text-sm font-bold">{currentRound?.collaborator_score || 0}</span>
                </div>
                <Progress value={collaboratorProgress} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gift Buttons */}
      <div className="absolute bottom-24 right-4 flex flex-col gap-3">
        <Button
          size="sm"
          onClick={() => handleSendGift(livestream.creator?.user_id)}
          className="bg-primary/90 hover:bg-primary backdrop-blur-sm"
        >
          <Gift className="w-4 h-4 mr-1" />
          Gift {livestream.creator?.username}
        </Button>
        
        {livestream.collaborator && (
          <Button
            size="sm"
            onClick={() => handleSendGift(livestream.collaborator?.user_id)}
            className="bg-secondary/90 hover:bg-secondary backdrop-blur-sm"
          >
            <Gift className="w-4 h-4 mr-1" />
            Gift {livestream.collaborator?.username}
          </Button>
        )}
      </div>

      {/* Stream Info */}
      <div className="absolute bottom-4 left-4 right-24">
        <h3 className="text-white font-bold text-lg mb-1">{livestream.title}</h3>
        <p className="text-white/80 text-sm">{livestream.description}</p>
      </div>

      <GiftDialog
        open={showGiftDialog}
        onOpenChange={setShowGiftDialog}
        creatorName={selectedCreator === livestream.creator?.user_id ? livestream.creator?.username : livestream.collaborator?.username}
        livestreamId={livestream.id}
        toCreatorId={selectedCreator}
        onGiftSent={() => {}}
      />
    </div>
  );
};

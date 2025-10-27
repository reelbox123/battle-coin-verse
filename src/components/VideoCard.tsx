import { useState } from "react";
import { Heart, MessageCircle, Share2, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GiftDialog } from "./GiftDialog";
import { CommentsDialog } from "./CommentsDialog";
import { ShareDialog } from "./ShareDialog";
import { ARGiftEffect } from "./ARGiftEffect";
import { toast } from "@/hooks/use-toast";

interface VideoCardProps {
  video: {
    id: number;
    creator: string;
    description: string;
    likes: string;
    comments: string;
    shares: string;
    thumbnail: string;
    profilePic: string;
  };
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAREffect, setShowAREffect] = useState(false);
  const [arIcon, setArIcon] = useState("");
  const [viewers] = useState(Math.floor(Math.random() * 5000) + 1000);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      description: isLiked ? "Removed from liked videos" : "Added to liked videos",
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: `${isFollowing ? "Unfollowed" : "Now following"} ${video.creator}`,
    });
  };

  const handleGiftSent = () => {
    const gifts = ["🦁", "🐉", "👑", "🚀", "💎", "❤️"];
    const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
    setArIcon(randomGift);
    setShowAREffect(true);
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video/Thumbnail */}
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover"
          poster={video.thumbnail}
          loop
          autoPlay
          muted
          playsInline
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <source src="/placeholder-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* AR Gift Effect */}
      <ARGiftEffect 
        show={showAREffect} 
        icon={arIcon}
        onComplete={() => setShowAREffect(false)}
      />

      {/* Live Viewer Count */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-destructive/90 backdrop-blur-sm rounded-full flex items-center gap-2 animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <Users className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-semibold">{viewers.toLocaleString()}</span>
      </div>

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12 border-2 border-primary cursor-pointer hover:scale-105 transition-transform">
            <img src={video.profilePic} alt={video.creator} className="w-full h-full object-cover" />
            <AvatarFallback className="bg-gradient-battle text-lg font-bold">
              {video.creator.slice(1, 3).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-base">{video.creator}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handleFollow}
              className={isFollowing 
                ? "bg-card/80 hover:bg-card border border-primary text-white" 
                : "bg-gradient-battle hover:opacity-90"
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowGiftDialog(true)}
              className="bg-primary/20 hover:bg-primary/30 backdrop-blur-sm border border-primary/50"
            >
              <Gift className="w-4 h-4 mr-1" />
              Gift
            </Button>
          </div>
        </div>
        <p className="text-sm mb-3">{video.description}</p>
      </div>

      {/* Interaction Buttons */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-all ${
            isLiked ? "bg-primary/20" : ""
          }`}>
            <Heart className={`w-6 h-6 transition-all ${
              isLiked ? "fill-primary text-primary scale-110" : "group-hover:text-primary"
            }`} />
          </div>
          <span className="text-xs font-medium text-white">{video.likes}</span>
        </button>

        <button onClick={() => setShowCommentsDialog(true)} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary/20 transition-all">
            <MessageCircle className="w-6 h-6 group-hover:text-secondary transition-colors text-white" />
          </div>
          <span className="text-xs font-medium text-white">{video.comments}</span>
        </button>

        <button onClick={() => setShowShareDialog(true)} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent/20 transition-all">
            <Share2 className="w-6 h-6 group-hover:text-accent transition-colors text-white" />
          </div>
          <span className="text-xs font-medium text-white">{video.shares}</span>
        </button>
      </div>

      {/* Dialogs */}
      <GiftDialog 
        open={showGiftDialog} 
        onOpenChange={setShowGiftDialog}
        creatorName={video.creator}
        onGiftSent={handleGiftSent}
      />
      <CommentsDialog 
        open={showCommentsDialog} 
        onOpenChange={setShowCommentsDialog}
        videoId={video.id}
      />
      <ShareDialog 
        open={showShareDialog} 
        onOpenChange={setShowShareDialog}
        videoId={video.id}
      />
    </div>
  );
};

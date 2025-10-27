import { Heart, MessageCircle, Share2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VideoCardProps {
  video: {
    id: number;
    creator: string;
    description: string;
    likes: string;
    comments: string;
    shares: string;
    thumbnail: string;
  };
}

export const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <div className="relative w-full h-full bg-black">
      {/* Video Thumbnail/Placeholder */}
      <div className="absolute inset-0">
        <img
          src={video.thumbnail}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Play Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
          <Play className="w-10 h-10 text-white fill-white ml-1" />
        </div>
      </div>

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10 border-2 border-primary">
            <AvatarFallback>{video.creator.slice(1, 3).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{video.creator}</p>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-gradient-battle hover:opacity-90"
          >
            Follow
          </Button>
        </div>
        <p className="text-sm mb-3">{video.description}</p>
      </div>

      {/* Interaction Buttons */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6">
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-all">
            <Heart className="w-6 h-6 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-xs font-medium">{video.likes}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary/20 transition-all">
            <MessageCircle className="w-6 h-6 group-hover:text-secondary transition-colors" />
          </div>
          <span className="text-xs font-medium">{video.comments}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent/20 transition-all">
            <Share2 className="w-6 h-6 group-hover:text-accent transition-colors" />
          </div>
          <span className="text-xs font-medium">{video.shares}</span>
        </button>
      </div>
    </div>
  );
};

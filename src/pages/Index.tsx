import { useState } from "react";
import { VideoCard } from "@/components/VideoCard";
import { Heart, MessageCircle, Share2, Flame } from "lucide-react";

const mockVideos = [
  {
    id: 1,
    creator: "@battlemaster",
    description: "Epic battle incoming! 🔥 Who's ready?",
    likes: "12.5K",
    comments: "892",
    shares: "234",
    thumbnail: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400",
    profilePic: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=100",
    videoUrl: "/videos/dbattle-sample.mp4",
  },
  {
    id: 2,
    creator: "@cryptoqueen",
    description: "Just staked 10K DCoin! 💎 #dBattle #crypto",
    likes: "8.3K",
    comments: "456",
    shares: "178",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
    profilePic: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100",
    videoUrl: "/videos/dbattle-sample.mp4",
  },
  {
    id: 3,
    creator: "@streamking",
    description: "New battle strategy revealed! 🎯",
    likes: "15.2K",
    comments: "1.2K",
    shares: "445",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
    profilePic: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100",
    videoUrl: "/videos/dbattle-sample.mp4",
  },
];

const Index = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  return (
    <div className="pt-16 md:pt-16 pb-20 md:pb-0">
      {/* Video Feed */}
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        {mockVideos.map((video, index) => (
          <div
            key={video.id}
            className="h-full snap-start relative"
            onScroll={() => setCurrentVideo(index)}
          >
            <VideoCard video={video} />
          </div>
        ))}
      </div>

      {/* Floating Action Hint */}
      <div className="fixed bottom-24 md:bottom-8 right-4 flex flex-col gap-3 items-center z-40">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-battle rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-card rounded-full p-4 border border-primary/30 hover:border-primary/60 transition-colors cursor-pointer">
            <Flame className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

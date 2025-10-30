import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LiveStreamViewProps {
  isStreaming: boolean;
  streamId: string;
  onEndStream?: () => void;
}

export const LiveStreamView = ({ isStreaming, streamId, onEndStream }: LiveStreamViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (isStreaming) {
      startStream();
    }

    return () => {
      stopStream();
    };
  }, [isStreaming]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      toast({
        title: "Live! 🔴",
        description: "You're now streaming live",
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Camera Access Error",
        description: "Please allow camera and microphone access to go live",
        variant: "destructive",
      });
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleEndStream = () => {
    stopStream();
    onEndStream?.();
  };

  if (!isStreaming) return null;

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Stream Controls */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black/50 p-4 rounded-full backdrop-blur-sm">
        <Button
          size="icon"
          variant={isVideoEnabled ? "default" : "destructive"}
          onClick={toggleVideo}
          className="rounded-full"
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant={isAudioEnabled ? "default" : "destructive"}
          onClick={toggleAudio}
          className="rounded-full"
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={handleEndStream}
          className="rounded-full"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Live Badge */}
      <div className="absolute top-4 left-4 bg-destructive text-white px-3 py-1 rounded-full font-bold flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        LIVE
      </div>
    </div>
  );
};

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize, Smile } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AREffectsPanel } from "./AREffectsPanel";

interface LiveStreamViewProps {
  isStreaming: boolean;
  streamId: string;
  onEndStream?: () => void;
}

export const LiveStreamView = ({ isStreaming, streamId, onEndStream }: LiveStreamViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);

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
    if (isFullscreen) {
      document.exitFullscreen();
    }
    onEndStream?.();
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      toast({
        title: "Fullscreen Error",
        description: "Could not toggle fullscreen mode",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!isStreaming) return null;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {selectedEffect && (
        <AREffectsPanel
          videoRef={videoRef}
          effect={selectedEffect}
        />
      )}

      {/* AR Effects Selector */}
      {showEffects && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black/80 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setSelectedEffect(null)}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${!selectedEffect ? 'bg-primary' : 'bg-white/20'}`}
            >
              <span className="text-2xl">🚫</span>
            </button>
            <button
              onClick={() => setSelectedEffect('dog')}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedEffect === 'dog' ? 'bg-primary' : 'bg-white/20'}`}
            >
              <span className="text-2xl">🐶</span>
            </button>
            <button
              onClick={() => setSelectedEffect('cat')}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedEffect === 'cat' ? 'bg-primary' : 'bg-white/20'}`}
            >
              <span className="text-2xl">🐱</span>
            </button>
            <button
              onClick={() => setSelectedEffect('sunglasses')}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedEffect === 'sunglasses' ? 'bg-primary' : 'bg-white/20'}`}
            >
              <span className="text-2xl">😎</span>
            </button>
            <button
              onClick={() => setSelectedEffect('crown')}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedEffect === 'crown' ? 'bg-primary' : 'bg-white/20'}`}
            >
              <span className="text-2xl">👑</span>
            </button>
            <button
              onClick={() => setSelectedEffect('heart')}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedEffect === 'heart' ? 'bg-primary' : 'bg-white/20'}`}
            >
              <span className="text-2xl">💖</span>
            </button>
          </div>
        </div>
      )}

      {/* Stream Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/60 p-3 rounded-full backdrop-blur-md">
        <Button
          size="icon"
          variant={isVideoEnabled ? "default" : "destructive"}
          onClick={toggleVideo}
          className="rounded-full h-12 w-12"
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant={isAudioEnabled ? "default" : "destructive"}
          onClick={toggleAudio}
          className="rounded-full h-12 w-12"
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={() => setShowEffects(!showEffects)}
          className="rounded-full h-12 w-12"
        >
          <Smile className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={toggleFullscreen}
          className="rounded-full h-12 w-12"
        >
          <Maximize className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={handleEndStream}
          className="rounded-full h-12 w-12"
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

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LiveStreamView } from "./LiveStreamView";
import { useFlowUser } from "@/hooks/useFlowUser";

interface GoLiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoLiveDialog = ({ open, onOpenChange }: GoLiveDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState("");
  const { user } = useFlowUser();

  const handleGoLive = async () => {
    if (!user.loggedIn) {
      toast({
        title: "Login Required",
        description: "Please connect your Flow wallet to go live",
        variant: "destructive",
      });
      return;
    }

    if (!title) {
      toast({
        title: "Missing Title",
        description: "Please add a title for your livestream",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-livestream', {
        body: {
          title,
          description,
          collaborator_id: null,
          flow_address: user.addr,
        },
      });

      if (error) throw error;

      setStreamId(data.livestream.id);
      setIsStreaming(true);
      
      toast({
        title: "Going Live! 🔴",
        description: "Your livestream has started!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start livestream",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async () => {
    try {
      const { error } = await supabase
        .from('livestreams')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', streamId);

      if (error) throw error;

      toast({
        title: "Stream Ended",
        description: "Your livestream has been ended successfully",
      });
      
      setIsStreaming(false);
      setStreamId("");
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end livestream",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isStreaming ? "sm:max-w-4xl h-[80vh]" : "sm:max-w-md"}>
        {isStreaming ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-destructive" />
                {title}
              </DialogTitle>
            </DialogHeader>
            <LiveStreamView 
              isStreaming={isStreaming} 
              streamId={streamId}
              onEndStream={handleEndStream}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-destructive" />
                Start Livestream
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title</Label>
                <Input
                  id="title"
                  placeholder="What's happening?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers what to expect..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-destructive to-primary hover:opacity-90"
                onClick={handleGoLive}
                disabled={loading}
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? "Starting..." : "Go Live Now"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

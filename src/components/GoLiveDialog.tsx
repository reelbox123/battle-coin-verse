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

interface GoLiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoLiveDialog = ({ open, onOpenChange }: GoLiveDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoLive = async () => {
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
        },
      });

      if (error) throw error;

      toast({
        title: "Going Live! 🔴",
        description: "Your livestream has started!",
      });
      
      setTitle("");
      setDescription("");
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
      </DialogContent>
    </Dialog>
  );
};

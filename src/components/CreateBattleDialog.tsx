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
import { Calendar, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateBattleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBattleDialog = ({ open, onOpenChange }: CreateBattleDialogProps) => {
  const [opponent, setOpponent] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleCreateBattle = () => {
    if (!opponent || !scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Battle Created! 🎉",
      description: `Your battle with ${opponent} has been scheduled`,
    });
    
    setOpponent("");
    setScheduledTime("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Create Your Battle
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="opponent">Opponent Username</Label>
            <Input
              id="opponent"
              placeholder="@username"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Schedule Time</Label>
            <div className="flex gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground mt-2" />
              <Input
                id="time"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-battle hover:opacity-90"
            onClick={handleCreateBattle}
          >
            Create Battle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

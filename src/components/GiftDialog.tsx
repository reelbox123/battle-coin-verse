import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorName: string;
  onGiftSent?: () => void;
}

const giftOptions = [
  { id: 1, name: "Lion", icon: "🦁", cost: 100, effect: "roar" },
  { id: 2, name: "Dragon", icon: "🐉", cost: 500, effect: "fire" },
  { id: 3, name: "Crown", icon: "👑", cost: 200, effect: "sparkle" },
  { id: 4, name: "Rocket", icon: "🚀", cost: 300, effect: "launch" },
  { id: 5, name: "Diamond", icon: "💎", cost: 1000, effect: "shine" },
  { id: 6, name: "Heart", icon: "❤️", cost: 50, effect: "pulse" },
];

export const GiftDialog = ({ open, onOpenChange, creatorName, onGiftSent }: GiftDialogProps) => {
  const [selectedGift, setSelectedGift] = useState<number | null>(null);

  const handleSendGift = (gift: typeof giftOptions[0]) => {
    setSelectedGift(gift.id);
    
    // Trigger AR effect
    if (onGiftSent) {
      onGiftSent();
    }

    setTimeout(() => {
      toast({
        title: "Gift Sent! 🎁",
        description: `You sent ${gift.name} ${gift.icon} to ${creatorName} (${gift.cost} DCoin)`,
      });
      setSelectedGift(null);
      onOpenChange(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Send Gift to {creatorName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {giftOptions.map((gift) => (
            <Button
              key={gift.id}
              variant="outline"
              className={`h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all ${
                selectedGift === gift.id ? "border-primary bg-primary/10 scale-95" : ""
              }`}
              onClick={() => handleSendGift(gift)}
            >
              <span className="text-3xl">{gift.icon}</span>
              <div className="text-center">
                <p className="text-xs font-semibold">{gift.name}</p>
                <p className="text-xs text-muted-foreground">{gift.cost} DC</p>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Balance: 5,000 DCoin</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

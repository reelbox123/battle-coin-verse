import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: number;
}

export const ShareDialog = ({ open, onOpenChange, videoId }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://dbattle.app/video/${videoId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: "Twitter", icon: "𝕏", color: "bg-black" },
    { name: "Facebook", icon: "f", color: "bg-blue-600" },
    { name: "WhatsApp", icon: "W", color: "bg-green-600" },
    { name: "Telegram", icon: "T", color: "bg-blue-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Video
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm truncate">{shareUrl}</code>
            <Button size="icon" variant="ghost" onClick={handleCopyLink}>
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  toast({ title: `Sharing to ${option.name}...` });
                  onOpenChange(false);
                }}
              >
                <div className={`w-10 h-10 rounded-full ${option.color} text-white flex items-center justify-center font-bold`}>
                  {option.icon}
                </div>
                <span className="text-xs">{option.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: number;
}

const mockComments = [
  { id: 1, user: "CryptoFan", avatar: "CF", text: "This is amazing! 🔥", time: "2m ago" },
  { id: 2, user: "TokenKing", avatar: "TK", text: "Great battle!", time: "5m ago" },
  { id: 3, user: "StreamQueen", avatar: "SQ", text: "Keep it up! 💪", time: "8m ago" },
];

export const CommentsDialog = ({ open, onOpenChange, videoId }: CommentsDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: comments.length + 1,
      user: "You",
      avatar: "YO",
      text: newComment,
      time: "Just now",
    };
    
    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Comments ({comments.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{comment.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.user}</span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
          />
          <Button onClick={handleSendComment} size="icon" className="bg-gradient-battle">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content: "👋 Hey! I'm here to help with any questions about Hype UP. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chatbot", { message });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            content: data.response,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    },
  });

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Interface */}
      {isOpen && (
        <Card className="w-80 mb-4 bg-card border-2 border-purple-500/30 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-purple-400">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Hype Support
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="max-h-64 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg text-sm ${
                    message.isUser
                      ? "bg-cyan-500/20 text-cyan-100 ml-4"
                      : "bg-purple-500/20 text-purple-100 mr-4"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="bg-purple-500/20 text-purple-100 mr-4 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border border-purple-400 border-t-transparent rounded-full"></div>
                    Typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-card border-purple-500/30 focus:border-purple-500 text-white placeholder-gray-400"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || chatMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:scale-110 transition-transform duration-300 neon-glow-purple"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}

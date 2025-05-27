import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket, Star, Flame, Gamepad2, Video, Calendar, Trophy, Mountain, Share, Mail, CheckCircle, Twitch, Youtube } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ChatbotWidget } from "@/components/ui/chatbot";
import { insertStreamerApplicationSchema } from "@shared/schema";

const formSchema = insertStreamerApplicationSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  contentType: z.string().min(1, "Please select your content type"),
  streamSchedule: z.string().min(1, "Please select your stream schedule"),
  goals: z.string().min(10, "Please share more about your goals (at least 10 characters)"),
  challenges: z.string().min(10, "Please describe your challenges (at least 10 characters)"),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telegramUserId: "",
      twitchChannel: "",
      youtubeChannel: "",
      contentType: "",
      streamSchedule: "",
      goals: "",
      challenges: "",
      socialMedia: "",
      email: "",
    },
  });

  // Auto-fill Telegram User ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramUserId = urlParams.get("telegram_user_id");
    if (telegramUserId) {
      form.setValue("telegramUserId", telegramUserId);
    }
  }, [form]);

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/streamer-application", data);
      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-pink-900/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="font-gaming text-5xl md:text-7xl font-black mb-6 neon-text text-purple-400">
              Let's Boost Your Stream!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Join the <span className="text-cyan-400 font-bold">Hype UP</span> community and transform your streaming journey. 
              Connect with fellow creators, unlock exclusive tools, and watch your channel explode with engagement. 
              Your path to viral content starts here.
            </p>
            <div className="flex justify-center space-x-6 text-pink-400">
              <Rocket className="h-8 w-8 animate-bounce" />
              <Star className="h-8 w-8 animate-pulse" />
              <Flame className="h-8 w-8 animate-bounce" style={{ animationDelay: "0.1s" }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Creator Showcase Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                title: "Epic Gaming Setup",
                gradient: "from-purple-600/80"
              },
              { 
                image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                title: "Creator Workspace", 
                gradient: "from-cyan-600/80"
              },
              { 
                image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                title: "Neon Aesthetics",
                gradient: "from-pink-600/80"
              }
            ].map((item, index) => (
              <div key={index} className="relative group cursor-pointer">
                <div className="gradient-border">
                  <div className="gradient-border-inner p-1">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end`}>
                  <p className="text-white p-4 font-semibold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Onboarding Form */}
        <section className="max-w-4xl mx-auto">
          <div className="gradient-border animate-pulse-neon">
            <div className="gradient-border-inner p-8">
              <h2 className="font-gaming text-3xl md:text-4xl font-bold text-center mb-8 text-cyan-400">
                <Gamepad2 className="inline-block mr-3 h-8 w-8" />
                Join the Elite Creator Community
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Hidden Telegram User ID Field */}
                  <FormField
                    control={form.control}
                    name="telegramUserId"
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />

                  {/* Channel Links Section */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="twitchChannel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-400 font-semibold flex items-center gap-2">
                            <Twitch className="h-4 w-4" />
                            Twitch Channel
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://twitch.tv/your-channel"
                              className="bg-card border-purple-500/30 focus:border-purple-500 text-white placeholder-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="youtubeChannel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-pink-400 font-semibold flex items-center gap-2">
                            <Youtube className="h-4 w-4" />
                            YouTube Channel
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://youtube.com/@your-channel"
                              className="bg-card border-pink-500/30 focus:border-pink-500 text-white placeholder-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Content Type & Schedule */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-400 font-semibold flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Primary Content Type
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-card border-cyan-500/30 focus:border-cyan-500 text-white">
                                <SelectValue placeholder="Select your niche" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-cyan-500/30">
                              <SelectItem value="gaming">Gaming</SelectItem>
                              <SelectItem value="irl">Just Chatting/IRL</SelectItem>
                              <SelectItem value="creative">Art/Creative</SelectItem>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="educational">Educational</SelectItem>
                              <SelectItem value="variety">Variety</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="streamSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-400 font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Stream Schedule
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-card border-purple-500/30 focus:border-purple-500 text-white">
                                <SelectValue placeholder="How often do you stream?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-purple-500/30">
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="few-times-week">Few times a week</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="irregular">Irregular schedule</SelectItem>
                              <SelectItem value="just-starting">Just starting out</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Goals & Challenges */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-400 font-semibold flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            What are your streaming goals?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Share your dreams and aspirations as a content creator..."
                              className="bg-card border-cyan-500/30 focus:border-cyan-500 text-white placeholder-gray-400 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="challenges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-pink-400 font-semibold flex items-center gap-2">
                            <Mountain className="h-4 w-4" />
                            What challenges are you facing?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Tell us about obstacles you're trying to overcome..."
                              className="bg-card border-pink-500/30 focus:border-pink-500 text-white placeholder-gray-400 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Social Media & Contact */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="socialMedia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-400 font-semibold flex items-center gap-2">
                            <Share className="h-4 w-4" />
                            Other Social Media
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Twitter, Instagram, TikTok handles"
                              className="bg-card border-purple-500/30 focus:border-purple-500 text-white placeholder-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-400 font-semibold flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="your@email.com"
                              className="bg-card border-cyan-500/30 focus:border-cyan-500 text-white placeholder-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-6">
                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 hover:from-purple-700 hover:via-cyan-700 hover:to-pink-700 px-12 py-4 rounded-xl font-gaming font-bold text-xl text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                    >
                      <Rocket className="mr-3 h-5 w-5" />
                      {submitMutation.isPending ? "Joining..." : "Join the Hype!"}
                    </Button>
                  </div>

                  {/* Error Message */}
                  {submitMutation.isError && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertDescription className="text-red-200">
                        Something went wrong. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </section>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 bg-card border-2 border-green-500/50">
              <CardContent className="pt-6 text-center">
                <div className="text-6xl text-green-400 mb-4">
                  <CheckCircle className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="font-gaming text-2xl text-cyan-400 mb-4">Welcome to Hype UP!</h3>
                <p className="text-gray-300 mb-6">
                  Your application has been submitted successfully. Get ready to boost your streaming journey!
                </p>
                <Button
                  onClick={() => setShowSuccess(false)}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                >
                  Awesome!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center border-t border-purple-500/20">
        <p className="text-gray-400">
          <span className="text-cyan-400 font-semibold">Powered by Hype UP</span> – Helping streamers go viral
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-2xl">
          <div className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors duration-300">
            <i className="fab fa-discord"></i>
          </div>
          <div className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors duration-300">
            <i className="fab fa-twitter"></i>
          </div>
          <div className="text-pink-400 hover:text-pink-300 cursor-pointer transition-colors duration-300">
            <i className="fab fa-instagram"></i>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}

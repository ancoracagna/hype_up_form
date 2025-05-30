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
import { Rocket, Star, Flame, MessageSquare, Gamepad2, Video, Calendar, Trophy, Mountain, Share, Mail, CheckCircle, Twitch, Youtube, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ChatbotWidget } from "@/components/ui/chatbot";
import { insertStreamerApplicationSchema } from "@shared/schema";
import { useLocation, Link } from "wouter";

const formSchema = insertStreamerApplicationSchema.extend({
  //email: z.string().email("Пожалуйста, введите действующий адрес электронной почты"),
  telegramUsername: z.string().min(2, "Ник в Telegram должен содержать хотя бы 2 символа").regex(/^@?[a-zA-Z0-9_]{2,32}$/, "Некорректный формат ника Telegram (например, @username или username)"), 
  contentType: z.string().min(1, "Пожалуйста, выберите тип вашего контента"),
  streamSchedule: z.string().min(1, "Пожалуйста, выберите ваш график стримов"),
  goals: z.string().min(10, "Пожалуйста, расскажите подробнее о ваших целях (минимум 10 символов)"),
  challenges: z.string().min(10, "Пожалуйста, опишите ваши трудности (минимум 10 символов)"),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [location] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telegramUserId: "",
      telegramUsername: "",
      twitchChannel: "",
      youtubeChannel: "",
      contentType: "",
      streamSchedule: "",
      goals: "",
      challenges: "",
      socialMedia: "",
      //email: "",
    },
  });

  // Track page view for analytics
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await apiRequest("POST", "/api/analytics/page-view", {
          path: location,
        });
      } catch (error) {
        // Silent fail for analytics
        console.log("Analytics tracking failed:", error);
      }
    };
    
    trackPageView();
  }, [location]);

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
              Давайте Усилим Ваш Стрим!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Присоединяйтесь к сообществу <span className="text-cyan-400 font-bold">Hype UP</span> и преобразите свой стриминговый путь.
              Общайтесь с другими создателями, открывайте эксклюзивные инструменты и наблюдайте, как ваш канал взрывается активностью.
              Ваш путь к вирусному контенту начинается здесь.
            </p>
            <div className="flex justify-center space-x-6 text-pink-400">
              <Rocket className="h-8 w-8 animate-bounce" />
              <Star className="h-8 w-8 animate-bounce" style={{ animationDelay: "0.05s" }} />
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
                title: "Эпичный игровой сетап",
                gradient: "from-purple-600/80"
              },
              { 
                image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                title: "Рабочее место стримера", 
                gradient: "from-cyan-600/80"
              },
              { 
                image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                title: "Неоновая эстетика",
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
                Присоединяйтесь к Элитному Сообществу Стримеров
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
                            Канал Twitch
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
                            Канал YouTube
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
                            Основной тип контента
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-card border-cyan-500/30 focus:border-cyan-500 text-white">
                                <SelectValue placeholder="Выберите вашу нишу" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-cyan-500/30">
                              <SelectItem value="gaming">Игры</SelectItem>
                              <SelectItem value="irl">Разговорный/IRL</SelectItem>
                              <SelectItem value="creative">Творчество/Арт</SelectItem>
                              <SelectItem value="music">Музыка</SelectItem>
                              <SelectItem value="educational">Образовательный</SelectItem>
                              <SelectItem value="variety">Разное</SelectItem>
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
                            График стримов
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-card border-purple-500/30 focus:border-purple-500 text-white">
                                <SelectValue placeholder="Как часто вы стримите?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-purple-500/30">
                              <SelectItem value="daily">Ежедневно</SelectItem>
                              <SelectItem value="few-times-week">Несколько раз в неделю</SelectItem>
                              <SelectItem value="weekly">Еженедельно</SelectItem>
                              <SelectItem value="irregular">Нерегулярно</SelectItem>
                              <SelectItem value="just-starting">Только начинаю</SelectItem>
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
                            Каковы ваши цели в стриминге?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Поделитесь своими мечтами и стремлениями как создателя контента..."
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
                            С какими трудностями вы сталкиваетесь?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Расскажите нам о препятствиях, которые вы пытаетесь преодолеть..."
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
                            Другие социальные сети
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Twitter, Instagram, TikTok"
                              className="bg-card border-purple-500/30 focus:border-purple-500 text-white placeholder-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

<FormField // ЗАМЕНЯЕМ ПОЛЕ EMAIL
                      control={form.control}
                      name="telegramUsername" // Новое имя поля
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyan-400 font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> {/* Или другая иконка Telegram */}
                            Ник в Telegram
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="@ваш_ник_в_telegram"
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
                      {submitMutation.isPending ? "Присоединяемся..." : "Присоединиться!"}
                    </Button>
                  </div>

                  {/* Error Message */}
                  {submitMutation.isError && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertDescription className="text-red-200">
                      Что-то пошло не так. Пожалуйста, попробуйте снова.
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
                Ваша заявка успешно отправлена. Приготовьтесь усилить свой стриминговый путь!
                </p>
                <Button
                  onClick={() => setShowSuccess(false)}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                >
                  Отлично!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center border-t border-purple-500/20">
        <p className="text-gray-400">
          <span className="text-cyan-400 font-semibold">Создано с Hype UP</span> – Помогаем стримерам стать популярными
        </p>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}

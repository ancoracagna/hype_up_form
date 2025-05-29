// client/src/pages/login.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient"; // Импортируем queryClient
import { useLocation } from "wouter"; // Для редиректа
import { LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      console.log("LoginPage: Попытка входа с:", data);
      const response = await apiRequest("POST", "/api/auth/login", data); // apiRequest уже должен был обработать не-ОК статусы
      const responseData = await response.json(); // Парсим JSON
  
      console.log("LoginPage: Ответ от /api/auth/login:", responseData);
  
      if (responseData.success && responseData.user) { // Убедимся, что user есть
        console.log("LoginPage: Вход успешен. Инвалидация /api/auth/status...");
        // Инвалидируем и ждем, пока запрос статуса потенциально обновится.
        // invalidateQueries возвращает Promise, который резолвится, когда все затронутые запросы завершены/отменены.
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/status"], exact: true });
        console.log("LoginPage: /api/auth/status инвалидирован. Попытка refetch...");
        // Дополнительно можно принудительно перезапросить и дождаться результата
        // Это может замедлить редирект, но даст больше уверенности, что статус обновлен
        await queryClient.refetchQueries({ queryKey: ["/api/auth/status"], exact: true });
        console.log("LoginPage: /api/auth/status перезапрошен. Навигация на /admin...");
  
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get("redirect") || "/admin"; // Получаем путь для редиректа
        navigate(redirectPath, { replace: true });
  
      } else {
        setError(responseData.message || "Неизвестная ошибка от сервера при входе.");
        console.error("LoginPage: API сообщил об ошибке входа:", responseData);
      }
    } catch (e: any) {
      console.error("LoginPage: Ошибка запроса на вход (блок catch):", e);
      let errorMessage = "Ошибка входа. Проверьте данные или попробуйте позже.";
       if (e.response && typeof e.response.json === 'function') { // если ошибка от apiRequest
           try {
               const errorJson = await e.response.json();
               errorMessage = errorJson.message || errorMessage;
           } catch (parseError) { /* ignore */ }
       } else if (e.message) {
           errorMessage = e.message;
       }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-gaming text-center text-purple-400">
            <LogIn className="inline-block mr-2 h-6 w-6" />
            Вход в панель администратора
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-400">Имя пользователя</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="admin"
                        className="bg-card border-cyan-500/30 focus:border-cyan-500 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-pink-400">Пароль</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="bg-card border-pink-500/30 focus:border-pink-500 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-700">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Вход..." : "Войти"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
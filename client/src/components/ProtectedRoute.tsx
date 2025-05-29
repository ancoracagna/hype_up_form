// client/src/components/ProtectedRoute.tsx
import { useQuery } from "@tanstack/react-query";
import { Route, Redirect, type RouteProps, useLocation } from "wouter"; // Добавил useLocation для query params
import { Skeleton } from "@/components/ui/skeleton";

interface AuthStatus {
  isAuthenticated: boolean;
  user?: { id: number; username: string; role: string }; // Уточнил тип id
}

interface ProtectedRouteProps extends Omit<RouteProps, 'component' | 'children'> {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const [location] = useLocation(); // Для получения query params
  const queryParams = new URLSearchParams(location.search);
  const redirectError = queryParams.get('error');


  const { data, isLoading, error, isFetching, refetch } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"], // Стабильный ключ для инвалидации
    // queryFn можно оставить по умолчанию, если getQueryFn из queryClient.ts используется
    retry: 1,
    staleTime: 0,               // Всегда считать устаревшим
    cacheTime: 1000 * 5,        // Кэшировать недолго (5 секунд для теста)
    refetchOnWindowFocus: true, // Перезапрашивать при фокусе окна
    refetchOnMount: true,       // Всегда перезапрашивать при монтировании компонента
    refetchInterval: false,     // Не нужно периодического обновления здесь
  });

  console.log("ProtectedRoute Check:", {
    path: rest.path,
    isLoading,
    isFetching,
    error: error ? error.message : null,
    data,
    redirectError
  });

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        Проверка авторизации... {/* Изменил сообщение */}
      </div>
    );
  }

  if (error) {
    console.error("ProtectedRoute: Ошибка при получении статуса аутентификации:", error);
    // Если была ошибка при получении статуса, перенаправляем на логин
    // Добавляем параметр, чтобы LoginPage мог показать сообщение
    return <Redirect to={`/login?redirect=${encodeURIComponent(rest.path || window.location.pathname)}&error=auth_check_failed`} />;
  }

  if (!data?.isAuthenticated || data.user?.role !== 'admin') {
    console.log("ProtectedRoute: Не аутентифицирован или не админ. Перенаправление на логин. Data:", data);
    return <Redirect to={`/login?redirect=${encodeURIComponent(rest.path || window.location.pathname)}`} />;
  }

  console.log("ProtectedRoute: Аутентифицирован и админ. Рендеринг компонента:", Component.name);
  return <Route {...rest} component={Component} />;
}
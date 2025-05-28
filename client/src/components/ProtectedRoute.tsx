// client/src/components/ProtectedRoute.tsx
import { useQuery } from "@tanstack/react-query";
import { Route, Redirect, type RouteProps } from "wouter";
import { Skeleton } from "@/components/ui/skeleton"; // Для состояния загрузки

interface AuthStatus {
  isAuthenticated: boolean;
  user?: { username: string; role: string };
}

// Определяем, что наш ProtectedRoute принимает те же пропсы, что и Route из wouter
interface ProtectedRouteProps extends Omit<RouteProps, 'component' | 'children'> {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { data, isLoading, error } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    retry: 1, // Не будем слишком настойчиво пытаться, если сервер недоступен
    staleTime: 5 * 60 * 1000, // Кэшировать статус на 5 минут
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 p-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !data?.isAuthenticated || data.user?.role !== 'admin') {
    // Если ошибка, не аутентифицирован или не админ, перенаправляем на логин
    // Можно добавить параметр ?redirect=<текущий_путь> для возврата после логина
    return <Redirect to={`/login?redirect=${encodeURIComponent(rest.path || window.location.pathname)}`} />;
  }

  // Если аутентифицирован и админ, рендерим запрошенный компонент
  return <Route {...rest} component={Component} />;
}
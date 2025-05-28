import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Eye, MessageCircle, TrendingUp, Calendar, Mail, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Analytics {
  totalApplications: number;
  totalPageViews: number;
  totalChatInteractions: number;
  recentApplications: Array<{
    id: number;
    email: string;
    contentType: string;
    streamSchedule: string;
    goals: string;
    challenges: string;
    twitchChannel: string | null;
    youtubeChannel: string | null;
    socialMedia: string | null;
    createdAt: string;
  }>;
  pageViewsToday: number;
  chatInteractionsToday: number;
}

export default function Admin() {
  const { data: applications, isLoading: appsLoading } = useQuery<{ success: boolean; applications: any[] }>({
    queryKey: ["/api/streamer-applications"],
    retry: 3,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{ success: boolean; data: Analytics }>({
    queryKey: ["/api/analytics"],
    retry: 3,
  });

  const isLoading = appsLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="font-gaming text-4xl font-bold text-purple-400">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card border-purple-500/30">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="bg-card border-purple-500/30">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = analytics?.data;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="font-gaming text-4xl md:text-5xl font-bold text-purple-400 neon-text mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Monitor streamer applications and platform analytics</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-purple-500/30 hover:border-purple-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{applications?.applications?.length || 0}</div>
              <p className="text-xs text-gray-400">All time submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-400">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalPageViews || "Loading..."}</div>
              <p className="text-xs text-gray-400">
                {stats?.pageViewsToday || 0} today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-pink-500/30 hover:border-pink-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-400">Chat Interactions</CardTitle>
              <MessageCircle className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalChatInteractions || "Loading..."}</div>
              <p className="text-xs text-gray-400">
                {stats?.chatInteractionsToday || 0} today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-green-500/30 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Active Now</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Live</div>
              <p className="text-xs text-gray-400">Real-time tracking</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="bg-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Streamer Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications?.applications?.length ? (
              <div className="space-y-6">
                {applications.applications.map((application: any) => (
                  <div
                    key={application.id}
                    className="gradient-border p-4 hover:scale-[1.02] transition-transform"
                  >
                    <div className="gradient-border-inner p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-cyan-400" />
                            <span className="text-white font-semibold">{application.email}</span>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              {application.contentType}
                            </Badge>
                            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                              {application.streamSchedule}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="text-purple-400 font-semibold mb-1">Goals:</h4>
                              <p className="text-gray-300 line-clamp-2">{application.goals}</p>
                            </div>
                            <div>
                              <h4 className="text-pink-400 font-semibold mb-1">Challenges:</h4>
                              <p className="text-gray-300 line-clamp-2">{application.challenges}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {application.twitchChannel && (
                              <a
                                href={application.twitchChannel}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Twitch
                              </a>
                            )}
                            {application.youtubeChannel && (
                              <a
                                href={application.youtubeChannel}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-sm"
                              >
                                <ExternalLink className="h-3 w-3" />
                                YouTube
                              </a>
                            )}
                            {application.socialMedia && (
                              <span className="text-cyan-400 text-sm">
                                Social: {application.socialMedia}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4" />
                          {application.createdAt ? format(new Date(application.createdAt), "MMM dd, yyyy") : "Recently submitted"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No applications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
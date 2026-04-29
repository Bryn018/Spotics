interface Activity {
  id: string;
  activity_type: string;
  title: string;
  subtitle?: string | null;
  metadata: {
    image?: string | null;
    album?: string | null;
    durationMs?: number;
    previewUrl?: string | null;
  } | null;
  occurred_at: string;
  created_at: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <p className="text-gray-400">No recent activity</p>
      </div>
    );
  }

  // Format time ago
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              {activity.metadata?.image && (
                <img
                  src={activity.metadata.image}
                  alt={activity.subtitle || activity.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium truncate">{activity.title}</h4>
                <p className="text-xs text-gray-400 truncate">{activity.subtitle}</p>
              </div>
              <span className="text-xs text-gray-500">{formatTimeAgo(activity.occurred_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

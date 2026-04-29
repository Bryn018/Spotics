import { Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ListeningScoreProps {
  score?: number;
  maxScore?: number;
  trend?: 'up' | 'down' | 'stable';
}

export function ListeningScore({ score = 8.7, maxScore = 10, trend = 'up' }: ListeningScoreProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-card rounded-xl border border-border p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Listening Score</h3>
          <motion.div
            animate={trend === 'up' ? { y: [0, -2, 0] } : trend === 'down' ? { y: [0, 2, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'bg-accent/20 text-accent' :
              trend === 'down' ? 'bg-destructive/20 text-destructive' :
              'bg-muted/20 text-muted-foreground'
            }`}
          >
            <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-primary">{score}</span>
            <span className="text-xl text-muted-foreground">/{maxScore}</span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
              >
                <Star
                  className={`h-5 w-5 ${
                    i < Math.floor(score / 2) ? 'text-primary fill-primary' : 'text-muted'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Based on listening diversity, consistency, and discovery patterns
        </div>
      </div>
    </motion.div>
  );
}
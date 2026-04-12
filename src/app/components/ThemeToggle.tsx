import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="relative text-gray-400 hover:text-white overflow-hidden group"
      >
        <motion.div
          initial={false}
          animate={{
            rotate: theme === 'dark' ? 0 : 180,
            scale: theme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-5 w-5" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            rotate: theme === 'light' ? 0 : -180,
            scale: theme === 'light' ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-5 w-5" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </Button>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { SpoticsLogo } from '../components/SpoticsLogo';
import { apiBaseUrl, apiRoutes } from '../lib/api';
import { useSession } from '../context/SessionContext';

export function Login() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { authenticated } = useSession();

  useEffect(() => {
    if (authenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSpotifyLogin = () => {
    window.location.href = `${apiBaseUrl}${apiRoutes.login}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dark solid background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Animated background gradients with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: mousePosition.x,
            y: mousePosition.y,
          }}
          transition={{
            scale: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            },
            x: { duration: 0.5, ease: "easeOut" },
            y: { duration: 0.5, ease: "easeOut" },
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: -mousePosition.x * 0.5,
            y: -mousePosition.y * 0.5,
          }}
          transition={{
            scale: {
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            },
            x: { duration: 0.5, ease: "easeOut" },
            y: { duration: 0.5, ease: "easeOut" },
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Main Content Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0D1421] border border-[#1E293B]">
          <div className="relative p-12">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <motion.div
                className="relative mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="absolute inset-0 bg-[#1DB954] rounded-full blur-xl opacity-30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <SpoticsLogo className="relative h-20 w-20" />
              </motion.div>

              <h1 className="text-4xl font-bold text-[#1DB954] mb-3 text-center">
                Spotics
              </h1>

              <p className="text-[#94A3B8] text-center max-w-sm leading-relaxed">
                Your personal music analytics platform. Connect with Spotify to unlock deep insights into your listening habits.
              </p>
            </div>

            {/* Decorative Line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1E293B] to-transparent mb-10" />

            {/* Spotify Login Button */}
            <div>
              <Button
                onClick={handleSpotifyLogin}
                className="w-full bg-gradient-to-r from-[#1DB954] to-[#159947] hover:from-[#1ed760] hover:to-[#1DB954] text-white font-semibold py-7 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35 transition-all duration-300 text-lg group relative overflow-hidden"
              >
                <span className="relative flex items-center justify-center gap-3">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Continue with Spotify
                </span>
              </Button>
            </div>

            {/* Info Section */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-xs text-[#64748B]">
                By connecting, you agree to share your Spotify listening data
              </p>

              {/* Features List */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {[
                  { icon: '📊', label: 'Analytics' },
                  { icon: '🎵', label: 'Top Tracks' },
                  { icon: '🎤', label: 'Artists' },
                  { icon: '💿', label: 'Albums' },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(30,41,59,0.5)] border border-[#1E293B]"
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-sm text-[#CBD5E1]">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            Spotics is not affiliated with Spotify AB or any of its partners
          </p>
        </div>
      </motion.div>
    </div>
  );
}

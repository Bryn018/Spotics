import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { SpoticsLogo } from '../components/SpoticsLogo';
import { apiRoutes } from '../lib/api';

export function Login() {
  const handleSpotifyLogin = () => {
    window.location.href = apiRoutes.login;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dark solid background - no gradients */}
      <div className="absolute inset-0 bg-black"></div>

      <motion.div 
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Main Content Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900/40 backdrop-blur-2xl border border-gray-800/50 shadow-2xl">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-black"></div>
          
          <div className="absolute inset-[1px] bg-gray-900/90 backdrop-blur-2xl rounded-3xl"></div>

          <div className="relative p-12">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative mb-6">
                <SpoticsLogo className="relative h-20 w-20" />
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-3 text-center">
                Spotics
              </h1>
              
              <p className="text-gray-400 text-center max-w-sm leading-relaxed">
                Your personal music analytics platform. Connect with Spotify to unlock deep insights into your listening habits.
              </p>
            </div>

            {/* Decorative Line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent mb-12" />

            {/* Spotify Login Button */}
            <div>
              <Button
                onClick={handleSpotifyLogin}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-7 rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 text-lg group relative overflow-hidden"
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
            <div className="mt-10 text-center space-y-4">
              <p className="text-xs text-gray-500">
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors duration-300"
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-sm text-gray-300">{feature.label}</span>
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

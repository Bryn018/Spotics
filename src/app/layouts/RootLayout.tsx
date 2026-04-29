import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TimeRangeProvider } from "../contexts/TimeRangeContext";

export function RootLayout() {
  return (
    <ThemeProvider>
      <TimeRangeProvider>
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
          <Header />
          <Outlet />
        <footer className="relative border-t border-gray-800/50 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm mt-20 py-12">
          <div className="container mx-auto px-4 max-w-[1600px]">
            <div className="text-center">
              <p className="text-gray-400 text-sm">© 2026 Insights</p>
            </div>
          </div>
        </footer>
        </div>
      </TimeRangeProvider>
    </ThemeProvider>
  );
}
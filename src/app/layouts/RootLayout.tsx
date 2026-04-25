import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TimeRangeProvider } from "../contexts/TimeRangeContext";

export function RootLayout() {
  return (
    <ThemeProvider>
      <TimeRangeProvider>
        <div className="min-h-screen bg-black">
          <Header />
          <Outlet />
        <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-sm mt-20 py-12">
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
import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TimeRangeProvider } from "../contexts/TimeRangeContext";
import { DashboardProvider } from "../context/DashboardContext";
import { AutoSync } from "../components/AutoSync";

export function RootLayout() {
  return (
    <ThemeProvider>
      <TimeRangeProvider>
        <DashboardProvider>
          <AutoSync />
          <div className="min-h-screen bg-black">
            <Header />
            <Outlet />
            <footer className="border-t border-[#111827] bg-black py-8">
              <div className="container mx-auto px-4 max-w-[1600px]">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">© 2026 Insights</p>
                </div>
              </div>
            </footer>
          </div>
        </DashboardProvider>
      </TimeRangeProvider>
    </ThemeProvider>
  );
}

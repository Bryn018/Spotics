import { HashRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "../context/DataContext";
import { Landing } from "../pages/Landing";
import { Dashboard } from "../pages/Dashboard";
import { Analytics } from "../pages/Analytics";
import { WrapReports } from "../pages/WrapReports";
import { Export } from "../pages/Export";

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/wraps" element={<WrapReports />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}

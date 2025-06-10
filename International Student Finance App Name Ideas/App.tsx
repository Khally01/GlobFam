import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { DashboardContent } from "./components/dashboard/DashboardContent";
import { FamilyHub } from "./components/family/FamilyHub";
import { MultiCurrencyWallet } from "./components/currency/MultiCurrencyWallet";
import { AcademicTimeline } from "./components/academic/AcademicTimeline";
import { VisaComplianceTracker } from "./components/visa/VisaComplianceTracker";
import { FamilyWealthPlanning } from "./components/family/FamilyWealthPlanning";
import { AustralianRegulatoryRequirements } from "./components/regulatory/AustralianRegulatoryRequirements";
import { LanguageToggle } from "./components/layout/LanguageToggle";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [language, setLanguage] = useState("en");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent language={language} />;
      case "familyHub":
        return <FamilyHub language={language} />;
      case "familyWealthPlanning":
        return <FamilyWealthPlanning language={language} />;
      case "multiCurrencyWallet":
        return <MultiCurrencyWallet language={language} />;
      case "academicTimeline":
        return <AcademicTimeline language={language} />;
      case "visaCompliance":
        return <VisaComplianceTracker language={language} />;
      case "regulatoryRequirements":
        return <AustralianRegulatoryRequirements language={language} />;
      default:
        return <DashboardContent language={language} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} language={language} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header language={language}>
          <LanguageToggle language={language} onLanguageChange={handleLanguageChange} />
        </Header>
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;

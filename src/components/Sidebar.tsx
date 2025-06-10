import { 
  BarChart3, 
  Calendar, 
  CreditCard, 
  FileText, 
  Home, 
  Settings, 
  Users, 
  Wallet,
  Shield,
  PieChart,
  BookOpen
} from "lucide-react";
import { translations } from "../../translations";

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: string;
}

export function Sidebar({ activeTab, onTabChange, language }: SidebarProps) {
  const t = translations[language];
  
  const tabs = [
    { id: "dashboard", name: t.dashboard, icon: Home },
    { id: "familyWealthPlanning", name: t.familyWealthPlanning, icon: PieChart },
    { id: "familyHub", name: t.familyHub, icon: Users },
    { id: "multiCurrencyWallet", name: t.multiCurrencyWallet, icon: Wallet },
    { id: "academicTimeline", name: t.academicTimeline, icon: Calendar },
    { id: "visaCompliance", name: t.visaCompliance, icon: Shield },
    { id: "regulatoryRequirements", name: t.regulatoryRequirements, icon: BookOpen },
    { id: "educationFinance", name: t.educationFinance, icon: CreditCard },
    { id: "documents", name: t.documents, icon: FileText },
    { id: "analytics", name: t.analytics, icon: BarChart3 },
    { id: "settings", name: t.settings, icon: Settings }
  ];
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
      <div className="h-full flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-emerald-600">{t.appName}</h1>
        </div>
        
        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                    <span>{tab.name}</span>
                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-emerald-600"></span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="font-medium text-emerald-600">BG</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Batbold G.</p>
              <p className="text-xs text-gray-500">{t.student}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Bell, HelpCircle, Search, Settings, User } from "lucide-react";
import { translations } from "../../translations";

interface HeaderProps {
  children?: React.ReactNode;
  language: string;
}

export function Header({ children, language }: HeaderProps) {
  const t = translations[language];
  
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-emerald-600">{t.appName}</h1>
          
          <div className="hidden md:flex relative ml-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {children}
          
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </button>
          
          <button className="flex items-center gap-2 ml-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700">Batbold G.</span>
          </button>
        </div>
      </div>
    </header>
  );
}

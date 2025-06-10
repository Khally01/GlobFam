import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'mn' : 'en';
    onLanguageChange(newLanguage);
  };
  
  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
    >
      <Globe className="h-4 w-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">
        {language === 'en' ? 'MN' : 'EN'}
      </span>
    </button>
  );
}

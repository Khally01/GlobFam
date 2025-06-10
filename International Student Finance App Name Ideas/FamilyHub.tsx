import { ArrowUpRight } from "lucide-react";
import { translations } from "../../translations";

interface FamilyHubProps {
  language: string;
}

export function FamilyHub({ language }: FamilyHubProps) {
  const t = translations[language];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.familyWealthPlanning}</h1>
        <p className="text-gray-600">{t.manageFamilyFinancialFuture}</p>
      </div>

      {/* Family Financial Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.familyFinancialOverview}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h3 className="font-medium text-gray-900 mb-2">{t.totalFamilyWealth}</h3>
            <p className="text-2xl font-bold text-emerald-700">$280,250 AUD</p>
            <p className="text-sm text-emerald-600">
              <span className="font-medium">+2.4%</span> {t.sinceLastMonth}
            </p>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t.combinedAssets}</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">{t.currentCountryOfResidence}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full overflow-hidden">
                <img src="https://flagcdn.com/w80/au.png" alt="Australia flag" className="h-full w-full object-cover" />
              </div>
              <span className="font-medium">Australia</span>
            </div>
            <p className="text-xl font-bold text-gray-900">$81,850 AUD</p>
            <p className="text-sm text-gray-600">29% of total assets</p>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '29%' }}></div>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">{t.homeCountry}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full overflow-hidden">
                <img src="https://flagcdn.com/w80/mn.png" alt="Mongolia flag" className="h-full w-full object-cover" />
              </div>
              <span className="font-medium">Mongolia</span>
            </div>
            <p className="text-xl font-bold text-gray-900">$198,400 AUD</p>
            <p className="text-sm text-gray-600">71% of total assets</p>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '71%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">{t.byLocation}</h3>
            <div className="h-48 bg-gray-50 rounded-md p-2">
              {/* Chart would go here */}
              <div className="h-full flex items-center justify-center text-gray-400">
                Asset location pie chart
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">{t.byType}</h3>
            <div className="h-48 bg-gray-50 rounded-md p-2">
              {/* Chart would go here */}
              <div className="h-full flex items-center justify-center text-gray-400">
                Asset type pie chart
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.financial}</p>
              <p className="text-lg font-bold text-gray-900">$94,000</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.realEstate}</p>
              <p className="text-lg font-bold text-gray-900">$165,000</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.business}</p>
              <p className="text-lg font-bold text-gray-900">$21,250</p>
            </div>
          </div>
        </div>
      </div>

      {/* Family Collaboration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.familyCollaboration}</h2>
          <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
            {t.createNew}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.target}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.current}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.dueDate}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t.progress}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.universityTuitionFund}</p>
                    <p className="text-xs text-gray-500">{t.savingForNextSemester}</p>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$17,000</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$8,500</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">July 15, 2025</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">50%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.emergencyMedicalFund}</p>
                    <p className="text-xs text-gray-500">{t.familyHealthEmergency}</p>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$5,000</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$5,000</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                    {t.completed}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">100%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.childEducationFund}</p>
                    <p className="text-xs text-gray-500">{t.savingForPrimarySchool}</p>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$3,000</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$1,800</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">August 20, 2025</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">60%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Family Members */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.familyMembers}</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
              {t.manage}
            </button>
            <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
              {t.addFamilyMember}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="font-medium text-emerald-600">BG</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">Batbold Ganbold</p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
                    {t.student}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Primary account holder</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {t.fullAccess}
              </span>
              <button className="text-sm text-emerald-600 flex items-center gap-1">
                <span>{t.manage}</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-600">EG</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">Enkhjargal Ganbold</p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                    {t.spouse}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Family member</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {t.fullAccess}
              </span>
              <button className="text-sm text-emerald-600 flex items-center gap-1">
                <span>{t.manage}</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="font-medium text-purple-600">MG</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">Munkh Ganbold</p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                    {t.child}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Family member</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {t.noAccess}
              </span>
              <button className="text-sm text-emerald-600 flex items-center gap-1">
                <span>{t.manage}</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="font-medium text-yellow-600">OG</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">Oyunbileg Ganbold</p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    {t.parent}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Family member (Mongolia)</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {t.viewOnly}
              </span>
              <button className="text-sm text-emerald-600 flex items-center gap-1">
                <span>{t.manage}</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Australian Regulatory Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.australianRegulatoryCompliance}</h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{t.maintainSufficientFunds}</p>
                  <p className="text-sm text-gray-600">$36,699 AUD required</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '115%' }}></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>$42,200 available</span>
                <span>{t.verifyBy}: August 15, 2025</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{t.maintainHealthCoverage}</p>
                  <p className="text-sm text-gray-600">OSHC for all family members</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Coverage active</span>
                <span>{t.renewBy}: March 15, 2026</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{t.maintainFullTimeEnrollment}</p>
                  <p className="text-sm text-gray-600">4 courses per semester</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Currently enrolled in 4 courses</span>
                <span>{t.verifyBy}: July 15, 2025</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.taxCompliance}</h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{t.australianTaxReturn}</p>
                  <p className="text-sm text-gray-600">{t.annualTaxFiling}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  {t.pending}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>2024-2025 tax year</span>
                <span>Due: October 31, 2025</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{t.mongolianTaxObligations}</p>
                  <p className="text-sm text-gray-600">{t.reportForeignAssets}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>2024 tax year</span>
                <span>Completed: February 15, 2025</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{t.foreignIncomeDeclaration}</p>
                  <p className="text-sm text-gray-600">{t.declareMongolianIncome}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  {t.pending}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>2024-2025 tax year</span>
                <span>Due: October 31, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Long-term Financial Planning */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.longTermFinancialPlanning}</h2>
          <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
            {t.updatePlan}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t.educationCompletion}</p>
                <p className="text-sm text-gray-600">December 2026</p>
              </div>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{t.targetSavings}</p>
                <p className="text-lg font-medium text-gray-900">$63,150</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                50% {t.funded}
              </span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t.postGraduationPlan}</p>
                <p className="text-sm text-gray-600">2027-2028</p>
              </div>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{t.targetSavings}</p>
                <p className="text-lg font-medium text-gray-900">$40,000</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                25% {t.funded}
              </span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t.propertyInvestment}</p>
                <p className="text-sm text-gray-600">2028-2030</p>
              </div>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }}></div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{t.targetValue}</p>
                <p className="text-lg font-medium text-gray-900">$120,000</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                10% {t.funded}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Planning */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.migrationPlanning}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img src="https://flagcdn.com/w80/mn.png" alt="Mongolia flag" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t.returnToMongolia}</p>
                <p className="text-sm text-gray-600">{t.returnToMongoliaDesc}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                <span className="text-sm text-gray-600">{t.underConsideration}</span>
              </div>
              <button className="text-sm text-emerald-600 flex items-center gap-1">
                <span>{t.viewDetails}</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg bg-emerald-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img src="https://flagcdn.com/w80/au.png" alt="Australia flag" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t.permanentResidency}</p>
                <p className="text-sm text-gray-600">{t.permanentResidencyDesc}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-emerald-700">{t.primaryPlan}</span>
              </div>
              <button className="text-sm text-emerald-600 flex items-center gap-1">
                <span>{t.viewDetails}</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

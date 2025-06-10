import { ArrowUpRight, Globe, Users, Home, PieChart, Building, Briefcase } from "lucide-react";
import { translations } from "../../translations";

interface FamilyWealthPlanningProps {
  language: string;
}

export function FamilyWealthPlanning({ language }: FamilyWealthPlanningProps) {
  const t = translations[language];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.familyWealthPlanning}</h1>
        <p className="text-gray-600">{t.manageFamilyFinancialFuture}</p>
      </div>

      {/* Family Financial Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.familyFinancialOverview}</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
              {t.byLocation}
            </button>
            <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
              {t.byType}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">{t.totalFamilyWealth}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                +3.2% {t.sinceLastMonth}
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">$876,500 AUD</p>
            <p className="text-sm text-gray-600 mt-1">{t.combinedAssets}</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">{t.currentCountryOfResidence}</h3>
            </div>
            <p className="text-xl font-bold text-gray-900">$342,800 AUD</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '39%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-600 ml-2">39%</span>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-gray-900">{t.homeCountry}</h3>
            </div>
            <p className="text-xl font-bold text-gray-900">$533,700 AUD</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: '61%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-600 ml-2">61%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{t.assetAllocation}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                <span className="text-xs text-gray-600">{t.financial}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-gray-600">{t.realEstate}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <span className="text-xs text-gray-600">{t.business}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">{t.australianAssets}</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500" style={{ transform: 'rotate(135deg)' }}></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500" style={{ transform: 'rotate(45deg)' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium">$342.8K</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="text-sm text-gray-600">Financial: 65%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-gray-600">Real Estate: 35%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm text-gray-600">Business: 0%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Commonwealth Bank Accounts</p>
                  <p className="text-sm font-medium text-gray-900">$124,350 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Australian Investments</p>
                  <p className="text-sm font-medium text-gray-900">$98,450 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Melbourne Apartment</p>
                  <p className="text-sm font-medium text-gray-900">$120,000 AUD</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">{t.mongolianAssets}</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 border-b-emerald-500" style={{ transform: 'rotate(240deg)' }}></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500" style={{ transform: 'rotate(60deg)' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium">$533.7K</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="text-sm text-gray-600">Financial: 15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-gray-600">Real Estate: 65%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm text-gray-600">Business: 20%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Ulaanbaatar Apartment</p>
                  <p className="text-sm font-medium text-gray-900">$280,000 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Family Business Stake</p>
                  <p className="text-sm font-medium text-gray-900">$106,700 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Khan Bank Accounts</p>
                  <p className="text-sm font-medium text-gray-900">$80,000 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Land Plot (Countryside)</p>
                  <p className="text-sm font-medium text-gray-900">$67,000 AUD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Family Collaboration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.familyCollaboration}</h2>
          <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md flex items-center gap-1">
            <span>{t.createNew}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.target}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.current}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.dueDate}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.progress}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.universityTuitionFund}</p>
                    <p className="text-xs text-gray-500">{t.savingForNextSemester}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900">$18,500 / $24,000 AUD</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-600">July 15, 2025</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '77%' }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">77%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.emergencyMedicalFund}</p>
                    <p className="text-xs text-gray-500">{t.familyHealthEmergency}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900">$10,000 / $10,000 AUD</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-600">Ongoing</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">100%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.childEducationFund}</p>
                    <p className="text-xs text-gray-500">{t.savingForPrimarySchool}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900">$6,200 / $12,000 AUD</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-600">January 30, 2026</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '52%' }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">52%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.propertyTaxPayment}</p>
                    <p className="text-xs text-gray-500">{t.propertyUlaanbaatar}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900">$850 / $850 AUD</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-600">May 15, 2025</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {t.completed}
                    </span>
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
            <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md flex items-center gap-1">
              <span>{t.addFamilyMember}</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="font-medium text-emerald-600">BG</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Batbold Ganbold</p>
                <p className="text-xs text-gray-500">{t.student}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.role}</p>
                <p className="text-xs font-medium text-gray-900">{t.primary}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.access}</p>
                <p className="text-xs font-medium text-emerald-600">{t.fullAccess}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.managedAssets}</p>
                <p className="text-xs font-medium text-gray-900">$876,500 AUD</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-600">EG</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Enkhjargal Ganbold</p>
                <p className="text-xs text-gray-500">{t.spouse}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.role}</p>
                <p className="text-xs font-medium text-gray-900">{t.spouse}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.access}</p>
                <p className="text-xs font-medium text-emerald-600">{t.fullAccess}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.managedAssets}</p>
                <p className="text-xs font-medium text-gray-900">$876,500 AUD</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="font-medium text-amber-600">MG</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Munkh Ganbold</p>
                <p className="text-xs text-gray-500">{t.child}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.role}</p>
                <p className="text-xs font-medium text-gray-900">{t.child}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.access}</p>
                <p className="text-xs font-medium text-gray-600">{t.noAccess}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.managedAssets}</p>
                <p className="text-xs font-medium text-gray-900">$0 AUD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Australian Regulatory Compliance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.australianRegulatoryCompliance}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1">
            <span>{t.viewDetailsLink}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-medium text-gray-900">{t.maintainSufficientFunds}</h3>
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t.compliant}
              </span>
              <p className="text-xs text-gray-600">{t.verifyBy}: August 15, 2025</p>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-medium text-gray-900">{t.maintainHealthCoverage}</h3>
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t.compliant}
              </span>
              <p className="text-xs text-gray-600">{t.renewBy}: March 15, 2026</p>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Building className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-medium text-gray-900">{t.maintainFullTimeEnrollment}</h3>
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t.compliant}
              </span>
              <p className="text-xs text-gray-600">{t.verifyBy}: July 15, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Compliance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.taxCompliance}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1">
            <span>{t.viewDetailsLink}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">{t.australianTaxReturn}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{t.annualTaxFiling}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {t.pending}
                </span>
                <p className="text-xs text-gray-600">{t.dueDate}: October 31, 2025</p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">{t.foreignIncomeDeclaration}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{t.declareMongolianIncome}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {t.pending}
                </span>
                <p className="text-xs text-gray-600">{t.dueDate}: October 31, 2025</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Home className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="font-medium text-gray-900">{t.mongolianTaxObligations}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{t.reportForeignAssets}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
                <p className="text-xs text-gray-600">{t.lastSubmitted}: February 15, 2025</p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Building className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="font-medium text-gray-900">{t.propertyTaxPayment}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{t.propertyUlaanbaatar}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
                <p className="text-xs text-gray-600">{t.lastSubmitted}: May 15, 2025</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">{t.educationCompletion}</h3>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">{t.targetSavings}</p>
              <p className="text-sm font-medium text-gray-900">$120,000 AUD</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-right text-gray-600">45% {t.funded}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.expectedCompletion}</p>
                <p className="text-xs font-medium text-gray-900">December 2026</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.monthlyContribution}</p>
                <p className="text-xs font-medium text-gray-900">$2,500 AUD</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">{t.postGraduationPlan}</h3>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">{t.propertyInvestment}</p>
              <p className="text-sm font-medium text-gray-900">{t.targetValue}: $200,000 AUD</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
            <p className="text-xs text-right text-gray-600">15% {t.funded}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.targetDate}</p>
                <p className="text-xs font-medium text-gray-900">January 2028</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t.monthlyContribution}</p>
                <p className="text-xs font-medium text-gray-900">$1,800 AUD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Planning */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.migrationPlanning}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1">
            <span>{t.viewDetailsLink}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-gray-900">{t.returnToMongolia}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t.returnToMongoliaDesc}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                {t.underConsideration}
              </span>
              <button className="text-xs text-emerald-600">{t.viewDetailsLink}</button>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">{t.permanentResidency}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t.permanentResidencyDesc}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {t.primaryPlan}
              </span>
              <button className="text-xs text-emerald-600">{t.viewDetailsLink}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

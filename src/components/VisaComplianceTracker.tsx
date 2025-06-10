import { ArrowUpRight, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { translations } from "../../translations";

interface VisaComplianceTrackerProps {
  language: string;
}

export function VisaComplianceTracker({ language }: VisaComplianceTrackerProps) {
  const t = translations[language];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.visaComplianceTracker}</h1>
        <p className="text-gray-600">{t.visaComplianceDescription}</p>
      </div>

      {/* Visa Status Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.visaStatusOverview}</h2>
          <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md mt-1">
            {t.downloadSummary}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <h3 className="font-medium text-gray-900">{t.visaStatus}</h3>
            </div>
            <p className="text-sm text-gray-600">{t.subclass500}</p>
            <p className="text-sm font-medium text-emerald-700 mt-2">{t.active}</p>
            <div className="mt-3 flex flex-wrap justify-between text-xs text-gray-500">
              <span className="mr-2 mb-1">{t.issueDate}: March 15, 2023</span>
              <span>{t.expiryDate}: February 28, 2027</span>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <h3 className="font-medium text-gray-900">{t.complianceStatus}</h3>
            </div>
            <p className="text-sm text-gray-600">{t.allRequirementsMet}</p>
            <p className="text-sm font-medium text-emerald-700 mt-2">{t.compliant}</p>
            <div className="mt-3 flex flex-wrap justify-between text-xs text-gray-500">
              <span className="mr-2 mb-1">{t.lastVerified}: May 15, 2025</span>
              <span>{t.nextVerification}: August 15, 2025</span>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h3 className="font-medium text-gray-900">{t.familyMembers}</h3>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex flex-wrap justify-between items-center">
                <p className="text-sm text-gray-600 mr-2 mb-1">Batbold Ganbold (Primary)</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.verified}
                </span>
              </div>
              <div className="flex flex-wrap justify-between items-center">
                <p className="text-sm text-gray-600 mr-2 mb-1">Enkhjargal Ganbold (Spouse)</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.verified}
                </span>
              </div>
              <div className="flex flex-wrap justify-between items-center">
                <p className="text-sm text-gray-600 mr-2 mb-1">Munkh Ganbold (Child)</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.verified}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Requirements */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.financialRequirements}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
            <span>{t.viewHistory}</span>
            <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-2">{t.primaryApplicant}</h3>
              <p className="text-xl font-bold text-blue-700">$21,041</p>
              <p className="text-xs text-blue-600">{t.annualRequirement}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-2">{t.spouse}</h3>
              <p className="text-xl font-bold text-blue-700">$7,362</p>
              <p className="text-xs text-blue-600">{t.annualRequirement}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-2">{t.child}</h3>
              <p className="text-xl font-bold text-blue-700">$8,296</p>
              <p className="text-xs text-blue-600">{t.annualRequirement}</p>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-wrap justify-between items-center mb-2">
              <div className="mr-4 mb-2">
                <h3 className="font-medium text-blue-900">{t.totalRequired}</h3>
                <p className="text-sm text-blue-700">$36,699 AUD</p>
              </div>
              <div className="text-right">
                <h3 className="font-medium text-blue-900">{t.currentBalanceAmount}</h3>
                <p className="text-sm text-blue-700">$42,200 AUD</p>
              </div>
            </div>
            <div className="w-full h-3 bg-blue-200 rounded-full">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '115%' }}></div>
            </div>
            <p className="mt-2 text-xs text-blue-700 text-right">115% {t.requiredFundsAvailable}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.acceptedFundingSources}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{t.bankDeposits}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{t.educationLoans}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{t.scholarships}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{t.financialSponsorship}</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.yourFundingSources}</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm text-gray-600 mr-2 mb-1">Commonwealth Bank Savings</p>
                  <p className="text-sm font-medium text-gray-900">$24,350 AUD</p>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm text-gray-600 mr-2 mb-1">Term Deposit</p>
                  <p className="text-sm font-medium text-gray-900">$15,000 AUD</p>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm text-gray-600 mr-2 mb-1">University Scholarship</p>
                  <p className="text-sm font-medium text-gray-900">$2,850 AUD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Insurance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.healthInsurance}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
            <span>{t.manageCoverage}</span>
            <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
              <div className="flex flex-wrap justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900 mr-2 mb-1">{t.oshcStatus}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.active}
                </span>
              </div>
              <p className="text-sm text-gray-600">{t.provider}: Medibank</p>
              <p className="text-sm text-gray-600">{t.policyNumber}: OSHC-2023-78945612</p>
              <div className="mt-3 flex flex-wrap justify-between text-xs text-gray-500">
                <span className="mr-2 mb-1">{t.startDate}: March 15, 2023</span>
                <span>{t.expiryDate}: March 15, 2026</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.coverageDetails}</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm text-gray-600 mr-2 mb-1">{t.coverageType}</p>
                  <p className="text-sm font-medium text-gray-900">{t.familyCoverage}</p>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm text-gray-600 mr-2 mb-1">{t.hospitalCover}</p>
                  <p className="text-sm font-medium text-gray-900">100%</p>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm text-gray-600 mr-2 mb-1">{t.generalTreatment}</p>
                  <p className="text-sm font-medium text-gray-900">85%</p>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm text-gray-600 mr-2 mb-1">{t.pharmaceuticals}</p>
                  <p className="text-sm font-medium text-gray-900">{t.pbs}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 border border-gray-200 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-3">{t.coveredFamilyMembers}</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="mr-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">Batbold Ganbold</p>
                    <p className="text-xs text-gray-500">{t.primary}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.covered}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <div className="mr-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">Enkhjargal Ganbold</p>
                    <p className="text-xs text-gray-500">{t.spouse}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.covered}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <div className="mr-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">Munkh Ganbold</p>
                    <p className="text-xs text-gray-500">{t.dependent}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.covered}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <h3 className="font-medium text-gray-900">{t.upcomingRenewal}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{t.renewalReminder}</p>
              <div className="flex flex-wrap justify-between items-center">
                <p className="text-sm text-gray-600 mr-2 mb-1">{t.renewalDate}</p>
                <p className="text-sm font-medium text-gray-900">March 15, 2026</p>
              </div>
              <div className="flex flex-wrap justify-between items-center">
                <p className="text-sm text-gray-600 mr-2 mb-1">{t.estimatedCost}</p>
                <p className="text-sm font-medium text-gray-900">$2,800 AUD</p>
              </div>
              <button className="mt-4 w-full px-3 py-2 bg-emerald-600 text-white text-sm rounded-md">
                {t.setRenewalReminder}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visa Expiry Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.visaExpiryInformation}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t.expiryDate}: February 28, 2027</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {t.daysRemaining}: 620
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">{t.visaExpiryDescription}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{t.visaExpiry}</h3>
              <p className="text-sm text-gray-600">{t.visaExpiryDate}: February 28, 2027</p>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{t.nextComplianceCheck}</h3>
              <p className="text-sm text-gray-600">{t.nextCheckDate}: August 15, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

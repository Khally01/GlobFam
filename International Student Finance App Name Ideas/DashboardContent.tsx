import { ArrowUpRight } from "lucide-react";
import { translations } from "../../translations";

interface DashboardContentProps {
  language: string;
}

export function DashboardContent({ language }: DashboardContentProps) {
  const t = translations[language];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard}</h1>
        <p className="text-gray-600">{t.welcomeMessage}</p>
      </div>

      {/* Australian Student Visa Compliance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.australianStudentVisa}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
            <span>{t.viewDetails}</span>
            <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h3 className="font-medium text-gray-900 mb-2">{t.financialRequirements}</h3>
            <p className="text-sm text-gray-600">{t.minimumFunds}</p>
            <p className="text-sm text-gray-600 mt-1">{t.currentBalance}</p>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '115%' }}></div>
            </div>
            <p className="mt-2 text-xs text-emerald-600">{t.statusCompliant}</p>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h3 className="font-medium text-gray-900 mb-2">{t.overseasStudentHealth}</h3>
            <p className="text-sm text-gray-600">{t.familyCoverage}</p>
            <p className="text-sm text-gray-600 mt-1">{t.validUntil} March 15, 2026</p>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="mt-2 text-xs text-emerald-600">{t.statusCompliant}</p>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h3 className="font-medium text-gray-900 mb-2">{t.enrollmentStatus}</h3>
            <p className="text-sm text-gray-600">{t.fullTimeEnrollment}</p>
            <p className="text-sm text-gray-600 mt-1">{t.currentStatus}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">{t.statusCompliant}</span>
              <span className="text-xs text-gray-500">{t.nextVerification}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center">
          <div className="text-sm text-gray-600 mr-2 mb-2">
            <span className="font-medium">{t.visaExpiry}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span>{t.nextComplianceCheck}</span>
          </div>
        </div>
      </div>

      {/* Multi-Currency Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.multiCurrencyOverview}</h2>
              <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                <span>{t.viewDetails}</span>
                <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-emerald-700">$</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">AUD</span>
                    <p className="text-xs text-gray-500">Australian Dollar</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-emerald-700">$24,350.75</p>
                <div className="mt-2 flex flex-wrap justify-between items-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 mr-2">+1.2%</span>
                  <button className="text-xs text-emerald-600">Convert</button>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-gray-700">₮</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">MNT</span>
                    <p className="text-xs text-gray-500">Mongolian Tugrik</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">₮15,750,000</p>
                <div className="mt-2 flex flex-wrap justify-between items-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 mr-2">-0.8%</span>
                  <button className="text-xs text-emerald-600">Convert</button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 mr-2 mb-1">
                  <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">Jun 1, 2025</span>
                </div>
                <div className="text-sm font-medium text-gray-900 mr-2 mb-1">University Tuition Payment</div>
                <div className="text-sm font-medium text-red-600">-$8,500.00</div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 mr-2 mb-1">
                  <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">May 30, 2025</span>
                </div>
                <div className="text-sm font-medium text-gray-900 mr-2 mb-1">Fund Transfer from Ulaanbaatar</div>
                <div className="text-sm font-medium text-green-600">+$2,009.46</div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 mr-2 mb-1">
                  <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">May 28, 2025</span>
                </div>
                <div className="text-sm font-medium text-gray-900 mr-2 mb-1">Grocery Shopping</div>
                <div className="text-sm font-medium text-red-600">-$178.35</div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.academicTimelineTitle}</h2>
              <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                <span>{t.viewCalendar}</span>
                <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">15</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.tuitionPaymentDue}</p>
                  <p className="text-xs text-gray-500">July 15, 2025</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">01</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.semester2Begins}</p>
                  <p className="text-xs text-gray-500">August 1, 2025</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">15</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.visaComplianceCheck}</p>
                  <p className="text-xs text-gray-500">August 15, 2025</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.familyAssets}</h2>
              <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                <span>{t.viewAll}</span>
                <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm font-medium text-gray-900 mr-2 mb-1">{t.propertyUlaanbaatar}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    Mongolia
                  </span>
                </div>
                <p className="mt-1 font-medium text-gray-900">₮350,000,000</p>
                <p className="text-xs text-gray-500">≈ $165,000 AUD</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm font-medium text-gray-900 mr-2 mb-1">{t.investmentPortfolio}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    Australia
                  </span>
                </div>
                <p className="mt-1 font-medium text-gray-900">$42,500 AUD</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-sm font-medium text-gray-900 mr-2 mb-1">{t.savingsAccount}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    Mongolia
                  </span>
                </div>
                <p className="mt-1 font-medium text-gray-900">₮25,750,000</p>
                <p className="text-xs text-gray-500">≈ $12,150 AUD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Family Requests and Cultural Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.familyRequests}</h2>
            <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
              <span>{t.viewAll}</span>
              <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap justify-between items-start">
                <div className="mr-2 mb-2">
                  <p className="font-medium text-gray-900">{t.propertyTaxPayment}</p>
                  <p className="text-sm text-gray-600">From: Oyunbileg (Parent)</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
              <div className="mt-3 flex flex-wrap justify-between items-center">
                <p className="text-sm font-medium text-gray-900 mr-2 mb-2">₮1,200,000</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
                    {t.approve}
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
                    {t.decline}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap justify-between items-start">
                <div className="mr-2 mb-2">
                  <p className="font-medium text-gray-900">{t.childSchoolFees}</p>
                  <p className="text-sm text-gray-600">From: Enkhjargal (Spouse)</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
              <div className="mt-3 flex flex-wrap justify-between items-center">
                <p className="text-sm font-medium text-gray-900 mr-2 mb-2">$850.00 AUD</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
                    {t.approve}
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
                    {t.decline}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mr-2">{t.culturalFinanceSettings}</h2>
            <button className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
              <span>{t.customize}</span>
              <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-900 mr-2">{t.primaryCurrency}</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">AUD</span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.primaryCurrencyDescription}</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-900 mr-2">{t.dateFormat}</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">DD/MM/YYYY</span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.dateFormatDescription}</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-900 mr-2">{t.familyFinanceModel}</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">{t.collaborative}</span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.familyFinanceModelDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

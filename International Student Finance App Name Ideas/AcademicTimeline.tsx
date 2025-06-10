import { ArrowUpRight } from "lucide-react";
import { translations } from "../../translations";

interface AcademicTimelineProps {
  language: string;
}

export function AcademicTimeline({ language }: AcademicTimelineProps) {
  const t = translations[language];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.australianAcademicTimeline}</h1>
        <p className="text-gray-600">{t.alignFinancialPlanning}</p>
      </div>

      {/* Academic Calendar */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.academicCalendar}</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
              {t.monthView}
            </button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
              {t.semesterView}
            </button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
              {t.yearView}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          <div className="text-center text-sm font-medium text-gray-500">Sun</div>
          <div className="text-center text-sm font-medium text-gray-500">Mon</div>
          <div className="text-center text-sm font-medium text-gray-500">Tue</div>
          <div className="text-center text-sm font-medium text-gray-500">Wed</div>
          <div className="text-center text-sm font-medium text-gray-500">Thu</div>
          <div className="text-center text-sm font-medium text-gray-500">Fri</div>
          <div className="text-center text-sm font-medium text-gray-500">Sat</div>
          
          {/* Calendar days - first row */}
          <div className="h-24 p-1 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-right text-sm text-gray-400">28</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-right text-sm text-gray-400">29</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-right text-sm text-gray-400">30</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-right text-sm text-gray-400">31</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">1</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">2</div>
            <div className="mt-1 p-1 text-xs bg-emerald-100 text-emerald-800 rounded">
              {t.today}
            </div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">3</div>
          </div>
          
          {/* Calendar days - second row */}
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">4</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">5</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">6</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">7</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">8</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">9</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">10</div>
          </div>
          
          {/* Calendar days - third row */}
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">11</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">12</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">13</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">14</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">15</div>
            <div className="mt-1 p-1 text-xs bg-blue-100 text-blue-800 rounded">
              {t.tuitionPaymentDue}
            </div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">16</div>
          </div>
          <div className="h-24 p-1 border border-gray-200 rounded-md">
            <div className="text-right text-sm">17</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button className="text-sm text-emerald-600 flex items-center gap-1">
            <span>{t.exportCalendar}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-blue-100 rounded-full"></div>
              <span className="text-xs text-gray-600">Academic Events</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-emerald-100 rounded-full"></div>
              <span className="text-xs text-gray-600">Financial Events</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-yellow-100 rounded-full"></div>
              <span className="text-xs text-gray-600">Visa Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Visa Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.studentVisaRequirements}</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-2">{t.livingCosts}</h3>
                <p className="text-xl font-bold text-blue-700">$21,041</p>
                <p className="text-xs text-blue-600">{t.required}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-2">{t.schoolAgeChild}</h3>
                <p className="text-xl font-bold text-blue-700">$8,296</p>
                <p className="text-xs text-blue-600">{t.required}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-2">{t.partnerSpouse}</h3>
                <p className="text-xl font-bold text-blue-700">$7,362</p>
                <p className="text-xs text-blue-600">{t.required}</p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <div>
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
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.complianceTimeline}</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">{t.enrollmentConfirmation}</h3>
              </div>
              <div className="ml-8 text-sm text-gray-600">
                <p>{t.lastVerified}: May 15, 2025</p>
                <p>{t.nextDue}: July 15, 2025</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">{t.healthInsurance}</h3>
              </div>
              <div className="ml-8 text-sm text-gray-600">
                <p>{t.validUntil} March 15, 2026</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">{t.financialEvidence}</h3>
              </div>
              <div className="ml-8 text-sm text-gray-600">
                <p>{t.lastSubmitted} April 10, 2025</p>
                <p>{t.nextDue}: August 15, 2025</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">{t.visaStatus}</h3>
              </div>
              <div className="ml-8 text-sm text-gray-600">
                <p>{t.subclass500}</p>
                <p>{t.expires} February 28, 2027</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Reminder */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">{t.importantReminder}</h2>
            <p className="text-sm text-yellow-700">{t.reminderText}</p>
          </div>
        </div>
      </div>

      {/* Financial Milestones and Semester Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.financialMilestones}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">15</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{t.tuitionPaymentDue}</p>
                  <p className="text-sm font-medium text-blue-600">$8,500</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">July 15, 2025</p>
                  <p className="text-xs text-gray-500">University of Melbourne</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">30</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{t.rentalPayment}</p>
                  <p className="text-sm font-medium text-gray-600">$2,400</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">July 30, 2025</p>
                  <p className="text-xs text-gray-500">Carlton Apartment</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-sm font-medium text-yellow-700">15</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{t.visaFinancialEvidence}</p>
                  <p className="text-sm font-medium text-yellow-600">Required</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">August 15, 2025</p>
                  <p className="text-xs text-gray-500">Department of Home Affairs</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">20</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{t.childSchoolFeesMilestone}</p>
                  <p className="text-sm font-medium text-gray-600">$1,200</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">August 20, 2025</p>
                  <p className="text-xs text-gray-500">Carlton Primary School</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">15</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{t.oshcHealthInsurance}</p>
                  <p className="text-sm font-medium text-gray-600">$850</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">September 15, 2025</p>
                  <p className="text-xs text-gray-500">Medibank</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.semesterOverview}</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-900">{t.tuitionFees}</p>
                <div className="text-sm">
                  <span className="font-medium text-emerald-600">$8,500</span>
                  <span className="text-gray-500"> / $17,000</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50% {t.paid}</span>
                <span>$8,500 {t.remaining}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-900">{t.housing}</p>
                <div className="text-sm">
                  <span className="font-medium text-emerald-600">$4,800</span>
                  <span className="text-gray-500"> / $7,200</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '67%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>67% {t.paid}</span>
                <span>$2,400 {t.remaining}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-900">{t.childEducation}</p>
                <div className="text-sm">
                  <span className="font-medium text-emerald-600">$1,800</span>
                  <span className="text-gray-500"> / $3,000</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>60% {t.paid}</span>
                <span>$1,200 {t.remaining}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-900">{t.livingExpenses}</p>
                <div className="text-sm">
                  <span className="font-medium text-emerald-600">$6,500</span>
                  <span className="text-gray-500"> / $10,500</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>62% {t.paid}</span>
                <span>$4,000 {t.remaining}</span>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-900">{t.totalSemesterCost}</p>
                <p className="text-sm font-medium text-gray-900">$37,700</p>
              </div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-600">{t.paidToDate}:</p>
                <p className="text-sm font-medium text-emerald-600">$21,600</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{t.remainingAmount}</p>
                <p className="text-sm font-medium text-blue-600">$16,100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

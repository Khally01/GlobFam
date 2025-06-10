import { ArrowUpRight, AlertCircle, CheckCircle, Clock, FileText, DollarSign, School } from "lucide-react";
import { translations } from "../../translations";

interface AustralianRegulatoryRequirementsProps {
  language: string;
}

export function AustralianRegulatoryRequirements({ language }: AustralianRegulatoryRequirementsProps) {
  const t = translations[language];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.australianRegulatoryCompliance}</h1>
        <p className="text-gray-600">{t.australianRegulatoryDescription}</p>
      </div>

      {/* Financial Requirements */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.financialRequirements}</h2>
          <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
            {t.downloadSummary}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">{t.visaFinancialRequirements}</h3>
              <p className="text-sm text-gray-600 mb-3">{t.visaFinancialDescription}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.primaryApplicant}</p>
                  <p className="text-sm font-medium text-gray-900">$21,041 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.spouse}</p>
                  <p className="text-sm font-medium text-gray-900">$7,362 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.child}</p>
                  <p className="text-sm font-medium text-gray-900">$8,296 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{t.totalRequired}</p>
                  <p className="text-sm font-medium text-gray-900">$36,699 AUD</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">{t.currentStatus}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">{t.currentBalance}</p>
                <p className="text-sm font-medium text-gray-900">$42,200 AUD</p>
              </div>
              <div className="w-full h-3 bg-blue-200 rounded-full">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '115%' }}></div>
              </div>
              <p className="mt-2 text-xs text-blue-700 text-right">115% {t.requiredFundsAvailable}</p>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{t.lastVerified}: May 15, 2025</span>
                <span>{t.nextVerification}: August 15, 2025</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 border border-gray-200 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-3">{t.acceptedFundingSources}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{t.bankDeposits}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{t.educationLoans}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{t.scholarships}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{t.financialSponsorship}</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.financialDocumentation}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Commonwealth Bank Statement</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.verified}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Term Deposit Certificate</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.verified}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">University Scholarship Letter</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.verified}
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md">
                {t.uploadNewDocument}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Requirements */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.enrollmentRequirements}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1">
            <span>{t.viewDetailsLink}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">{t.courseEnrollment}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
              </div>
              <p className="text-sm text-gray-600">{t.institution}: University of Melbourne</p>
              <p className="text-sm text-gray-600">{t.program}: Master of Business Administration</p>
              <p className="text-sm text-gray-600">{t.studyLoad}: Full-time (4 courses)</p>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{t.currentSemester}: Semester 1, 2025</span>
                <span>{t.expectedCompletion}: December 2026</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.enrollmentDocumentation}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Confirmation of Enrollment (CoE)</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.valid}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Course Registration Receipt</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.valid}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Academic Progress Report</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.valid}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 border border-gray-200 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-3">{t.enrollmentRequirementsList}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.maintainFullTimeEnrollment}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.attendClassesRegularly}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.maintainSatisfactoryProgress}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.notifyAddressChange}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.maintainValidVisa}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">{t.upcomingVerifications}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.semesterEnrollment}</p>
                  <p className="text-sm font-medium text-gray-900">July 15, 2025</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.academicProgress}</p>
                  <p className="text-sm font-medium text-gray-900">August 15, 2025</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.attendanceVerification}</p>
                  <p className="text-sm font-medium text-gray-900">September 30, 2025</p>
                </div>
              </div>
              <button className="mt-4 w-full px-3 py-2 bg-emerald-600 text-white text-sm rounded-md">
                {t.setVerificationReminders}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Child Education Requirements */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.childEducationRequirements}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1">
            <span>{t.viewDetailsLink}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">{t.schoolEnrollment}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t.compliant}
                </span>
              </div>
              <p className="text-sm text-gray-600">{t.childName}: Munkh Ganbold</p>
              <p className="text-sm text-gray-600">{t.school}: Melbourne Primary School</p>
              <p className="text-sm text-gray-600">{t.grade}: Year 3</p>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{t.enrollmentDate}: February 5, 2025</span>
                <span>{t.schoolYear}: 2025</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.schoolDocumentation}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">School Enrollment Confirmation</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.valid}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">School Fee Receipt</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.valid}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Immunization Record</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.valid}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">{t.schoolFees}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.annualTuition}</p>
                  <p className="text-sm font-medium text-gray-900">$8,500 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.materials}</p>
                  <p className="text-sm font-medium text-gray-900">$650 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{t.activities}</p>
                  <p className="text-sm font-medium text-gray-900">$450 AUD</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{t.totalAnnual}</p>
                  <p className="text-sm font-medium text-gray-900">$9,600 AUD</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{t.nextPaymentDue}: July 15, 2025</span>
                <span>{t.amount}: $4,800 AUD</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <School className="h-5 w-5 text-amber-600" />
                <h3 className="font-medium text-gray-900">{t.australianSchoolRequirements}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.mandatoryEnrollment}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.immunizationRequirements}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.attendanceRequirements}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.englishLanguageSupport}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Obligations */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.taxObligations}</h2>
          <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
            {t.taxCalendar}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
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
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.australianTaxRequirements}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.taxFileNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.reportAllIncome}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.declareForeignIncome}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-gray-600">{t.claimDeductions}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-amber-600" />
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
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{t.taxDocumentation}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Australian Tax File Number</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.obtained}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Previous Tax Return</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.filed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Mongolian Tax Declaration</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.filed}
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md">
                {t.uploadNewDocument}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Important Reminders */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t.importantReminders}</h2>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
            {t.setReminders}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-gray-900">{t.visaRenewalReminder}</h3>
            </div>
            <p className="text-sm text-gray-600">{t.visaRenewalDescription}</p>
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>{t.expiryDate}: February 28, 2027</span>
              <span>{t.reminderDate}: November 28, 2026</span>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">{t.oshcRenewalReminder}</h3>
            </div>
            <p className="text-sm text-gray-600">{t.oshcRenewalDescription}</p>
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>{t.expiryDate}: March 15, 2026</span>
              <span>{t.reminderDate}: January 15, 2026</span>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-emerald-600" />
              <h3 className="font-medium text-gray-900">{t.taxReturnReminder}</h3>
            </div>
            <p className="text-sm text-gray-600">{t.taxReturnDescription}</p>
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>{t.dueDate}: October 31, 2025</span>
              <span>{t.reminderDate}: September 15, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

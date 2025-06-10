import { ArrowUpRight } from "lucide-react";
import { translations } from "../../translations";

interface MultiCurrencyWalletProps {
  language: string;
}

export function MultiCurrencyWallet({ language }: MultiCurrencyWalletProps) {
  const t = translations[language];
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.multiCurrencyWalletTitle}</h1>
        <p className="text-gray-600">{t.manageFinances}</p>
      </div>

      {/* Currency Conversion */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.currencyConversion}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.from}</label>
              <div className="flex">
                <div className="w-1/3">
                  <select className="w-full border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option>AUD</option>
                    <option>MNT</option>
                    <option>USD</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  className="w-2/3 border-l-0 border border-gray-300 rounded-r-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Amount"
                  defaultValue="1,000.00"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.to}</label>
              <div className="flex">
                <div className="w-1/3">
                  <select className="w-full border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option>MNT</option>
                    <option>AUD</option>
                    <option>USD</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  className="w-2/3 border-l-0 border border-gray-300 rounded-r-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Amount"
                  defaultValue="2,115,000.00"
                  readOnly
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              <p>{t.exchangeRate} 1 AUD = 2,115 MNT</p>
              <p>{t.lastUpdated} June 2, 2025 12:45 PM</p>
            </div>
            
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              {t.convert}
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Exchange Rate History</h3>
            <div className="h-40 bg-white rounded-md p-2">
              {/* Chart would go here */}
              <div className="h-full flex items-center justify-center text-gray-400">
                Exchange rate chart visualization
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>May 2</span>
              <span>May 9</span>
              <span>May 16</span>
              <span>May 23</span>
              <span>May 30</span>
              <span>Jun 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.recentTransactions}</h2>
          <button className="text-sm text-emerald-600 flex items-center gap-1">
            <span>{t.viewAll}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.description}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.amount}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.currency}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.audEquivalent}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">Jun 1, 2025</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">University Tuition Payment</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">-8,500.00</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">AUD</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">-8,500.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">May 30, 2025</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Fund Transfer from Ulaanbaatar</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">+4,250,000.00</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">MNT</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">+2,009.46</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">May 28, 2025</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Grocery Shopping</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">-178.35</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">AUD</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">-178.35</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">May 25, 2025</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Child School Fees</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">-850.00</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">AUD</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">-850.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">May 20, 2025</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Property Income</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">+1,200,000.00</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">MNT</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">+567.38</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Family Asset Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{t.familyAssetTracking}</h2>
            <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-md">
              {t.addAsset}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{t.australianAssets}</h3>
              
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">Investment Portfolio</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Financial
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-gray-900">$42,500 AUD</p>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">Savings Account</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Financial
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-gray-900">$24,350 AUD</p>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">Term Deposit</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Financial
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-gray-900">$15,000 AUD</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{t.mongolianAssets}</h3>
              
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">Property in Ulaanbaatar</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      Real Estate
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-gray-900">₮350,000,000</p>
                  <p className="text-xs text-gray-500">≈ $165,000 AUD</p>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">Savings Account</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Financial
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-gray-900">₮25,750,000</p>
                  <p className="text-xs text-gray-500">≈ $12,150 AUD</p>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">Family Business Share</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      Business
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-gray-900">₮45,000,000</p>
                  <p className="text-xs text-gray-500">≈ $21,250 AUD</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">{t.totalAssets}</h3>
              <p className="font-bold text-gray-900">$280,250 AUD</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.assetAllocation}</h2>
          
          <div className="h-48 bg-gray-50 rounded-md p-2 mb-4">
            {/* Chart would go here */}
            <div className="h-full flex items-center justify-center text-gray-400">
              Asset allocation pie chart
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Real Estate</span>
              </div>
              <div className="text-sm font-medium text-gray-900">59%</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Financial</span>
              </div>
              <div className="text-sm font-medium text-gray-900">33%</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Business</span>
              </div>
              <div className="text-sm font-medium text-gray-900">8%</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Australia</span>
              </div>
              <div className="text-sm font-medium text-gray-900">29%</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Mongolia</span>
              </div>
              <div className="text-sm font-medium text-gray-900">71%</div>
            </div>
          </div>
        </div>
      </div>

      {/* International Transfer */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.internationalTransfer}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.fromAccount}</label>
              <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>Australian Savings - $24,350.75 AUD</option>
                <option>Mongolian Savings - ₮25,750,000 MNT</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.recipient}</label>
              <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>Mongolian Savings - Khan Bank</option>
                <option>Oyunbileg (Parent) - Khan Bank</option>
                <option>Enkhjargal (Spouse) - Commonwealth Bank</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.amount}</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Amount"
                  defaultValue="1,000.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.currency}</label>
                <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                  <option>AUD</option>
                  <option>MNT</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.purpose}</label>
              <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>Family Support</option>
                <option>Property Maintenance</option>
                <option>Investment</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.note}</label>
              <textarea 
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                placeholder="Add a note..."
              ></textarea>
            </div>
            
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              {t.transferMoney}
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Transfer Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Send Amount</span>
                <span className="text-sm font-medium text-gray-900">1,000.00 AUD</span>
              </div>
              
              <div className="flex justify-between items-center p-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Exchange Rate</span>
                <span className="text-sm font-medium text-gray-900">1 AUD = 2,115 MNT</span>
              </div>
              
              <div className="flex justify-between items-center p-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Fee</span>
                <span className="text-sm font-medium text-gray-900">5.00 AUD</span>
              </div>
              
              <div className="flex justify-between items-center p-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Delivery Time</span>
                <span className="text-sm font-medium text-gray-900">1-2 Business Days</span>
              </div>
              
              <div className="flex justify-between items-center p-2">
                <span className="text-sm font-medium text-gray-900">Recipient Gets</span>
                <span className="text-sm font-medium text-emerald-600">2,115,000 MNT</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Recent Recipients</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-md">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">O</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Oyunbileg (Parent)</p>
                    <p className="text-xs text-gray-500">Khan Bank - Mongolia</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-md">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">E</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enkhjargal (Spouse)</p>
                    <p className="text-xs text-gray-500">Commonwealth Bank - Australia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

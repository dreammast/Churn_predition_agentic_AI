import React, { useState, useEffect } from 'react';
import { CustomerData, AgenticResponse, RecommendedAction } from '../types';
import { getAgenticChurnPrediction } from '../services/geminiService';
import GaugeChart from './GaugeChart';
import { ChevronDownIcon, SearchIcon } from './icons';
import { RISK_LEVEL_CONFIG } from '../constants';

const initialCustomerData: CustomerData = {
  customerID: '7590-VHVEG',
  tenure: 1,
  MonthlyCharges: 29.85,
  TotalCharges: 29.85,
  Contract: 'Month-to-month',
  PaymentMethod: 'Electronic check',
  InternetService: 'DSL',
  OnlineSecurity: 'No',
  TechSupport: 'No',
};

const ActionCard: React.FC<{ action: RecommendedAction; index: number }> = ({ action, index }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsExecuted(true);
    }, 1500);
  };

  return (
    <div className="bg-white border border-brand-gray-200 rounded-lg mb-3 shadow-sm">
      <button
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-brand-gray-800">
          Action {index + 1}: {action.action}
        </span>
        <div className="flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full mr-4 ${
                action.priority === "High" || action.priority === "Critical" ? 'bg-red-100 text-red-800' :
                action.priority === "Medium" ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
                {action.priority} Priority
            </span>
            <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-brand-gray-200 space-y-4">
          <div className="bg-brand-blue text-white p-3 rounded-md">
              <strong className="font-bold">Description:</strong> {action.action}
          </div>
          <div className="flex justify-between items-center gap-4">
              <div className="bg-brand-blue text-white p-3 rounded-md">
                  <strong className="font-bold">Channel:</strong> {action.channel}
              </div>
              <button
                onClick={handleExecute}
                disabled={isExecuting || isExecuted}
                className={`px-4 py-2 rounded-md font-semibold text-white transition-all duration-300 ${
                  isExecuted ? 'bg-green-500 cursor-not-allowed' :
                  isExecuting ? 'bg-brand-blue/80 cursor-wait' :
                  'bg-brand-blue hover:bg-brand-blue/80'
                }`}
              >
                {isExecuted ? '✅ Executed' : isExecuting ? 'Executing...' : 'Execute'}
              </button>
          </div>
        </div>
      )}
    </div>
  );
};


const SingleCustomerAnalysis: React.FC = () => {
  const [customerData, setCustomerData] = useState<CustomerData>(initialCustomerData);
  const [analysisResult, setAnalysisResult] = useState<AgenticResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleCustomers, setSampleCustomers] = useState<CustomerData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerData[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch('/pkl_file/WA_Fn-UseC_-Telco-Customer-Churn.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim());
        const customers: CustomerData[] = lines.slice(1).map((line) => {
          const values = line.split(',');
          const customer = headers.reduce((obj, header, index) => {
            const value = values[index]?.trim();
            if (header === 'tenure' || header === 'MonthlyCharges' || header === 'TotalCharges') {
              (obj as any)[header] = parseFloat(value) || 0;
            } else {
              (obj as any)[header] = value;
            }
            return obj;
          }, {} as CustomerData);
          return customer;
        });
        setSampleCustomers(customers);
        if (customers.length > 0) {
            populateFormWithCustomer(customers[0]);
        }
      } catch (error) {
        console.error('Failed to load sample customer data:', error);
      }
    };
    fetchCustomerData();
  }, []);

  const populateFormWithCustomer = (customer: CustomerData) => {
    setCustomerData({
      ...customer,
      Contract: customer.Contract as 'Month-to-month' | 'One year' | 'Two year',
      PaymentMethod: customer.PaymentMethod as 'Electronic check' | 'Mailed check' | 'Bank transfer (automatic)' | 'Credit card (automatic)',
      InternetService: customer.InternetService as 'DSL' | 'Fiber optic' | 'No',
      OnlineSecurity: customer.OnlineSecurity as 'Yes' | 'No' | 'No internet service',
      TechSupport: customer.TechSupport as 'Yes' | 'No' | 'No internet service',
    });
    setAnalysisResult(null);
    setError(null);
  };
  
  const handleSelectCustomer = (customer: CustomerData) => {
    populateFormWithCustomer(customer);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = sampleCustomers.filter(c => c.customerID.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const loadRandomCustomer = () => {
    if (sampleCustomers.length > 0) {
      const randomIndex = Math.floor(Math.random() * sampleCustomers.length);
      const randomCustomer = sampleCustomers[randomIndex];
      populateFormWithCustomer(randomCustomer);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['tenure', 'MonthlyCharges', 'TotalCharges'].includes(name);
    setCustomerData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    try {
        const result = await getAgenticChurnPrediction({
        customerID: customerData.customerID,
        tenure: customerData.tenure,
        MonthlyCharges: customerData.MonthlyCharges,
        TotalCharges: customerData.TotalCharges,
        Contract: customerData.Contract,
        PaymentMethod: customerData.PaymentMethod,
        InternetService: customerData.InternetService,
        OnlineSecurity: customerData.OnlineSecurity,
        TechSupport: customerData.TechSupport,
        });
        setAnalysisResult(result);
    } catch (error) {
        console.error("Failed to get churn prediction:", error);
        setError("Error: Could not retrieve AI analysis. This might be due to API rate limits or a connection issue. Please try again later or check the browser console for details.");
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-gray-900">Single Customer Analysis</h1>
        <p className="text-brand-gray-600 mt-1">Input a customer's profile to get an instant AI-driven churn risk assessment.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-brand-gray-800 mb-4">Find Customer</h2>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Customer ID (e.g., 7590-VHVEG)"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setIsSearchActive(true)}
                        onBlur={() => setTimeout(() => setIsSearchActive(false), 150)}
                        className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                        aria-label="Search for a customer by ID"
                    />
                    {isSearchActive && searchQuery && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-brand-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            <ul>
                                {searchResults.length > 0 ? (
                                    searchResults.map(customer => (
                                        <li
                                            key={customer.customerID}
                                            className="px-4 py-2 hover:bg-brand-gray-100 cursor-pointer text-brand-gray-900"
                                            onMouseDown={() => handleSelectCustomer(customer)}
                                        >
                                            {customer.customerID}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-brand-gray-500">No customers found.</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 border-t pt-6 border-brand-gray-200">
              <h2 className="text-xl font-semibold text-brand-gray-800">Customer Profile</h2>
              <button
                onClick={loadRandomCustomer}
                disabled={sampleCustomers.length === 0}
                className="text-sm bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800 font-semibold py-1 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Load a random customer from the sample dataset"
              >
                🎲 Load Random
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tenure" className="block text-sm font-medium text-brand-gray-700">Tenure (months): {customerData.tenure}</label>
                <input type="range" id="tenure" name="tenure" min="0" max="72" value={customerData.tenure} onChange={handleChange} className="w-full h-2 bg-brand-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <label htmlFor="MonthlyCharges" className="block text-sm font-medium text-brand-gray-700">Monthly Charges ($): {customerData.MonthlyCharges}</label>
                <input type="range" id="MonthlyCharges" name="MonthlyCharges" min="20" max="120" step="0.5" value={customerData.MonthlyCharges} onChange={handleChange} className="w-full h-2 bg-brand-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
               <div>
                <label htmlFor="Contract" className="block text-sm font-medium text-brand-gray-700">Contract Type</label>
                <select id="Contract" name="Contract" value={customerData.Contract} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                  <option>Month-to-month</option>
                  <option>One year</option>
                  <option>Two year</option>
                </select>
              </div>
              <div>
                <label htmlFor="PaymentMethod" className="block text-sm font-medium text-brand-gray-700">Payment Method</label>
                <select id="PaymentMethod" name="PaymentMethod" value={customerData.PaymentMethod} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                  <option>Electronic check</option>
                  <option>Mailed check</option>
                  <option>Bank transfer (automatic)</option>
                  <option>Credit card (automatic)</option>
                </select>
              </div>
              <div>
                <label htmlFor="InternetService" className="block text-sm font-medium text-brand-gray-700">Internet Service</label>
                <select id="InternetService" name="InternetService" value={customerData.InternetService} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                  <option>DSL</option>
                  <option>Fiber optic</option>
                  <option>No</option>
                </select>
              </div>
              <div>
                <label htmlFor="OnlineSecurity" className="block text-sm font-medium text-brand-gray-700">Online Security</label>
                <select id="OnlineSecurity" name="OnlineSecurity" value={customerData.OnlineSecurity} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                  <option>Yes</option>
                  <option>No</option>
                  <option>No internet service</option>
                </select>
              </div>
              <div>
                <label htmlFor="TechSupport" className="block text-sm font-medium text-brand-gray-700">Tech Support</label>
                <select id="TechSupport" name="TechSupport" value={customerData.TechSupport} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                  <option>Yes</option>
                  <option>No</option>
                  <option>No internet service</option>
                </select>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue/90 disabled:bg-brand-blue/50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Agent is Analyzing...
                  </>
                ) : '🤖 Analyze Churn Risk'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-md min-h-full">
            <h2 className="text-xl font-semibold text-brand-gray-800 mb-4">Agentic AI Analysis</h2>
            {isLoading && (
              <div className="text-center p-8">
                <p className="text-brand-gray-600">The agentic AI is analyzing the customer profile...</p>
                <p className="text-sm text-brand-gray-500 mt-2">This may take a few seconds.</p>
              </div>
            )}
            {error && (
              <div className="text-center p-8 border-2 border-dashed border-red-300 rounded-lg bg-red-50 text-red-800">
                <h3 className="font-bold text-lg mb-2">Analysis Failed</h3>
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !analysisResult && !error && (
               <div className="text-center p-8 border-2 border-dashed border-brand-gray-300 rounded-lg">
                <p className="text-brand-gray-600">Your analysis results will appear here.</p>
                <p className="text-sm text-brand-gray-500 mt-2">Fill out the customer profile and click "Analyze Churn Risk".</p>
              </div>
            )}
            {analysisResult && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg text-center ${RISK_LEVEL_CONFIG[analysisResult.risk_level]?.bgColor || 'bg-brand-gray-200'} ${RISK_LEVEL_CONFIG[analysisResult.risk_level]?.color || 'text-brand-gray-800'}`}>
                  <h3 className="text-lg font-bold">Churn Risk: {analysisResult.risk_level.replace('_', ' ')}</h3>
                  <p className="text-sm">Urgency: {analysisResult.urgency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>

                <GaugeChart value={analysisResult.churn_probability} riskLevel={analysisResult.risk_level} />
                
                <div>
                  <h3 className="text-lg font-semibold text-brand-gray-800 mb-2">🔍 Key Risk Factors</h3>
                  <ul className="list-disc list-inside space-y-1 text-brand-gray-700">
                    {analysisResult.key_factors.map((factor, i) => <li key={i}>{factor}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white bg-brand-blue py-2 px-4 rounded-md mb-3 inline-flex items-center gap-2">
                    🚀 Recommended Agentic Actions
                  </h3>
                  <div>
                    {analysisResult.recommended_actions.map((action, i) => (
                      <ActionCard key={i} action={action} index={i} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleCustomerAnalysis;
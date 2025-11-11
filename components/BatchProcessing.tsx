import React, { useState, useCallback } from 'react';
import { AgenticResponse, CustomerData } from '../types';
import { getAgenticChurnPrediction } from '../services/geminiService';
import { RISK_LEVEL_CONFIG } from '../constants';

const BatchProcessing: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setResults([]);
      setProgress(0);
    }
  };

  const processBatch = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
          setIsProcessing(false);
          return;
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const customerDataList: CustomerData[] = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          const value = values[index]?.trim();
          if (header === 'tenure' || header === 'MonthlyCharges' || header === 'TotalCharges') {
            (obj as any)[header] = parseFloat(value) || 0;
          } else {
            (obj as any)[header] = value;
          }
          return obj;
        }, {} as CustomerData);
      });
      
      for (let i = 0; i < customerDataList.length; i++) {
        const customer = customerDataList[i];
        try {
            const analysis: AgenticResponse = await getAgenticChurnPrediction(customer);
            setResults(prevResults => [...prevResults, {
              customer_id: customer.customerID,
              churn_probability: analysis.churn_probability,
              risk_level: analysis.risk_level,
              urgency: analysis.urgency,
              actions_count: analysis.recommended_actions.length,
            }]);
        } catch (error) {
            console.error(`Error processing customer ${customer.customerID}:`, error);
            setResults(prevResults => [...prevResults, {
                customer_id: customer.customerID,
                churn_probability: "Error",
                risk_level: "Error",
                urgency: "Error",
                actions_count: "Error",
            }]);
        }

        setProgress(((i + 1) / customerDataList.length) * 100);

        // Add a delay to avoid rate limiting
        if (i < customerDataList.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }
      setIsProcessing(false);
    };

    reader.readAsText(file);
  }, [file]);

  const downloadResults = () => {
    if (results.length === 0) return;
    const headers = Object.keys(results[0]);
    const csvContent = [
      headers.join(','),
      ...results.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `agentic_churn_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-gray-900">Batch Customer Analysis</h1>
        <p className="text-brand-gray-600 mt-1">Upload a CSV file with customer data to process multiple customers at once.</p>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <label htmlFor="file-upload" className="cursor-pointer bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-gray-800 font-semibold py-2 px-4 rounded-lg inline-flex items-center transition-colors">
            <span>{fileName ? 'Change File' : 'Upload Customer Data (CSV)'}</span>
            <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
          {fileName && <span className="text-brand-gray-600">{fileName}</span>}
          <div className="flex-grow"></div>
          <button
            onClick={processBatch}
            disabled={!file || isProcessing}
            className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-blue/90 disabled:bg-brand-blue/50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : '🚀 Process Batch'}
          </button>
        </div>

        {isProcessing && (
          <div className="mt-6">
            <div className="w-full bg-brand-gray-200 rounded-full h-2.5">
              <div className="bg-brand-blue h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-center text-sm text-brand-gray-600 mt-2">{Math.round(progress)}% Complete</p>
          </div>
        )}
        
        {results.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-brand-gray-800">Batch Analysis Results</h3>
              <button onClick={downloadResults} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                📥 Download Results
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-brand-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Customer ID</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Churn Probability</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Urgency</th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-200">
                  {results.map((result, index) => {
                    const isError = result.risk_level === 'Error';
                    const riskConfig = !isError && result.risk_level && RISK_LEVEL_CONFIG[result.risk_level]
                      ? RISK_LEVEL_CONFIG[result.risk_level]
                      : { color: 'text-brand-gray-800', bgColor: 'bg-brand-gray-200' };

                    return (
                      <tr key={index} className={`transition-colors duration-200 hover:bg-brand-gray-50 ${isError ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                        <td className="py-4 px-6 whitespace-nowrap font-medium text-brand-gray-900">{result.customer_id}</td>
                        <td className="py-4 px-6 whitespace-nowrap text-brand-gray-800">
                          {typeof result.churn_probability === 'number'
                            ? `${(result.churn_probability * 100).toFixed(1)}%`
                            : <span className="text-red-600 font-semibold">{result.churn_probability}</span>
                          }
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {isError ? (
                            <span className="text-red-600 font-semibold">{result.risk_level}</span>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${riskConfig.bgColor} ${riskConfig.color}`}>
                              {(result.risk_level || '').replace(/_/g, ' ')}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-brand-gray-800">
                           {isError ? <span className="text-red-600 font-semibold">{result.urgency}</span> : (result.urgency || '').replace(/_/g, ' ')}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-center text-brand-gray-800">
                          {isError ? <span className="text-red-600 font-semibold">{result.actions_count}</span> : result.actions_count}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BatchProcessing;
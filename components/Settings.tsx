
import React, { useState } from 'react';

const Settings: React.FC = () => {
    const [config, setConfig] = useState({
        highRiskThreshold: 70,
        mediumRiskThreshold: 50,
        defaultChannel: 'Email',
        maxActions: 3,
        crmUrl: '',
        autoExecute: false,
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setConfig(prev => ({ ...prev, [name]: checked }));
        } else {
            setConfig(prev => ({ ...prev, [name]: name.includes('Threshold') ? parseInt(value) : value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-brand-gray-900">System Settings</h1>
                <p className="text-brand-gray-600 mt-1">Configure the parameters and integrations for the agentic AI system.</p>
            </header>
            
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-brand-gray-800 border-b pb-2 mb-4">Agent Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="highRiskThreshold" className="block text-sm font-medium text-brand-gray-700">High Risk Threshold (%)</label>
                                <input type="number" name="highRiskThreshold" id="highRiskThreshold" value={config.highRiskThreshold} onChange={handleChange} min="50" max="90" className="mt-1 block w-full rounded-md border-brand-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"/>
                            </div>
                             <div>
                                <label htmlFor="mediumRiskThreshold" className="block text-sm font-medium text-brand-gray-700">Medium Risk Threshold (%)</label>
                                <input type="number" name="mediumRiskThreshold" id="mediumRiskThreshold" value={config.mediumRiskThreshold} onChange={handleChange} min="30" max="69" className="mt-1 block w-full rounded-md border-brand-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"/>
                            </div>
                            <div>
                                <label htmlFor="defaultChannel" className="block text-sm font-medium text-brand-gray-700">Default Action Channel</label>
                                <select id="defaultChannel" name="defaultChannel" value={config.defaultChannel} onChange={handleChange} className="mt-1 block w-full rounded-md border-brand-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm">
                                    <option>Email</option>
                                    <option>SMS</option>
                                    <option>Phone</option>
                                    <option>Multi-channel</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="maxActions" className="block text-sm font-medium text-brand-gray-700">Max Actions per Customer: {config.maxActions}</label>
                                <input type="range" id="maxActions" name="maxActions" min="1" max="5" value={config.maxActions} onChange={handleChange} className="w-full h-2 bg-brand-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div>
                         <h3 className="text-xl font-semibold text-brand-gray-800 border-b pb-2 mb-4">Integrations & Automation</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="crmUrl" className="block text-sm font-medium text-brand-gray-700">CRM Integration URL</label>
                                <input type="text" name="crmUrl" id="crmUrl" value={config.crmUrl} onChange={handleChange} placeholder="https://mycrm.com/api/v1/customer" className="mt-1 block w-full rounded-md border-brand-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"/>
                            </div>
                            <div className="flex items-center">
                                <input id="autoExecute" name="autoExecute" type="checkbox" checked={config.autoExecute} onChange={handleChange} className="h-4 w-4 rounded border-brand-gray-300 text-brand-blue focus:ring-brand-blue" />
                                <label htmlFor="autoExecute" className="ml-2 block text-sm text-brand-gray-900">Enable Automatic Action Execution</label>
                            </div>
                         </div>
                    </div>

                    <div className="flex justify-end items-center space-x-4">
                        {showSuccess && <span className="text-green-600 transition-opacity duration-300">✅ Configuration saved!</span>}
                        <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-blue/90 disabled:bg-brand-blue/50 transition-colors">
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Settings;

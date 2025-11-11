
import { Page } from './types';

export const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'single-customer', label: 'Single Customer Analysis' },
  { id: 'batch-processing', label: 'Batch Processing' },
  { id: 'agent-performance', label: 'Agent Performance' },
  { id: 'settings', label: 'Settings' },
];

export const RISK_LEVEL_CONFIG: { [key: string]: { color: string; bgColor: string } } = {
    HIGH: { color: 'text-red-800', bgColor: 'bg-red-200' },
    MEDIUM: { color: 'text-yellow-800', bgColor: 'bg-yellow-200' },
    LOW: { color: 'text-green-800', bgColor: 'bg-green-200' },
    VERY_LOW: { color: 'text-blue-800', bgColor: 'bg-blue-200' }
};

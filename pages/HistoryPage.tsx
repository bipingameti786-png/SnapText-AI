import React, { useEffect, useState } from 'react';
import { HistoryItem } from '../types';
import { getHistory, deleteFromHistory, clearHistory } from '../services/historyService';
import { Trash2, FileText, ChevronLeft } from '../components/Icons';
import { Button } from '../components/Button';
import { AdBanner } from '../components/AdBanner';

interface HistoryPageProps {
  onSelect: (text: string) => void;
  onBack: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelect, onBack }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(deleteFromHistory(id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">History</h2>
        {history.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 opacity-60">
          <FileText className="w-16 h-16 mb-4" />
          <p>No scans yet.</p>
          <AdBanner className="mt-8" slotId="6997552561" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-3 overflow-auto pb-4 no-scrollbar flex-1">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item.text)}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all cursor-pointer group relative"
              >
                <div className="pr-8">
                  <p className="text-gray-800 dark:text-gray-200 font-medium line-clamp-2 mb-1">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, item.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <AdBanner className="mt-auto pt-2" slotId="6997552561" />
        </div>
      )}
    </div>
  );
};
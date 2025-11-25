import React, { useRef } from 'react';
import { Camera, Upload, ScanText, FileText } from '../components/Icons';
import { Button } from '../components/Button';
import { HistoryItem } from '../types';
import { AdBanner } from '../components/AdBanner';

interface HomeProps {
  onCameraClick: () => void;
  onImageSelected: (file: File) => void;
  onHistoryClick: () => void;
  recentHistory: HistoryItem[];
  onHistoryItemClick: (text: string) => void;
}

export const Home: React.FC<HomeProps> = ({ 
  onCameraClick, 
  onImageSelected, 
  onHistoryClick,
  recentHistory,
  onHistoryItemClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full p-6 overflow-y-auto no-scrollbar">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-3xl inline-flex mb-4 ring-8 ring-primary/5 dark:ring-primary/10">
            <ScanText className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scan & Convert
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Turn physical documents into digital text instantly with AI.
          </p>
        </div>

        {/* Main Actions */}
        <div className="w-full space-y-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full py-5 text-lg shadow-xl shadow-primary/20"
            onClick={onCameraClick}
            icon={<Camera className="w-6 h-6" />}
          >
            Take a Photo
          </Button>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full py-5 text-lg border-2"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="w-6 h-6" />}
            >
              Upload from Gallery
            </Button>
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner className="my-6" />

      {/* Recent History Snippet */}
      {recentHistory.length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Recent Scans</h3>
            <button 
              onClick={onHistoryClick}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentHistory.slice(0, 2).map((item) => (
              <div 
                key={item.id}
                onClick={() => onHistoryItemClick(item.text)}
                className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer active:scale-98 transition-transform"
              >
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md mr-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
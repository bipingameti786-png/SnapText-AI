import React, { useState, useEffect } from 'react';
import { AppRoute, HistoryItem } from './types';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { CameraPage } from './pages/CameraPage';
import { ResultPage } from './pages/ResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { extractTextFromImage } from './services/geminiService';
import { getHistory, saveToHistory } from './services/historyService';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [darkMode, setDarkMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);

  // Load Theme & History
  useEffect(() => {
    // Theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    // History
    setRecentHistory(getHistory());
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigate = (newRoute: AppRoute) => {
    setRoute(newRoute);
    if (newRoute === AppRoute.HOME) {
      setRecentHistory(getHistory());
    }
  };

  const processImage = async (base64Image: string) => {
    setIsProcessing(true);
    setCurrentImage(base64Image); // Store for preview
    
    try {
      const text = await extractTextFromImage(base64Image);
      setCurrentText(text);
      saveToHistory(text); // Auto-save to history
      setRecentHistory(getHistory());
      setRoute(AppRoute.RESULT);
    } catch (error) {
      alert("Failed to extract text. Please ensure the image is clear and contains text.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelection = async (file: File) => {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        processImage(base64);
      } catch (e) {
        console.error("File error", e);
      }
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    processImage(imageSrc);
  };

  const handleHistorySelect = (text: string) => {
    setCurrentText(text);
    setCurrentImage(undefined); // No image for history items in this simple version
    setRoute(AppRoute.RESULT);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Overlay Loader */}
      {isProcessing && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium animate-pulse">Extracting Text...</p>
          <p className="text-sm text-gray-400 mt-2">Powered by Gemini AI</p>
        </div>
      )}

      {route !== AppRoute.CAMERA && (
        <NavBar 
          darkMode={darkMode} 
          toggleTheme={() => setDarkMode(!darkMode)}
          currentRoute={route}
          navigate={handleNavigate}
        />
      )}

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {route === AppRoute.HOME && (
          <Home 
            onCameraClick={() => setRoute(AppRoute.CAMERA)}
            onImageSelected={handleFileSelection}
            onHistoryClick={() => setRoute(AppRoute.HISTORY)}
            recentHistory={recentHistory}
            onHistoryItemClick={handleHistorySelect}
          />
        )}

        {route === AppRoute.CAMERA && (
          <CameraPage 
            onCapture={handleCameraCapture} 
            onBack={() => setRoute(AppRoute.HOME)} 
          />
        )}

        {route === AppRoute.RESULT && (
          <ResultPage 
            initialText={currentText}
            originalImage={currentImage}
            onBack={() => setRoute(AppRoute.HOME)}
          />
        )}

        {route === AppRoute.HISTORY && (
          <HistoryPage 
            onSelect={handleHistorySelect}
            onBack={() => setRoute(AppRoute.HOME)}
          />
        )}
      </main>
    </div>
  );
};

export default App;

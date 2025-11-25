import React from 'react';
import { Moon, Sun, History, ChevronLeft } from './Icons';
import { AppRoute } from '../types';

interface NavBarProps {
  darkMode: boolean;
  toggleTheme: () => void;
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ darkMode, toggleTheme, currentRoute, navigate }) => {
  const isHome = currentRoute === AppRoute.HOME;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {!isHome && (
          <button 
            onClick={() => navigate(AppRoute.HOME)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
        )}
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
          SnapText AI
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
        
        {isHome && (
          <button 
            onClick={() => navigate(AppRoute.HISTORY)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            aria-label="History"
          >
            <History className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        )}
      </div>
    </nav>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-input bg-background hover:bg-muted dark:bg-background-paper dark:hover:bg-muted transition-colors duration-200"
        aria-label="Tema Seçenekleri"
      >
        {theme === 'light' && <FiSun className="w-5 h-5 text-accent" />}
        {theme === 'dark' && <FiMoon className="w-5 h-5 text-primary" />}
        {theme === 'system' && <FiMonitor className="w-5 h-5 text-foreground" />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeDropdown}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-border ring-opacity-5 z-50 border border-border">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={() => {
                  setTheme('light');
                  closeDropdown();
                }}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
                role="menuitem"
              >
                <FiSun className="mr-3 h-5 w-5" />
                Açık Tema
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  closeDropdown();
                }}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
                role="menuitem"
              >
                <FiMoon className="mr-3 h-5 w-5" />
                Koyu Tema
              </button>
              <button
                onClick={() => {
                  setTheme('system');
                  closeDropdown();
                }}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  theme === 'system'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
                role="menuitem"
              >
                <FiMonitor className="mr-3 h-5 w-5" />
                Sistem Teması
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
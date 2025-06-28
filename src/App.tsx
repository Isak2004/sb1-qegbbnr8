import React, { useState } from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';
import { EffectsModal } from './components/EffectsModal';
import { SnowflakesEffect } from './components/SnowflakesEffect';
import { BalloonsEffect } from './components/BalloonsEffect';
import { SnakeGame } from './components/SnakeGame';

function App() {
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [showSnakeGame, setShowSnakeGame] = useState(false);
  const [activeEffect, setActiveEffect] = useState<'snowflakes' | 'balloons' | null>(null);

  const handleEffectSelect = (effect: 'snowflakes' | 'balloons') => {
    // Turn off current effect if selecting the same one
    if (activeEffect === effect) {
      setActiveEffect(null);
    } else {
      setActiveEffect(effect);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop")'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20" />
      
      {/* Effects */}
      <SnowflakesEffect isActive={activeEffect === 'snowflakes'} />
      <BalloonsEffect isActive={activeEffect === 'balloons'} />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Space */}
        <header className="p-6 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Logo or brand space */}
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg"></div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-12">
              {/* Welcome Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/20">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Welcome
                </h1>
                <p className="text-white/80 text-lg sm:text-xl mb-8">
                  Choose your experience
                </p>
                
                {/* Buttons Container */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  {/* Games Button */}
                  <button 
                    onClick={() => setShowSnakeGame(true)}
                    className="group relative w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/90 hover:to-purple-500/90 backdrop-blur-sm border border-white/20 rounded-xl px-8 py-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Gamepad2 className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-white font-semibold text-lg">Games</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  {/* Effects Button */}
                  <button 
                    onClick={() => setShowEffectsModal(true)}
                    className="group relative w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-pink-600/80 to-orange-600/80 hover:from-pink-500/90 hover:to-orange-500/90 backdrop-blur-sm border border-white/20 rounded-xl px-8 py-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-white font-semibold text-lg">Effects</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
                
                {/* Active Effect Indicator */}
                {activeEffect && (
                  <div className="mt-6 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/70 text-sm capitalize">
                      {activeEffect} effect active
                    </span>
                    <button
                      onClick={() => setActiveEffect(null)}
                      className="text-white/50 hover:text-white/80 text-sm underline ml-2"
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer Space */}
        <footer className="p-6 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="h-px bg-white/10"></div>
          </div>
        </footer>
      </div>
      
      {/* Mobile-optimized floating elements */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-20">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-4 h-4 bg-white/40 rounded-full"></div>
        </div>
      </div>
      
      {/* Effects Modal */}
      <EffectsModal
        isOpen={showEffectsModal}
        onClose={() => setShowEffectsModal(false)}
        onSelectEffect={handleEffectSelect}
      />
      
      {/* Snake Game */}
      <SnakeGame
        isOpen={showSnakeGame}
        onClose={() => setShowSnakeGame(false)}
      />
    </div>
  );
}

export default App;
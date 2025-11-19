import React, { useState } from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';
import { EffectsModal } from './components/EffectsModal';
import { SnowflakesEffect } from './components/SnowflakesEffect';
import { BalloonsEffect } from './components/BalloonsEffect';
import { SpotlightEffect } from './components/SpotlightEffect';
import { SoapBubblesEffect } from './components/SoapBubblesEffect';
import { ScrambleEffect } from './components/ScrambleEffect';
import { SunflareEffect } from './components/SunflareEffect';
import { LensFlareEffect } from './components/LensFlareEffect';
import { FirefliesEffect } from './components/FirefliesEffect';
import { RainEffect } from './components/RainEffect';
import { GlitchEffect } from './components/GlitchEffect';
import { SmokeWispsEffect } from './components/SmokeWispsEffect';
import { LightningStormEffect } from './components/LightningStormEffect';
import { StarfieldEffect } from './components/StarfieldEffect';
import { DustParticlesEffect } from './components/DustParticlesEffect';
import { BouncingHeartsEffect } from './components/BouncingHeartsEffect';
import { SnakeGame } from './components/SnakeGame';

function App() {
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [showSnakeGame, setShowSnakeGame] = useState(false);
  const [activeEffect, setActiveEffect] = useState<'snowflakes' | 'balloons' | 'spotlight' | 'bubbles' | 'scramble' | 'sunflare' | 'lensflare' | 'fireflies' | 'rain' | 'glitch' | 'smoke' | 'lightning' | 'starfield' | 'dust' | 'hearts' | null>(null);

  const handleEffectSelect = (effect: 'snowflakes' | 'balloons' | 'spotlight' | 'bubbles' | 'scramble' | 'sunflare' | 'lensflare' | 'fireflies' | 'rain' | 'glitch' | 'smoke' | 'lightning' | 'starfield' | 'dust' | 'hearts') => {
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
          backgroundImage: 'url("/public/1758659008299-qbolrp.jpeg")'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20" />
      
      {/* Effects */}
      <SnowflakesEffect isActive={activeEffect === 'snowflakes'} />
      <BalloonsEffect isActive={activeEffect === 'balloons'} />
      <SpotlightEffect isActive={activeEffect === 'spotlight'} />
      <SoapBubblesEffect isActive={activeEffect === 'bubbles'} />
      <ScrambleEffect isActive={activeEffect === 'scramble'} />
      <SunflareEffect isActive={activeEffect === 'sunflare'} />
     <LensFlareEffect isActive={activeEffect === 'lensflare'} />
      <FirefliesEffect isActive={activeEffect === 'fireflies'} />
      <RainEffect isActive={activeEffect === 'rain'} />
      <GlitchEffect isActive={activeEffect === 'glitch'} />
      <SmokeWispsEffect isActive={activeEffect === 'smoke'} />
      <LightningStormEffect isActive={activeEffect === 'lightning'} />
      <StarfieldEffect isActive={activeEffect === 'starfield'} />
      <DustParticlesEffect isActive={activeEffect === 'dust'} />
      <BouncingHeartsEffect isActive={activeEffect === 'hearts'} />
      
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
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {/* Welcome Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 ml-auto max-w-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">
                  Welcome
                </h1>
                <p className="text-white/80 text-base sm:text-lg mb-6 text-center">
                  Choose your experience
                </p>
                
                {/* Buttons Container */}
                <div className="flex flex-col gap-4 items-center">
                  {/* Games Button */}
                  <button 
                    onClick={() => setShowSnakeGame(true)}
                    className="group relative w-full max-w-[80px] bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/90 hover:to-purple-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <Gamepad2 className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-white font-semibold text-xs">Games</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  {/* Effects Button */}
                  <button 
                    onClick={() => setShowEffectsModal(true)}
                    className="group relative w-full max-w-[80px] bg-gradient-to-r from-pink-600/80 to-orange-600/80 hover:from-pink-500/90 hover:to-orange-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-pink-500/25"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-white font-semibold text-xs">Effects</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
                
                {/* Active Effect Indicator */}
                {activeEffect && (
                  <div className="mt-4 flex items-center justify-center space-x-2">
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
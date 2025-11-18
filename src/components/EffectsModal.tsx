import React from 'react';
import { X, Snowflake, Heart, Flashlight, Circle, Shuffle, Sun, Camera, Sparkles, CloudRain, Zap, Wind, Bolt, Star, Waves } from 'lucide-react';

interface EffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEffect: (effect: 'snowflakes' | 'balloons' | 'spotlight' | 'bubbles' | 'scramble' | 'sunflare' | 'lensflare' | 'fireflies' | 'rain' | 'glitch' | 'smoke' | 'lightning' | 'starfield' | 'dust') => void;
}

export const EffectsModal: React.FC<EffectsModalProps> = ({ isOpen, onClose, onSelectEffect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Choose an Effect
        </h2>
        
        {/* Effect Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => {
              onSelectEffect('snowflakes');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-500/90 hover:to-cyan-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Snowflake className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Snow</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('balloons');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-pink-600/80 to-red-600/80 hover:from-pink-500/90 hover:to-red-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Heart className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Balloons</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('spotlight');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500/90 hover:to-amber-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Flashlight className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Spotlight</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('bubbles');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/90 hover:to-blue-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Circle className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Bubbles</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('scramble');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500/90 hover:to-indigo-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Shuffle className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Scramble</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('sunflare');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-orange-600/80 to-yellow-600/80 hover:from-orange-500/90 hover:to-yellow-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Sun className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Sunflare</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('lensflare');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500/90 hover:to-purple-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Camera className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Lens Flare</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('fireflies');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-green-600/80 to-yellow-600/80 hover:from-green-500/90 hover:to-yellow-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Fireflies</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('rain');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-blue-600/80 to-gray-600/80 hover:from-blue-500/90 hover:to-gray-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <CloudRain className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Rain</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('glitch');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-red-600/80 to-purple-600/80 hover:from-red-500/90 hover:to-purple-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Zap className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Glitch</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('smoke');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-gray-600/80 to-slate-600/80 hover:from-gray-500/90 hover:to-slate-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Wind className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Smoke</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('lightning');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/90 hover:to-blue-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Bolt className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Lightning</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('starfield');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-indigo-600/80 to-blue-600/80 hover:from-indigo-500/90 hover:to-blue-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Starfield</span>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('dust');
              onClose();
            }}
            className="group w-full max-w-[80px] mx-auto bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500/90 hover:to-orange-500/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-1">
              <Waves className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white font-semibold text-xs">Dust</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
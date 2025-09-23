import React from 'react';
import { X, Snowflake, Heart, Flashlight, Circle } from 'lucide-react';

interface EffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEffect: (effect: 'snowflakes' | 'balloons' | 'spotlight' | 'bubbles') => void;
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
            className="group w-full bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-500/90 hover:to-cyan-500/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-3">
              <Snowflake className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <div className="text-white font-semibold text-lg">Snowflakes</div>
                <div className="text-white/70 text-sm">Gentle falling snow</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('balloons');
              onClose();
            }}
            className="group w-full bg-gradient-to-r from-pink-600/80 to-red-600/80 hover:from-pink-500/90 hover:to-red-500/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-3">
              <Heart className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <div className="text-white font-semibold text-lg">Balloons</div>
                <div className="text-white/70 text-sm">Rising celebration balloons</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('spotlight');
              onClose();
            }}
            className="group w-full bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500/90 hover:to-amber-500/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-3">
              <Flashlight className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <div className="text-white font-semibold text-lg">Spotlight</div>
                <div className="text-white/70 text-sm">Scanning spotlight effect</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => {
              onSelectEffect('bubbles');
              onClose();
            }}
            className="group w-full bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/90 hover:to-blue-500/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-3">
              <Circle className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <div className="text-white font-semibold text-lg">Soap Bubbles</div>
                <div className="text-white/70 text-sm">3D floating soap bubbles</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
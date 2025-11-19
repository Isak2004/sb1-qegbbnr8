import React from 'react';
import { X } from 'lucide-react';

interface HeartColorPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColors: (colors: string[]) => void;
}

export const HeartColorPreview: React.FC<HeartColorPreviewProps> = ({ isOpen, onClose, onSelectColors }) => {
  if (!isOpen) return null;

  const heartColors = [
    { name: 'Deep Red', code: '#8B0000' },
    { name: 'Hot Pink', code: '#FF1493' },
    { name: 'Deep Pink', code: '#FF69B4' },
    { name: 'Bright Red', code: '#FF0000' },
    { name: 'Orange Red', code: '#FF4500' },
    { name: 'Gold', code: '#FFD700' },
    { name: 'Lime Green', code: '#32CD32' },
    { name: 'Electric Blue', code: '#00BFFF' },
    { name: 'Purple', code: '#8A2BE2' },
  ];

  const [selectedColors, setSelectedColors] = React.useState<string[]>(heartColors.map(c => c.code));

  const toggleColor = (colorCode: string) => {
    setSelectedColors(prev => 
      prev.includes(colorCode) 
        ? prev.filter(c => c !== colorCode)
        : [...prev, colorCode]
    );
  };

  const handleApply = () => {
    onSelectColors(selectedColors);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-lg w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Choose Heart Colors
        </h2>
        
        <p className="text-white/80 text-sm mb-6 text-center">
          Click colors to toggle them on/off
        </p>
        
        {/* Color Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {heartColors.map((color) => (
            <button
              key={color.code}
              onClick={() => toggleColor(color.code)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                selectedColors.includes(color.code)
                  ? 'border-white/60 bg-white/10'
                  : 'border-white/20 bg-white/5 opacity-50'
              }`}
            >
              {/* Color Preview Circle */}
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/30"
                style={{ backgroundColor: color.code }}
              />
              
              {/* Color Info */}
              <div className="text-center">
                <div className="text-white font-semibold text-sm mb-1">
                  {color.name}
                </div>
                <div className="text-white/70 text-xs font-mono">
                  {color.code}
                </div>
              </div>
              
              {/* Selected Indicator */}
              {selectedColors.includes(color.code) && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Selected Count */}
        <div className="text-center text-white/70 text-sm mb-6">
          {selectedColors.length} colors selected
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedColors(heartColors.map(c => c.code))}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Select All
          </button>
          <button
            onClick={() => setSelectedColors([])}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={selectedColors.length === 0}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
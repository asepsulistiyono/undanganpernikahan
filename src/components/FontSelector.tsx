import { useState } from 'react';
import { Type, ChevronDown, Check } from 'lucide-react';
import { availableFonts, headingFonts, scriptFonts, FontConfig } from '../themes/fonts';

interface Props {
  value: string;
  onChange: (fontId: string) => void;
  label: string;
  type?: 'all' | 'heading' | 'script' | 'body';
}

export default function FontSelector({ value, onChange, label, type = 'all' }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const fonts = type === 'heading' ? headingFonts :
                type === 'script' ? scriptFonts :
                type === 'body' ? availableFonts.filter(f => f.category === 'sans-serif' || f.category === 'serif') :
                availableFonts;

  const selectedFont = fonts.find(f => f.id === value) || fonts[0];

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'sans-serif', label: 'Sans Serif' },
    { id: 'serif', label: 'Serif' },
    { id: 'modern', label: 'Modern' },
    { id: 'display', label: 'Display' },
    { id: 'handwriting', label: 'Handwriting' },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFonts = activeCategory === 'all' ? fonts : fonts.filter(f => f.category === activeCategory);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border rounded-xl hover:border-amber-400 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Type className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium text-sm">{selectedFont.name}</p>
              <p className="text-xs text-gray-500" style={{ fontFamily: selectedFont.family }}>
                {selectedFont.preview}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl max-h-80 overflow-hidden">
            {/* Category tabs */}
            <div className="flex gap-1 p-2 border-b overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Font list */}
            <div className="overflow-y-auto max-h-60">
              {filteredFonts.map(font => (
                <button
                  key={font.id}
                  onClick={() => { onChange(font.id); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition text-left border-b border-gray-50 ${
                    value === font.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">{font.name}</p>
                    <p className="text-lg text-gray-600 mt-0.5" style={{ fontFamily: font.family }}>
                      {font.preview}
                    </p>
                  </div>
                  {value === font.id && (
                    <Check className="w-4 h-4 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

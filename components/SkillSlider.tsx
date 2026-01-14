
import React from 'react';

interface SkillSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

const SkillSlider: React.FC<SkillSliderProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300 capitalize">{label}</label>
        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30">
          {value}/5
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all hover:bg-slate-600"
      />
    </div>
  );
};

export default SkillSlider;

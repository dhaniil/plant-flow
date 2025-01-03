import { Settings, Save, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import React from 'react';

interface NutrientStatsProps {
  nutrients: Array<{
    id: string;
    name: string;
    value: number | null;
    topic: string;
    color: string;
    unit: string;
  }>;
  editMode: string | null;
  editTopic: string;
  onEdit: (id: string, topic: string) => void;
  onSave: (id: string) => void;
  onEditTopicChange: (topic: string) => void;
  onCancelEdit: () => void;
}

const NutrientStats: React.FC<NutrientStatsProps> = ({
  nutrients = [],
  editMode,
  editTopic,
  onEdit,
  onSave,
  onEditTopicChange,
  onCancelEdit
}) => {
  const { isAdmin } = useAdmin();

  const formatValue = (value: number | null | undefined, unit: string): string => {
    if (value == null || isNaN(value)) return "0";
    return Number.isInteger(value) ? 
      Math.floor(value).toString() : 
      value.toFixed(1);
  };

  return (
    <div className="animate-fade-in-slow grid grid-cols-1 lg:grid-cols-1 gap-8">
      <div className="bg-white/20 rounded-2xl p-8 border border-white/30 shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="lg:h-8 sm:h-6 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
            <h2 className="lg:text-2xl font-bold text-green-700 sm:text-base">Status Nutrisi</h2>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/10 backdrop-blur px-4 py-1.5 
                        rounded-full border border-green-500/20">
            <div className="animate-pulse-slow w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-green-700 font-medium">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nutrients.map((nutrient) => (
            <div key={nutrient.id} 
                 className="group relative p-6 rounded-xl transition-all duration-300"
                 style={{
                   background: `linear-gradient(135deg, 
                     ${nutrient.color}70 0%, 
                     ${nutrient.color}50 100%
                   )`,
                   boxShadow: `0 8px 32px -4px ${nutrient.color}40`
                 }}>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full"
                         style={{ backgroundColor: nutrient.color }}></div>
                    <h3 className="text-xl font-bold text-white drop-shadow-md">
                      {nutrient.name}
                    </h3>
                  </div>

                  {isAdmin && (
                    <>
                      {editMode === nutrient.id ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSave(nutrient.id);
                          }}
                          className="p-3 rounded-xl transition-all duration-300
                                   bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        >
                          <Save size={20} className="text-white drop-shadow-md" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => onEdit(nutrient.id, nutrient.topic)}
                          className="p-3 rounded-xl transition-all duration-300
                                   bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        >
                          <Settings size={20} className="text-white drop-shadow-md" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 mb-6">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold tracking-tighter text-white drop-shadow-lg">
                      {formatValue(nutrient.value, nutrient.unit)}
                    </span>
                    <span className="ml-2 text-lg font-medium text-white/90">
                      {nutrient.unit}
                    </span>
                  </div>
                </div>

                {isAdmin && editMode === nutrient.id && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={editTopic}
                      onChange={(e) => onEditTopicChange(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full p-3 bg-black/30 border border-white/40 rounded-xl
                               text-white placeholder-white/60 text-sm font-medium
                               focus:ring-2 focus:ring-white/70 focus:border-transparent
                               transition-all duration-200"
                      placeholder="Masukkan MQTT topic"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NutrientStats); 
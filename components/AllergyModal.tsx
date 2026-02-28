
import React, { useState } from 'react';

interface AllergyModalProps {
  onSave: (allergies: string[]) => void;
  onClose?: () => void;
  initialAllergies?: string[];
}

const COMMON_ALLERGENS = [
  { id: 'nuts', label: 'Noix / Amandes', icon: 'fa-seedling' },
  { id: 'seafood', label: 'Poissons / Thon', icon: 'fa-fish' },
  { id: 'dairy', label: 'Produits Laitiers', icon: 'fa-cheese' },
  { id: 'eggs', label: 'Œufs', icon: 'fa-egg' },
  { id: 'gluten', label: 'Gluten / Blé', icon: 'fa-wheat-awn' },
  { id: 'soy', label: 'Soja', icon: 'fa-leaf' },
];

const AllergyModal: React.FC<AllergyModalProps> = ({ onSave, onClose, initialAllergies = [] }) => {
  // Map labels back to IDs for pre-selection
  const initialSelected = COMMON_ALLERGENS
    .filter(a => initialAllergies.includes(a.label))
    .map(a => a.id);
  
  // Find custom allergies (those not in COMMON_ALLERGENS)
  const initialCustom = initialAllergies
    .filter(label => !COMMON_ALLERGENS.some(a => a.label === label))
    .join(', ');

  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [custom, setCustom] = useState(initialCustom);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleFinish = () => {
    const selectedLabels = selected.map(id => COMMON_ALLERGENS.find(a => a.id === id)?.label || id);
    const customLabels = custom.split(',').map(s => s.trim()).filter(s => s !== '');
    const finalAllergies = Array.from(new Set([...selectedLabels, ...customLabels]));
    onSave(finalAllergies);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/40 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-12 duration-500 overflow-hidden relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all z-10"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
        <div className="bg-rose-500 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <i className="fa-solid fa-hand-dots text-2xl"></i>
          </div>
          <h2 className="text-2xl font-black mb-1">Vos Allergies ?</h2>
          <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest">Pour des recettes en toute sécurité</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {COMMON_ALLERGENS.map(allergy => (
              <button
                key={allergy.id}
                onClick={() => toggle(allergy.id)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                  selected.includes(allergy.id) 
                  ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-100' 
                  : 'border-slate-50 bg-slate-50 text-slate-400'
                }`}
              >
                <i className={`fa-solid ${allergy.icon} text-xl`}></i>
                <span className="text-[10px] font-black uppercase tracking-tight">{allergy.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Autre (séparés par virgule)</label>
            <input 
              type="text"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-slate-700"
              placeholder="Ex: Fraises, Kiwi..."
            />
          </div>

          <button 
            onClick={handleFinish}
            className="w-full bg-slate-800 text-white py-5 rounded-[2rem] font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            ENREGISTRER MES PRÉFÉRENCES
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllergyModal;

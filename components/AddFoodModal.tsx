
import React, { useState } from 'react';
import { MaturityLevel, FoodItem, FoodCategory } from '../types';
import { estimateShelfLife } from '../services/geminiService';

interface AddFoodModalProps {
  onClose: () => void;
  onAdd?: (item: FoodItem) => void;
  onUpdate?: (item: FoodItem) => void;
  itemToEdit?: FoodItem;
}

const CATEGORIES: { label: FoodCategory; icon: string; color: string; bgColor: string; borderColor: string; activeTextColor: string }[] = [
  { label: 'Légume', icon: 'fa-carrot', color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', activeTextColor: 'text-orange-700' },
  { label: 'Fruit', icon: 'fa-apple-whole', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200', activeTextColor: 'text-red-700' },
  { label: 'Produit laitier', icon: 'fa-cheese', color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', activeTextColor: 'text-amber-700' },
  { label: 'Charcuterie', icon: 'fa-bacon', color: 'text-rose-400', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', activeTextColor: 'text-rose-700' },
  { label: 'Viande/Poisson', icon: 'fa-fish', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', activeTextColor: 'text-blue-700' },
  { label: 'Épicerie', icon: 'fa-jar', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', activeTextColor: 'text-yellow-700' },
  { label: 'Autre', icon: 'fa-box', color: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', activeTextColor: 'text-indigo-700' },
];

const AddFoodModal: React.FC<AddFoodModalProps> = ({ onClose, onAdd, onUpdate, itemToEdit }) => {
  const [name, setName] = useState(itemToEdit?.name || '');
  const [category, setCategory] = useState<FoodCategory>(itemToEdit?.category || 'Légume');
  const [purchaseDate, setPurchaseDate] = useState(itemToEdit?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [freshness, setFreshness] = useState<MaturityLevel>(itemToEdit?.maturity || 5); // Default to fresh
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalExpiryDate = itemToEdit?.expiryDate || '';

    // Re-estimate if it's a new item or if key details changed
    if (!itemToEdit || (itemToEdit && (name !== itemToEdit.name || freshness !== itemToEdit.maturity || purchaseDate !== itemToEdit.purchaseDate))) {
        setLoading(true);
        const shelfLife = await estimateShelfLife(name, freshness);
        const pDate = new Date(purchaseDate);
        const expiry = new Date(pDate);
        expiry.setDate(pDate.getDate() + shelfLife);
        finalExpiryDate = expiry.toISOString().split('T')[0];
    }

    if (itemToEdit && onUpdate) {
        onUpdate({
            ...itemToEdit,
            name: name.trim(),
            category,
            purchaseDate,
            expiryDate: finalExpiryDate,
            maturity: freshness,
        });
    } else if (onAdd) {
        const shelfLife = await estimateShelfLife(name, freshness);
        const pDate = new Date(purchaseDate);
        const expiry = new Date(pDate);
        expiry.setDate(pDate.getDate() + shelfLife);

        const newItem: FoodItem = {
          id: crypto.randomUUID(),
          name: name.trim(),
          category,
          purchaseDate,
          expiryDate: expiry.toISOString().split('T')[0],
          maturity: freshness,
          estimatedShelfLifeDays: shelfLife,
          isUsed: false,
          isWasted: false,
          price: Math.floor(Math.random() * 8) + 3,
          weight: (Math.floor(Math.random() * 5) + 2) * 100,
        };
        onAdd(newItem);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-emerald-600 p-7 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{itemToEdit ? 'Modifier' : 'Nouvel aliment'}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{itemToEdit ? 'Mettez à jour les détails' : 'Remplissez les détails'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center justify-center">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-7 space-y-6 overflow-y-auto max-h-[75vh]">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom du produit</label>
            <input
              autoFocus
              type="text"
              required
              className="w-full px-5 py-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-lg font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="ex: Tomates Cerises"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Catégorie</label>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                    category === cat.label 
                      ? `${cat.borderColor} ${cat.bgColor} ${cat.activeTextColor} shadow-lg shadow-black/5` 
                      : 'border-slate-50 bg-slate-50/50 text-slate-300'
                  }`}
                >
                  <i className={`fa-solid ${cat.icon} text-xl mb-1.5 ${category === cat.label ? cat.color : 'text-slate-200'}`}></i>
                  <span className="text-[9px] font-black leading-tight text-center uppercase tracking-tighter">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Date d'achat</label>
              <input
                type="date"
                required
                className="w-full px-4 py-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Fraîcheur</label>
              <div className="flex items-center gap-1.5 justify-center bg-slate-50 p-2 py-4 rounded-2xl border border-slate-100">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFreshness(level as MaturityLevel)}
                    className={`transition-all ${freshness >= level ? 'text-amber-400 scale-110 drop-shadow-sm' : 'text-slate-200'}`}
                  >
                    <i className="fa-solid fa-star text-sm"></i>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98] disabled:opacity-70 disabled:grayscale"
          >
            {loading ? (
              <><i className="fa-solid fa-circle-notch animate-spin text-xl"></i> {itemToEdit ? 'MISE À JOUR...' : 'ESTIMATION EN COURS...'}</>
            ) : (
              <><i className="fa-solid fa-bolt-lightning text-lg"></i> {itemToEdit ? 'ENREGISTRER LES MODIFICATIONS' : 'AJOUTER AU FRIGO'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFoodModal;

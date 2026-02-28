
import React from 'react';
import { ChosenRecipe } from '../types';

interface RecipeDetailModalProps {
  recipe: ChosenRecipe;
  onClose: () => void;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
        <div className="bg-slate-800 p-8 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight leading-none mb-1 capitalize">{recipe.title}</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Ma Recette Enregistrée</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <i className="fa-regular fa-clock text-rose-500 text-lg"></i>
            <span className="text-sm font-black text-slate-600 uppercase tracking-widest">{recipe.duration} de préparation</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-list-ul text-rose-400"></i> Ingrédients requis
              </h4>
              <ul className="text-sm text-slate-600 space-y-3 font-medium">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <i className="fa-solid fa-circle-check text-emerald-400 text-[10px] mt-1.5"></i> {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-fire-burner text-rose-400"></i> Étapes de cuisine
              </h4>
              <ol className="text-sm text-slate-600 space-y-4 font-medium">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0 border border-slate-200">{i + 1}</span> 
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100/50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200/50">
                <i className="fa-solid fa-lightbulb text-lg"></i>
            </div>
            <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Rappel du chef</p>
                <p className="text-xs text-amber-800 font-medium leading-relaxed italic">"{recipe.chefTip}"</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <button 
             onClick={onClose}
             className="w-full bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all active:scale-[0.98]"
           >
             RETOUR À MES RECETTES
           </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;


import React, { useEffect, useState } from 'react';
import { Recipe, FoodItem, ChosenRecipe } from '../types';
import { getRecipes } from '../services/geminiService';

interface RecipeModalProps {
  item?: FoodItem;
  customItems?: FoodItem[];
  otherIngredients: string[];
  onClose: () => void;
  onChooseRecipe: (recipe: Recipe, ingredientIds: string[]) => void;
  allergies: string[];
}

const RecipeModal: React.FC<RecipeModalProps> = ({ item, customItems, otherIngredients, onClose, onChooseRecipe, allergies }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const ingredientIds = customItems ? customItems.map(i => i.id) : (item ? [item.id] : []);

  useEffect(() => {
    const fetchRecipes = async () => {
      const isStrict = !!customItems;
      const mainIngredient = item ? item.name : (customItems?.map(i => i.name).join(", ") || "");
      const availableIngredients = isStrict ? [] : otherIngredients;
      
      const data = await getRecipes(mainIngredient, availableIngredients, isStrict, allergies);
      setRecipes(data);
      setLoading(false);
    };
    fetchRecipes();
  }, [item, customItems, otherIngredients, allergies]);

  const displayTitle = item ? item.name : "Sélection personnalisée";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-rose-500 p-8 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight leading-none mb-1">Cuisiner : <span className="capitalize">{displayTitle}</span></h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Idées rapides Anti-Gaspi</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center justify-center">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 border-[6px] border-rose-500/10 border-t-rose-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <i className="fa-solid fa-utensils text-rose-500 text-2xl animate-pulse"></i>
                </div>
              </div>
              <div>
                <p className="text-slate-800 font-black text-lg">Création en cours...</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">L'IA prépare vos menus gourmands</p>
              </div>
            </div>
          ) : recipes.length > 0 ? (
            recipes.map((recipe, idx) => (
              <div key={idx} className="bg-slate-50/50 rounded-[2.5rem] p-7 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-black text-rose-600 leading-tight pr-4">{recipe.title}</h3>
                  <div className="bg-white px-4 py-2 rounded-2xl text-[10px] font-black text-slate-500 shadow-sm flex items-center gap-2 whitespace-nowrap">
                    <i className="fa-regular fa-clock text-rose-400"></i> {recipe.duration}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <i className="fa-solid fa-list-ul text-rose-400"></i> Ingrédients
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 font-medium">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <i className="fa-solid fa-circle-check text-rose-300 text-[10px] mt-1"></i> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <i className="fa-solid fa-fire-burner text-rose-400"></i> Instructions
                    </h4>
                    <ol className="text-sm text-slate-600 space-y-3 font-medium">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 text-[10px] font-black flex items-center justify-center shrink-0 border border-rose-100">{i + 1}</span> 
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <button 
                    onClick={() => onChooseRecipe(recipe, ingredientIds)}
                    className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-2 hover:bg-rose-600 transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-bookmark"></i> CHOISIR CETTE RECETTE
                  </button>

                  <div className="bg-amber-50/50 p-4 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200/50">
                        <i className="fa-solid fa-lightbulb text-lg"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Le conseil du chef</p>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed italic">"{recipe.chefTip}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <i className="fa-solid fa-face-frown text-slate-200 text-5xl mb-4"></i>
              <p className="text-slate-500 font-bold">Aucune recette trouvée. Essayez un autre ingrédient.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;

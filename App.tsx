
import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, DashboardStats, MaturityLevel, Recipe, ChosenRecipe, UserProfile } from './types';
import { loadItems, saveItems, loadStats, saveStats, clearAllData, loadChosenRecipes, saveChosenRecipes, loadUser, saveUser } from './utils/storage';
import AddFoodModal from './components/AddFoodModal';
import RecipeModal from './components/RecipeModal';
import RecipeDetailModal from './components/RecipeDetailModal';
import AuthPage from './components/AuthPage';
import AllergyModal from './components/AllergyModal';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(loadUser());
  const [items, setItems] = useState<FoodItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>(loadStats());
  const [chosenRecipes, setChosenRecipes] = useState<ChosenRecipe[]>(loadChosenRecipes());
  const [view, setView] = useState<'home' | 'stats' | 'list' | 'recipes'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FoodItem | null>(null);
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<FoodItem | null>(null);
  const [selectedDetailRecipe, setSelectedDetailRecipe] = useState<ChosenRecipe | null>(null);
  const [isEditingAllergies, setIsEditingAllergies] = useState(false);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedForRecipe, setSelectedForRecipe] = useState<string[]>([]);
  const [customRecipeItems, setCustomRecipeItems] = useState<FoodItem[] | null>(null);

  useEffect(() => {
    if (user?.isLoggedIn) {
      setItems(loadItems());
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) saveUser(user);
  }, [user]);

  useEffect(() => {
    if (user?.isLoggedIn) saveItems(items);
  }, [items, user]);

  useEffect(() => {
    if (user?.isLoggedIn) saveStats(stats);
  }, [stats, user]);

  useEffect(() => {
    if (user?.isLoggedIn) saveChosenRecipes(chosenRecipes);
  }, [chosenRecipes, user]);

  const sortedItems = useMemo(() => {
    return [...items]
      .filter(item => !item.isUsed && !item.isWasted)
      .sort((a, b) => {
        const timeA = new Date(a.expiryDate).getTime();
        const timeB = new Date(b.expiryDate).getTime();
        return timeA - timeB;
      });
  }, [items]);

  const activeRecipes = useMemo(() => {
    return chosenRecipes.filter(r => !r.isCompleted);
  }, [chosenRecipes]);

  const urgentCount = useMemo(() => {
    return sortedItems.filter(item => {
      const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysLeft >= 0 && daysLeft < 3;
    }).length;
  }, [sortedItems]);

  const shoppingListItems = useMemo(() => {
    const expiredOrUsedNames = items
      .filter(i => i.isUsed || i.isWasted)
      .map(i => i.name);
    const currentlyInFridgeNames = sortedItems.map(i => i.name);
    return Array.from(new Set(expiredOrUsedNames))
      .filter(name => !currentlyInFridgeNames.includes(name));
  }, [items, sortedItems]);

  const handleAddItem = (newItem: FoodItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  const handleUpdateItem = (updatedItem: FoodItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setItemToEdit(null);
  };

  const markAsUsed = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, isUsed: true } : i));
    setStats(prev => ({
      ...prev,
      moneySaved: prev.moneySaved + item.price,
      foodSavedWeight: prev.foodSavedWeight + item.weight
    }));
  };

  const markAsWasted = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, isWasted: true } : i));
    setStats(prev => {
      const newTopWasted = [...prev.topWastedItems];
      if (!newTopWasted.includes(item.name)) newTopWasted.push(item.name);
      return {
        ...prev,
        wastedItemsCount: prev.wastedItemsCount + 1,
        topWastedItems: newTopWasted.slice(-5)
      };
    });
  };

  const handleChooseRecipe = (recipe: Recipe, ingredientIds: string[]) => {
    const newChosen: ChosenRecipe = {
      ...recipe,
      id: crypto.randomUUID(),
      chosenDate: new Date().toISOString(),
      isCompleted: false,
      relatedIngredientIds: ingredientIds
    };
    setChosenRecipes(prev => [newChosen, ...prev]);
    setSelectedRecipeItem(null);
    setCustomRecipeItems(null);
    setIsSelectionMode(false);
    setSelectedForRecipe([]);
  };

  const handleCompleteRecipe = (chosenId: string, usedIngIds: string[], followed: boolean) => {
    if (followed) {
      usedIngIds.forEach(id => markAsUsed(id));
    }
    setChosenRecipes(prev => prev.map(r => r.id === chosenId ? { ...r, isCompleted: true } : r));
  };

  const handleRemoveRecipe = (id: string) => {
    setChosenRecipes(prev => prev.filter(r => r.id !== id));
  };

  const handleResetApp = () => {
    if (window.confirm("⚠️ ATTENTION : Vous allez supprimer TOUT l'historique. Cette action est définitive. Voulez-vous continuer ?")) {
      clearAllData();
      setItems([]);
      setChosenRecipes([]);
      setUser(null);
      setStats({
        moneySaved: 0,
        foodSavedWeight: 0,
        wastedItemsCount: 0,
        topWastedItems: []
      });
      setView('home');
    }
  };

  const toggleIngredientSelection = (id: string) => {
    setSelectedForRecipe(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGenerateCustomRecipe = () => {
    const selectedItems = items.filter(i => selectedForRecipe.includes(i.id));
    if (selectedItems.length > 0) {
      setCustomRecipeItems(selectedItems);
    }
  };

  const getUrgencyColor = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (daysLeft < 0) return 'bg-slate-500';
    if (daysLeft < 2) return 'bg-rose-600 shadow-lg shadow-rose-200 animate-pulse';
    if (daysLeft < 4) return 'bg-amber-500 shadow-md shadow-amber-100';
    return 'bg-emerald-500 shadow-sm shadow-emerald-100';
  };

  const getUrgencyText = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (daysLeft < 0) return 'Périmé';
    if (daysLeft === 0) return "Aujourd'hui";
    if (daysLeft === 1) return 'Demain';
    return `${daysLeft} jours restants`;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Légume': return 'fa-carrot';
      case 'Fruit': return 'fa-apple-whole';
      case 'Produit laitier': return 'fa-cheese';
      case 'Charcuterie': return 'fa-bacon';
      case 'Viande/Poisson': return 'fa-fish';
      default: return 'fa-box';
    }
  };

  // Condition de rendu pour l'authentification
  if (!user?.isLoggedIn) {
    return <AuthPage onLogin={setUser} />;
  }

  // Condition de rendu pour les allergies (si non définies ou en cours de modification)
  if (isEditingAllergies || !user.allergies || (user.allergies.length === 0 && !localStorage.getItem('zogdida_allergies_skipped'))) {
    return <AllergyModal 
      initialAllergies={user.allergies}
      onClose={isEditingAllergies ? () => setIsEditingAllergies(false) : undefined}
      onSave={(allergies) => {
        setUser({ ...user, allergies });
        localStorage.setItem('zogdida_allergies_skipped', 'true');
        setIsEditingAllergies(false);
      }} 
    />;
  }

  return (
    <div className="min-h-screen pb-40 max-w-lg mx-auto bg-[#F2FFF0] relative overflow-x-hidden text-slate-900">
      <header className="p-6 pb-2 flex justify-between items-center bg-transparent z-40">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-snowflake text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-700 tracking-tight">ZOGDIDA</h1>
          </div>
        </div>
        
        {view === 'home' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 text-white w-12 h-12 rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-90 animate-in fade-in zoom-in duration-300"
          >
            <i className="fa-solid fa-plus text-xl"></i>
          </button>
        )}
      </header>

      <main className="px-5 py-4">
        {view === 'home' && (
          <div className="space-y-6">
            <section>
              <div className="flex justify-between items-end mb-5">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-snowflake text-sky-400"></i> Mon Frigo
                </h2>
                <span className="text-xs font-bold text-slate-400">{sortedItems.length} produits</span>
              </div>
              
              {sortedItems.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-slate-100">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-basket-shopping text-slate-300 text-3xl"></i>
                  </div>
                  <h3 className="font-bold text-slate-700 mb-1 text-lg">Frigo vide !</h3>
                  <p className="text-slate-400 text-sm">Ajoutez vos aliments pour commencer à économiser.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedItems.map(item => (
                    <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <i className={`fa-solid ${getCategoryIcon(item.category)} text-xl`}></i>
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800 text-lg capitalize leading-tight">{item.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mr-1">Fraîcheur :</span>
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <i key={lvl} className={`fa-solid fa-star text-[9px] ${item.maturity >= lvl ? 'text-amber-400' : 'text-slate-100'}`}></i>
                                ))}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-wider ${getUrgencyColor(item.expiryDate)}`}>
                          {getUrgencyText(item.expiryDate)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => markAsUsed(item.id)}
                          className="flex-[2] bg-emerald-600 text-white py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-100"
                        >
                          <i className="fa-solid fa-check-double"></i> CONSOMMÉ
                        </button>
                        <button 
                          onClick={() => setSelectedRecipeItem(item)}
                          className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100"
                        >
                          <i className="fa-solid fa-mortar-pestle"></i>
                        </button>
                        <button 
                          onClick={() => setItemToEdit(item)}
                          className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          onClick={() => markAsWasted(item.id)}
                          className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-400"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'recipes' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            {activeRecipes.length > 0 && (
              <section className="animate-in slide-in-from-top-4 duration-500">
                <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-fire-burner animate-bounce"></i> Mes Recettes à Préparer
                </h3>
                <div className="space-y-4">
                  {activeRecipes.map(recipe => (
                    <div key={recipe.id} className="group relative bg-white border-2 border-rose-100 rounded-[2.5rem] p-6 shadow-xl shadow-rose-100/20 transition-all hover:border-rose-300">
                      <div className="flex justify-between items-start mb-2">
                        <button 
                          onClick={() => setSelectedDetailRecipe(recipe)}
                          className="text-left flex-1"
                        >
                          <h4 className="font-black text-slate-800 text-lg group-hover:text-rose-500 transition-colors">{recipe.title}</h4>
                        </button>
                        <button onClick={() => handleRemoveRecipe(recipe.id)} className="text-slate-300 hover:text-rose-400 p-2 z-10">
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedDetailRecipe(recipe)}
                        className="w-full text-left flex items-center gap-2 mb-6"
                      >
                         <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                            <i className="fa-regular fa-clock"></i> {recipe.duration}
                         </p>
                         <span className="text-[10px] bg-rose-50 text-rose-500 px-3 py-1 rounded-full font-black uppercase tracking-widest ml-auto group-hover:bg-rose-500 group-hover:text-white transition-all">Voir détails</span>
                      </button>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCompleteRecipe(recipe.id, recipe.relatedIngredientIds, true)}
                          className="flex-[1.5] bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg shadow-rose-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <i className="fa-solid fa-check-double"></i> J'AI CUISINÉ
                        </button>
                        <button 
                          onClick={() => handleCompleteRecipe(recipe.id, recipe.relatedIngredientIds, false)}
                          className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          ANNULER
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-book-open text-rose-500"></i> Recettes Anti-Gaspi
                </h2>
                <div className="bg-white/60 p-1 rounded-2xl shadow-sm border border-rose-100">
                  <button 
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedForRecipe([]);
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${isSelectionMode ? 'bg-slate-800 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-200'}`}
                    title={isSelectionMode ? 'Annuler' : 'Sélectionner plusieurs'}
                  >
                    <i className={`fa-solid ${isSelectionMode ? 'fa-xmark' : 'fa-list-check'} text-lg`}></i>
                  </button>
                </div>
              </div>
              
              {isSelectionMode && (
                <p className="text-[11px] font-bold text-slate-500 bg-rose-50/50 p-4 rounded-3xl border border-dashed border-rose-200 animate-in fade-in duration-300">
                  <i className="fa-solid fa-circle-info mr-2 text-rose-400"></i>
                  Appuyez sur les ingrédients pour les ajouter à votre recette personnalisée.
                </p>
              )}

              <div className="space-y-4">
                  {sortedItems.map(item => (
                      <button 
                        key={item.id}
                        onClick={() => isSelectionMode ? toggleIngredientSelection(item.id) : setSelectedRecipeItem(item)}
                        className={`w-full text-left bg-white p-5 rounded-3xl shadow-sm border-2 transition-all flex items-center justify-between ${isSelectionMode && selectedForRecipe.includes(item.id) ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelectionMode && selectedForRecipe.includes(item.id) ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
                            {isSelectionMode && selectedForRecipe.includes(item.id) ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-utensils"></i>}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 capitalize">{item.name}</h4>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.category}</span>
                          </div>
                        </div>
                        <i className={`fa-solid ${isSelectionMode ? 'fa-circle-plus' : 'fa-chevron-right'} ${isSelectionMode && selectedForRecipe.includes(item.id) ? 'text-rose-500 scale-125' : 'text-slate-100'}`}></i>
                      </button>
                  ))}
              </div>
            </section>

            {isSelectionMode && selectedForRecipe.length > 0 && (
              <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] z-40 animate-in slide-in-from-bottom-8">
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-[3rem] shadow-2xl shadow-rose-200/50 border border-rose-100">
                  <button 
                    onClick={handleGenerateCustomRecipe}
                    className="w-full bg-rose-500 text-white py-5 rounded-[2.5rem] font-black text-sm shadow-xl shadow-rose-200 border-4 border-white flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    GÉNÉRER AVEC CES {selectedForRecipe.length} ALIMENTS
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-6 bg-emerald-600 p-6 rounded-[2.5rem] text-white">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                 <i className="fa-solid fa-user text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-black">{user.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                   {user.allergies.length > 0 ? `Allergies: ${user.allergies.join(', ')}` : 'Aucune allergie enregistrée'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#E9F5E6] rounded-3xl p-6 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-700">
                  <i className="fa-solid fa-coins"></i>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-700 leading-none">{stats.moneySaved} TND</div>
                  <div className="text-[11px] font-bold text-emerald-700/60 mt-1 uppercase tracking-wider">Économies</div>
                </div>
              </div>

              <div className="bg-[#FEF1F0] rounded-3xl p-6 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <i className="fa-solid fa-scale-balanced"></i>
                </div>
                <div>
                  <div className="text-3xl font-black text-rose-600 leading-none">{(stats.foodSavedWeight / 1000).toFixed(1)} kg</div>
                  <div className="text-[11px] font-bold text-rose-600/60 mt-1 uppercase tracking-wider">Nourriture sauvée</div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
               <button 
                onClick={() => setIsEditingAllergies(true)}
                className="w-full py-4 bg-white text-rose-500 font-bold text-[10px] uppercase tracking-widest rounded-2xl border border-rose-100 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-hand-dots"></i> Modifier mes allergies
              </button>
              <button 
                onClick={handleResetApp}
                className="w-full py-4 bg-white/40 text-rose-500 font-bold text-[10px] uppercase tracking-widest rounded-2xl border border-rose-100 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-trash-can"></i> Réinitialiser et se déconnecter
              </button>
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-5">
              <i className="fa-solid fa-clipboard-list text-emerald-600"></i> Liste Intelligente
            </h2>
            <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100">
              {shoppingListItems.length > 0 ? (
                <div className="space-y-3">
                  {shoppingListItems.map((name, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-6 h-6 rounded-lg border-2 border-emerald-400"></div>
                      <span className="text-slate-700 font-bold capitalize flex-1">{name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-10 font-bold">Rien à acheter !</p>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-sm max-w-sm bg-white/80 backdrop-blur-lg rounded-[2.5rem] shadow-2xl p-2.5 flex justify-between items-center z-50 border border-white/50">
        <button 
          onClick={() => { setView('home'); setIsSelectionMode(false); }}
          className={`flex-1 py-3.5 rounded-full flex flex-col items-center gap-1.5 transition-all ${view === 'home' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-snowflake text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tight">Frigo</span>
        </button>
        <button 
          onClick={() => { setView('recipes'); }}
          className={`flex-1 py-3.5 rounded-full flex flex-col items-center gap-1.5 transition-all ${view === 'recipes' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-book-journal-whills text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tight">Recettes</span>
        </button>
        <button 
          onClick={() => { setView('list'); setIsSelectionMode(false); }}
          className={`flex-1 py-3.5 rounded-full flex flex-col items-center gap-1.5 transition-all ${view === 'list' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-bag-shopping text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tight">Courses</span>
        </button>
        <button 
          onClick={() => { setView('stats'); setIsSelectionMode(false); }}
          className={`flex-1 py-3.5 rounded-full flex flex-col items-center gap-1.5 transition-all ${view === 'stats' ? 'text-emerald-600 scale-110 font-bold' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-user-gear text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tight">Profil</span>
        </button>
      </nav>

      {isAddModalOpen && (
        <AddFoodModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddItem} 
        />
      )}

      {itemToEdit && (
        <AddFoodModal 
          onClose={() => setItemToEdit(null)} 
          onUpdate={handleUpdateItem}
          itemToEdit={itemToEdit}
        />
      )}

      {selectedRecipeItem && (
        <RecipeModal 
          item={selectedRecipeItem} 
          otherIngredients={sortedItems.map(i => i.name)}
          onClose={() => setSelectedRecipeItem(null)} 
          onChooseRecipe={handleChooseRecipe}
          allergies={user.allergies}
        />
      )}

      {customRecipeItems && (
        <RecipeModal 
          customItems={customRecipeItems}
          otherIngredients={sortedItems.map(i => i.name)}
          onClose={() => {
            setCustomRecipeItems(null);
            setIsSelectionMode(false);
            setSelectedForRecipe([]);
          }} 
          onChooseRecipe={handleChooseRecipe}
          allergies={user.allergies}
        />
      )}

      {selectedDetailRecipe && (
        <RecipeDetailModal 
          recipe={selectedDetailRecipe}
          onClose={() => setSelectedDetailRecipe(null)}
        />
      )}
    </div>
  );
};

export default App;

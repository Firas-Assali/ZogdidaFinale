
import { FoodItem, DashboardStats, ChosenRecipe, UserProfile } from "../types";

const STORAGE_KEY_ITEMS = "zogdida_items";
const STORAGE_KEY_STATS = "zogdida_stats";
const STORAGE_KEY_CHOSEN_RECIPES = "zogdida_chosen_recipes";
const STORAGE_KEY_USER = "zogdida_user";

export const saveItems = (items: FoodItem[]) => {
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
};

export const loadItems = (): FoodItem[] => {
  const data = localStorage.getItem(STORAGE_KEY_ITEMS);
  return data ? JSON.parse(data) : [];
};

export const saveStats = (stats: DashboardStats) => {
  localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
};

export const loadStats = (): DashboardStats => {
  const data = localStorage.getItem(STORAGE_KEY_STATS);
  return data ? JSON.parse(data) : {
    moneySaved: 0,
    foodSavedWeight: 0,
    wastedItemsCount: 0,
    topWastedItems: []
  };
};

export const saveChosenRecipes = (recipes: ChosenRecipe[]) => {
  localStorage.setItem(STORAGE_KEY_CHOSEN_RECIPES, JSON.stringify(recipes));
};

export const loadChosenRecipes = (): ChosenRecipe[] => {
  const data = localStorage.getItem(STORAGE_KEY_CHOSEN_RECIPES);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: UserProfile) => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

export const loadUser = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  return data ? JSON.parse(data) : null;
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY_ITEMS);
  localStorage.removeItem(STORAGE_KEY_STATS);
  localStorage.removeItem(STORAGE_KEY_CHOSEN_RECIPES);
  localStorage.removeItem(STORAGE_KEY_USER);
};


export enum MaturityLevel {
  VERY_FRESH = 1,
  FRESH = 2,
  MATURE = 3,
  RIPE = 4,
  OVERRIPE = 5
}

export type FoodCategory = 'Légume' | 'Fruit' | 'Produit laitier' | 'Charcuterie' | 'Viande/Poisson' | 'Épicerie' | 'Autre';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  purchaseDate: string;
  expiryDate: string;
  maturity: MaturityLevel;
  estimatedShelfLifeDays: number;
  isUsed: boolean;
  isWasted: boolean;
  price: number; // in TND
  weight: number; // in grams
}

export interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
  duration: string;
  chefTip: string;
}

export interface ChosenRecipe extends Recipe {
  id: string;
  chosenDate: string;
  isCompleted: boolean;
  relatedIngredientIds: string[]; 
}

export interface UserProfile {
  name: string;
  email: string;
  allergies: string[];
  isLoggedIn: boolean;
}

export interface DashboardStats {
  moneySaved: number;
  foodSavedWeight: number;
  wastedItemsCount: number;
  topWastedItems: string[];
}

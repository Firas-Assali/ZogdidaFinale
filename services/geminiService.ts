
import { GoogleGenAI, Type } from "@google/genai";
import { MaturityLevel, Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const estimateShelfLife = async (name: string, freshness: MaturityLevel): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Estime la durée de conservation restante (en jours) pour cet aliment : "${name}" avec un niveau de fraîcheur de ${freshness}/5 (5=parfaitement frais/neuf, 1=doit être consommé très rapidement). Réponds uniquement par un chiffre entier.`,
    });
    const days = parseInt(response.text.trim());
    return isNaN(days) ? 3 : days;
  } catch (error) {
    console.error("Error estimating shelf life:", error);
    return 3;
  }
};

export const getRecipes = async (
  itemName: string, 
  otherIngredients: string[], 
  isStrict: boolean = false,
  allergies: string[] = []
): Promise<Recipe[]> => {
  try {
    const allergyContext = allergies.length > 0 
      ? `\nATTENTION : L'utilisateur est ALLERGIQUE à : ${allergies.join(", ")}. INTERDICTION ABSOLUE d'inclure ces éléments dans les recettes ou leurs dérivés.` 
      : "";

    let prompt = "";
    if (isStrict) {
      prompt = `Propose 3 recettes rapides mettant en œuvre UNIQUEMENT ces ingrédients sélectionnés : "${itemName}". 
      INTERDICTION d'utiliser d'autres aliments frais du frigo non cités ici. ${allergyContext}
      Tu peux seulement ajouter des produits de base du placard (sel, poivre, huile, eau, épices de base, sucre). 
      Les recettes doivent être centrées sur ces éléments précis.`;
    } else {
      prompt = `Propose 3 recettes rapides et faciles (moins de 20 min) mettant en valeur l'ingrédient principal : "${itemName}". ${allergyContext}
      Propose des recettes variées et gourmandes. Autres ingrédients éventuellement disponibles dans le frigo : ${otherIngredients.join(", ")}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              duration: { type: Type.STRING },
              chefTip: { type: Type.STRING }
            },
            required: ["title", "ingredients", "steps", "duration", "chefTip"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

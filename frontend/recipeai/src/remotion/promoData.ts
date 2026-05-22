export type PromoScene = {
  readonly step: string;
  readonly title: string;
  readonly caption: string;
  readonly screenshot: string;
  readonly accent: string;
};

export const PROMO_WIDTH = 1080;
export const PROMO_HEIGHT = 1920;
export const PROMO_FPS = 30;
export const SCENE_DURATION_IN_FRAMES = 126;
export const SCENE_STEP_IN_FRAMES = 108;

export const promoScenes: readonly PromoScene[] = [
  {
    step: "Step 1",
    title: "Stock your fridge",
    caption: "Start with the ingredients you already have at home.",
    screenshot: "promo/screens/01-fridge.png",
    accent: "#ffd43c",
  },
  {
    step: "Step 2",
    title: "Choose preferences",
    caption: "Tune diets and disliked ingredients for better suggestions.",
    screenshot: "promo/screens/02-preferences.png",
    accent: "#ffcf5a",
  },
  {
    step: "Step 3",
    title: "Generate a recipe",
    caption: "Turn what you have into a dinner idea with one tap.",
    screenshot: "promo/screens/03-generated-recipe.png",
    accent: "#ffc94a",
  },
  {
    step: "Step 4",
    title: "Save the winner",
    caption: "Keep your best recipe ideas ready for the next time.",
    screenshot: "promo/screens/04-saved-recipe.png",
    accent: "#ffbc37",
  },
  {
    step: "Step 5",
    title: "Generate shopping list",
    caption: "Move straight from recipe to a clean ingredient checklist.",
    screenshot: "promo/screens/05-shopping-list.png",
    accent: "#ffb000",
  },
];

export const PROMO_DURATION_IN_FRAMES =
  SCENE_STEP_IN_FRAMES * (promoScenes.length - 1) + SCENE_DURATION_IN_FRAMES;

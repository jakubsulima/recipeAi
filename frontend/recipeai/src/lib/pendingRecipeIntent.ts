const PENDING_RECIPE_SEARCH_KEY = "dishGeniePendingRecipeSearch";

export const savePendingRecipeSearch = (search: string) => {
  if (!search.trim()) {
    return;
  }

  sessionStorage.setItem(PENDING_RECIPE_SEARCH_KEY, search);
};

export const consumePendingRecipeRedirect = () => {
  const search = sessionStorage.getItem(PENDING_RECIPE_SEARCH_KEY);
  if (!search) {
    return null;
  }

  sessionStorage.removeItem(PENDING_RECIPE_SEARCH_KEY);
  return {
    pathname: "/Recipe",
    search: "",
    state: { search },
  };
};

export const clearPendingRecipeSearch = () => {
  sessionStorage.removeItem(PENDING_RECIPE_SEARCH_KEY);
};

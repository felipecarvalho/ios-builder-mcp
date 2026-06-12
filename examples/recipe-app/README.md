# Recipe App Example

A SwiftUI iOS app for discovering, saving, and cooking recipes.
Generated using iOS Builder MCP.

## Structure

```
RecipeApp/
├── App.swift
├── ContentView.swift
├── Models/
│   ├── Recipe.swift
│   └── Ingredient.swift
├── ViewModels/
│   ├── RecipeViewModel.swift
│   └── SearchViewModel.swift
├── Views/
│   ├── HomeView.swift
│   ├── RecipeListView.swift
│   ├── RecipeDetailView.swift
│   ├── SearchView.swift
│   └── FavoritesView.swift
└── Components/
    ├── RecipeCard.swift
    ├── IngredientRow.swift
    ├── StepRow.swift
    └── CategoryGrid.swift
```

## Features
- Browse recipes by category (Breakfast, Lunch, Dinner, Dessert, Snacks)
- Search with ingredient filtering
- Step-by-step cooking mode with timers
- Favorites collection with iCloud sync
- Shopping list generation from recipes
- Serving size scaling
- Nutrition information display
- Dark mode and Dynamic Type support

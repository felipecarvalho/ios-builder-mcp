# Fitness Tracker Example

A SwiftUI iOS app for tracking workouts, monitoring progress, and maintaining fitness goals.
Generated using iOS Builder MCP.

## Structure

```
FitnessTracker/
├── App.swift
├── ContentView.swift
├── Models/
│   ├── Workout.swift
│   └── Exercise.swift
├── ViewModels/
│   ├── WorkoutViewModel.swift
│   └── ProgressViewModel.swift
├── Views/
│   ├── DashboardView.swift
│   ├── WorkoutListView.swift
│   ├── WorkoutDetailView.swift
│   ├── ActiveWorkoutView.swift
│   └── ProgressView.swift
└── Components/
    ├── WorkoutCard.swift
    ├── ExerciseRow.swift
    ├── ProgressChart.swift
    └── StatBubble.swift
```

## Features
- Dashboard with daily summary and streaks
- Workout logging with exercises, sets, reps, and weights
- Active workout timer with rest tracking
- Progress charts (weight trend, volume over time)
- HealthKit sync for calories and heart rate
- Dark mode support with custom design system

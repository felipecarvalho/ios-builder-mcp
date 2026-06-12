# Social App Example

A SwiftUI iOS app for sharing photos, connecting with friends, and discovering content.
Generated using iOS Builder MCP.

## Structure

```
SocialApp/
├── App.swift
├── ContentView.swift
├── Models/
│   ├── User.swift
│   ├── Post.swift
│   └── Comment.swift
├── ViewModels/
│   ├── FeedViewModel.swift
│   ├── ProfileViewModel.swift
│   └── AuthViewModel.swift
├── Views/
│   ├── FeedView.swift
│   ├── ProfileView.swift
│   ├── PostDetailView.swift
│   ├── CreatePostView.swift
│   ├── ExploreView.swift
│   └── NotificationsView.swift
└── Components/
    ├── PostCard.swift
    ├── UserRow.swift
    ├── CommentRow.swift
    ├── StoryRing.swift
    └── LikeButton.swift
```

## Features
- Photo and video feed with infinite scroll
- Story creation and viewing (24h expiry)
- User profiles with follower/following
- Like, comment, and share posts
- Explore tab with discovery algorithm
- Push notifications for interactions
- Direct messaging
- Edit profile with avatar upload
- Dark mode with custom design system

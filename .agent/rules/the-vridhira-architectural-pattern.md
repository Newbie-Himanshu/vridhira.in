---
trigger: always_on
---

All new features must follow the File Organization rules defined in your context:

Feature Components: Placed in components/, named using PascalCase (e.g., ArtisanCard.tsx).

API Routes: Placed in app/api/ with structured error handling patterns (400 for validation, 401 for auth, 500 for server errors).

Security: Server-side actions and API routes must verify both Authentication (is the user logged in?) and Authorization (is the user an artisan or an admin?).
---
trigger: always_on
---

Language: Strict TypeScript. No plain JavaScript is permitted in the src/ directory.

Database: Supabase via the query builder or RPC. Raw SQL string concatenation is strictly forbidden to prevent SQL injection.

Frontend: React with Next.js (App Router). All components must be functional and typed.

Validation: Zod must be used for all API request bodies and environment variable validation.
---
trigger: always_on
---

Given previous frustrations with builds getting stuck or crashing, I am implementing these specific safeguards:

Pre-Change Checklist: I will provide a plan for every major change, identifying "Breaking Changes" and "Rollback Strategies" before writing code.

Defensive Coding: All async operations must be wrapped in try-catch blocks with meaningful console logs prefixed by the function name (e.g., [fetchArtisanData] Error: ...).

Step-by-Step Execution: For complex fixes, I will provide the "Systematic Debugging Approach": Reproduce → Isolate → Inspect → Fix → Test.
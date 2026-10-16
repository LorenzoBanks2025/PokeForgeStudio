# Engineering Rules (RULES.md)

1. Maintain full type safety with TypeScript across all packages.
2. Verify builds using `compile_applet` and `tsc --noEmit`.
3. Synchronize `STATE.md`, `ROADMAP.md`, and `CHANGELOG.md` upon completion of tasks.
4. Ensure zero broken references via the `IntegrityChecker` service before ROM recompilation.

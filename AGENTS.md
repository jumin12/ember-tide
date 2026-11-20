# Journey save compatibility

Keep existing browser saves, recovery copies, and exported journey files readable in every release. Use stable quest and content IDs. Put migrations and defaults in the existing journey normalizer and retain every previously shipped save reader when changing the current schema. Preserve the original record until the player explicitly saves or deletes it.

For persistence changes, run `node elyndor/tools/check-persistence.mjs` and verify that an older record can load, export, and round-trip in the current build. Keep regression fixtures for older formats.

---
description: "Generate git commits using gitmoji, in English, max 50 characters"
alwaysApply: true
---

- When writing commits, ALWAYS write them in English
- Use gitmoji nomenclature following the examples from https://gitmoji.dev/
- Limit the commit message to 50 characters max, including the emoji
- Use the format <gitmoji> <short imperative message>
- If you need to provide more context, use the commit description (body) for that, but keep the title concise and focused on the main change

## Good examples

- ✨ Add new feature to improve performance
- 🐛 Fix bug causing crash on startup
- 📝 Update documentation for API changes
- 🔥 Remove deprecated code and dependencies
- ♻️ Refactor code for better readability and maintainability

## Bad examples

- Added new feature to improve performance (no gitmoji, not imperative)
- Fixed bug causing crash on startup (not imperative)

---
description: "Coding style guidelines for the project."
alwaysApply: true
---

# Coding Style

Write the code in English, always, to maintain the consistency in the codebase and avoid confusion

Don't use emojis in the code, comments or markdown documentation

The emojis are noise, bloat context innecesarily, burn tokens, difficult to readbility and may not render properly in all environments

Don't use ascii blocks in the code, to create comments, because they are not readable and don't follow the standard syntax of the language you're using to create comments, don't do this:

```python
#==============
#This is a comment
#==============
```

Use the following format to create comments:

```python
# This is a comment
```

```sql
-- This is a comment
```

In simple words, use the standard syntax given by the language you're using to create comments
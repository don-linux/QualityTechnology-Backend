---
description: "Coding style guidelines for the project."
alwaysApply: true
---

# Coding Style

## General Guidelines

- Write the code in English, always, to maintain the consistency in the codebase and avoid confusion

- Don't use emojis in the code, comments or markdown documentation

The emojis are noise, bloat context innecesarily, burn tokens, difficult to readbility and may not render properly in all environments

## Code Comments Conventions

- Don't use ascii blocks in the code, to create comments, because they are not readable and don't follow the standard syntax of the language you're using to create comments, don't do this:

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

## Code Writing Conventions

- Search about the best conventions for the language you're using to write the code, example:

Python uses snake case for variables and functions, camel case for classes, and Pascal case for modules

JavaScript uses camel case for variables and functions, and Pascal case for classes

And so on...

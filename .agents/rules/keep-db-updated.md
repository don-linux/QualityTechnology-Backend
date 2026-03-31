---
description: "Keep the database structure file updated and synchronized with the latest changes of the models in the backend to ensure data integrity and consistency across the application"

alwaysApply: true
---

# Keep DB Updated

When you're making changes to the backend, your responsibility is to keep the database structure file updated with the models in the backend

If you add a new model and fields into the models on the backend, you should update the database structure file

That file is `db.sql`

Why you need to do this?

Because this project doesn't have an ORM, the database structure file is the source of truth for the database structure and schema

Keeping both sides synchronized ensures that the database structure and schema are always in sync with the models in the backend, avoiding inconsistencies and potential issues when trying to access or manipulate data in the database

So if you didn't update the database structure file, it could lead to issues such as:

- Data inconsistency: If the database structure file is not updated, it may not reflect the latest changes made to the backend, which can lead to data inconsistency and errors when trying to access or manipulate data in the database.

- Collaboration problems: If multiple developers are working on the project and the database structure file is not updated, it can lead to confusion and miscommunication among team members, as they may not be aware of the latest changes made to the backend and how it affects the database structure.

- Testing difficulties: If the database structure file is not updated, it can make it difficult to test the application properly, as the tests may rely on the expected database schema defined in the file, which may not reflect the latest changes made to the backend.

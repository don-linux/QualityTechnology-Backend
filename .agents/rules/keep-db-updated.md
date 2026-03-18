# KEEP DB UPDATED.md

---
description: "Keep the database structure file updated and synchronized with the latest changes in the backend to ensure data integrity and consistency across the application"

alwaysApply: true
---

When you're making changes to the backend, your responsibility is to keep the database structure file updated with the backend

If you add a new field into the backend, you should update the database structure file

The target file is db.sql

Why you need to do this?

Because this project doesn't use an ORM, so the database structure file is the source of truth for the database schema and structure

Keeping it updated ensures that all changes to the database are properly documented and reflected in the file, which is crucial for maintaining data integrity and consistency across the application and into the docker container

So if you didn't update the database structure file, it could lead to issues such as:
- Data inconsistency: If the database structure file is not updated, it may not reflect the latest changes made to the backend, which can lead to data inconsistency and errors when trying to access or manipulate data in the database.
- Deployment issues: If the database structure file is not updated, it may cause issues during deployment, as the database schema may not match the expected structure defined in the file, leading to errors and potential downtime.
- Collaboration problems: If multiple developers are working on the project and the database structure file is not updated, it can lead to confusion and miscommunication among team members, as they may not be aware of the latest changes made to the backend and how it affects the database structure.
- Testing difficulties: If the database structure file is not updated, it can make it difficult to test the application properly, as the tests may rely on the expected database schema defined in the file, which may not reflect the latest changes made to the backend.
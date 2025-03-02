# Task Management System

This project is a Task Management System developed as part of an enhanced lab test for a Full Stack Developer position. The backend is built using Laravel 12, while the frontend was intended to be developed using ReactJS. However, due to some challenges with the Laravel + React starter kit, the frontend is not yet completed. This repository contains the fully functional backend, including RESTful APIs, authentication, and database management.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Backend Features](#backend-features)
  - [Frontend Features ](#frontend-features)
- [Installation](#installation)
  - [Quick Install Command](#quick-install-command)
- [API Endpoints](#api-endpoints)
  - [User Authentication](#user-authentication)
  - [Task Management](#task-management)
  - [Task Activity Log](#task-activity-log)
- [Database Schema](#database-schema)
- [Future Work](#future-work)
- [License](#license)

## Technologies Used

- **Backend:** Laravel 12
- **Database:** MySQL
- **Frontend:** ReactJS
- **Other Tools:**
  - Redis (for caching)
  - Composer (for dependency management)

## Project Structure

The project follows the standard Laravel directory structure with some additional customizations:

- `app/Http/Controllers`: Contains all the API controllers for handling requests.
- `app/Models`: Contains the Eloquent models for Users, Tasks, Roles, and Task Activities.
- `database/migrations`: Contains the database migration files for creating tables.
- `routes/api.php`: Contains all the API routes.
- `config`: Contains configuration files for caching, database, and other settings.
- `tests`: Contains unit and integration tests for critical APIs.

## Features

### Backend Features

- **User Authentication:**
  - Login and Signup APIs with JWT (JSON Web Tokens) for secure authentication.
  - Role-based access control (Admin vs. User).

- **Task Management:**
  - CRUD operations for tasks (Create, Read, Update, Delete).
  - Bulk task updates (batch editing).
  - Task activity log to track actions like creation, updates, and deletions.

- **Database:**
  - MySQL database with tables for Users, Tasks, Roles, and Task Activities.
  - **Relationships:**
    - Users ↔ Tasks: One-to-Many.
    - Tasks ↔ Task_Activities: One-to-Many.
    - Users ↔ Roles: Many-to-Many.
  - Soft deletes using a `deleted_at` column.
  - Indexing for frequently queried columns (e.g., `user_id`, `status`).

- **Performance Optimization:**
  - Redis caching for improved API response times.
  - Database query optimization using eager loading and JOINs.

- **Security:**
  - Sanitized user inputs to prevent SQL injection.
  - HTTPS with CSRF tokens.
  - Sensitive information stored in environment variables.

### Frontend Features 

- User authentication (Login/Signup pages).
- Dashboard to display tasks with filtering options.
- Task creation, editing, and deletion forms with validation.
- Drag-and-drop functionality for reordering tasks.
- Real-time updates using WebSocket or polling.(Not Done yet)
- Dark mode support.

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/task-management-system.git](https://github.com/Ujjal-ENG/task_management_system.git)
   cd task-management-system
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   composer run dev
```bash
**After drag and drop action, please run**
```bash
    php artisan optimize:clear
 ```bash
***than reload the system each time, this problem happend for react package***

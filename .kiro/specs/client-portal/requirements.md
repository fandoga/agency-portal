# Requirements Document: Client Portal

## Introduction

Клиентский портал — это публичная часть Agency Portal, которая предоставляет клиентам агентства доступ к информации о их проектах через Magic Link без необходимости регистрации. Система обеспечивает бесшовную авторизацию через Supabase Auth, изолированный доступ к данным проекта, и применение брендинга агентства к интерфейсу.

## Glossary

- **Client_Portal** - Публичная часть приложения для клиентов агентства
- **Magic_Link** - Ссылка для автоматической авторизации, содержащая токен Supabase Auth и share_token проекта
- **Share_Token** - UUID токен проекта для публичного доступа
- **Agency_Theme** - Цветовая тема агентства, загружаемая из профиля
- **Supabase_Auth** - Система авторизации Supabase
- **Team_Member** - Член команды агентства, генерирующий Magic Link
- **Client** - Клиент агентства, получающий доступ к проекту
- **Project_Page** - Страница отображения проекта с задачами и прогрессом
- **RLS** - Row Level Security, механизм безопасности на уровне базы данных

## Requirements

### Requirement 1: Magic Link Generation

**User Story:** As a team member, I want to generate a Magic Link for a client, so that the client can access their project without registration.

#### Acceptance Criteria

1. WHEN a team member requests a Magic Link for a project, THE Client_Portal SHALL generate a link containing a Supabase Auth token and the project share_token
2. THE Magic_Link SHALL follow the format `/client/auth?token={magic_token}&share_token={project_uuid}`
3. WHEN a Magic Link is generated, THE Client_Portal SHALL ensure the share_token corresponds to a valid project
4. THE Magic_Link SHALL be unique for each generation request

### Requirement 2: Client Authentication via Magic Link

**User Story:** As a client, I want to click a Magic Link and be automatically authenticated, so that I can access my project without manual login.

#### Acceptance Criteria

1. WHEN a client clicks a Magic Link, THE Client_Portal SHALL extract the magic token and share_token from the URL
2. WHEN the magic token is extracted, THE Client_Portal SHALL call Supabase_Auth signInWithOtp with the token
3. WHEN Supabase_Auth verifies the token, THE Supabase_Auth SHALL set an authentication cookie for the client
4. WHEN authentication succeeds, THE Client_Portal SHALL redirect the client to `/client/project/{share_token}`
5. IF the magic token is invalid or expired, THEN THE Client_Portal SHALL display an error message and prevent access

### Requirement 3: Project Data Access

**User Story:** As a client, I want to view my project information, so that I can track progress and see tasks.

#### Acceptance Criteria

1. WHEN a client accesses `/client/project/{share_token}`, THE Client_Portal SHALL fetch project data using the share_token
2. THE Client_Portal SHALL fetch project data from the projects table WHERE share_token matches the URL parameter
3. THE Client_Portal SHALL fetch associated milestones from the milestones table for the project
4. WHEN fetching data, THE RLS SHALL verify the client has access via the share_token
5. IF the share_token is invalid or the project does not exist, THEN THE Client_Portal SHALL display a "Project not found" error

### Requirement 4: Agency Theme Application

**User Story:** As a client, I want to see the project page styled in my agency's colors, so that the experience is branded and consistent.

#### Acceptance Criteria

1. WHEN the Project_Page loads, THE Client_Portal SHALL fetch the agency profile associated with the project
2. THE Client_Portal SHALL extract the color_theme field from the agency profile
3. WHEN the color_theme is retrieved, THE Client_Portal SHALL apply the theme to the page CSS variables
4. THE Agency_Theme SHALL be applied before rendering the project content
5. IF the agency profile has no color_theme defined, THEN THE Client_Portal SHALL use default theme colors

### Requirement 5: Read-Only Access Control

**User Story:** As a system, I want to ensure clients can only view project data, so that they cannot modify or delete information.

#### Acceptance Criteria

1. THE Client_Portal SHALL not display any edit, delete, or create controls to clients
2. WHEN a client attempts to modify data via API, THE RLS SHALL reject the request
3. THE Client_Portal SHALL only use SELECT queries for client data access
4. THE Client_Portal SHALL not expose any mutation endpoints to client sessions

### Requirement 6: Isolated Project Access

**User Story:** As a client, I want to see only my project, so that I cannot access other clients' projects.

#### Acceptance Criteria

1. WHEN a client is authenticated via Magic Link, THE Client_Portal SHALL restrict access to only the project associated with the share_token
2. THE RLS SHALL enforce that clients can only query projects WHERE share_token matches their access token
3. THE RLS SHALL enforce that clients can only query milestones for projects they have access to
4. IF a client attempts to access a different share_token, THEN THE Client_Portal SHALL deny access and return an error

### Requirement 7: Project Page Display

**User Story:** As a client, I want to see project details, tasks, and progress, so that I understand the current state of my project.

#### Acceptance Criteria

1. WHEN the Project_Page renders, THE Client_Portal SHALL display the project name
2. THE Project_Page SHALL display the project description
3. THE Project_Page SHALL display the project status
4. THE Project_Page SHALL display a list of milestones with their names, descriptions, statuses, and due dates
5. THE Project_Page SHALL display a progress indicator showing completed vs total milestones
6. THE Project_Page SHALL display the project creation date

### Requirement 8: Client Layout

**User Story:** As a client, I want a clean and focused interface, so that I can easily navigate and understand my project information.

#### Acceptance Criteria

1. THE Client_Portal SHALL use a dedicated client layout separate from the agency team layout
2. THE Client_Layout SHALL not display agency-specific navigation or controls
3. THE Client_Layout SHALL display the agency logo if available
4. THE Client_Layout SHALL apply the Agency_Theme to all UI components
5. THE Client_Layout SHALL be responsive and work on mobile devices

### Requirement 9: Error Handling

**User Story:** As a client, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN authentication fails, THE Client_Portal SHALL display a message indicating the Magic Link is invalid or expired
2. WHEN a project is not found, THE Client_Portal SHALL display a "Project not found" message
3. WHEN a network error occurs, THE Client_Portal SHALL display a "Connection error" message with retry option
4. WHEN the database is unavailable, THE Client_Portal SHALL display a "Service temporarily unavailable" message
5. THE Client_Portal SHALL log all errors for debugging purposes

### Requirement 10: Security and RLS Policies

**User Story:** As a system administrator, I want Row Level Security policies to protect client data, so that unauthorized access is prevented at the database level.

#### Acceptance Criteria

1. THE RLS SHALL allow SELECT access to projects table WHERE share_token is provided
2. THE RLS SHALL allow SELECT access to milestones table WHERE project_id matches an accessible project
3. THE RLS SHALL allow SELECT access to profiles table for public fields (agency_name, logo_url, color_theme)
4. THE RLS SHALL deny INSERT, UPDATE, and DELETE operations from client sessions
5. THE RLS SHALL enforce policies even if client-side code is bypassed

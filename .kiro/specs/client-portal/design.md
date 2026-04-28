# Design Document: Client Portal

## Overview

Клиентский портал для Agency Portal — это публичная часть приложения, которая позволяет клиентам агентства просматривать информацию о своих проектах без необходимости регистрации в системе. Клиенты получают доступ через Magic Link, который содержит токен авторизации Supabase и share_token проекта. После перехода по ссылке клиент автоматически авторизуется и видит страницу проекта с задачами, прогрессом и информацией, стилизованную в цветовой теме агентства.

Ключевые особенности:

- **Бесшовная авторизация**: Magic Link автоматически авторизует клиента через Supabase Auth
- **Изолированный доступ**: Клиент видит только один проект, к которому у него есть доступ
- **Брендинг агентства**: Динамическая загрузка цветовой темы из профиля агентства
- **Read-only режим**: Клиент не может редактировать данные, только просматривать
- **Масштабируемость**: Архитектура позволяет легко добавлять новые страницы и функции

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Agency Team"
        A[Team Member] -->|Generates| B[Magic Link]
    end

    subgraph "Client Side"
        C[Client] -->|Clicks| B
        B -->|Contains| D[Magic Link Token + share_token]
        D -->|Redirects to| E[/client/project/token]
    end

    subgraph "Supabase Auth"
        E -->|signInWithOtp| F[Supabase Auth]
        F -->|Auto Login| G[Client Session]
    end

    subgraph "Client Portal App"
        G -->|Loads| H[Client Layout]
        H -->|Fetches| I[Project Data]
        H -->|Fetches| J[Agency Theme]
        I -->|Displays| K[Project Page]
        J -->|Applies| K
    end

    subgraph "Database"
        I -.->|RLS: share_token| L[(projects)]
        I -.->|RLS: share_token| M[(milestones)]
        J -.->|RLS: public| N[(profiles)]
    end

    K -->|Read-only View| C
```

````

### Sequence Diagram: Client Authentication Flow

```mermaid
sequenceDiagram
    participant TM as Team Member
    participant CL as Client
    participant SA as Supabase Auth
    participant CP as Client Portal
    participant DB as Database

    TM->>TM: Generate Magic Link
    Note over TM: Link = /client/auth?<br/>token=magic_token&<br/>share_token=project_uuid

    TM->>CL: Send Magic Link (email/chat)

    CL->>CP: Click Magic Link
    CP->>SA: signInWithOtp(email, redirectTo)
    SA->>SA: Verify Magic Link Token
    SA->>CL: Set Auth Cookie
    SA->>CP: Redirect to /client/project/[share_token]

    CP->>DB: Fetch project by share_token
    DB-->>CP: Project + Milestones

    CP->>DB: Fetch agency profile (color_theme)
    DB-->>CP: Profile with color_theme

    CP->>CP: Apply agency theme
    CP->>CL: Display Project Page
````

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Magic Link Format Validation

_For any_ generated Magic Link, the URL SHALL match the format `/client/auth?token={magic_token}&share_token={project_uuid}` where both token and share_token are valid UUIDs.

**Validates: Requirements 1.2**

### Property 2: Magic Link Uniqueness

_For any_ project, generating multiple Magic Links SHALL produce unique magic tokens for each generation request.

**Validates: Requirements 1.4**

### Property 3: Magic Link Contains Valid Project

_For any_ generated Magic Link, the share_token SHALL correspond to an existing project in the database.

**Validates: Requirements 1.3**

### Property 4: URL Parameter Extraction

_For any_ valid Magic Link URL, parsing SHALL correctly extract both the magic_token and share_token parameters.

**Validates: Requirements 2.1**

### Property 5: Redirect URL Construction

_For any_ successful authentication with share_token, the redirect URL SHALL be `/client/project/{share_token}` where share_token matches the original parameter.

**Validates: Requirements 2.4**

### Property 6: Project Query Construction

_For any_ share_token provided in the URL, the database query SHALL include a WHERE clause filtering by share_token.

**Validates: Requirements 3.2**

### Property 7: Milestone Relationship Fetching

_For any_ project accessed via share_token, the system SHALL fetch all associated milestones from the milestones table.

**Validates: Requirements 3.3**

### Property 8: Agency Profile Fetching

_For any_ project loaded on the Project_Page, the system SHALL fetch the associated agency profile.

**Validates: Requirements 4.1**

### Property 9: Theme Extraction and Application

_For any_ agency profile with a color_theme field, the system SHALL extract the theme and apply it to CSS variables before rendering.

**Validates: Requirements 4.2, 4.3**

### Property 10: Read-Only UI Rendering

_For any_ client session, the rendered UI SHALL not contain any edit, delete, or create controls.

**Validates: Requirements 5.1**

### Property 11: Query Type Restriction

_For any_ database operation initiated by a client session, the query type SHALL be SELECT only.

**Validates: Requirements 5.3**

### Property 12: Project Access Isolation

_For any_ client authenticated with a specific share_token, access SHALL be restricted to only the project associated with that share_token.

**Validates: Requirements 6.1**

### Property 13: Project Field Display Completeness

_For any_ project rendered on the Project_Page, the display SHALL include the project name, description, status, and creation date.

**Validates: Requirements 7.1, 7.2, 7.3, 7.6**

### Property 14: Milestone Field Display Completeness

_For any_ milestone rendered on the Project_Page, the display SHALL include the milestone name, description, status, and due date.

**Validates: Requirements 7.4**

### Property 15: Progress Calculation Accuracy

_For any_ set of milestones, the progress indicator SHALL correctly calculate the ratio of completed milestones to total milestones.

**Validates: Requirements 7.5**

### Property 16: Layout Component Separation

_For any_ client portal route, the layout component used SHALL be the Client_Layout, not the agency team layout.

**Validates: Requirements 8.1**

### Property 17: Agency Navigation Exclusion

_For any_ client session, the rendered layout SHALL not contain agency-specific navigation elements.

**Validates: Requirements 8.2**

### Property 18: Conditional Logo Display

_For any_ agency profile, the logo SHALL be displayed if logo_url is present, and SHALL not be displayed if logo_url is null or empty.

**Validates: Requirements 8.3**

### Property 19: Theme Application to Components

_For any_ UI component in the Client_Layout, the component SHALL use CSS variables from the applied Agency_Theme.

**Validates: Requirements 8.4**

### Property 20: Error Logging Completeness

_For any_ error that occurs in the Client_Portal, the error SHALL be logged with sufficient context for debugging.

**Validates: Requirements 9.5**

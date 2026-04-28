# Implementation Plan: Client Portal

## Overview

Реализация клиентского портала для Agency Portal — публичной части приложения, которая позволяет клиентам просматривать информацию о своих проектах через Magic Link без регистрации. Система использует Supabase Auth для автоматической авторизации, RLS для изоляции данных, и динамическую загрузку брендинга агентства.

**Технологический стек:** TypeScript, Next.js 16 (App Router), React 19, RTK Query, Supabase, Tailwind CSS

**Архитектурный подход:** Feature-Sliced Design (FSD)

## Tasks

- [x] 1. Set up client portal routing structure and authentication flow
  - Create `/src/app/client/auth/page.tsx` route for Magic Link authentication
  - Create `/src/app/client/project/[share_token]/page.tsx` dynamic route for project display
  - Create `/src/app/client/layout.tsx` dedicated client layout (separate from agency layout)
  - _Requirements: 2.1, 2.4, 8.1_

- [-] 2. Implement Magic Link authentication handler
  - [x] 2.1 Create authentication page component
    - Extract `token` and `share_token` from URL query parameters
    - Call Supabase `signInWithOtp` with extracted token
    - Handle authentication success and redirect to `/client/project/[share_token]`
    - Handle authentication errors (invalid/expired token)
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 9.1_
  - [ ] 2.2 Write property test for URL parameter extraction
    - **Property 4: URL Parameter Extraction**
    - **Validates: Requirements 2.1**
  - [ ] 2.3 Write property test for redirect URL construction
    - **Property 5: Redirect URL Construction**
    - **Validates: Requirements 2.4**

- [-] 3. Create client portal data layer (RTK Query endpoints)
  - [x] 3.1 Add client portal endpoints to projectApi
    - Implement `getProjectByShareToken` query endpoint
    - Fetch project with associated milestones using share_token
    - Fetch agency profile with color_theme for the project
    - Handle "Project not found" errors
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 9.2_
  - [ ] 3.2 Write property test for project query construction
    - **Property 6: Project Query Construction**
    - **Validates: Requirements 3.2**
  - [ ] 3.3 Write property test for milestone relationship fetching
    - **Property 7: Milestone Relationship Fetching**
    - **Validates: Requirements 3.3**
  - [ ] 3.4 Write property test for agency profile fetching
    - **Property 8: Agency Profile Fetching**
    - **Validates: Requirements 4.1**

- [~] 4. Checkpoint - Ensure authentication and data fetching work
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Implement agency theme system
  - [x] 5.1 Create theme utility functions
    - Create `/src/shared/lib/theme/applyAgencyTheme.ts` utility
    - Extract color_theme from agency profile
    - Apply theme to CSS variables dynamically
    - Handle missing color_theme (use default theme)
    - _Requirements: 4.2, 4.3, 4.5_
  - [ ] 5.2 Write property test for theme extraction and application
    - **Property 9: Theme Extraction and Application**
    - **Validates: Requirements 4.2, 4.3**

- [-] 6. Build client layout component
  - [x] 6.1 Create Client_Layout component
    - Create `/src/widgets/client-layout/ClientLayout.tsx`
    - Display agency logo if logo_url is present
    - Apply agency theme to all UI components
    - Exclude agency-specific navigation elements
    - Make layout responsive for mobile devices
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ] 6.2 Write property test for layout component separation
    - **Property 16: Layout Component Separation**
    - **Validates: Requirements 8.1**
  - [ ] 6.3 Write property test for agency navigation exclusion
    - **Property 17: Agency Navigation Exclusion**
    - **Validates: Requirements 8.2**
  - [ ] 6.4 Write property test for conditional logo display
    - **Property 18: Conditional Logo Display**
    - **Validates: Requirements 8.3**

- [-] 7. Implement project page display
  - [x] 7.1 Create Project_Page component
    - Create `/src/page/client-project/ClientProjectPage.tsx`
    - Display project name, description, status, creation date
    - Display list of milestones with name, description, status, due date
    - Calculate and display progress indicator (completed/total milestones)
    - Apply read-only styling (no edit/delete/create controls)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 5.1_
  - [ ] 7.2 Write property test for project field display completeness
    - **Property 13: Project Field Display Completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.6**
  - [ ] 7.3 Write property test for milestone field display completeness
    - **Property 14: Milestone Field Display Completeness**
    - **Validates: Requirements 7.4**
  - [ ] 7.4 Write property test for progress calculation accuracy
    - **Property 15: Progress Calculation Accuracy**
    - **Validates: Requirements 7.5**
  - [ ] 7.5 Write property test for read-only UI rendering
    - **Property 10: Read-Only UI Rendering**
    - **Validates: Requirements 5.1**

- [~] 8. Checkpoint - Ensure UI rendering and theming work
  - Ensure all tests pass, ask the user if questions arise.

- [-] 9. Implement error handling and user feedback
  - [x] 9.1 Create error boundary components
    - Create error components for authentication failures
    - Create error component for "Project not found"
    - Create error component for network errors with retry option
    - Create error component for "Service temporarily unavailable"
    - Add error logging for debugging
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ] 9.2 Write property test for error logging completeness
    - **Property 20: Error Logging Completeness**
    - **Validates: Requirements 9.5**

- [-] 10. Implement Magic Link generation feature (agency side)
  - [x] 10.1 Create Magic Link generation utility
    - Create `/src/features/share-access/lib/generateMagicLink.ts`
    - Generate Supabase Magic Link token
    - Construct URL with format `/client/auth?token={magic_token}&share_token={project_uuid}`
    - Ensure share_token corresponds to valid project
    - Generate unique tokens for each request
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 10.2 Write property test for Magic Link format validation
    - **Property 1: Magic Link Format Validation**
    - **Validates: Requirements 1.2**
  - [ ] 10.3 Write property test for Magic Link uniqueness
    - **Property 2: Magic Link Uniqueness**
    - **Validates: Requirements 1.4**
  - [ ] 10.4 Write property test for Magic Link contains valid project
    - **Property 3: Magic Link Contains Valid Project**
    - **Validates: Requirements 1.3**

- [-] 11. Create Magic Link UI component (agency side)
  - [x] 11.1 Create share access modal component
    - Create `/src/features/share-access/ui/ShareAccessModal.tsx`
    - Add button to generate Magic Link for project
    - Display generated Magic Link with copy-to-clipboard functionality
    - Show success/error feedback
    - _Requirements: 1.1_

- [-] 12. Implement Row Level Security (RLS) policies
  - [x] 12.1 Create RLS migration for client portal
    - Create Supabase migration file for RLS policies
    - Add SELECT policy for projects table WHERE share_token is provided
    - Add SELECT policy for milestones table WHERE project_id matches accessible project
    - Add SELECT policy for profiles table for public fields (agency_name, logo_url, color_theme)
    - Deny INSERT, UPDATE, DELETE operations from client sessions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 5.2, 5.3, 6.2, 6.3, 6.4_
  - [ ] 12.2 Write property test for project access isolation
    - **Property 12: Project Access Isolation**
    - **Validates: Requirements 6.1**
  - [ ] 12.3 Write property test for query type restriction
    - **Property 11: Query Type Restriction**
    - **Validates: Requirements 5.3**

- [-] 13. Wire components together and integrate into app
  - [x] 13.1 Connect authentication flow to project page
    - Wire Magic Link authentication to redirect flow
    - Connect RTK Query endpoints to page components
    - Apply agency theme on layout mount
    - Ensure error boundaries wrap all client routes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 4.4_
  - [ ] 13.2 Write integration tests for end-to-end flow
    - Test Magic Link click → authentication → project display
    - Test theme application on page load
    - Test error handling for invalid tokens
    - Test error handling for missing projects
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 4.4, 9.1, 9.2_

- [~] 14. Final checkpoint - Ensure all tests pass and feature is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests and integration tests validate specific examples and edge cases
- All implementation follows Feature-Sliced Design (FSD) architecture
- RTK Query is used for data fetching with automatic cache invalidation
- Supabase RLS policies provide database-level security enforcement

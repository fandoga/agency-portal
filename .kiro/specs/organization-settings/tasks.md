# Implementation Plan: Organization Settings Feature

## Overview

This implementation plan creates a dedicated organization settings page where agency owners can customize their organization's branding (name, color theme, and logo). The feature follows the Feature-Sliced Design (FSD) architecture and integrates with existing Agency Portal systems using TypeScript, React 19, Next.js 16, RTK Query, and Supabase.

**Key Implementation Areas:**

- Database schema extension (color_theme column)
- New Next.js page route with authentication/authorization guards
- Form component with real-time validation
- Logo upload to Supabase Storage
- RTK Query mutation with optimistic updates
- Navigation update in existing settings widget

## Tasks

- [x] 1. Database schema extension and Supabase Storage setup
  - Create migration to add `color_theme` column to `profiles` table (TEXT, nullable)
  - Add CHECK constraint for hex color validation (#RGB or #RRGGBB format)
  - Create Supabase Storage bucket named `logos` with public access
  - Configure bucket settings: 2MB file size limit, allowed MIME types (image/png, image/jpeg, image/svg+xml, image/webp)
  - Set up RLS policies for storage bucket (authenticated users can upload, public can read)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.4, 6.5_

- [x] 2. Update TypeScript types for Profile entity
  - [x] 2.1 Add `color_theme` field to Profile interface in `src/entities/profile/lib/types.ts`
    - Add as optional field: `color_theme?: string | null`
    - _Requirements: 1.5_
  - [x] 2.2 Create UpdateOrganizationSettingsInput type
    - Define interface with profileId, agency_name, color_theme, logo_url fields
    - All fields except profileId should be optional
    - _Requirements: 7.2_

- [x] 3. Implement Profile API mutation for organization settings
  - [x] 3.1 Add `updateOrganizationSettings` mutation to profileApi in `src/entities/profile/api/profileApi.ts`
    - Implement queryFn with authentication check using `supabase.auth.getUser()`
    - Build update object with only provided fields (partial update)
    - Execute Supabase update query with `.eq("id", profileId).select().single()`
    - Return updated profile data or error
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_
  - [x] 3.2 Add cache invalidation to mutation
    - Invalidate Profile cache tags on success: `[{ type: "Profile", id: profileId }, "Profile"]`
    - _Requirements: 7.5_
  - [x] 3.3 Implement optimistic update in onQueryStarted
    - Use `dispatch(profileApi.util.updateQueryData())` to update cache immediately
    - Apply patch to matching profile in getAgency query
    - Implement undo logic on mutation failure
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 4. Create logo upload utility function
  - [x] 4.1 Create `src/features/organization-settings/lib/uploadLogo.ts`
    - Implement file validation (type and size checks)
    - Generate unique filename: `${agencyId}_${Date.now()}.${ext}`
    - Upload to Supabase Storage `logos` bucket with cacheControl: "3600"
    - Return public URL on success
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 4.2 Create validation helper functions
    - `validateFile(file: File)`: Check MIME type and file size
    - `validateColorTheme(value: string)`: Validate hex format with regex
    - `validateLogoUrl(value: string)`: Validate URL format
    - `validateAgencyName(value: string)`: Check length (2-100 chars) and non-empty after trim
    - _Requirements: 3.3, 3.4, 4.3, 5.3, 6.2, 6.3, 9.1_

- [x] 5. Create LogoUploadField component
  - [x] 5.1 Implement `src/features/organization-settings/ui/LogoUploadField.tsx`
    - Create component with file input, upload button, and progress indicator
    - Implement state management for upload progress and errors
    - Handle file selection and validation
    - Call uploadLogo utility on file selection
    - Display upload progress during upload
    - Call onUploadComplete callback with public URL on success
    - Display error message on failure
    - _Requirements: 6.1, 6.2, 6.3, 6.7, 6.8_
  - [x] 5.2 Add accessibility features to LogoUploadField
    - Add ARIA labels for file input and upload button
    - Ensure keyboard navigation support
    - Add screen reader announcements for upload status
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 6. Create OrganizationSettingsForm component
  - [x] 6.1 Implement `src/features/organization-settings/ui/OrganizationSettingsForm.tsx`
    - Create form component with state management for all fields
    - Pre-populate form fields with current agency data
    - Implement controlled inputs for agency_name, color_theme, logo_url
    - Add form state: data, errors, isSubmitting, isDirty
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 5.1, 5.2_
  - [x] 6.2 Implement real-time field validation
    - Add onChange handlers with inline validation for each field
    - Display validation errors below each field
    - Use validation helper functions from step 4.2
    - _Requirements: 3.3, 3.4, 4.3, 5.3, 9.1, 9.2_
  - [x] 6.3 Implement form submission logic
    - Create handleSubmit function that validates all fields
    - Call updateOrganizationSettings mutation with form data
    - Disable submit button during submission and when validation errors exist
    - Display success notification on successful update
    - Display error notification on failure with retry option
    - Focus first invalid field on validation failure
    - _Requirements: 3.5, 3.6, 3.7, 4.5, 4.6, 5.5, 5.6, 7.7, 9.2, 9.3, 9.4, 9.5, 9.6, 11.4_
  - [x] 6.4 Add color picker with preview
    - Integrate color input with type="color"
    - Display visual preview of selected color
    - Show default color option when no theme is set
    - Handle clearing color theme (set to null)
    - _Requirements: 4.1, 4.2, 4.4, 4.6, 4.7_
  - [x] 6.5 Add logo preview functionality
    - Display current logo image when logo_url is valid
    - Show placeholder image when URL is invalid or image fails to load
    - Update preview when logo_url changes or file is uploaded
    - _Requirements: 5.4, 5.7_
  - [x] 6.6 Integrate LogoUploadField component
    - Add LogoUploadField to form
    - Handle onUploadComplete to populate logo_url field
    - Handle onUploadError to display error message
    - _Requirements: 6.6, 6.7_
  - [x] 6.7 Add accessibility features to form
    - Ensure all inputs have proper labels and ARIA attributes
    - Make color picker keyboard accessible (arrow keys)
    - Announce validation errors to screen readers
    - Announce success/error notifications to screen readers
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6_

- [x] 7. Create OrganizationSettingsWidget component
  - [x] 7.1 Implement `src/widgets/organization-settings/OrganizationSettingsWidget.tsx`
    - Create composite widget component with Card layout
    - Add CardHeader with title "Настройки организации" and description
    - Add Separator between header and content
    - Render OrganizationSettingsForm in CardContent
    - Add ErrorBoundary for error handling
    - _Requirements: 2.6_

- [x] 8. Create OrganizationSettingsPage route
  - [x] 8.1 Implement `src/app/settings/organization-settings/page.tsx`
    - Create async page component with `await connection()` for Next.js 16
    - Add Suspense boundary with loading fallback
    - _Requirements: 2.1_
  - [x] 8.2 Create OrganizationSettingsContent component
    - Implement authentication guard using useAuth hook
    - Redirect to /auth if user not authenticated
    - Fetch organization data using useGetAgencyData hook
    - Display loading state while fetching data
    - _Requirements: 2.2, 2.3, 2.5_
  - [x] 8.3 Implement authorization guard
    - Check if current user has 'owner' role using agency_members data
    - Display access denied message for non-owner users
    - Include "Вернуться на главную" button in access denied UI
    - _Requirements: 2.4, 10.2, 10.3, 10.4_
  - [x] 8.4 Render OrganizationSettingsWidget for authorized owners
    - Pass agency data as props to widget
    - Preserve agency_id query parameter in URL
    - _Requirements: 2.2, 2.6_

- [x] 9. Update Settings Widget navigation
  - [x] 9.1 Update `src/widgets/agency-settings/AgencySettings.tsx`
    - Change "Настройки организации" button onClick handler
    - Update route from `/settings/agency-settings` to `/settings/organization-settings`
    - Ensure useRedirectParams hook is used to preserve agency_id query parameter
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10. Checkpoint - Test core functionality
  - Verify database migration applied successfully
  - Test authentication and authorization guards
  - Test form validation for all fields
  - Test logo upload to Supabase Storage
  - Test form submission with optimistic updates
  - Ensure all tests pass, ask the user if questions arise

- [x] 11. Add responsive design and mobile support
  - [x] 11.1 Make OrganizationSettingsForm responsive
    - Add responsive layout using Tailwind CSS breakpoints
    - Ensure form is usable on 320px minimum width (mobile)
    - Test on tablet (768px) and desktop (1024px+) widths
    - _Requirements: 12.5_
  - [x] 11.2 Optimize logo preview for different screen sizes
    - Scale logo preview appropriately for mobile/tablet/desktop
    - Ensure color picker is usable on touch devices
    - _Requirements: 12.5_

- [x] 12. Add error handling and user feedback
  - [x] 12.1 Implement network error handling
    - Detect network errors in mutation
    - Display toast notification with retry option
    - _Requirements: 9.5_
  - [x] 12.2 Implement RLS error handling
    - Detect permission denied errors (code 42501)
    - Display clear error message about insufficient permissions
    - _Requirements: 7.7, 10.5_
  - [x] 12.3 Add loading states
    - Display spinner on submit button during submission
    - Show loading state during data fetch
    - Display upload progress during file upload
    - _Requirements: 2.5, 6.8, 9.6_

- [x] 13. Final checkpoint - End-to-end testing
  - Test complete user flow: navigate to page → update fields → submit → verify changes
  - Test error scenarios: invalid inputs, network failures, permission denied
  - Test optimistic updates: verify immediate UI feedback and rollback on failure
  - Verify RLS policies prevent non-owners from updating settings
  - Test accessibility: keyboard navigation, screen reader announcements
  - Test responsive design on mobile, tablet, and desktop
  - Ensure all tests pass, ask the user if questions arise

## Notes

- This feature follows the existing FSD architecture pattern used in the Agency Portal
- All components use TypeScript for type safety
- RTK Query handles caching and optimistic updates automatically
- Supabase RLS policies provide database-level security
- The design document does not include a "Correctness Properties" section, so property-based tests are not applicable
- Focus on integration tests and manual testing for UI interactions and external service integrations
- All user-facing text is in Russian to match the application language
- The feature integrates with existing authentication, routing, and state management systems

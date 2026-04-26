# Requirements Document

## Introduction

The Organization Settings feature enables agency owners to customize their organization's branding and identity within the Agency Portal application. This feature provides a dedicated interface for managing organization name, color theme, and logo, ensuring consistent branding across the platform. Currently, the "Настройки организации" (Organization Settings) button in the AgencySettings widget navigates to a team management page. This feature will create a proper organization customization page and update the navigation accordingly.

## Glossary

- **Agency_Portal**: The B2C SaaS application for marketing agencies to communicate with clients
- **Organization**: A marketing agency using the Agency Portal (stored in the `profiles` table)
- **Organization_Settings_Page**: The new page for customizing organization branding and identity
- **Settings_Widget**: The AgencySettings widget containing navigation buttons for various settings
- **Profile_API**: The RTK Query API for managing organization profile data
- **Color_Theme**: A hexadecimal color value representing the organization's brand color
- **Logo_URL**: A URL pointing to the organization's logo image stored in Supabase Storage
- **Owner**: A user with the 'owner' role who has full permissions to modify organization settings
- **RLS**: Row Level Security policies in PostgreSQL that enforce access control

## Requirements

### Requirement 1: Database Schema Extension

**User Story:** As a developer, I want to extend the profiles table with a color_theme field, so that organizations can store their brand color preferences.

#### Acceptance Criteria

1. THE Database_Migration SHALL add a `color_theme` column to the `profiles` table with type TEXT
2. THE Database_Migration SHALL set the `color_theme` column as nullable to support existing records
3. THE Database_Migration SHALL add a CHECK constraint to validate hexadecimal color format (e.g., #FFFFFF or #FFF)
4. WHEN the migration is applied, THE Database SHALL preserve all existing profile records without data loss
5. THE Profile_Type_Definition SHALL include the `color_theme` field as an optional string property

### Requirement 2: Organization Settings Page Creation

**User Story:** As an agency owner, I want to access a dedicated organization settings page, so that I can customize my organization's branding in one place.

#### Acceptance Criteria

1. THE Organization_Settings_Page SHALL be accessible at the route `/settings/organization-settings`
2. THE Organization_Settings_Page SHALL preserve the `agency_id` query parameter from the URL
3. WHEN a non-authenticated user attempts to access the page, THE Application SHALL redirect to `/auth`
4. WHEN a user without owner role attempts to access the page, THE Organization_Settings_Page SHALL display an access denied message
5. THE Organization_Settings_Page SHALL display a loading state while fetching organization data
6. THE Organization_Settings_Page SHALL display the current organization name, color theme, and logo URL

### Requirement 3: Organization Name Management

**User Story:** As an agency owner, I want to change my organization name, so that I can rebrand or correct naming errors.

#### Acceptance Criteria

1. THE Organization_Settings_Form SHALL display an input field for the organization name
2. THE Organization_Settings_Form SHALL pre-populate the input field with the current `agency_name` value
3. THE Organization_Settings_Form SHALL validate that the organization name is not empty
4. THE Organization_Settings_Form SHALL validate that the organization name is between 2 and 100 characters
5. WHEN the organization name is updated, THE Profile_API SHALL persist the change to the `profiles` table
6. WHEN the update succeeds, THE Organization_Settings_Page SHALL display a success notification
7. WHEN the update fails, THE Organization_Settings_Page SHALL display an error message with failure details

### Requirement 4: Color Theme Management

**User Story:** As an agency owner, I want to select a color theme for my organization, so that my brand colors are reflected in the portal.

#### Acceptance Criteria

1. THE Organization_Settings_Form SHALL display a color picker input for the color theme
2. THE Organization_Settings_Form SHALL pre-populate the color picker with the current `color_theme` value
3. THE Organization_Settings_Form SHALL validate that the color value is in hexadecimal format (#RRGGBB or #RGB)
4. THE Organization_Settings_Form SHALL provide a visual preview of the selected color
5. WHEN the color theme is updated, THE Profile_API SHALL persist the change to the `profiles` table
6. WHEN the color theme field is cleared, THE Profile_API SHALL store NULL in the database
7. THE Organization_Settings_Form SHALL display a default color option when no color theme is set

### Requirement 5: Logo URL Management

**User Story:** As an agency owner, I want to update my organization logo, so that my branding is visible to clients and team members.

#### Acceptance Criteria

1. THE Organization_Settings_Form SHALL display an input field for the logo URL
2. THE Organization_Settings_Form SHALL pre-populate the input field with the current `logo_url` value
3. THE Organization_Settings_Form SHALL validate that the logo URL is a valid URL format when provided
4. THE Organization_Settings_Form SHALL display a preview of the logo image when a valid URL is provided
5. WHEN the logo URL is updated, THE Profile_API SHALL persist the change to the `profiles` table
6. WHEN the logo URL field is cleared, THE Profile_API SHALL store an empty string in the database
7. IF the logo URL is invalid or the image fails to load, THE Organization_Settings_Form SHALL display a placeholder image

### Requirement 6: Logo File Upload Support

**User Story:** As an agency owner, I want to upload a logo file directly, so that I don't need to host the image externally.

#### Acceptance Criteria

1. THE Organization_Settings_Form SHALL provide a file upload button for logo images
2. THE Organization_Settings_Form SHALL validate that uploaded files are image types (PNG, JPG, JPEG, SVG, WEBP)
3. THE Organization_Settings_Form SHALL validate that uploaded files are smaller than 2MB
4. WHEN a file is selected, THE Upload_Handler SHALL upload the file to Supabase Storage in the `logos` bucket
5. WHEN the upload succeeds, THE Upload_Handler SHALL generate a public URL for the uploaded file
6. WHEN the upload succeeds, THE Organization_Settings_Form SHALL populate the logo URL field with the generated URL
7. WHEN the upload fails, THE Organization_Settings_Form SHALL display an error message with failure details
8. THE Organization_Settings_Form SHALL display upload progress during file upload

### Requirement 7: Profile API Update Mutation

**User Story:** As a developer, I want an RTK Query mutation for updating organization settings, so that changes are persisted to the database with proper cache invalidation.

#### Acceptance Criteria

1. THE Profile_API SHALL provide an `updateOrganizationSettings` mutation endpoint
2. THE Update_Mutation SHALL accept parameters: `profileId`, `agency_name`, `color_theme`, and `logo_url`
3. THE Update_Mutation SHALL verify the current user is authenticated before executing
4. THE Update_Mutation SHALL update only the provided fields in the `profiles` table
5. WHEN the update succeeds, THE Update_Mutation SHALL invalidate the `Profile` cache tag
6. WHEN the update succeeds, THE Update_Mutation SHALL return the updated profile data
7. WHEN the update fails due to RLS policies, THE Update_Mutation SHALL return a permission denied error

### Requirement 8: Settings Widget Navigation Update

**User Story:** As an agency owner, I want the "Настройки организации" button to navigate to the organization settings page, so that I can access organization customization features.

#### Acceptance Criteria

1. THE Settings_Widget SHALL update the "Настройки организации" button click handler
2. WHEN the "Настройки организации" button is clicked, THE Settings_Widget SHALL navigate to `/settings/organization-settings`
3. THE Settings_Widget SHALL preserve the `agency_id` query parameter during navigation
4. THE Settings_Widget SHALL use the `useRedirectParams` hook for navigation to maintain query parameters

### Requirement 9: Form Validation and Error Handling

**User Story:** As an agency owner, I want clear validation feedback, so that I understand what needs to be corrected before saving.

#### Acceptance Criteria

1. THE Organization_Settings_Form SHALL display inline validation errors for each field
2. THE Organization_Settings_Form SHALL disable the submit button while validation errors exist
3. THE Organization_Settings_Form SHALL disable the submit button during submission
4. WHEN validation fails, THE Organization_Settings_Form SHALL focus the first invalid field
5. WHEN a network error occurs, THE Organization_Settings_Form SHALL display a retry option
6. THE Organization_Settings_Form SHALL display a loading spinner on the submit button during submission

### Requirement 10: Row Level Security Verification

**User Story:** As a security engineer, I want to verify RLS policies allow only owners to update organization settings, so that unauthorized users cannot modify organization data.

#### Acceptance Criteria

1. THE RLS_Policy SHALL allow SELECT operations on `profiles` for users who are members of the organization
2. THE RLS_Policy SHALL allow UPDATE operations on `profiles` only for users with the 'owner' role
3. WHEN a non-owner attempts to update organization settings, THE Database SHALL reject the operation
4. WHEN a non-member attempts to view organization settings, THE Database SHALL reject the operation
5. THE Update_Mutation SHALL return a clear error message when RLS policies block the operation

### Requirement 11: Optimistic UI Updates

**User Story:** As an agency owner, I want immediate visual feedback when I save changes, so that the interface feels responsive.

#### Acceptance Criteria

1. WHEN the form is submitted, THE Organization_Settings_Form SHALL immediately update the displayed values
2. WHEN the mutation succeeds, THE Organization_Settings_Form SHALL retain the optimistic updates
3. WHEN the mutation fails, THE Organization_Settings_Form SHALL revert to the previous values
4. WHEN the mutation fails, THE Organization_Settings_Form SHALL display an error notification
5. THE Organization_Settings_Form SHALL use RTK Query's optimistic update feature for cache updates

### Requirement 12: Accessibility and Responsive Design

**User Story:** As a user with accessibility needs, I want the organization settings page to be keyboard navigable and screen reader friendly, so that I can customize my organization settings independently.

#### Acceptance Criteria

1. THE Organization_Settings_Form SHALL be fully keyboard navigable using Tab and Enter keys
2. THE Organization_Settings_Form SHALL provide proper ARIA labels for all form inputs
3. THE Organization_Settings_Form SHALL announce validation errors to screen readers
4. THE Organization_Settings_Form SHALL announce success and error notifications to screen readers
5. THE Organization_Settings_Page SHALL be responsive and usable on mobile devices (320px minimum width)
6. THE Color_Picker SHALL be accessible via keyboard with arrow keys for color adjustment

# Design Document: Organization Settings Feature

## Overview

The Organization Settings feature enables agency owners to customize their organization's branding and identity within the Agency Portal application. This feature provides a dedicated settings page where owners can manage organization name, color theme, and logo through a form interface with real-time validation and optimistic updates.

### Key Capabilities

- **Organization Name Management**: Update agency name with validation (2-100 characters)
- **Color Theme Customization**: Select brand colors using a color picker with hex validation
- **Logo Management**: Upload logo files to Supabase Storage or provide external URLs
- **Real-time Validation**: Inline validation feedback with accessibility support
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on failure
- **Role-based Access**: Owner-only access enforced at UI and database levels

### Design Goals

1. **User Experience**: Provide immediate visual feedback and clear validation messages
2. **Security**: Enforce owner-only access through RLS policies and UI guards
3. **Performance**: Use optimistic updates and efficient cache invalidation
4. **Accessibility**: Full keyboard navigation and screen reader support
5. **Maintainability**: Follow FSD architecture and existing codebase patterns

## Architecture

### System Context

The Organization Settings feature integrates with existing Agency Portal systems:

```
┌─────────────────────────────────────────────────────────────┐
│                     Agency Portal                            │
│                                                              │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │   Settings   │─────▶│  Organization   │                 │
│  │    Widget    │      │  Settings Page  │                 │
│  └──────────────┘      └────────┬────────┘                 │
│                                  │                           │
│                                  ▼                           │
│                        ┌─────────────────┐                  │
│                        │  Profile API    │                  │
│                        │  (RTK Query)    │                  │
│                        └────────┬────────┘                  │
│                                  │                           │
│                                  ▼                           │
│                        ┌─────────────────┐                  │
│                        │  Supabase       │                  │
│                        │  - profiles DB  │                  │
│                        │  - Storage      │                  │
│                        │  - RLS          │                  │
│                        └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 19.2.4, Next.js 16.2.0 (App Router), TypeScript 5.x
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: shadcn/ui with Tailwind CSS 4.x
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Validation**: Client-side validation with HTML5 constraints
- **File Upload**: Supabase Storage with public bucket access

### Architecture Patterns

**Feature-Sliced Design (FSD)**:

- **Page Layer**: `/settings/organization-settings` route handler
- **Widget Layer**: OrganizationSettingsWidget (composite component)
- **Feature Layer**: OrganizationSettingsForm (form logic and validation)
- **Entity Layer**: Profile API extensions (mutations and types)
- **Shared Layer**: Hooks, utilities, UI components

**Data Flow**:

1. User navigates to organization settings page
2. Page fetches current profile data via RTK Query
3. Form displays with pre-populated values
4. User modifies fields with real-time validation
5. On submit, optimistic update applied to UI
6. Mutation sent to Supabase with RLS enforcement
7. On success, cache invalidated and data refetched
8. On failure, UI reverted and error displayed

## Components and Interfaces

### Component Hierarchy

```
OrganizationSettingsPage (app/settings/organization-settings/page.tsx)
  └─ OrganizationSettingsWidget (widgets/organization-settings/)
      ├─ SettingsHeader (displays org name and breadcrumb)
      ├─ OrganizationSettingsForm (features/organization-settings/)
      │   ├─ NameField (Input + validation)
      │   ├─ ColorThemeField (Color picker + preview)
      │   ├─ LogoUrlField (Input + preview)
      │   ├─ LogoUploadField (File input + progress)
      │   └─ SubmitButton (with loading state)
      └─ ErrorBoundary (error handling)
```

### Component Specifications

#### 1. OrganizationSettingsPage

**Location**: `src/app/settings/organization-settings/page.tsx`

**Responsibilities**:

- Route handler for `/settings/organization-settings`
- Authentication guard (redirect to `/auth` if not authenticated)
- Authorization guard (display access denied for non-owners)
- Fetch organization data via `useGetAgencyData` hook
- Preserve `agency_id` query parameter
- Display loading state during data fetch

**Props**: None (uses URL params and hooks)

**State**:

- Derived from `useAuth()` and `useGetAgencyData()`

**Example Structure**:

```typescript
export default async function OrganizationSettingsPage() {
  await connection(); // Next.js 16 requirement

  return (
    <Suspense fallback={<Loading />}>
      <OrganizationSettingsContent />
    </Suspense>
  );
}

function OrganizationSettingsContent() {
  const { session } = useAuth();
  const { session: agency, isLoading } = useGetAgencyData();

  if (!session) redirect("/auth");
  if (isLoading) return <Loading />;
  if (!isOwner(agency)) return <AccessDenied />;

  return <OrganizationSettingsWidget agency={agency} />;
}
```

#### 2. OrganizationSettingsWidget

**Location**: `src/widgets/organization-settings/OrganizationSettingsWidget.tsx`

**Responsibilities**:

- Composite component for organization settings UI
- Layout and spacing management
- Error boundary for form errors

**Props**:

```typescript
interface OrganizationSettingsWidgetProps {
  agency: Profile;
}
```

**Structure**:

```typescript
<Card>
  <CardHeader>
    <h1>Настройки организации</h1>
    <p>Управление брендингом и идентичностью</p>
  </CardHeader>
  <Separator />
  <CardContent>
    <OrganizationSettingsForm agency={agency} />
  </CardContent>
</Card>
```

#### 3. OrganizationSettingsForm

**Location**: `src/features/organization-settings/ui/OrganizationSettingsForm.tsx`

**Responsibilities**:

- Form state management
- Field validation
- Optimistic updates
- Error handling
- Submit logic

**Props**:

```typescript
interface OrganizationSettingsFormProps {
  agency: Profile;
}
```

**State**:

```typescript
interface FormState {
  agency_name: string;
  color_theme: string | null;
  logo_url: string;
  isSubmitting: boolean;
  errors: {
    agency_name?: string;
    color_theme?: string;
    logo_url?: string;
  };
}
```

**Validation Rules**:

- `agency_name`: Required, 2-100 characters, non-empty after trim
- `color_theme`: Optional, hex format (#RGB or #RRGGBB), regex: `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/`
- `logo_url`: Optional, valid URL format when provided

**Methods**:

- `validateField(field, value)`: Validate single field
- `validateForm()`: Validate all fields
- `handleSubmit()`: Submit with optimistic update
- `handleUpload(file)`: Upload logo to Supabase Storage

#### 4. LogoUploadField

**Location**: `src/features/organization-settings/ui/LogoUploadField.tsx`

**Responsibilities**:

- File input handling
- File type and size validation
- Upload progress display
- Supabase Storage integration

**Props**:

```typescript
interface LogoUploadFieldProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}
```

**State**:

```typescript
interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}
```

**Validation**:

- Allowed types: PNG, JPG, JPEG, SVG, WEBP
- Max size: 2MB
- MIME type check: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`

**Upload Flow**:

1. User selects file
2. Validate file type and size
3. Generate unique filename: `${agency_id}_${timestamp}.${ext}`
4. Upload to Supabase Storage bucket `logos`
5. Get public URL
6. Call `onUploadComplete(url)`

### API Interfaces

#### Profile API Extension

**Location**: `src/entities/profile/api/profileApi.ts`

**New Endpoint**:

```typescript
updateOrganizationSettings: build.mutation<
  Profile,
  UpdateOrganizationSettingsInput
>({
  queryFn: async ({ profileId, agency_name, color_theme, logo_url }) => {
    // 1. Verify authentication
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return { error: userErr };

    // 2. Build update object (only provided fields)
    const updates: Partial<Profile> = {};
    if (agency_name !== undefined) updates.agency_name = agency_name;
    if (color_theme !== undefined) updates.color_theme = color_theme;
    if (logo_url !== undefined) updates.logo_url = logo_url;

    // 3. Update profile
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profileId)
      .select()
      .single();

    if (error) return { error };
    return { data };
  },
  invalidatesTags: (result, error, { profileId }) =>
    result ? [{ type: "Profile", id: profileId }, "Profile"] : [],
  // Optimistic update
  async onQueryStarted({ profileId, ...patch }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      profileApi.util.updateQueryData("getAgency", undefined, (draft) => {
        const profile = draft.find((p) => p.id === profileId);
        if (profile) {
          Object.assign(profile, patch);
        }
      }),
    );
    try {
      await queryFulfilled;
    } catch {
      patchResult.undo();
    }
  },
});
```

**Type Definitions**:

```typescript
interface UpdateOrganizationSettingsInput {
  profileId: string;
  agency_name?: string;
  color_theme?: string | null;
  logo_url?: string;
}
```

### Supabase Storage Configuration

**Bucket**: `logos`

**Configuration**:

```typescript
{
  name: "logos",
  public: true,
  fileSizeLimit: 2097152, // 2MB
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "image/webp"
  ]
}
```

**Upload Function**:

```typescript
async function uploadLogo(file: File, agencyId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${agencyId}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from("logos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("logos").getPublicUrl(filePath);

  return publicUrl;
}
```

## Data Models

### Database Schema Extension

**Migration**: `add_color_theme_to_profiles`

```sql
-- Add color_theme column
ALTER TABLE profiles
ADD COLUMN color_theme TEXT;

-- Add CHECK constraint for hex color validation
ALTER TABLE profiles
ADD CONSTRAINT color_theme_hex_format
CHECK (
  color_theme IS NULL OR
  color_theme ~ '^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$'
);

-- Add comment
COMMENT ON COLUMN profiles.color_theme IS 'Organization brand color in hex format (#RGB or #RRGGBB)';
```

### TypeScript Type Updates

**Profile Type Extension**:

```typescript
// src/entities/profile/lib/types.ts

export interface Profile {
  id: string;
  user_id: string;
  agency_name: string;
  website_url: string;
  logo_url: string;
  color_theme?: string | null; // NEW
  updated_at: string;
}

export interface UpdateOrganizationSettingsInput {
  profileId: string;
  agency_name?: string;
  color_theme?: string | null;
  logo_url?: string;
}
```

### Form Data Model

```typescript
interface OrganizationSettingsFormData {
  agency_name: string;
  color_theme: string;
  logo_url: string;
}

interface OrganizationSettingsFormErrors {
  agency_name?: string;
  color_theme?: string;
  logo_url?: string;
  _form?: string; // General form error
}

interface OrganizationSettingsFormState {
  data: OrganizationSettingsFormData;
  errors: OrganizationSettingsFormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}
```

### Validation Schema

```typescript
const validationRules = {
  agency_name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    validate: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) return "Минимум 2 символа";
      if (trimmed.length > 100) return "Максимум 100 символов";
      return null;
    },
  },
  color_theme: {
    required: false,
    pattern: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
    validate: (value: string) => {
      if (!value) return null; // Optional field
      if (!value.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)) {
        return "Неверный формат цвета (используйте #RGB или #RRGGBB)";
      }
      return null;
    },
  },
  logo_url: {
    required: false,
    validate: (value: string) => {
      if (!value) return null; // Optional field
      try {
        new URL(value);
        return null;
      } catch {
        return "Неверный формат URL";
      }
    },
  },
};
```

## Error Handling

### Error Categories

1. **Validation Errors**: Client-side field validation failures
2. **Authentication Errors**: User not authenticated
3. **Authorization Errors**: User not owner of organization
4. **Network Errors**: Failed API requests
5. **RLS Errors**: Database permission denied
6. **Upload Errors**: File upload failures

### Error Handling Strategy

#### 1. Validation Errors

**Display**: Inline below each field
**Recovery**: User corrects input
**Example**:

```typescript
{
  agency_name: "Минимум 2 символа",
  color_theme: "Неверный формат цвета"
}
```

#### 2. Authentication Errors

**Display**: Redirect to `/auth`
**Recovery**: User logs in
**Implementation**:

```typescript
const { session } = useAuth();
if (!session) redirect("/auth");
```

#### 3. Authorization Errors

**Display**: Access denied message with explanation
**Recovery**: Contact organization owner
**UI**:

```typescript
<Card>
  <CardHeader>
    <h2>Доступ запрещён</h2>
  </CardHeader>
  <CardContent>
    <p>Только владелец организации может изменять настройки.</p>
    <Button onClick={() => redirectParams("/agency")}>
      Вернуться на главную
    </Button>
  </CardContent>
</Card>
```

#### 4. Network Errors

**Display**: Toast notification with retry option
**Recovery**: Automatic retry or manual retry button
**Implementation**:

```typescript
try {
  await updateSettings(data);
} catch (error) {
  if (isNetworkError(error)) {
    showToast({
      title: "Ошибка сети",
      description: "Проверьте подключение к интернету",
      action: <Button onClick={handleRetry}>Повторить</Button>,
    });
  }
}
```

#### 5. RLS Errors

**Display**: Permission denied message
**Recovery**: Verify role and refresh
**Detection**:

```typescript
if (error.code === "42501" || error.message.includes("permission denied")) {
  showToast({
    title: "Недостаточно прав",
    description: "У вас нет прав для изменения настроек организации",
    variant: "destructive",
  });
}
```

#### 6. Upload Errors

**Display**: Inline error below upload field
**Recovery**: User selects different file
**Validation**:

```typescript
function validateFile(file: File): string | null {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "image/webp",
  ];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return "Неподдерживаемый формат файла. Используйте PNG, JPG, SVG или WEBP";
  }

  if (file.size > maxSize) {
    return "Файл слишком большой. Максимальный размер: 2MB";
  }

  return null;
}
```

### Error Logging

**Client-side**:

```typescript
function logError(error: Error, context: string) {
  console.error(`[${context}]`, error);
  // Future: Send to error tracking service (Sentry, etc.)
}
```

**User-facing messages**:

- Always in Russian (matching application language)
- Clear and actionable
- Include recovery steps when possible

## Testing Strategy

### Testing Approach

This feature involves UI interactions, form validation, file uploads, and database operations. The testing strategy focuses on **example-based unit tests** and **integration tests** rather than property-based testing, as the feature primarily deals with specific user workflows and external service integrations.

### Why Property-Based Testing Does NOT Apply

Property-based testing (PBT) is **not appropriate** for this feature because:

1. **UI Rendering**: Form layout and styling are visual concerns, not universal properties
2. **External Services**: Supabase Storage and database operations have deterministic behavior that doesn't vary meaningfully with input
3. **Specific Workflows**: User interactions follow concrete scenarios (fill form → submit → see result)
4. **Configuration Validation**: Field validation rules are specific constraints, not universal properties
5. **Side Effects**: File uploads and database writes are side-effect operations without return values to assert properties on

### Unit Tests

**Test Framework**: Jest + React Testing Library

#### Form Validation Tests

**Location**: `src/features/organization-settings/__tests__/OrganizationSettingsForm.test.tsx`

**Test Cases**:

```typescript
describe("OrganizationSettingsForm Validation", () => {
  it("displays error when agency name is empty", () => {
    // Arrange: render form
    // Act: clear name field and blur
    // Assert: error message displayed
  });

  it("displays error when agency name is less than 2 characters", () => {
    // Arrange: render form
    // Act: enter "A" and blur
    // Assert: error message "Минимум 2 символа"
  });

  it("displays error when agency name exceeds 100 characters", () => {
    // Arrange: render form
    // Act: enter 101 character string
    // Assert: error message "Максимум 100 символов"
  });

  it("displays error for invalid hex color format", () => {
    // Arrange: render form
    // Act: enter "red" in color field
    // Assert: error message about hex format
  });

  it("accepts valid 3-digit hex color (#RGB)", () => {
    // Arrange: render form
    // Act: enter "#F00"
    // Assert: no error displayed
  });

  it("accepts valid 6-digit hex color (#RRGGBB)", () => {
    // Arrange: render form
    // Act: enter "#FF0000"
    // Assert: no error displayed
  });

  it("displays error for invalid URL format", () => {
    // Arrange: render form
    // Act: enter "not-a-url" in logo URL field
    // Assert: error message about URL format
  });

  it("accepts empty logo URL (optional field)", () => {
    // Arrange: render form
    // Act: leave logo URL empty
    // Assert: no error, form can submit
  });
});
```

#### File Upload Validation Tests

**Location**: `src/features/organization-settings/__tests__/LogoUploadField.test.tsx`

**Test Cases**:

```typescript
describe("LogoUploadField Validation", () => {
  it("rejects file larger than 2MB", () => {
    // Arrange: create 3MB file
    // Act: attempt upload
    // Assert: error message about file size
  });

  it("rejects unsupported file type (PDF)", () => {
    // Arrange: create PDF file
    // Act: attempt upload
    // Assert: error message about file type
  });

  it("accepts PNG file under 2MB", () => {
    // Arrange: create 1MB PNG file
    // Act: attempt upload
    // Assert: upload initiated, no error
  });

  it("accepts JPG file under 2MB", () => {
    // Arrange: create 1MB JPG file
    // Act: attempt upload
    // Assert: upload initiated, no error
  });

  it("displays upload progress during upload", () => {
    // Arrange: mock slow upload
    // Act: upload file
    // Assert: progress bar visible and updating
  });
});
```

#### API Mutation Tests

**Location**: `src/entities/profile/api/__tests__/profileApi.test.ts`

**Test Cases**:

```typescript
describe("updateOrganizationSettings Mutation", () => {
  it("updates only agency_name when provided", async () => {
    // Arrange: mock Supabase client
    // Act: call mutation with only agency_name
    // Assert: Supabase update called with only agency_name
  });

  it("updates multiple fields when provided", async () => {
    // Arrange: mock Supabase client
    // Act: call mutation with name, color, and logo
    // Assert: Supabase update called with all fields
  });

  it("returns error when user not authenticated", async () => {
    // Arrange: mock auth failure
    // Act: call mutation
    // Assert: error returned
  });

  it("invalidates Profile cache on success", async () => {
    // Arrange: mock successful update
    // Act: call mutation
    // Assert: cache invalidation triggered
  });

  it("performs optimistic update before API call", async () => {
    // Arrange: mock delayed API response
    // Act: call mutation
    // Assert: cache updated immediately
  });

  it("reverts optimistic update on failure", async () => {
    // Arrange: mock API failure
    // Act: call mutation
    // Assert: cache reverted to original state
  });
});
```

### Integration Tests

#### End-to-End Form Submission

**Location**: `src/features/organization-settings/__tests__/integration.test.tsx`

**Test Cases**:

```typescript
describe("Organization Settings Integration", () => {
  it("successfully updates organization name", async () => {
    // Arrange: render form with mock data
    // Act: change name, submit form
    // Assert: API called, success message shown, cache updated
  });

  it("successfully updates color theme", async () => {
    // Arrange: render form
    // Act: select color, submit
    // Assert: API called with color, preview updated
  });

  it("successfully uploads logo and updates URL", async () => {
    // Arrange: render form, mock storage upload
    // Act: select file, wait for upload, submit
    // Assert: file uploaded, URL updated, form submitted
  });

  it("displays error message on API failure", async () => {
    // Arrange: mock API failure
    // Act: submit form
    // Assert: error message displayed, form not cleared
  });

  it("reverts changes on API failure", async () => {
    // Arrange: render form with initial data
    // Act: change fields, submit, API fails
    // Assert: form reverted to initial values
  });
});
```

#### Authorization Tests

**Location**: `src/app/settings/organization-settings/__tests__/page.test.tsx`

**Test Cases**:

```typescript
describe("Organization Settings Page Authorization", () => {
  it("redirects to /auth when user not authenticated", () => {
    // Arrange: mock no session
    // Act: render page
    // Assert: redirect to /auth
  });

  it("displays access denied for non-owner users", () => {
    // Arrange: mock user with 'member' role
    // Act: render page
    // Assert: access denied message shown
  });

  it("displays form for owner users", () => {
    // Arrange: mock user with 'owner' role
    // Act: render page
    // Assert: form rendered
  });
});
```

### Manual Testing Checklist

**Accessibility**:

- [ ] All form fields keyboard navigable (Tab, Shift+Tab)
- [ ] Color picker accessible via keyboard (arrow keys)
- [ ] Screen reader announces field labels
- [ ] Screen reader announces validation errors
- [ ] Screen reader announces success/error notifications
- [ ] Focus management on validation errors

**Responsive Design**:

- [ ] Form usable on 320px width (mobile)
- [ ] Form usable on 768px width (tablet)
- [ ] Form usable on 1024px+ width (desktop)
- [ ] Logo preview scales appropriately
- [ ] Color picker usable on touch devices

**Browser Compatibility**:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**User Workflows**:

- [ ] Update organization name only
- [ ] Update color theme only
- [ ] Update logo URL only
- [ ] Upload logo file
- [ ] Update all fields simultaneously
- [ ] Clear optional fields (color, logo)
- [ ] Cancel form without saving
- [ ] Navigate away with unsaved changes (future: add warning)

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for validation logic and API mutations
- **Integration Tests**: Cover all critical user workflows
- **Manual Tests**: Accessibility and responsive design verification

### Testing Tools

- **Jest**: Unit test runner
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **@testing-library/user-event**: User interaction simulation
- **jest-axe**: Accessibility testing

## Implementation Notes

### Navigation Update

**File**: `src/widgets/agency-settings/AgencySettings.tsx`

**Change**:

```typescript
// Before
<Button
  onClick={() => redirectParams("/settings/agency-settings")}
  size={"sm"}
  variant="outline"
>
  Настройки организации
</Button>

// After
<Button
  onClick={() => redirectParams("/settings/organization-settings")}
  size={"sm"}
  variant="outline"
>
  Настройки организации
</Button>
```

### Supabase Storage Setup

**Bucket Creation** (via Supabase Dashboard or SQL):

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Set file size limit
UPDATE storage.buckets
SET file_size_limit = 2097152
WHERE id = 'logos';
```

**RLS Policies for Storage**:

```sql
-- Allow authenticated users to upload to their agency folder
CREATE POLICY "Users can upload logos for their agencies"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos' AND
  auth.uid() IN (
    SELECT user_id FROM agency_members
    WHERE role = 'owner'
  )
);

-- Allow public read access
CREATE POLICY "Public read access for logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');
```

### Performance Considerations

1. **Optimistic Updates**: Immediate UI feedback reduces perceived latency
2. **Cache Invalidation**: Selective invalidation prevents unnecessary refetches
3. **Image Optimization**: Consider adding image compression before upload
4. **Debouncing**: Add debounce to color picker to reduce validation calls
5. **Lazy Loading**: Load color picker library only when needed

### Security Considerations

1. **RLS Enforcement**: Database-level security prevents unauthorized updates
2. **File Type Validation**: Both client and server-side validation
3. **File Size Limits**: Prevent storage abuse
4. **URL Validation**: Prevent XSS via malicious URLs
5. **CSRF Protection**: Supabase handles CSRF tokens automatically

### Accessibility Features

1. **ARIA Labels**: All form fields have descriptive labels
2. **Error Announcements**: Screen readers announce validation errors
3. **Focus Management**: Focus moves to first error on validation failure
4. **Keyboard Navigation**: Full keyboard support for all interactions
5. **Color Contrast**: Ensure sufficient contrast for color theme preview
6. **Alternative Text**: Logo preview includes alt text

### Future Enhancements

1. **Image Cropping**: Add image cropper for logo uploads
2. **Multiple Themes**: Support light/dark theme variants
3. **Logo Library**: Pre-designed logo templates
4. **Undo/Redo**: History of changes with undo capability
5. **Bulk Updates**: Update multiple organizations at once (for multi-agency users)
6. **Preview Mode**: Preview changes before saving
7. **Change History**: Audit log of settings changes
8. **Custom Fonts**: Allow custom font uploads for branding

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Status**: Ready for Implementation

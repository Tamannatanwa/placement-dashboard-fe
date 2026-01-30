# Profile Wizard Component

A modern, polymorphic multi-step profile form wizard designed for both student and admin profiles.

## Features

- ✅ **Multi-step form wizard** with step-by-step navigation
- ✅ **Polymorphic design** - works for both student and admin roles
- ✅ **Back/Next navigation** - users can go back to previous steps and edit
- ✅ **Step validation** - each step validates before proceeding
- ✅ **Progress tracking** - visual progress indicator
- ✅ **Review step** - final review before submission
- ✅ **Modern UI** - built with shadcn/ui components
- ✅ **Type-safe** - full TypeScript support with Zod validation

## Architecture

### Polymorphism Design

The component uses TypeScript interfaces to support multiple user roles:

```typescript
// Base profile data structure
interface BaseProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  // ... common fields
}

// Student-specific
interface StudentProfileFormData extends BaseProfileFormData {
  // Student-specific fields
}

// Admin-specific
interface AdminProfileFormData extends BaseProfileFormData {
  // Admin-specific fields
}

// Union type for polymorphic usage
type ProfileFormData = StudentProfileFormData | AdminProfileFormData;
```

### Component Structure

```
ProfileWizard (Main Container)
├── StepIndicator (Visual step progress)
├── StepNavigation (Back/Next buttons)
└── Step Components
    ├── PersonalInfoStep
    ├── AcademicInfoStep
    └── ReviewStep
```

## Usage

### Basic Usage (Student)

```tsx
import { ProfileWizard } from "@/components/profile/ProfileWizard";

export default function ProfilePage() {
  return <ProfileWizard userRole="student" />;
}
```

### With Initial Data

```tsx
<ProfileWizard
  userRole="student"
  initialData={{
    first_name: "John",
    last_name: "Doe",
    // ... other fields
  }}
/>
```

### With Completion Callback

```tsx
<ProfileWizard
  userRole="student"
  onComplete={(data) => {
    console.log("Profile completed:", data);
    // Handle completion
  }}
/>
```

## Extending for Admin Profile

To add admin-specific steps or fields:

### 1. Extend the Types

```typescript
// src/types/profile.ts
export interface AdminProfileFormData extends BaseProfileFormData {
  department?: string;
  permissions?: string[];
  // Add admin-specific fields
}
```

### 2. Create Admin-Specific Step Component

```typescript
// src/components/profile/steps/AdminSettingsStep.tsx
export function AdminSettingsStep({ formData, onUpdate }: StepContentProps) {
  // Admin-specific form fields
  return (
    <Card>
      {/* Admin form fields */}
    </Card>
  );
}
```

### 3. Add Validation Schema

```typescript
// src/lib/validations/profile.ts
export const adminSettingsSchema = z.object({
  department: z.string().min(1, "Department is required"),
  permissions: z.array(z.string()).optional(),
});
```

### 4. Update ProfileWizard

```typescript
// In ProfileWizard.tsx, conditionally render steps based on role
const STEPS = userRole === "admin" 
  ? [
      // ... existing steps
      {
        id: "admin-settings",
        title: "Admin Settings",
        component: AdminSettingsStep,
        validationSchema: adminSettingsSchema,
      },
    ]
  : [
      // Student steps
    ];
```

## Step Navigation

Users can:
- **Navigate forward** - Click "Next" after completing current step
- **Navigate backward** - Click "Previous" to go back
- **Jump to completed steps** - Click on completed step indicators
- **Edit previous steps** - Go back, edit, and return to current step

## Validation

Each step has its own Zod validation schema:
- `personalInfoSchema` - Personal information validation
- `academicInfoSchema` - Academic information validation
- `completeProfileSchema` - Final validation before submission

Validation happens:
- On "Next" button click
- Before final submission
- Real-time in form fields (via react-hook-form)

## Styling

The component uses:
- **shadcn/ui** components (Card, Button, Input, etc.)
- **Tailwind CSS** for styling
- **Cyan color scheme** for primary actions (matches your design system)
- **Dark mode support** via next-themes

## API Integration

The wizard integrates with:
- `studentsApi.getMyProfile()` - Load existing profile
- `studentsApi.updateMyProfile()` - Save profile updates

For admin profiles, you would create similar API methods in an `adminApi` module.

## File Structure

```
src/
├── components/
│   └── profile/
│       ├── ProfileWizard.tsx       # Main wizard component
│       ├── StepIndicator.tsx      # Step progress indicator
│       ├── StepNavigation.tsx     # Navigation buttons
│       └── steps/
│           ├── PersonalInfoStep.tsx
│           ├── AcademicInfoStep.tsx
│           └── ReviewStep.tsx
├── types/
│   └── profile.ts                 # TypeScript types
└── lib/
    └── validations/
        └── profile.ts             # Zod schemas
```

## Best Practices

1. **Always validate** before moving to next step
2. **Save progress** - Consider auto-saving form data to localStorage
3. **Handle errors** - Show user-friendly error messages
4. **Loading states** - Show loading indicators during API calls
5. **Accessibility** - Ensure keyboard navigation works
6. **Mobile responsive** - Test on mobile devices

## Future Enhancements

- [ ] Auto-save to localStorage
- [ ] Resume incomplete profiles
- [ ] File upload for resume
- [ ] Additional step for skills/interests
- [ ] Admin-specific workflow steps
- [ ] Analytics tracking for completion rates



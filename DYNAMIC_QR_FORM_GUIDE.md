# Dynamic QR Code Form - Implementation Guide

## Overview
The QR code creation form now dynamically switches input fields based on the selected QR code type, providing a context-aware user experience with proper validation for each type.

## ✨ Features

### Dynamic Field Rendering
- **Real-time Updates**: Form fields change instantly when QR type is selected
- **Smooth Transitions**: 300ms fade-in animation for new field sets
- **Auto-focus**: First field automatically focused after type change
- **Type Persistence**: Form values preserved when switching between types
- **Smart Validation**: Type-specific validation rules applied dynamically

### Supported QR Code Types

#### 1. **URL / Menu / Landing Page**
Fields:
- `redirectUrl` (required) - Website URL

Use Cases: Website links, online menus, landing pages

#### 2. **vCard - Contact Information**
Fields:
- `vcardName` (required) - Full name
- `vcardPhone` (optional) - Phone number
- `vcardEmail` (optional) - Email address with validation
- `vcardOrganization` (optional) - Company name
- `vcardWebsite` (optional) - Website URL with validation

Use Cases: Business cards, contact sharing, networking

#### 3. **WiFi Network**
Fields:
- `wifiSSID` (required) - Network name
- `wifiPassword` (optional) - Network password
- `wifiEncryption` (required) - WPA/WPA2, WEP, or No Password

Use Cases: Guest WiFi, office networks, cafe hotspots

#### 4. **Email**
Fields:
- `emailAddress` (required) - Email address with validation
- `emailSubject` (optional) - Pre-filled subject line
- `emailBody` (optional) - Pre-filled message body

Use Cases: Contact forms, support requests, feedback

#### 5. **SMS Message**
Fields:
- `smsPhone` (required) - Phone number
- `smsMessage` (optional) - Pre-filled message text

Use Cases: Text-to-join campaigns, quick messaging, alerts

#### 6. **Phone Call**
Fields:
- `phoneNumber` (required) - Phone number

Use Cases: Call-to-action, support hotlines, business contact

#### 7. **Location/GPS**
Fields:
- `locationLat` (required) - Latitude coordinate
- `locationLng` (required) - Longitude coordinate
- `locationAddress` (optional) - Descriptive address

Use Cases: Venue locations, store finder, event directions

#### 8. **Plain Text**
Fields:
- `textContent` (required) - Any text content

Use Cases: Serial numbers, product info, instructions, credentials

#### 9. **Payment**
Fields:
- `paymentPlatform` (required) - Cash App, Zelle, Venmo, or PayPal
- `paymentHandle` (required) - Username, cashtag, or email

Use Cases: Tips, donations, quick payments, fundraising

---

## 🔧 Technical Implementation

### Schema Validation
Dynamic Zod schemas that adapt based on selected type:

```typescript
const createQRSchema = (type: string) => {
  // Base fields for all types
  const baseSchema = {
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().optional(),
    type: z.enum([...]),
    maxScans: z.number().optional(),
  };

  // Type-specific validation
  switch (type) {
    case 'URL':
      return z.object({
        ...baseSchema,
        redirectUrl: z.string().url('Must be a valid URL'),
      });
    // ... other types
  }
};
```

### State Management
```typescript
const [selectedType, setSelectedType] = useState<string>('URL');
const typeValue = watch('type'); // Watch for type changes

useEffect(() => {
  if (typeValue && typeValue !== selectedType) {
    setSelectedType(typeValue);
    // Screen reader announcement
    // Auto-focus first field
  }
}, [typeValue, selectedType]);
```

### Conditional Rendering
```tsx
{selectedType === 'VCARD' && (
  <div className="space-y-4 animate-in fade-in-50 duration-300">
    {/* vCard specific fields */}
  </div>
)}
```

---

## ♿ Accessibility Features

### Screen Reader Support
- **Type Change Announcements**: When type changes, screen readers announce:
  > "QR code type changed to [TYPE]. Form fields updated."
  
- **Live Region**: Dynamic field container has `aria-live="polite"` and `role="region"`
- **Field Labels**: All inputs have proper `<Label>` associations
- **Error Messages**: Errors linked via `aria-describedby`
- **Required Fields**: Marked with `aria-required="true"` and visual indicator

### Keyboard Navigation
- **Tab Order**: Logical tab flow through form fields
- **Auto-focus**: First field focused after type change (100ms delay)
- **Focus Indicators**: 2px blue rings on all interactive elements
- **Select Dropdowns**: Keyboard navigable with arrow keys

### Visual Accessibility
- **Clear Labels**: Descriptive labels for all fields
- **Helper Text**: Muted text provides context
- **Error States**: Red text with alert role
- **Required Indicators**: Red asterisk with screen reader text

---

## 🎨 User Experience

### Smooth Transitions
- **Fade In**: New fields fade in with 300ms duration
- **Opacity Animation**: `animate-in fade-in-50` utility
- **No Layout Shift**: Container maintains height during transitions

### Helpful Placeholders
Each field has context-specific placeholders:
- URL: `https://example.com`
- Email: `contact@example.com`
- Phone: `+1 (555) 123-4567`
- WiFi: `MyWiFiNetwork`
- Payment: `$username or email`

### Smart Validation
- **Real-time**: Validation occurs on blur and submit
- **Type-specific**: URL fields validate URLs, email fields validate emails
- **Clear Messages**: Actionable error messages
- **Visual Feedback**: Red text and border for errors

---

## 📋 Data Structure

### Form Submission Format
Data is transformed based on type before API submission:

```typescript
// URL Type
{
  name: "My QR",
  type: "URL",
  redirectUrl: "https://example.com"
}

// vCard Type
{
  name: "Business Card",
  type: "VCARD",
  content: JSON.stringify({
    name: "John Doe",
    phone: "+1555123456",
    email: "john@example.com",
    organization: "Company Inc",
    website: "https://company.com"
  })
}

// WiFi Type
{
  name: "Guest WiFi",
  type: "WIFI",
  content: JSON.stringify({
    ssid: "GuestNetwork",
    password: "password123",
    encryption: "WPA"
  })
}

// ... similar for other types
```

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Type selection changes displayed fields immediately
- [ ] First field auto-focuses after type change
- [ ] Validation rules match selected type
- [ ] Form values preserved when switching types
- [ ] All required fields enforced
- [ ] Optional fields work correctly
- [ ] Error messages display properly
- [ ] Submit creates QR code successfully

### Accessibility Tests
- [ ] Screen reader announces type changes
- [ ] All fields keyboard accessible
- [ ] Focus indicators visible
- [ ] Tab order logical
- [ ] Required fields announced
- [ ] Error messages associated with fields
- [ ] Helper text provides context

### Visual Tests
- [ ] Smooth fade-in transition
- [ ] No layout shift during transitions
- [ ] Error states clearly visible
- [ ] Placeholders helpful and clear
- [ ] Mobile responsive
- [ ] Dark mode compatible

### Type-Specific Tests
- [ ] URL validation works
- [ ] Email validation works
- [ ] Phone number accepts various formats
- [ ] WiFi encryption options correct
- [ ] Payment platforms available
- [ ] Location coordinates validated
- [ ] Text area expands properly

---

## 🚀 Future Enhancements

### Planned Features
1. **QR Preview**: Real-time preview of generated QR code
2. **Field Templates**: Pre-fill common patterns
3. **Bulk Creation**: Create multiple QR codes at once
4. **Import/Export**: Import data from CSV/JSON
5. **Custom Validation**: User-defined validation rules
6. **Field Presets**: Save field combinations as presets
7. **Advanced Payment**: Support for amounts and notes
8. **Map Picker**: Visual location picker for coordinates
9. **vCard Photo**: Upload contact photo for vCard
10. **WiFi QR Preview**: Show network details before scanning

### Technical Improvements
- Add unit tests for dynamic schema generation
- Implement form field persistence with localStorage
- Add undo/redo for form changes
- Progressive enhancement for JavaScript-disabled browsers
- WebSocket real-time collaboration
- Form autosave with draft recovery

---

## 📚 Code Examples

### Adding a New QR Type

1. **Update the enum**:
```typescript
type: z.enum([..., 'NEWTYPE'])
```

2. **Add schema case**:
```typescript
case 'NEWTYPE':
  return z.object({
    ...baseSchema,
    newField: z.string().min(1, 'Required'),
  });
```

3. **Add conditional rendering**:
```tsx
{selectedType === 'NEWTYPE' && (
  <div className="space-y-4 animate-in fade-in-50 duration-300">
    <div className="space-y-2">
      <Label htmlFor="newField">
        New Field <span className="text-destructive">*</span>
      </Label>
      <Input
        id="newField"
        {...register('newField')}
        ref={firstFieldRef}
        placeholder="Placeholder text"
      />
    </div>
  </div>
)}
```

4. **Handle submission**:
```typescript
case 'NEWTYPE':
  qrData.content = JSON.stringify({
    field: data.newField,
  });
  break;
```

---

## 🐛 Troubleshooting

### Fields Not Updating
**Issue**: Fields don't change when type is selected
**Solution**: Ensure `watch('type')` is properly configured and `selectedType` state is updating

### Validation Errors Persist
**Issue**: Errors from previous type remain after switching
**Solution**: Schema is recreated for each type, ensuring clean validation

### Auto-focus Not Working
**Issue**: First field doesn't focus after type change
**Solution**: Check `firstFieldRef` is attached to correct field and timeout is set (100ms)

### Animations Choppy
**Issue**: Fade-in animation is not smooth
**Solution**: Ensure Tailwind animation classes are configured and CSS transitions are enabled

---

## 📞 Support

For issues or questions:
1. Check the [UI/UX Improvements Guide](UI_UX_IMPROVEMENTS.md)
2. Review the [Project Features](PROJECT_FEATURES.md)
3. Test on the UI Test Page: `/dashboard/ui-test`
4. Check browser console for errors

---

**Last Updated**: December 31, 2025  
**Version**: 2.0.0  
**File**: `/app/dashboard/qr-codes/create/page.tsx`

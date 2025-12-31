# QR Code Type Examples

Quick reference for testing the dynamic QR code form with realistic data.

## 🔗 URL Type
**Use Case**: Website link, landing page, menu
```
Name: Company Website
Type: URL
Redirect URL: https://example.com
```

## 👤 vCard Type
**Use Case**: Business card, contact sharing
```
Name: John's Business Card
Type: vCard
Full Name: John Doe
Phone: +1 (555) 123-4567
Email: john.doe@example.com
Organization: Acme Corporation
Website: https://johndoe.com
```

## 📶 WiFi Type
**Use Case**: Guest network, office WiFi
```
Name: Office Guest WiFi
Type: WiFi
Network Name: Office-Guest-5G
Password: Welcome2024!
Encryption: WPA/WPA2
```

## 📧 Email Type
**Use Case**: Contact form, support email
```
Name: Support Contact
Type: Email
Email Address: support@example.com
Subject: Customer Inquiry
Message: Hello, I would like to ask about...
```

## 💬 SMS Type
**Use Case**: Text campaigns, quick messaging
```
Name: Join Our Newsletter
Type: SMS
Phone Number: +1 (555) 999-8888
Message: JOIN to subscribe to our newsletter!
```

## 📞 Phone Type
**Use Case**: Call-to-action, hotline
```
Name: Customer Service
Type: Phone
Phone Number: +1 (800) 555-1234
```

## 📍 Location Type
**Use Case**: Venue location, store finder
```
Name: Main Office Location
Type: Location
Latitude: 37.7749
Longitude: -122.4194
Address: 123 Market Street, San Francisco, CA 94103
```

## 📝 Text Type
**Use Case**: Product info, serial numbers
```
Name: Product Serial Number
Type: Text
Text Content: SN-2024-ABC-12345
Model: XYZ-1000
Manufactured: December 2024
```

## 💰 Payment Type
**Use Case**: Tips, donations, payments

### Cash App Example
```
Name: Coffee Tips
Type: Payment
Platform: Cash App
Handle: $YourCashtag
```

### Zelle Example
```
Name: Rent Payment
Type: Payment
Platform: Zelle
Handle: landlord@email.com
```

### Venmo Example
```
Name: Split Dinner
Type: Payment
Platform: Venmo
Handle: @YourVenmoUsername
```

### PayPal Example
```
Name: Donations
Type: Payment
Platform: PayPal
Handle: donate@nonprofit.org
```

---

## 🧪 Test Scenarios

### Scenario 1: Restaurant Menu
1. Select "Menu" type
2. Enter name: "Dinner Menu"
3. Enter URL: "https://restaurant.com/menu"
4. Create QR code
5. Verify QR redirects to menu

### Scenario 2: Networking Event
1. Select "vCard" type
2. Fill in all contact details
3. Create QR code
4. Scan and verify contact saves correctly

### Scenario 3: Coffee Shop WiFi
1. Select "WiFi" type
2. Enter SSID and password
3. Select WPA encryption
4. Create QR code
5. Scan and verify auto-connects

### Scenario 4: Event Registration
1. Select "Email" type
2. Pre-fill subject and body
3. Create QR code
4. Scan and verify email opens with data

### Scenario 5: Tip Jar
1. Select "Payment" type
2. Choose Cash App
3. Enter cashtag
4. Create QR code
5. Scan and verify opens Cash App

---

## 📱 Mobile Testing Tips

1. **WiFi QR**: Test on iOS and Android - behavior differs
2. **vCard QR**: Verify contact saves with all fields
3. **Location QR**: Check if maps app opens correctly
4. **Payment QR**: Ensure correct app launches
5. **Phone QR**: Verify call prompt appears

---

## ✅ Validation Tests

Test these invalid inputs to verify error handling:

### Invalid URL
```
redirectUrl: "not-a-url"
Expected: "Must be a valid URL"
```

### Invalid Email (vCard)
```
vcardEmail: "invalid-email"
Expected: "Invalid email"
```

### Invalid Email (Email Type)
```
emailAddress: "notanemail"
Expected: "Invalid email address"
```

### Empty Required Fields
```
vcardName: ""
Expected: "Name is required"
```

### Invalid Website (vCard)
```
vcardWebsite: "not-a-website"
Expected: "Invalid URL"
```

---

## 🎯 Edge Cases

### Very Long Text
```
textContent: [4000 characters of text]
Test: Verify QR code size limits
```

### Special Characters
```
wifiPassword: "P@ssw0rd!@#$%^&*()"
Test: Verify encoding works
```

### International Phone
```
phoneNumber: "+44 20 7946 0958"
Test: Verify international format
```

### Unicode Content
```
textContent: "Hello 世界 🌍"
Test: Verify UTF-8 encoding
```

### Empty Optional Fields
```
emailSubject: ""
emailBody: ""
Test: Verify submission works
```

---

## 🔍 Debug Checklist

If form isn't working:

1. ✅ Check browser console for errors
2. ✅ Verify type is updating in state
3. ✅ Confirm correct fields rendering
4. ✅ Check validation schema matches type
5. ✅ Verify API endpoint accepts data format
6. ✅ Test with simple data first
7. ✅ Check network tab for API response
8. ✅ Verify QR code creation succeeds

---

**Pro Tip**: Use the UI test page at `/dashboard/ui-test` to verify all form components work correctly before testing QR creation.

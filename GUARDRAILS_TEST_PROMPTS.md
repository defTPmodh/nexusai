# Guardrails Test Prompts

Use these prompts to test if the guardrails are working correctly. **Make sure you're logged in as a non-admin user** (employee/member role) to test guardrails, as admins bypass guardrails.

## Test Prompts by PII Type

### 1. **Email Detection Test**
```
Please send an email to john.doe@example.com and also contact support@company.com for help.
```

**Expected Result:**
- If action is "redact": `[EMAIL REDACTED]` appears in place of emails
- If action is "block": Request is blocked with error message
- If action is "warn": Request continues but warning shown

---

### 2. **Phone Number Detection Test**
```
Call me at 555-123-4567 or try my mobile (415) 555-9876. You can also reach me at +1-800-555-0100.
```

**Expected Result:**
- Phone numbers should be detected and redacted/blocked based on guardrail action

---

### 3. **SSN Detection Test**
```
My social security number is 123-45-6789. Please keep it secure.
```

**Expected Result:**
- SSN should be detected and redacted/blocked immediately

---

### 4. **Credit Card Detection Test**
```
My credit card number is 4532-1234-5678-9010. The CVV is 123.
```

**Expected Result:**
- Credit card number should be detected and redacted/blocked

---

### 5. **IP Address Detection Test**
```
The server IP address is 192.168.1.1 and the gateway is 10.0.0.1.
```

**Expected Result:**
- IP addresses should be detected and redacted/blocked

---

## Comprehensive Test Prompt (All PII Types)

**Use this prompt to test all PII types at once:**

```
I need help with my account. Here are my details:
- Email: jane.smith@company.com
- Phone: (555) 123-4567
- SSN: 123-45-6789
- Credit Card: 4532-1234-5678-9010
- IP Address: 192.168.1.100

Please update my account with this information.
```

**Expected Result:**
- All PII types should be detected
- Depending on guardrail action:
  - **Block**: Request completely blocked with list of detected types
  - **Redact**: All PII replaced with `[TYPE REDACTED]` placeholders
  - **Warn**: Request continues but warning banner appears

---

## Real-World Scenario Tests

### Scenario 1: Customer Support Request
```
Hi, I'm having trouble accessing my account. My email is customer@example.com and my phone number is 555-123-4567. Can you help me reset my password?
```

### Scenario 2: Financial Information
```
I need to update my payment method. My credit card is 4532-1234-5678-9010 and expires 12/25. My billing address is 123 Main St, City, State 12345.
```

### Scenario 3: Employee Onboarding
```
New employee details:
Name: John Doe
Email: john.doe@company.com
Phone: 555-987-6543
SSN: 987-65-4321
Start date: 01/15/2025
```

---

## Testing Guardrail Actions

### Test "Block" Action
1. Go to `/admin/guardrails`
2. Set action to "Block"
3. Ensure guardrails are enabled
4. Send a message with PII
5. **Expected**: Request should be blocked with error message showing detected PII types

### Test "Redact" Action
1. Set action to "Redact"
2. Send a message with PII
3. **Expected**: Message should be processed but PII replaced with `[TYPE REDACTED]`
4. Response should show warning banner

### Test "Warn" Action
1. Set action to "Warn"
2. Send a message with PII
3. **Expected**: Request continues but warning banner appears in chat

---

## Testing Allowlist Patterns

### Allowlist Test
1. Go to `/admin/guardrails`
2. Add allowlist pattern: `.*@company\.com`
3. Send message: `Contact me at support@company.com`
4. **Expected**: Email should NOT be redacted (allowlisted)

---

## Admin Bypass Test

1. Log in as admin user
2. Send message with PII
3. **Expected**: PII should NOT be detected/redacted (admins bypass guardrails)

---

## Quick Test Checklist

- [ ] Email addresses are detected
- [ ] Phone numbers are detected
- [ ] SSNs are detected
- [ ] Credit cards are detected
- [ ] IP addresses are detected
- [ ] Block action prevents request
- [ ] Redact action replaces PII
- [ ] Warn action shows warning
- [ ] Allowlist patterns work
- [ ] Admins bypass guardrails
- [ ] UI shows warning banners correctly
- [ ] Error messages are clear

---

## Recommended Test Prompt (Use This First)

**Copy and paste this into the chat:**

```
Test PII Detection:
Email: test@example.com
Phone: 555-123-4567
SSN: 123-45-6789
Credit Card: 4532-1234-5678-9010
IP: 192.168.1.1
```

This will test all detection types at once and show you exactly how the guardrails are working.


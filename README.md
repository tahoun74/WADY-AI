# WhatsApp Order Forwarder – Chrome Extension

## What This Extension Does

This Chrome extension allows suppliers to forward **WhatsApp order messages** directly into the backend processing pipeline.

Instead of sending emails manually, the extension:
- Captures selected WhatsApp message text
- Collects the customer phone number
- Sends the data to the backend API
- The backend activates the existing ingestion / AI pipeline

No real email is sent from the browser.

---

## How It Works

1. Open **WhatsApp Web**
2. Highlight an order message
3. Right-click → **Forward WhatsApp Order**
4. The extension:
   - Reads the selected text
   - Tries to detect the customer phone number
   - If not detected, asks the user to enter it
5. The extension sends the data to the backend
6. The backend:
   - Finds the customer by phone
   - Builds `EmailData`
   - Pushes it to the ingestion pipeline using `send_email_job`

---

## Backend API Endpoint

The extension sends data to the following endpoint:

```

POST /api/v1/whatsapp/email

````

### Request Body

```json
{
  "phone": "+974XXXXXXXX",
  "body_text": "Selected WhatsApp order text"
}
````

---

## Current Local Setup

During development, the backend API is running locally

This will later be replaced with the production backend domain.

---

## How to Install the Extension

1. Build the extension:

   ```bash
   npm run build
   ```
2. Open Chrome and go to:

   ```
   chrome://extensions
   ```
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `dist/` folder

---

## Important Notes

* The extension does **not** send SMTP or Gmail emails
* All email and order processing happens server-side
* WhatsApp orders are processed exactly like email orders
---

## Summary

**WhatsApp Web → Right-click → API call → Backend pipeline**

Simple, secure, and integrated with the existing system.

```

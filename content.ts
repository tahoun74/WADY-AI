// Inline types to avoid import issues in content scripts
enum MessageType {
  SAVE_TOKEN = 'SAVE_TOKEN',
  GET_CONTEXT = 'GET_CONTEXT',
  CONTEXT_RESULT = 'CONTEXT_RESULT',
  SHOW_NOTIFICATION = 'SHOW_NOTIFICATION'
}

interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}

declare var chrome: any;

// --- Auth Handling (dashboard.wady.ai) ---
if (window.location.hostname.includes('wady.ai')) {
  window.addEventListener('message', (event) => {
    // Validate origin
    if (event.origin !== window.location.origin) return;

    if (event.data && event.data.type === 'WADY_EXTENSION_TOKEN_ISSUED') {
      const tokenData = event.data.payload;
      
      // Send to background to store
      chrome.runtime.sendMessage({
        type: MessageType.SAVE_TOKEN,
        payload: tokenData
      });

      // Show immediate feedback on the web page
      const feedback = document.createElement('div');
      feedback.style.position = 'fixed';
      feedback.style.top = '20px';
      feedback.style.right = '20px';
      feedback.style.padding = '16px';
      feedback.style.background = '#4F46E5';
      feedback.style.color = 'white';
      feedback.style.borderRadius = '8px';
      feedback.style.zIndex = '99999';
      feedback.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      feedback.innerText = 'Extension Linked Successfully!';
      document.body.appendChild(feedback);

      setTimeout(() => feedback.remove(), 3000);
    }
  });
}

// --- WhatsApp Context Extraction (web.whatsapp.com) ---
if (window.location.hostname.includes('web.whatsapp.com')) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender: any, sendResponse: any) => {
    if (message.type === MessageType.GET_CONTEXT) {
      const context = extractWhatsAppContext();
      sendResponse(context);
    }
  });
}

function extractWhatsAppContext() {
  try {
    // Heuristics for WhatsApp Web DOM (Subject to change by WhatsApp)
    // Common pattern: The main chat header usually contains the contact name in a span or div with specific attributes
    
    // Attempt 1: Look for the main header (usually the right pane header)
    const mainHeader = document.querySelector('header'); 
    let chatName = 'Unknown Chat';
    let senderDisplay = 'Unknown Sender';

    if (mainHeader) {
      // The contact name is often in the first span/div with text inside the header info block
      const infoBlock = mainHeader.querySelector('div[role="button"]');
      if (infoBlock) {
          const textElement = infoBlock.querySelector('span[title]');
          if (textElement) {
            chatName = textElement.getAttribute('title') || textElement.textContent || 'Unknown';
          }
      }
    }

    // Try to find phone number from the header if it's not a named contact
    // (This is best effort)
    
    return {
      chat_name: chatName,
      sender_display: senderDisplay, // Hard to get "my" number, usually we get the chat partner's
      message_ts: new Date().toISOString()
    };
  } catch (e) {
    console.error('Wady Ext: Failed to extract context', e);
    return {};
  }
}
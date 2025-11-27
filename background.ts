import { API_BASE_URL, ExtensionMessage, ExtensionTokenData, MessageType, STORAGE_KEY, WadyPayload } from './types';

declare var chrome: any;

// 1. Initialize Context Menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send-to-wady",
    title: "Send to Wady Inbox",
    contexts: ["selection"]
  });
});

// 2. Handle Messages (Auth Token Save)
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender: any, sendResponse: any) => {
  if (message.type === MessageType.SAVE_TOKEN) {
    const data = message.payload;
    chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
      console.log('Wady Ext: Token saved.');
      // Update extension badge to show active
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#4F46E5' });
    });
  }
});

// 3. Handle Context Menu Click
chrome.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
  if (info.menuItemId === "send-to-wady" && info.selectionText && tab?.id) {
    
    // A. Check Auth
    const auth = await getAuthToken();
    if (!auth) {
      notifyUser('Please click the extension icon to connect your Wady account first.', true);
      return;
    }

    // B. Prepare Payload Base
    const payload: WadyPayload = {
      text: info.selectionText,
      page_url: tab.url || 'unknown',
      source_hint: isWhatsApp(tab.url) ? 'whatsapp_web' : 'generic_web',
      context: {}
    };

    // C. Try to get context if on WhatsApp
    if (isWhatsApp(tab.url)) {
      try {
        const context = await chrome.tabs.sendMessage(tab.id, { type: MessageType.GET_CONTEXT });
        if (context) {
          payload.context = context;
        }
      } catch (e) {
        console.warn('Could not fetch rich context, sending raw text only.');
      }
    }

    // D. Send to API
    try {
      await sendToWady(payload, auth.token);
      notifyUser('Order sent to Wady Inbox successfully!');
    } catch (error) {
      console.error(error);
      notifyUser('Failed to send. Please try again.', true);
    }
  }
});

// --- Helpers ---

function isWhatsApp(url?: string): boolean {
  return !!url && url.includes('web.whatsapp.com');
}

async function getAuthToken(): Promise<ExtensionTokenData | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result: any) => {
      resolve(result[STORAGE_KEY] || null);
    });
  });
}

async function sendToWady(payload: WadyPayload, token: string) {
  const body = JSON.stringify(payload);
  console.log('Wady Ext: Sending JSON payload', body);

  const response = await fetch(`${API_BASE_URL}/ingest/browser-extension/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: body
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired
      chrome.storage.local.remove([STORAGE_KEY]);
      chrome.action.setBadgeText({ text: '' });
      throw new Error('Session expired');
    }
    throw new Error('API Error: ' + response.statusText);
  }
  
  return response.json();
}

function notifyUser(message: string, isError = false) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'https://picsum.photos/48/48', // Placeholder, ideally use local icon
    title: isError ? 'Wady Error' : 'Wady Success',
    message: message,
    priority: 2
  });
}

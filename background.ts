// background.ts
declare const chrome: any;

const MENU_ID = "send-whatsapp-order";

// Change this to your real API base URL
const API_BASE_URL = "http://localhost:8000";
const API_PATH = "/api/v1/whatsapp/email"; // the route you will add in backend

type PhoneResult = { phone?: string };

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Send WhatsApp Order",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
  try {
    if (info.menuItemId !== MENU_ID) return;
    if (!tab?.id) return;

    const selectedText = (info.selectionText || "").trim();
    if (!selectedText) {
      await notify("No text selected.", true);
      return;
    }

    // 1) Ask content script to detect phone from WhatsApp Web DOM
    let phone = await tryGetPhoneFromTab(tab.id);

    // 2) If not found, ask user via small popup window
    if (!phone) {
      phone = await promptForPhone();
    }

    if (!phone) {
      await notify("No phone provided. Cancelled.", true);
      return;
    }

    // 3) Send to backend
    await postOrder({phone,body_text: selectedText,});

    await notify("Order sent successfully ✅");
  } catch (err: any) {
    await notify(err?.message || "Failed to send order.", true);
  }
});

async function tryGetPhoneFromTab(tabId: number): Promise<string | null> {
  try {
    const res: PhoneResult = await chrome.tabs.sendMessage(tabId, {
      type: "GET_WA_PHONE"
    });
    const phone = (res?.phone || "").trim();
    return phone || null;
  } catch {
    return null;
  }
}

async function postOrder(payload: { phone: string; body_text: string }) {
  const r = await fetch(`${API_BASE_URL}${API_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const msg = await safeText(r);
    throw new Error(`Backend error (${r.status}): ${msg}`);
  }

  try {
    return await r.json();
  } catch {
    return {};
  }
}

async function safeText(r: Response) {
  try {
    return await r.text();
  } catch {
    return "";
  }
}

/**
 * Minimal phone prompt using an extension popup window.
 * You will add phone_prompt.html below.
 */
function promptForPhone(): Promise<string | null> {
  return new Promise((resolve) => {
    const url = chrome.runtime.getURL("phone_prompt.html");

    chrome.windows.create(
      {
        url,
        type: "popup",
        width: 360,
        height: 220
      },
      (win: any) => {
        const listener = (message: any) => {
          if (message?.type === "PHONE_PROMPT_RESULT") {
            chrome.runtime.onMessage.removeListener(listener);
            try {
              if (win?.id) chrome.windows.remove(win.id);
            } catch {}
            const phone = (message.phone || "").trim();
            resolve(phone || null);
          }
        };

        chrome.runtime.onMessage.addListener(listener);
      }
    );
  });
}

async function notify(message: string, isError = false) {
  // If you want, replace with chrome.notifications (requires permission),
  // but simplest: just console + optional alert-like UX later.
  console[isError ? "error" : "log"]("[Extension]", message);
}

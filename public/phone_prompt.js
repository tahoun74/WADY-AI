document.getElementById("send").addEventListener("click", () => {
  const phone = (document.getElementById("phone").value || "").trim();
  chrome.runtime.sendMessage({ type: "PHONE_PROMPT_RESULT", phone });
});

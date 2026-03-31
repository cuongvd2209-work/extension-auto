const s = document.createElement("script");
s.src = chrome.runtime.getURL("inject.js");
s.onload = () => s.remove();
document.documentElement.appendChild(s);

const observer = new MutationObserver(() => {
  const el = document.getElementById("txtNoiDung");
  if (el) {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("CyHg5BLw");
    setTimeout(() => {
      window.postMessage(
        { type: "FILL_FORM", docId: key },
        "*"
      );
    }, 1000);
    observer.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Nhận lệnh từ popup và forward sang page
chrome.runtime.onMessage.addListener((msg) => {
  console.log(msg.type);
  if (msg.type === "RUN_AUTO_PROCESS") {
    window.postMessage(
      { type: "RUN_OPEN_TAB", docId: msg.docId },
      "*"
    );
  }

  if (msg.type === "PDF_RESULT") {
    console.log(msg);
  }
});

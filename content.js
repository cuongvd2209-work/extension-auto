const s = document.createElement("script");
s.src = chrome.runtime.getURL("inject.js");
s.onload = () => s.remove();
document.documentElement.appendChild(s);

const observer = new MutationObserver(() => {
  const params = new URLSearchParams(window.location.search);
  const externalType = params.get('externalType');

  // GOTO ASSIGN PAGE
  if (externalType == 'ASSIGN_TASK') {
    const el = document.getElementById("txtNoiDung");
    if (el) {
      setTimeout(() => {
        window.postMessage(
          { 
            type: "ASSIGN_TASK", 
            docId: params.get("CyHg5BLw"),
            action: "AUTO_FILL"
          },
          "*"
        );
      }, 1000);
      observer.disconnect();
    }
  }

  if (externalType == 'TRANSFER_PROCESSING') {
    const el = document.getElementById("dt_basic");
    if (el) {
      setTimeout(() => {
        window.postMessage(
          { 
            type: "TRANSFER_PROCESSING",
            docId: params.get("externalDocId"),
            action: "AUTO_FILL"
          },
          "*"
        );
      }, 1000);
      observer.disconnect();
    }
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

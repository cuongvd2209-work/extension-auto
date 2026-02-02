document.getElementById("run").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const docId = document.getElementById("docId").value;

  chrome.tabs.sendMessage(tab.id, {
    type: "RUN_AUTO_PROCESS",
    docId
  });
});
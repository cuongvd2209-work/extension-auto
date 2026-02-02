document.getElementById("run").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    type: "RUN_AUTO_PROCESS",
  });
});
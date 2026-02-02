chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FAKE_AI") {
    sendResponse({
      title: "Xử lý công văn",
      content: "Kiểm tra hồ sơ, xử lý và phản hồi trước 17h.",
      deadline: "2026-01-25"
    });
  }

  return true;
});

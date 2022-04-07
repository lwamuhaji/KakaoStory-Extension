document.addEventListener("scroll", () => {
  if (document.documentElement.scrollTop % 10 > 2) return;
  const postCount = document.querySelectorAll(".list_swipe._container").length;
  const imageCount = document.querySelectorAll(".img_swipe._mediaImage").length;
  chrome.runtime.sendMessage(["scroll", postCount, imageCount]);
});

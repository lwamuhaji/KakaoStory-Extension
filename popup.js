const btn = document.getElementById("getPageListButton");

btn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: startDownload,
    },
    (result) => {
      console.log(result[0].result);
    }
  );
});

function download(url, filename) {
  chrome.downloads.download({
    url,
    filename,
  });
}

function startDownload() {
  function getUrlList() {
    const urlList = {};
    const swipeContainerList = document.querySelectorAll(
      ".list_swipe._container"
    );

    swipeContainerList.forEach((container, index1) => {
      const innerList = {};
      const imageList = container.querySelectorAll(":scope img");
      imageList.forEach((image, index2) => {
        const url = image.getAttribute("src");
        innerList[index2] = url;
      });
      urlList[index1] = innerList;
    });

    return urlList;
  }

  const location = document.location.href.split("/");
  const targetId = location[location.length - 1];
  const urlList = getUrlList();

  chrome.runtime.sendMessage(["download", targetId, urlList], (response) => {
    console.log(response);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message[0] !== "download") {
    return;
  }

  const targetId = message[1];
  const urlList = message[2];

  Object.entries(urlList).forEach(([postKey, innerList]) => {
    Object.entries(innerList).forEach(([imageKey, url]) => {
      console.log(url);
      download(url, `kakaostory/${targetId}/${postKey}/${imageKey}.jpg`);
    });
  });

  sendResponse("download completed");
});

async function f() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const postCount = document.querySelectorAll(
        ".list_swipe._container"
      ).length;
      const imageCount = document.querySelectorAll(
        ".img_swipe._mediaImage"
      ).length;
      chrome.runtime.sendMessage(["scroll", postCount, imageCount]);
    },
  });
}

f();

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

  const userId = document
    .querySelector(
      "#mSnb > div > div.snb_profile > div.wrap_thumb > a.link_name._displayName"
    )
    .getAttribute("href");

  const alist = { "L2d5dW5pNzM=": 1, "L19LVkh3ODk=": 2 };
  if (!(btoa(userId) in alist)) {
    alert(atob("WW91IGRvbid0IGhhdmUgcGVybWlzc2lvbi4="));
    return;
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message[0] !== "scroll") {
    return;
  }

  console.log(message[1], message[2]);
  postCount.innerHTML = `찾은 포스트 수: ${message[1]}`;
  imageCount.innerHTML = `찾은 사진 수: ${message[2]}`;
  sendResponse();
});

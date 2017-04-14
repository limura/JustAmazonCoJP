var magicWord = "&emi=AN1VRQENFRJN5";
var tabIdToJustAmazonStatus = {};

function isAmazonQueryURL(url){
  return url.indexOf("://www.amazon.co.jp/") != -1 && url.indexOf("field-keywords=") != -1;
}
function isJustAmazonURL(url){
  return url.indexOf(magicWord) != -1;
}

function enableActionButton(tabId){
  chrome.pageAction.show(tabId);
}
function disableActionButton(tabId){
  chrome.pageAction.hide(tabId);
}

function setEnableIcon(tabId){
  chrome.pageAction.setIcon({
    path: "icon/JustAmazon32.png",
    tabId: tabId,
  });
}
function setDisableIcon(tabId){
  chrome.pageAction.setIcon({
    path: "icon/AnyCustomer32.png",
    tabId: tabId,
  });
}

function addJustAmazonURL(tabId){
  tabIdToJustAmazonStatus[tabId] = "Added";
  chrome.tabs.executeScript(tabId, {code: "location.href+=\"" + magicWord + "\";"});
}
function delJustAmazonURL(tabId){
  tabIdToJustAmazonStatus[tabId] = "Deleted";
  chrome.tabs.executeScript(tabId, {code: "location.href=location.href.replace(/" + magicWord + "/, '');"});
}

function ToggleJustAmazon(tab) {
  var currentURL = tab.url;
  if(!isAmazonQueryURL(currentURL)){
    return;
  }
  if(isJustAmazonURL(currentURL)){
    delJustAmazonURL(tab.id);
  }else{
    addJustAmazonURL(tab.id);
  }
}

chrome.pageAction.onClicked.addListener(ToggleJustAmazon);

chrome.webRequest.onBeforeRequest.addListener(function(tab){
  var targetURL = tab.url;
  if(!isAmazonQueryURL(targetURL) || isJustAmazonURL(targetURL)){
    return {};
  }
  if(tab.tabId in tabIdToJustAmazonStatus) {
    delete tabIdToJustAmazonStatus[tab.tabId];
    return {};
  }
  return {
    redirectUrl: targetURL + magicWord
  };
}, {
  urls: ["*://www.amazon.co.jp/*"],
  types: ["main_frame"]
}, [ "blocking" ]);

chrome.tabs.onUpdated.addListener(function(tabId){
  chrome.tabs.get(tabId, function(tab){
    var targetURL = tab.url;
    if(!isAmazonQueryURL(targetURL)){
      return;
    }
    enableActionButton(tabId);
    if(isJustAmazonURL(targetURL)){
      setEnableIcon(tabId);
    }else{
      setDisableIcon(tabId);
    }
  });
});

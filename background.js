//var magicWord = "&emi=AN1VRQENFRJN5";
var magicWord = "&rh=p_6%3AAN1VRQENFRJN5";
var tabIdToJustAmazonStatus = {};

function isAmazonQueryURL(url){
  return url?.indexOf("://www.amazon.co.jp/s") != -1 && url?.indexOf("k=") != -1;
}
function isJustAmazonURL(url){
  return url?.indexOf(magicWord) != -1;
}

function enableActionButton(tabId){
  chrome.browserAction.enable(tabId);
}
function disableActionButton(tabId){
  chrome.browserAction.disable(tabId);
}

function setEnableIcon(tabId){
  chrome.browserAction.setIcon({
    path: "icon/JustAmazon32.png",
    tabId: tabId,
  });
}
function setDisableIcon(tabId){
  chrome.browserAction.setIcon({
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

chrome.browserAction.onClicked.addListener(ToggleJustAmazon);

chrome.tabs.onUpdated.addListener(function(tabId){
  chrome.tabs.get(tabId, function(tab){
    var targetURL = tab.url;
    if(!isAmazonQueryURL(targetURL)){
      disableActionButton(tabId);
      return;
    }
    enableActionButton(tabId);
    if(!(tabId in tabIdToJustAmazonStatus)){
      if(!isJustAmazonURL(targetURL)){
        addJustAmazonURL(tabId);
      }
    }
    if(isJustAmazonURL(targetURL)){
      setEnableIcon(tabId);
    }else{
      setDisableIcon(tabId);
    }
  });
});

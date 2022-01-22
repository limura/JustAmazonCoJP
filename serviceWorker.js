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
  chrome.action.enable(tabId);
}
function disableActionButton(tabId){
  chrome.action.disable(tabId);
}

function setEnableIcon(tabId){
  chrome.action.setIcon({
    path: "icon/JustAmazon32.png",
    tabId: tabId,
  });
  chrome.action.setTitle({
    tabId: tabId,
    title: "検索結果にAmazon.co.jp以外も含めるよう変更する"
  });
}
function setDisableIcon(tabId){
  chrome.action.setIcon({
    path: "icon/AnyCustomer32.png",
    tabId: tabId,
  });
  chrome.action.setTitle({
    tabId: tabId,
    title: "検索結果をAmazon.co.jpで販売されているものだけに変更する"
  });
}

function addJustAmazonURL(tabId){
  tabIdToJustAmazonStatus[tabId] = "Added";
  chrome.declarativeNetRequest.updateEnabledRulesets(
    {
      disableRulesetIds: ["disableRule"],
      enableRulesetIds: ["enableRule"],
    }
  );
  chrome.tabs.reload(tabId);
}
function delJustAmazonURL(tabId){
  tabIdToJustAmazonStatus[tabId] = "Deleted";
  chrome.declarativeNetRequest.updateEnabledRulesets(
    {
      disableRulesetIds: ["enableRule"],
      enableRulesetIds: ["disableRule"],
    }
  );
  chrome.tabs.reload(tabId);
}

function ToggleJustAmazon(tab) {
  var currentURL = tab.url;
  console.log("ToggleJustAmazon called", currentURL);
  if(!isAmazonQueryURL(currentURL)){
    return;
  }
  if(isJustAmazonURL(currentURL)){
    delJustAmazonURL(tab.id);
  }else{
    addJustAmazonURL(tab.id);
  }
}

chrome.action.onClicked.addListener(ToggleJustAmazon);

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

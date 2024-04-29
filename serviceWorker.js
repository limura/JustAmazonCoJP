//var magicWord = "&emi=AN1VRQENFRJN5";
var magicWord = "&rh=p_6%3AAN1VRQENFRJN5";
var tabIdToJustAmazonStatus = {};

function getEnabledRulesetsAsync() {
  return new Promise((resolve, reject) => {
    chrome.declarativeNetRequest.getEnabledRulesets((rulesetIds) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(rulesetIds);
      }
    });
  });
}

async function isJustAmazonEnabled() {
  try {
    const rulesets = await getEnabledRulesetsAsync();
    const enableRulePresent = rulesets.some(rule => rule.includes("enableRule"));
    return enableRulePresent;
  } catch (error) {
    console.error('Error:', error);
    return false; // エラーが発生した場合はfalseを返す
  }
}

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

function enableJustAmazon(tabId){
  chrome.declarativeNetRequest.updateEnabledRulesets(
    {
      disableRulesetIds: ["disableRule"],
      enableRulesetIds: ["enableRule"],
    }
  );
}
function disableJustAmazon(tabId){
  chrome.declarativeNetRequest.updateEnabledRulesets(
    {
      disableRulesetIds: ["enableRule"],
      enableRulesetIds: ["disableRule"],
    }
  );
}

function ToggleJustAmazon(tab) {
  var currentURL = tab.url;
  console.log("ToggleJustAmazon called", currentURL);
  if(!isAmazonQueryURL(currentURL)){
    return;
  }
  if(isJustAmazonURL(currentURL)){
    disableJustAmazon(tab.id);
  }else{
    enableJustAmazon(tab.id);
  }
  chrome.tabs.reload(tab.Id);
}

chrome.action.onClicked.addListener(ToggleJustAmazon);

function updateAppIconStatus(tabId) {
  chrome.tabs.get(tabId, async function(tab){
    var targetURL = tab.url;
    if(!isAmazonQueryURL(targetURL)){
      disableActionButton(tabId);
      return;
    }
    enableActionButton(tabId);
    let isEnabled = isJustAmazonURL(targetURL);
    if(isEnabled) {
      setEnableIcon(tabId);
      enableJustAmazon(tabId);
    }else{
      setDisableIcon(tabId);
      disableJustAmazon(tabId);
    }
  });
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  updateAppIconStatus(tabId);
});
chrome.tabs.onUpdated.addListener(function(tabId){
  updateAppIconStatus(tabId);
});

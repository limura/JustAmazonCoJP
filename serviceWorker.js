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

// https://developer.chrome.com/docs/extensions/reference/api/offscreen?hl=ja のものをそのまま使います
let offScreenDocumentCreating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (offScreenDocumentCreating) {
    await offScreenDocumentCreating;
  } else {
    offScreenDocumentCreating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['WORKERS'],
      justification: "個々のタブでの ON/OFF 状態を一時的に保存するために使います。\n具体的には、ブラウザを再起動すると消えるようにするために offscreen 側でタブのON/OFF状態を保存します(以前の background.js の代わりとして用います)。",
    });
    await offScreenDocumentCreating;
    offScreenDocumentCreating = null;
  }
}

function sendToStateKeeper(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }else{
        resolve(response);
      }
    });
  });
}

let stateKeeperHtmlPath = "tabStateKeeper.html";
async function saveState(tabId, state) {
  await setupOffscreenDocument(stateKeeperHtmlPath);
  await sendToStateKeeper({type: "save", key: tabId, value: state});
}
async function loadState(tabId) {
  await setupOffscreenDocument(stateKeeperHtmlPath);
  try {
    let response = await sendToStateKeeper({type: "load", key: tabId});
    return response;
  }catch(error){
    console.log("JACP: load got error:", error);
  }
  return undefined;
}

async function ToggleJustAmazon(tab) {
  var currentURL = tab.url;
  if(!isAmazonQueryURL(currentURL)){
    return;
  }
  // state としては、「JustAmazonが無効の場合が True」です。
  // 初期値は undefined で False であるので、初期値が得られた場合に「JustAmazonが有効」と判定させるためです。
  if(isJustAmazonURL(currentURL)){
    await saveState(tab.id, true);
    disableJustAmazon(tab.id);
  }else{
    await saveState(tab.id, false);
    enableJustAmazon(tab.id);
  }
  chrome.tabs.reload(tab.Id);
}

chrome.action.onClicked.addListener(ToggleJustAmazon);

async function updateAppIconStatus(tabId) {
  chrome.tabs.get(tabId, async function(tab){
    var targetURL = tab.url;
    if(!isAmazonQueryURL(targetURL)){
      disableActionButton(tabId);
      return;
    }
    enableActionButton(tabId);
    let tabState = await loadState(tabId);
    if(!tabState) { // state としては、「JustAmazonが無効の場合が True」なので、!tabState であれば Enable にする方向で作業します。
      setEnableIcon(tabId);
      enableJustAmazon(tabId);
      let isEnabled = isJustAmazonURL(targetURL);
      if(!isEnabled) {
        chrome.tabs.reload(tab.Id);
      }
    }else{
      setDisableIcon(tabId);
      disableJustAmazon(tabId);
      let isEnabled = isJustAmazonURL(targetURL);
      if(isEnabled) {
        chrome.tabs.reload(tab.Id);
      }
    }
  });
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  updateAppIconStatus(tabId);
});
chrome.tabs.onUpdated.addListener(function(tabId){
  updateAppIconStatus(tabId);
});

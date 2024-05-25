var state = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //console.log("onMessage", request, request.type, request.key, request.value);
    switch (request.type) {
        case "save":
            console.log("save[", request.key, "] = ", request.value);
            state[request.key] = request.value;
            sendResponse(request.value);
            return;
        case "load":
            //console.log("load[", request.key, "] -> ", state[request.key]);
            sendResponse(state[request.key]);
            return;
        default:
            break;
    }
    sendResponse(undefined);
});
  

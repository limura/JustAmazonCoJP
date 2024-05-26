var state = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
        case "save":
            state[request.key] = request.value;
            sendResponse(request.value);
            return;
        case "load":
            sendResponse(state[request.key]);
            return;
        default:
            break;
    }
    sendResponse(undefined);
});

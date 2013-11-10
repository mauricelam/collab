// var syncedTabs = [];
var sockets = {};
var currentURL;
var serverURL = 'http://murmuring-brook-3141.herokuapp.com';
var clientIds = {};
var tabIds = {};

chrome.browserAction.onClicked.addListener(function (tab) {
    console.log('browser action clicked');
    if (tab.id in sockets) {
        delete sockets[tab.id];
        chrome.tabs.sendMessage(tab.id, {action: 'stop'});
    } else {
        var socket = sockets[tab.id] = io.connect(serverURL, {'force new connection': true});
        socket.emit('handshake', { room: 'testroom' });
        socket.on('handshake', function(data) {
            clientIds[tab.id] = data.client_key;
            tabIds[data.client_key] = tab.id;
            console.log('client ID: ', data);
            if (data.new_room) {
                // chrome.tabs.captureVisibleTab(tab.windowId, {}, function(dataUrl) {
                //     socket.emit('pageimage', { source: dataUrl });
                // });
                // chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function(mhtml) {
                //     var reader = new FileReader();
                //     reader.onloadend = function () {
                //         var url = reader.result;
                //         console.log(url);
                //         // socket.emit('htmlsource', { source: url });
                //     };
                //     reader.readAsDataURL(mhtml);
                //     // var stream = ss.createBlobReadStream(mhtml);
                //     // ss.createBlobReadStream(mhtml).pipe(stream);
                // });
                chrome.tabs.sendMessage(tab.id, {action: 'getPageSource'}, function(source) {
                    // console.log('send page source', source);
                    socket.emit('htmlsource', { source: source });
                });
            } else {
                console.log(data);
                chrome.tabs.update(tab.id, { url: chrome.extension.getURL('client.html') }, function() {
                    window.setTimeout(function() {
                        chrome.tabs.sendMessage(tab.id, { action: 'applyHTML', html: data.source });
                    }, 1000);
                });
            }
        });
        socket.on('htmlsource', function(data) {
            chrome.tabs.sendMessage(tab.id, {action: 'applyHTML', html: data});
        });
        socket.on('pageimage', function(data) {
            chrome.tabs.sendMessage(tab.id, {action: 'showImage', image: data});
        });
        socket.on('error', function(data){
            console.log('error', data);
        });
        socket.on('action', function(data) {
            chrome.tabs.sendMessage(tab.id, {action: 'dispatchSerialEvent', data: data});
            // dispatchSerialEvent(data);
        });
        socket.on('mousemove', function(data) {
            chrome.tabs.sendMessage(tab.id, {action: 'mousemove', data: data});
        });
        socket.on('broadcast', function(data) {
            chrome.tabs.sendMessage(tab.id, data);
        });
    }
});

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    var socket = sockets[sender.tab.id];
    switch (message.action) {
        case 'broadcast':
            console.log('broadcast: ', message);
            if (socket) {
                message.payload.sender = clientIds[sender.tab.id];
                socket.emit('broadcast', message.payload);
            }
            break;
        case 'emit':
            if (socket) {
                message.payload.sender = clientIds[sender.tab.id];
                socket.emit(message.event, message.payload);
            }
            break;
        case 'updateScreen':
            if (socket) {
                console.log('update screen la');
                chrome.tabs.captureVisibleTab(sender.tab.windowId, {}, function(dataUrl) {
                    socket.emit('pageimage', { source: dataUrl });
                });
            }
            break;
        // case 'sendEvent':
        //     // console.log('sendevent', message.eventString);
        //     socket.emit('action', message.eventString);
        //     break;
        // case 'getCurrentURL':
        //     sendResponse(currentURL);
        //     break;
        // case 'shouldStart':
        //     sendResponse(sender.tab.id in sockets);
        //     break;
    }
});

chrome.tabs.onUpdated.addListener(function (tabid, changeInfo, tab) {
    if (tabid in sockets) {
        sockets[tabid].emit('action', JSON.stringify({ type:'locationchange', url: changeInfo.url }));

        // chrome.tabs.executeScript(tab.id, { file: 'jquery.js' });
        // chrome.tabs.executeScript(tab.id, { file: 'socket.io.js' });
        // chrome.tabs.executeScript(tab.id, { file: 'inject.js' });

        if (changeInfo.url) currentURL = changeInfo.url;
    }
});
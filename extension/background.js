// var syncedTabs = [];
var sockets = {};
var currentURL;
var serverURL = 'http://murmuring-brook-3141.herokuapp.com';
var clientIds = {};
var tabIds = {};

var hostTabs = {};

function hostifyTab(tabid) {
    chrome.tabs.executeScript(tabid, { file: 'jquery.js' });
    chrome.tabs.executeScript(tabid, { file: 'inject.js' });
    chrome.tabs.insertCSS(tabid, { file: 'styles.css' });
}

function createRoom(tabid, room) {
    var socket = sockets[tabid] = io.connect(serverURL, {'force new connection': true});
    socket.emit('handshake', { room: room, create: true });
    console.log('emitted');
    socket.on('handshake', function(data) {
        if (data.error) {
            alert('Unable to initialize');
            console.log(data.error);
            return;
        }
        clientIds[tabid] = data.client_key;
        tabIds[data.client_key] = tabid;
        console.log('client ID: ', data);
        if (!data.new_room) {
            throw 'Creating room should be new room';
        }
        hostifyTab(tabid);
        // chrome.tabs.captureVisibleTab(tab.windowId, {}, function(dataUrl) {
        //     socket.emit('pageimage', { source: dataUrl });
        // });
        // chrome.pageCapture.saveAsMHTML({tabId: tabid}, function(mhtml) {
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
        hostTabs[tabid] = true;
        // updateScreenFromHost(tabid);

    });
    setupSocket(tabid);
}

chrome.tabs.onUpdated.addListener(function (tabid, change, tab) {
    if (change.status === 'complete' && tabid in hostTabs) {
        hostifyTab(tabid);
        // updateScreenFromHost(tabid);
    }
});

function updateScreenFromHost(tabid) {
    var socket = sockets[tabid];
    if (!socket) return;
    chrome.tabs.sendMessage(tabid, {action: 'getPageSource'}, function(source) {
        // console.log('send page source', source);
        socket.emit('htmlsource', { source: source });
    });
}

function joinRoom(tabid, room) {
    var socket = sockets[tabid] = io.connect(serverURL, {'force new connection': true});
    socket.emit('handshake', { room: room });
    socket.on('handshake', function(data) {
        clientIds[tabid] = data.client_key;
        tabIds[data.client_key] = tabid;
        console.log('client ID: ', data);
        if (data.new_room) {
            throw 'Join room does not exist';
        }
        chrome.tabs.sendMessage(tabid, { action: 'applyHTML', html: data.source });
        // chrome.tabs.update(tabid, { url: chrome.extension.getURL('client.html') }, function() {
        //     window.setTimeout(function() {
        //     }, 1000);
        // });

    });
    setupSocket(tabid);
}

function setupSocket(tabid) {
    var socket = sockets[tabid];
    socket.on('htmlsource', function(data) {
        chrome.tabs.sendMessage(tabid, {action: 'applyHTML', html: data});
    });
    socket.on('pageimage', function(data) {
        chrome.tabs.sendMessage(tabid, {action: 'showImage', image: data});
    });
    socket.on('error', function(data){
        console.log('error', data);
    });
    // socket.on('action', function(data) {
    //     chrome.tabs.sendMessage(tabid, {action: 'dispatchSerialEvent', data: data});
    //     // dispatchSerialEvent(data);
    // });
    socket.on('mousemove', function(data) {
        chrome.tabs.sendMessage(tabid, {action: 'mousemove', data: data});
    });
    socket.on('broadcast', function(data) {
        chrome.tabs.sendMessage(tabid, data);
    });
}

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    var socket = sender.tab && sockets[sender.tab.id];
    switch (message.action) {
        case 'createRoom':
            chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
                console.log('Create room active', tab);
                createRoom(tab[0].id, message.room);
            });
            break;
        case 'joinRoomBtn':
            chrome.tabs.create({ url: chrome.extension.getURL('client.html#' + message.room) });
            break;
        case 'joinRoom':
            joinRoom(sender.tab.id, message.room);
            break;
        case 'broadcast':
            if (window.logbroadcast)
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
        case 'updateHTML':
            if (socket) {
                console.log('update HTML source');
                socket.emit('htmlsource', { source: message.source });
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
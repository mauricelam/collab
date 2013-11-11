// var syncedTabs = [];
var sockets = {};
var currentURL;
var serverURL = 'http://murmuring-brook-3141.herokuapp.com';
var clientIds = {};
var tabIds = {};

var hostTabs = {};

function hostifyTab(tabid) {
    chrome.tabs.executeScript(tabid, { file: 'jquery.js' });
    chrome.tabs.executeScript(tabid, { file: 'cursor.js' });
    chrome.tabs.executeScript(tabid, { file: 'host.js' });
    chrome.tabs.insertCSS(tabid, { file: 'styles.css' });
}

function createRoom(tabid, room, name) {
    var socket = sockets[tabid] = io.connect(serverURL, {'force new connection': true});
    socket.emit('handshake', { room: room, create: true, name: name });
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
        hostTabs[tabid] = true;
    });
    setupSocket(tabid);
}

chrome.tabs.onUpdated.addListener(function (tabid, change, tab) {
    if (change.status === 'complete' && tabid in hostTabs) {
        hostifyTab(tabid);
    }
});

chrome.tabs.onRemoved.addListener(function (tabid, removeInfo) {
    if (tabid in hostTabs) {
        console.log('close room');
        chrome.extension.sendMessage({action: 'closeRoom', tabid: tabid});
    }
});

// function updateScreenFromHost(tabid) {
//     var socket = sockets[tabid];
//     if (!socket) return;
//     chrome.tabs.sendMessage(tabid, {action: 'getPageSource'}, function(source) {
//         // console.log('send page source', source);
//         socket.emit('htmlsource', { source: source });
//     });
// }

function joinRoom(tabid, room, name) {
    var socket = sockets[tabid] = io.connect(serverURL, {'force new connection': true});
    socket.emit('handshake', { room: room, name: name});
    socket.on('handshake', function(data) {
        clientIds[tabid] = data.client_key;
        tabIds[data.client_key] = tabid;
        console.log('client ID: ', data);
        if (data.new_room) {
            throw 'Join room does not exist';
        }
        // console.log('datasource', data);
        chrome.tabs.sendMessage(tabid, { action: 'applyHTML', bundle: data.source });
    });
    setupSocket(tabid);
}

function setupSocket(tabid) {
    var socket = sockets[tabid];
    socket.on('htmlsource', function(data) {
        console.log('htmlsource', data);
        chrome.tabs.sendMessage(tabid, {action: 'applyHTML', bundle: data});
    });
    // socket.on('pageimage', function(data) {
    //     chrome.tabs.sendMessage(tabid, {action: 'showImage', image: data});
    // });
    socket.on('error', function(data){
        console.warn('error', data);
    });
    socket.on('broadcast', function(data) {
        chrome.tabs.sendMessage(tabid, data);
    });
    socket.on('roomClosed', function(data) {
        chrome.tabs.sendMessage(tabid, {action: 'roomClosed'});
    });
}

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    var socket = sockets[message.tabid] || (sender.tab && sockets[sender.tab.id]);
    switch (message.action) {
        case 'createRoom':
            chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
                console.log('Create room active', tab);
                createRoom(tab[0].id, message.room);
            });
            break;
        case 'joinRoom':
            joinRoom(sender.tab.id, message.room, message.name);
            break;
        case 'joinRoomBtn':
            chrome.tabs.create({ url: chrome.extension.getURL('client.html#' + message.room + '&' +message.name) });
            break;
        case 'broadcast':
            if (window.logbroadcast)
                console.log('broadcast: ', message);
            if (socket) {
                message.payload.sender = clientIds[sender.tab.id];
                socket.emit('broadcast', message.payload);
            }
            break;
        case 'updateHTML':
            if (socket) {
                console.log('update HTML source', message.bundle);
                socket.emit('htmlsource', message.bundle);
            }
            break;
        case 'closeRoom':
            // console.log('close room message', socket, message, sockets);
            if (socket) {
                socket.emit('closeRoom', {sender: clientIds[message.tabid]});
            }
            break;
        // case 'emit':
        //     if (socket) {
        //         message.payload.sender = clientIds[sender.tab.id];
        //         socket.emit(message.event, message.payload);
        //     }
        //     break;
        // case 'updateScreen':
        //     if (socket) {
        //         chrome.tabs.captureVisibleTab(sender.tab.windowId, {}, function(dataUrl) {
        //             socket.emit('pageimage', { source: dataUrl });
        //         });
        //     }
        //     break;
    }
});

// chrome.tabs.onUpdated.addListener(function (tabid, changeInfo, tab) {
//     if (tabid in sockets) {
//         sockets[tabid].emit('action', JSON.stringify({ type:'locationchange', url: changeInfo.url }));

//         if (changeInfo.url) currentURL = changeInfo.url;
//     }
// });
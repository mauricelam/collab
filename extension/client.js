var id = Math.floor(Math.random() * 1e9);

var url = 'http://murmuring-brook-3141.herokuapp.com';

window.addEventListener('mousemove', Cursor.onMove, true);
window.addEventListener('click', Cursor.onClick, true);

console.log('client code loaded');

$(window).unload(function(event) {
    console.log('unload');
    chrome.extension.sendMessage({action: 'broadcast', payload: { action: 'disconnected' }});
});

// var screen = $('#screen');

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'mousemove':
            // console.log('client mouse move');
            showCursorAt(message.sender, message.x, message.y);
            break;
        case 'applyHTML':
            console.log('apply HTML', message);
            applyHTML(message.bundle.source, message.bundle.styles);
            break;
        case 'roomClosed':
            alert('The host disconnected from the server. This window will close');
            window.close();
            break;
        case 'disconnected':
            // A user disconnected. The session cannot continue if the host is disconnected.
            removeCursor(message.sender);
            break;
    }
});

function applyHTML(source, styles) {
    document.body.innerHTML = source;
    removeAllScripts();
    for (var id in styles) {
        var elem = $('*[COLLAB-id=' + id + ']').get(0);
        if (elem) {
            elem.style.cssText = styles[id];
        }
    }
}

// chrome.extension.sendMessage({ action: 'clientReady' });

function removeAllScripts() {
    $('script').remove();
    $('style').remove(); // Maybe hover should remain?
    $('link:not(#COLLAB-stylesheet)').remove();
}

var hash = location.hash.substr(1).split('&');
chrome.extension.sendMessage({action: 'joinRoom', room: hash[0], name: hash[1]});


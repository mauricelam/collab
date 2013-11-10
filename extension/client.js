var id = Math.floor(Math.random() * 1e9);

var url = 'http://murmuring-brook-3141.herokuapp.com';

window.addEventListener('mousemove', function (event) {
    chrome.extension.sendMessage({
        action: 'emit',
        event: 'mousemove',
        payload: {
            x: event.pageX,
            y: event.pageY
        }
    });
}, true);

console.log('client code loaded');

var controller;
var parties = {};
var numConnections = 0;

window.addEventListener('click', function(event) {
    event.preventDefault();
}, true);

$(window).unload(function(event) {
    console.log('unload');
    chrome.extension.sendMessage({action: 'broadcast', payload: { action: 'disconnected' }});
});

function getSenderNumber(id) {
    if (!(id in parties)) {
        parties[id] = numConnections++;
    }
    return parties[id];
}

var screen = $('#screen');

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'mousemove':
            showCursorAt(getSenderNumber(message.data.sender), message.data.x, message.data.y);
            break;
        case 'applyHTML':
            document.body.innerHTML = message.html;
            removeAllScripts();
            // Some user has obtained control
            break;
        case 'showImage':
            screen.attr('src', message.image);
            break;
        case 'disconnected':
            // A user disconnected. The session cannot continue if the host is disconnected.
            removeCursor(message.sender);
            break;
    }
});

// chrome.extension.sendMessage({ action: 'clientReady' });

function getPageSource() {
    return document.documentElement.outerHTML;
}

function removeAllScripts() {
    $('script').remove();
    $('style').remove(); // Maybe hover should remain?
    $('link').remove();
}

var cursors = {};
function showCursorAt(id, x, y) {
    if (!cursors[id]) {
        cursors[id] = $('<div>').addClass('COLLAB-cursor').attr('id', 'COLLAB-cursor-' + id);
    }
    cursors[id].css({'top': y, 'left': x, '-webkit-filter': 'hue-rotate(' + (id * 45) + 'deg)'});
    $(document.body).append(cursors[id]);
}

function removeCursor(id) {
    cursors[id].remove();
    delete cursors[id];
}

chrome.extension.sendMessage({action: 'joinRoom'});

// =============== Drawing code =================

var drawing = false;

function startDrawing() {
    var canvas = $('<canvas class="COLLAB-draw"/>');
    canvas.height(document.body.scrollHeight);
    canvas.width(document.body.scrollWidth);
    $('body').append(canvas);
    drawing = true;
}

function stopDrawing() {
    drawing = false;
}

window.addEventListener('keydown', function(event) {
    if (event.keyCode === 68 && event.altKey) {
        if (!drawing) {
            startDrawing();
        } else {
            stopDrawing();
        }
    }
}, true);


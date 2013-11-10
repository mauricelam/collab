var id = Math.floor(Math.random() * 1e9);

var url = 'http://murmuring-brook-3141.herokuapp.com';

window.addEventListener('mousemove', function (event) {
    chrome.extension.sendMessage({
        action: 'broadcast',
        payload: {
            action: 'mousemove',
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
            // console.log('client mouse move');
            showCursorAt(message.sender, message.x, message.y);
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

function removeAllScripts() {
    $('script').remove();
    $('style').remove(); // Maybe hover should remain?
    $('link:not(#COLLAB-stylesheet)').remove();
}

var cursors = {};
function showCursorAt(id, x, y) {
    if (!cursors[id]) {
        cursors[id] = $('<div>').addClass('COLLAB-cursor');
    }
    var num = getSenderNumber(id);
    cursors[id].css({'top': y, 'left': x, '-webkit-filter': 'hue-rotate(' + (num * 45) + 'deg)'});
    $(document.body).after(cursors[id]);
}

function removeCursor(id) {
    if (cursors[id])
        cursors[id].remove();
    delete cursors[id];
}

room = location.hash.substr(1).split("&")[0];
name = location.hash.substr(1).split("&")[1];
chrome.extension.sendMessage({action: 'joinRoom', room: room, name: name});
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


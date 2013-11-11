var Cursor = {
    lastMove: 0,
    onMove: function (event) {
        if (event.timestamp - Cursor.lastMove < 100)
            return;
        chrome.extension.sendMessage({
            action: 'broadcast',
            payload: {
                action: 'mousemove',
                x: event.pageX,
                y: event.pageY
            }
        });
        Cursor.lastMove = event.timestamp;
    },
    onClick: function (event) {
        var id = event.target.getAttribute('COLLAB-id');
        chrome.extension.sendMessage({
            action: 'broadcast',
            payload: {
                action: 'click',
                x: event.pageX,
                y: event.pageY,
                id: id
            }
        });
        event.preventDefault();
    }
};

var numConnections = 0;
var parties = {};
function getSenderNumber(id) {
    var num = parties[id];
    if (num === undefined) {
        num = parties[id] = numConnections++;
    }
    return num;
}

var cursors = {};
function showCursorAt(id, x, y) {
    if (!cursors[id]) {
        cursors[id] = $('<div>').addClass('COLLAB-cursor');
        $(document.body).after(cursors[id]);
    }
    var num = getSenderNumber(id);
    cursors[id].css({'top': y, 'left': x, '-webkit-filter': 'hue-rotate(' + (num * 45) + 'deg)'});
}

function removeCursor(id) {
    if (cursors[id])
        cursors[id].remove();
    delete cursors[id];
}

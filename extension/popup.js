$('#add').click(function() {
    chrome.extension.sendMessage({action: 'createRoom'});
    window.close();
});

$('#join').click(function() {
    chrome.extension.sendMessage({action: 'joinRoomBtn'});
    window.close();
});
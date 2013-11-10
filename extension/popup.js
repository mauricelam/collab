$('#add').click(function() {
    chrome.extension.sendMessage({action: 'createRoom', room: $('#room').val() });
    localStorage['collabroom'] = $('#room').val();
    window.close();
});

$('#join').click(function() {
    chrome.extension.sendMessage({action: 'joinRoomBtn', room: $('#room').val() });
    localStorage['collabroom'] = $('#room').val();
    window.close();
});

$('#room').val(localStorage['collabroom'] || 'testroom');
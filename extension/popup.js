$('#add').click(function() {
    chrome.extension.sendMessage({action: 'createRoom', room: $('#room').val(), name: $('#name').val() });
    localStorage['collabroom'] = $('#room').val();
    localStorage['name'] = $('#name').val();
    window.close();
});

$('#join').click(function() {
    chrome.extension.sendMessage({action: 'joinRoomBtn', room: $('#room').val(), name: $('#name').val() });
    localStorage['collabroom'] = $('#room').val();
    localStorage['name'] = $('#name').val();
    window.close();
});

$('#room').val(localStorage['collabroom'] || 'testroom');

$('#name').val(localStorage['collabroom'] || 'Test');
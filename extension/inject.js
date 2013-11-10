var id = Math.floor(Math.random() * 1e9);

var controller;
var parties = {};
var numConnections = 0;

var lastMove = 0;
window.addEventListener('mousemove', function (event) {
    if (event.timestamp - lastMove < 100)
        return;
    chrome.extension.sendMessage({
        action: 'broadcast',
        payload: {
            action: 'mousemove',
            x: event.pageX,
            y: event.pageY
        }
    });
    lastMove = event.timestamp;
}, true);

var lastOuterHTML;
window.setInterval(function() {
    if (shouldUpdate())
        updateHTML();
}, 2000);

function getSenderNumber(id) {
    if (!(id in parties)) {
        parties[id] = numConnections++;
    }
    return parties[id];
}

function updateScreen() {
    // console.log('update screen');
    // chrome.extension.sendMessage({action: 'updateScreen'});
}

function updateHTML() {
    var source = getPageSource();
    chrome.extension.sendMessage({ action: 'updateHTML', source: source });
}

window.addEventListener('mousewheel', updateScreen, true);
window.addEventListener('scroll', updateScreen, true);
document.documentElement.addEventListener('scroll', updateScreen, true);

document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('scroll', updateScreen, true);
}, true);

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'mousemove':
            showCursorAt(message.sender, message.x, message.y);
            break;
        case 'click':
            clickElementWithId(message.id);
            break;
        case 'controlChanged':
            // Some user has obtained control
            break;
        case 'disconnected':
            // A user disconnected. The session cannot continue if the host is disconnected.
            removeCursor(message.sender);
            break;
        case 'getPageSource':
            var source = getPageSource();
            // console.log('sending source: ', source);
            sendResponse(source);
            break;
    }
});

function clickElementWithId(id) {
    $('*[COLLAB-id=' + id + ']').click();
}

function transformURL(url) {
    if (url.indexOf('//') === 0) {
        url = location.protocol + url;
    }
    return url;
}

var excludeCSS = {'cssText': true, 'webkitBackgroundSize': true};

var defaultStyles = {};

function css(a){
    var o = {};
    var rules = window.getComputedStyle(a);
    for (var r in rules) {
        if (isNaN(parseFloat(r)) || !isFinite(r))
            if (typeof rules[r] === 'string' && rules[r].length > 0 && !(r in excludeCSS)) {
                if (rules[r] !== defaultStyles[r])
                    o[r] = rules[r];
            }
    }
    return o;
}

var ignoreTags = {
    'META': true,
    'SCRIPT': true,
    'STYLE': true,
    'NOSCRIPT': true,
    'LINK': true,
    'TITLE': true
};

function shouldUpdate() {
    var outerHTML = document.body.outerHTML;
    var should = outerHTML !== lastOuterHTML;
    lastOuterHTML = outerHTML;
    return should;
}

function getPageSource() {
    var styles = {};
    var id = 0;
    var profile = Date.now();
    console.log('browser parse start');
    var allElems = document.getElementsByTagName('*');
    for (var i = 0, count = allElems.length; i < count; i++) {
        var elem = allElems[i];
        if (elem.tagName in ignoreTags)
            continue;
        styles[id] = css(elem);
        elem.setAttribute('COLLAB-id', id++);
    }
    console.log('a', Date.now() - profile);

    var temp = $('<div>' + document.documentElement.outerHTML + '</div>');

    temp.find('.COLLAB-cursor').remove();
    console.log('b', Date.now() - profile);

    temp.find('img').each(function() {
        this.src = transformURL(this.src);
    });
    console.log('c', Date.now() - profile);
    temp.find('link').each(function() {
        this.href = transformURL(this.href);
    });
    console.log('d', Date.now() - profile);
    temp.find('a').each(function() {
        this.href = transformURL(this.href);
    });
    console.log('e', Date.now() - profile);
    var allElems = temp[0].getElementsByTagName('*');
    for (i = 0, count = allElems.length; i < count; i++) {
        var elem = allElems[i];
        if (elem.tagName in ignoreTags)
            continue;
        var style = styles[elem.getAttribute('COLLAB-id')];
        for (var r in style) {
            elem.style[r] = style[r];
        }
        if (elem.value) {
            elem.value = elem.value;
        }
    }

    console.log('Parsing took', Date.now() - profile);

    return temp.html();
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
    cursors[id].remove();
    delete cursors[id];
}



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




// window.addEventListener('mousemove', function (event) {
//     chrome.extension.sendMessage({
//         action: 'emit',
//         event: 'mousemove',
//         payload: {
//             sender: id,
//             x: event.pageX,
//             y: event.pageY
//         }
//     });
// }, true);

// function copyStyle() {
//     // copy the style from :hover to COLLAB-hover
//     var newstyle = '';
//     var styles = document.styleSheets;
//     for(var i=0, len=styles.length; i < len; i++) {

//         var sheet = styles[i], rules = sheet.cssRules;
//         if (!rules) {
//             console.log('no css rules');
//             continue;
//         }
//         // console.log(rules);
//         for(var j=0, len2=rules.length; j<len2;j++) {
        
//             var rule = rules[j];
//             if(rule && rule.selectorText && rule.selectorText.indexOf(':hover') > -1){
//                 newstyle += rule.cssText.replace(/:hover/g, '.COLLAB-hover');
//             }
//         }
//     }
//     var styleTag = document.createElement('style');
//     styleTag.id = 'fakehover';
//     styleTag.textContent = newstyle;
//     document.head.appendChild(styleTag);
// }

// function getParentWithId(element) {
//     var parent = element.parentNode;
//     while (parent && !parent.id && !parent.href) {
//         parent = parent.parentNode;
//     }
//     return parent;
// }

// function generateImmediateQuery(element) {
//     var queryString = element.tagName;
//     var id = element.id;
//     if (id) queryString += '#' + id;
//     if (element.className) queryString += '.' + element.className.trim().replace(/[ \n\t]+/g, '.');
//     if (element.href) {
//         queryString += '[href="' + element.getAttribute('href') + '"]';
//     }
//     // console.log(queryString);
//     return queryString;
// }

// function generateQuery(element) {
//     if (document.isEqualNode(element)) {
//         return 'document';
//     }
//     if (element == window) {
//         return 'window';
//     }
//     var queryString;
//     var current = element;
//     do {
//         var immediateQuery = generateImmediateQuery(current);
//         queryString = (queryString) ? immediateQuery + ' ' + queryString : immediateQuery;
//         current = getParentWithId(current, immediateQuery);
//         // console.log(queryString);
//     } while (current && document.querySelectorAll(queryString).length > 1);
//     if (queryString) queryString = queryString.replace(/\%/g, '+++');
//     return queryString;
// }

// function restoreElement(query) {
//     if (query) query = query.replace('+++', '%');
//     if (query === 'document') {
//         return document;
//     } else if (query === 'window') {
//         return window;
//     } else {
//         return document.querySelector(query);
//     }
// }

// function stringifyEvent(event) {
//     var obj = {};
//     for (var i in event) {
//         if (typeof event[i] === 'function') {
//             continue;
//         } else if (event[i] instanceof Node) {
//             obj[i] = { '-element': generateQuery(event[i]) };
//         } else if (typeof event[i] === 'number') {
//             obj[i] = event[i];
//         } else if (i === 'view' || i === 'currentTarget' || i === 'originalEvent' || i === 'delegateTarget' || i === 'handleObj') {
//             // these things are making cyclic object
//         } else {
//             obj[i] = event[i];
//             // console.log(i, event[i]);
//         }
//     }
//     return JSON.stringify(obj);
// }

// var lastScrollTop = 0, lastScrollLeft = 0;
// var lastVal;

// function dispatchSerialEvent (str) {
//     var obj = JSON.parse(str);
//     var target, relatedTarget;
//     try {
//         target = restoreElement(obj.target['-element']);
//         relatedTarget = (obj.relatedTarget) ? restoreElement(obj.relatedTarget['-element']) : null;

//         if (obj.val !== undefined) lastVal = target.value = obj.val;
//     } catch (e) {}

//     var event;
//     if (obj.type === 'mousewheel') {
//         event = document.createEvent('WheelEvent');
//         event.initWebKitWheelEvent(obj.wheelDeltaX, obj.wheelDeltaY, null, obj.screenX, obj.screenY, obj.clientX, obj.clientY, obj.ctrlKey, obj.altKey, obj.shiftKey, obj.metaKey);
//     } else if (obj.type === 'scroll') {
//         if (target === document) target = document.body;
//         target.scrollTop = obj.scrollTop;
//         target.scrollLeft = obj.scrollLeft;
//         lastScrollTop = obj.scrollTop;
//         lastScrollLeft = obj.scrollLeft;
//     } else if (obj.type === 'locationchange') {
//         if (obj.url) {
//             location.href = obj.url;
//         }
//     } else if (obj.type.indexOf('key') > -1) {
//         event = document.createEvent('KeyboardEvent');
//         event.initKeyboardEvent(obj.type, obj.bubbles, obj.cancelable, null, obj.ctrlKey, obj.altKey, obj.shiftKey, obj.metaKey, obj.keyCode, obj.charCode);
//     } else {
//         event = document.createEvent('MouseEvents');
//         event.initMouseEvent(obj.type, obj.bubbles, obj.cancelable, null, obj.detail, obj.screenX, obj.screenY, obj.clientX, obj.clientY, obj.ctrlKey, obj.altKey, obj.shiftKey, obj.metaKey, obj.button, relatedTarget);
//     }
//     if (obj.type === 'mouseover') {
//         // console.log('mouseenter');
//         $(target).parents().not('.COLLAB-hover').addClass('COLLAB-hover');
//         // console.log(obj.target['-element'], target);
//     } else if (obj.type === 'mouseout') {
//         var elems = $('.COLLAB-hover');
//         if (relatedTarget) {
//             elems = elems.not($(relatedTarget).parents());
//         }
//         elems.removeClass('COLLAB-hover');
//     }
//     if (event) {
//         event['-cobrowse'] = true;
//         if (target) target.dispatchEvent(event);
//     }
// }

// chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
//     switch (message.action) {
//         case 'dispatchSerialEvent':
//             dispatchSerialEvent(message.data);
//             break;
//         case 'start':
//             start(message.url);
//             break;
//         case 'stop':
//             stop();
//     }
// });

// chrome.extension.sendMessage({'action': 'shouldStart'}, function (shouldStart) {
//     if (shouldStart) {
//         start(null);
//     }
// });

// function start(url) {
//     console.log('initialize', url);
//     if (url) location.href = url;

//     var mouseEvents = ['mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'show', 'mousewheel'];
//     var keyboardEvents = ['keydown', 'keyup', 'keypress', 'scroll', 'change', 'focus', 'blur'];
//     var eventTypes = [mouseEvents, keyboardEvents];

//     var enabled = true;

//     var repeater = function (e) {
//         if (!e['-cobrowse'] && enabled) {
//             if (e.type === 'scroll') {
//                 var target = (document.isEqualNode(e.target)) ? document.body : e.target;
//                 if (target.scrollTop == lastScrollTop && target.scrollLeft == lastScrollLeft) {
//                     // do not send if scroll positions not updated
//                     return;
//                 }
//                 e.scrollTop = target.scrollTop;
//                 e.scrollLeft = target.scrollLeft;
//             }
//             if (lastVal != e.target.value) {
//                 e.val = e.target.value;
//             }
//             chrome.extension.sendMessage({action: 'sendEvent', eventString: stringifyEvent(e)});
//         }
//     };

//     for (var i = 0, count = eventTypes.length; i < count; i++) {
//         for (var j = 0, count2 = eventTypes[i].length; j < count2; j++) {
//             var eventType = eventTypes[i][j];
//             window.addEventListener(eventType, repeater, true);
//         }
//     }

//     // Capture the URL and the scroll position
//     var url = location.href;
//     var allElements = document.querySelectorAll('*');
//     var scrollPositions = {};
//     for (var i = 0, count = allElements.length; i < count; i++) {
//         var element = allElements[i];
//         if (element.scrollTop !== 0) {
//             scrollPositions[generateQuery(element)] = element.scrollTop;
//         }
//     }
//     // setTimeout(copyStyle, 1500);
// }

// document.addEventListener('DOMContentLoaded', copyStyle, true);

// function stop () {
//     location.reload(true);
// }

// ================== New code =======================

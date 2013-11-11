var id = Math.floor(Math.random() * 1e9);

window.addEventListener('mousemove', Cursor.onMove, true);

function updateHTML() {
    var bundle = getPageSource();
    chrome.extension.sendMessage({ action: 'updateHTML', bundle: bundle });
}

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'mousemove':
            showCursorAt(message.sender, message.x, message.y);
            break;
        case 'click':
            clickElementWithId(message.id);
            break;
        case 'disconnected':
            // A user disconnected. The session cannot continue if the host is disconnected.
            removeCursor(message.sender);
            break;
        // case 'getPageSource':
        //     var source = getPageSource();
        //     // console.log('sending source: ', source);
        //     sendResponse(source);
        //     break;
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

// var excludeCSS = {'cssText': true, 'webkitBackgroundSize': true, "backgroundClip": true, "backgroundColor": true, "backgroundImage": true, "backgroundOrigin": true, "backgroundPosition": true, "backgroundPositionX": true, "backgroundPositionY": true, "backgroundRepeat": true, "backgroundSize": true, 'borderLeftColor': true, 'borderLeftStyle': true, 'borderLeftWidth': true, 'borderRightColor': true, 'borderRightStyle': true, 'borderRightWidth': true, 'borderBottomColor': true, 'borderBottomStyle': true, 'borderBottomWidth': true, 'borderTopColor': true, 'borderTopStyle': true, 'borderTopWidth': true};

// var defaultStyles = {"alignContent": "stretch", "alignItems": "stretch", "alignSelf": "stretch", "alignmentBaseline": "auto"};
// var defaultStyles = {"alignContent": "stretch", "alignItems": "stretch", "alignSelf": "stretch", "alignmentBaseline": "auto", "background": "rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box", "backgroundAttachment": "scroll", "backgroundClip": "border-box", "backgroundColor": "rgba(0, 0, 0, 0)", "backgroundImage": "none", "backgroundOrigin": "padding-box", "backgroundPosition": "0% 0%", "backgroundPositionX": "0%", "backgroundPositionY": "0%", "backgroundRepeat": "repeat", "backgroundSize": "auto", "baselineShift": "baseline", "border": "0px none rgb(0, 0, 0)", "borderBottom": "0px none rgb(0, 0, 0)", "borderBottomColor": "rgb(0, 0, 0)", "borderBottomLeftRadius": "0px", "borderBottomRightRadius": "0px", "borderBottomStyle": "none", "borderBottomWidth": "0px", "borderCollapse": "separate", "borderColor": "rgb(0, 0, 0)", "borderImage": "none", "borderImageOutset": "0px", "borderImageRepeat": "stretch", "borderImageSlice": "100%", "borderImageSource": "none", "borderImageWidth": "1", "borderLeft": "0px none rgb(0, 0, 0)", "borderLeftColor": "rgb(0, 0, 0)", "borderLeftStyle": "none", "borderLeftWidth": "0px", "borderRadius": "0px", "borderRight": "0px none rgb(0, 0, 0)", "borderRightColor": "rgb(0, 0, 0)", "borderRightStyle": "none", "borderRightWidth": "0px", "borderSpacing": "0px 0px", "borderStyle": "none", "borderTop": "0px none rgb(0, 0, 0)", "borderTopColor": "rgb(0, 0, 0)", "borderTopLeftRadius": "0px", "borderTopRightRadius": "0px", "borderTopStyle": "none", "borderTopWidth": "0px", "borderWidth": "0px", "bottom": "auto", "boxShadow": "none", "boxSizing": "content-box", "bufferedRendering": "auto", "captionSide": "top", "clear": "none", "clip": "auto", "clipPath": "none", "clipRule": "nonzero", "color": "rgb(0, 0, 0)", "colorInterpolation": "srgb", "colorInterpolationFilters": "linearrgb", "colorRendering": "auto", "cursor": "auto", "direction": "ltr", "display": "block", "dominantBaseline": "auto", "emptyCells": "show", "fill": "#000000", "fillOpacity": "1", "fillRule": "nonzero", "filter": "none", "flex": "0 1 auto", "flexBasis": "auto", "flexDirection": "row", "flexFlow": "row nowrap", "flexGrow": "0", "flexShrink": "1", "flexWrap": "nowrap", "float": "none", "floodColor": "rgb(0, 0, 0)", "floodOpacity": "1", "font": "normal normal normal 16px/normal Times", "fontFamily": "Times", "fontSize": "16px", "fontStyle": "normal", "fontVariant": "normal", "fontWeight": "normal", "glyphOrientationHorizontal": "0deg", "glyphOrientationVertical": "auto", "gridTemplate": "none", "imageRendering": "auto", "justifyContent": "flex-start", "kerning": "0", "left": "auto", "letterSpacing": "normal", "lightingColor": "rgb(255, 255, 255)", "lineHeight": "normal", "listStyle": "disc outside none", "listStyleImage": "none", "listStylePosition": "outside", "listStyleType": "disc", "markerEnd": "none", "markerMid": "none", "markerStart": "none", "mask": "none", "maskType": "luminance", "maxHeight": "none", "maxWidth": "none", "minHeight": "0px", "minWidth": "0px", "opacity": "1", "order": "0", "orphans": "auto", "outline": "rgb(0, 0, 0) none 0px", "outlineColor": "rgb(0, 0, 0)", "outlineOffset": "0px", "outlineStyle": "none", "outlineWidth": "0px", "overflow": "visible", "overflowWrap": "normal", "overflowX": "visible", "overflowY": "visible", "padding": "0px", "paddingBottom": "0px", "paddingLeft": "0px", "paddingRight": "0px", "paddingTop": "0px", "pageBreakAfter": "auto", "pageBreakBefore": "auto", "pageBreakInside": "auto", "pointerEvents": "auto", "position": "static", "resize": "none", "right": "auto", "shapeRendering": "auto", "speak": "normal", "stopColor": "rgb(0, 0, 0)", "stopOpacity": "1", "stroke": "none", "strokeDasharray": "none", "strokeDashoffset": "0", "strokeLinecap": "butt", "strokeLinejoin": "miter", "strokeMiterlimit": "4", "strokeOpacity": "1", "strokeWidth": "1", "tabSize": "8", "tableLayout": "auto", "textAlign": "start", "textAnchor": "start", "textDecoration": "none", "textIndent": "0px", "textOverflow": "clip", "textRendering": "auto", "textShadow": "none", "textTransform": "none", "top": "auto", "transition": "all 0s ease 0s", "transitionDelay": "0s", "transitionDuration": "0s", "transitionProperty": "all", "transitionTimingFunction": "ease", "unicodeBidi": "normal", "vectorEffect": "none", "verticalAlign": "baseline", "visibility": "visible", "webkitAnimationDelay": "0s", "webkitAnimationDirection": "normal", "webkitAnimationDuration": "0s", "webkitAnimationFillMode": "none", "webkitAnimationIterationCount": "1", "webkitAnimationName": "none", "webkitAnimationPlayState": "running", "webkitAnimationTimingFunction": "ease", "webkitAppRegion": "no-drag", "webkitAppearance": "none", "webkitAspectRatio": "none", "webkitBackfaceVisibility": "visible", "webkitBackgroundClip": "border-box", "webkitBackgroundComposite": "source-over", "webkitBackgroundOrigin": "padding-box", "webkitBorderAfter": "0px none rgb(0, 0, 0)", "webkitBorderAfterColor": "rgb(0, 0, 0)", "webkitBorderAfterStyle": "none", "webkitBorderAfterWidth": "0px", "webkitBorderBefore": "0px none rgb(0, 0, 0)", "webkitBorderBeforeColor": "rgb(0, 0, 0)", "webkitBorderBeforeStyle": "none", "webkitBorderBeforeWidth": "0px", "webkitBorderEnd": "0px none rgb(0, 0, 0)", "webkitBorderEndColor": "rgb(0, 0, 0)", "webkitBorderEndStyle": "none", "webkitBorderEndWidth": "0px", "webkitBorderFit": "border", "webkitBorderHorizontalSpacing": "0px", "webkitBorderImage": "none", "webkitBorderStart": "0px none rgb(0, 0, 0)", "webkitBorderStartColor": "rgb(0, 0, 0)", "webkitBorderStartStyle": "none", "webkitBorderStartWidth": "0px", "webkitBorderVerticalSpacing": "0px", "webkitBoxAlign": "stretch", "webkitBoxDecorationBreak": "slice", "webkitBoxDirection": "normal", "webkitBoxFlex": "0", "webkitBoxFlexGroup": "1", "webkitBoxLines": "single", "webkitBoxOrdinalGroup": "1", "webkitBoxOrient": "horizontal", "webkitBoxPack": "start", "webkitBoxReflect": "none", "webkitBoxShadow": "none", "webkitClipPath": "none", "webkitColumnAxis": "auto", "webkitColumnBreakAfter": "auto", "webkitColumnBreakBefore": "auto", "webkitColumnBreakInside": "auto", "webkitColumnCount": "auto", "webkitColumnGap": "normal", "webkitColumnProgression": "normal", "webkitColumnRule": "0px none rgb(0, 0, 0)", "webkitColumnRuleColor": "rgb(0, 0, 0)", "webkitColumnRuleStyle": "none", "webkitColumnRuleWidth": "0px", "webkitColumnSpan": "none", "webkitColumnWidth": "auto", "webkitColumns": "auto auto", "webkitFilter": "none", "webkitFontFeatureSettings": "normal", "webkitFontKerning": "auto", "webkitFontSmoothing": "auto", "webkitFontVariantLigatures": "normal", "webkitHighlight": "none", "webkitHyphenateCharacter": "auto", "webkitLineAlign": "none", "webkitLineBoxContain": "block inline replaced", "webkitLineBreak": "auto", "webkitLineClamp": "none", "webkitLineGrid": "none", "webkitLineSnap": "none", "webkitLocale": "auto", "webkitMarginAfterCollapse": "collapse", "webkitMarginBeforeCollapse": "collapse", "webkitMarginBottomCollapse": "collapse", "webkitMarginTopCollapse": "collapse", "webkitMarqueeDirection": "auto", "webkitMarqueeRepetition": "infinite", "webkitMarqueeStyle": "scroll", "webkitMaskBoxImage": "none", "webkitMaskBoxImageOutset": "0px", "webkitMaskBoxImageRepeat": "stretch", "webkitMaskBoxImageSlice": "0 fill", "webkitMaskBoxImageSource": "none", "webkitMaskBoxImageWidth": "auto", "webkitMaskClip": "border-box", "webkitMaskComposite": "source-over", "webkitMaskImage": "none", "webkitMaskOrigin": "border-box", "webkitMaskPosition": "0% 0%", "webkitMaskPositionX": "0%", "webkitMaskPositionY": "0%", "webkitMaskRepeat": "repeat", "webkitMaskSize": "auto", "webkitMaxLogicalHeight": "none", "webkitMaxLogicalWidth": "none", "webkitMinLogicalHeight": "0px", "webkitMinLogicalWidth": "0px", "webkitPaddingAfter": "0px", "webkitPaddingBefore": "0px", "webkitPaddingEnd": "0px", "webkitPaddingStart": "0px", "webkitPerspective": "none", "webkitPrintColorAdjust": "economy", "webkitRtlOrdering": "logical", "webkitRubyPosition": "before", "webkitTapHighlightColor": "rgba(0, 0, 0, 0.4)", "webkitTextCombine": "none", "webkitTextDecorationsInEffect": "none", "webkitTextEmphasisColor": "rgb(0, 0, 0)", "webkitTextEmphasisPosition": "over", "webkitTextEmphasisStyle": "none", "webkitTextFillColor": "rgb(0, 0, 0)", "webkitTextOrientation": "vertical-right", "webkitTextSecurity": "none", "webkitTextStrokeColor": "rgb(0, 0, 0)", "webkitTextStrokeWidth": "0px", "webkitTransform": "none", "webkitTransformStyle": "flat", "webkitTransition": "all 0s ease 0s", "webkitTransitionDelay": "0s", "webkitTransitionDuration": "0s", "webkitTransitionProperty": "all", "webkitTransitionTimingFunction": "ease", "webkitUserDrag": "auto", "webkitUserModify": "read-only", "webkitUserSelect": "text", "webkitWritingMode": "horizontal-tb", "whiteSpace": "normal", "widows": "auto", "wordBreak": "normal", "wordSpacing": "0px", "wordWrap": "normal", "writingMode": "lr-tb", "zIndex": "auto", "zoom": "1"};

function css(a){
    var rules = window.getComputedStyle(a);
    return rules.cssText;
}

var lastOuterHTML;

function shouldUpdate() {
    var outerHTML = document.body.outerHTML;
    var should = outerHTML !== lastOuterHTML;
    lastOuterHTML = outerHTML;
    return should;
}

var ignoreTagStyles = {
    'META': true,
    'SCRIPT': true,
    'STYLE': true,
    'NOSCRIPT': true,
    'LINK': true,
    'TITLE': true
};

function getPageSource() {
    var styles = {};
    var id = 0;
    var profile = Date.now();
    console.log('browser parse start');
    var allElems = document.getElementsByTagName('*');
    for (var i = 0, count = allElems.length; i < count; i++) {
        var elem = allElems[i];
        if (elem.tagName in ignoreTagStyles)
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
    temp.find('input,textarea').each(function() {
        $(this).val($(this).val());
    });

    console.log('Parsing took', Date.now() - profile);

    return {source: temp.html(), styles: styles};
}

updateHTML();
window.setInterval(function() {
    if (shouldUpdate())
        updateHTML();
}, 2000);


// =============== Drawing code =================

// var drawing = false;

// function startDrawing() {
//     var canvas = $('<canvas class="COLLAB-draw"/>');
//     canvas.height(document.body.scrollHeight);
//     canvas.width(document.body.scrollWidth);
//     $('body').append(canvas);
//     drawing = true;
// }

// function stopDrawing() {
//     drawing = false;
// }

// window.addEventListener('keydown', function(event) {
//     if (event.keyCode === 68 && event.altKey) {
//         if (!drawing) {
//             startDrawing();
//         } else {
//             stopDrawing();
//         }
//     }
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

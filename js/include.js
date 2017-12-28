console.log('included');
var inputs = document.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    if(input.id == 'lst-ib') break;
}
window.e1 = null; window.e2 = null; window.opt = null;
input.onkeydown = function(e) {
    if (e.isTrusted) {
        e1 = e;
        doKeyboardEvent1('down', e, this);
    }
    else {
        e2 = e;
        console.clear();
        ccc();
    }
};

window.ccc = function() {
    for (var i in e1) {
        if (i == 'timeStamp' || i == 'path' || i == 'isTrusted' || i == 'sourceCapabilities') continue;
        if (e1[i] != e2[i]) console.log(i, e1[i],  e2[i], opt[i]);
    }
}

window.doKeyboardEvent = function(type, char, obj) {
    var pressEvent = document.createEvent('KeyboardEvent');
    pressEvent.initKeyboardEvent(
        "key"+type,             //type
        true,                   //bubble
        true,                   //cancelable
        window,                 //view
        'q',                   //char
        'q'.charCodeAt(0),     //key
        0,                      //location
        false,                   //repeat
        ""                     //modifiers
    );
    //console.log(pressEvent);
    obj.dispatchEvent(pressEvent);
};

window.doKeyboardEvent1 = function(type, char) {
    if (type == undefined) type='press';
    if (char == undefined) char = 'q';
    /*opt = {
        code: 'Key'+char.toUpperCase(),
        key: char,
        view: window,
        keyCode: char.charCodeAt(0),
        charCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true,
        cancelable: true,
        isComposing: false,
        composed : true,
    };*/
    opt = char;
    console.log(opt);
    var pressEvent = new KeyboardEvent("key"+type, opt);
    //console.log(pressEvent);
    input.dispatchEvent(pressEvent);
}
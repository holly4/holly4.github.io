/// <reference path="typings/jquery/jquery.d.ts" />

const zeroWidthNoBreakSpace = 0xfeff;
const oghamSpaceMark = 0x1680;

const asciiLowerA = 97;
const asciiUpperA = 65;

const mssLowerA = 0x1D5BA;
const mssUpperA = 0x1D5A0;

const circlesLowerA = 0x24d0;
const circlesUpperA = 0x24B6;

const wordJoiner = 8288;
const utf8BOM = 65279;

function convertCharacter(ch, lowerA, upperA) {
    var code = ch.charCodeAt(0);

    if (ch >= 'a' && ch <= 'z') {
        var offset = code - asciiLowerA;
        var letter = lowerA + offset;
        return String.fromCodePoint(letter);

    } else if (ch >= 'A' && ch <= 'Z') {
        var offset = code - asciiUpperA;
        var letter = upperA + offset;
        return String.fromCodePoint(letter);

    } else {
        return ch;
    }
}

function unconvertCharacter(ch, lowerA, upperA) {
    var code = ch.charCodeAt(0);

    if (code >= lowerA && code <= lowerA + 25) {
        var offset = code - lowerA;
        var letter = asciiLowerA + offset;
        return String.fromCodePoint(letter);

    } else if (code >= upperA && code <= upperA + 25) {
        var offset = code - upperA;
        var letter = asciiUpperA + offset;
        return String.fromCodePoint(letter);

    } else {
        return ch;
    }
}

function convertString(raw, lowerA, upperA) {
    var cooked = "";
    for (var i = 0; i < raw.length; i++) {
        cooked += convertCharacter(raw.charAt(i), lowerA, upperA);
    }
    return cooked;
}

function unconvertString(raw, lowerA, upperA) {
    var cooked = "";
    for (var i = 0; i < raw.length; i++) {
        cooked += unconvertCharacter(raw.charAt(i), lowerA, upperA);
    }
    return cooked;
}

function addSpaces(raw, space) {
    var cooked = "";
    for (var i = 0; i < raw.length; i++) {
        var ch = raw.charAt(i);
        cooked += ch;
        if (ch != ' ' && i < (raw.length - 1))
            cooked += space;
    }
    return cooked;
}

function removeSpaces(raw, space) {
    var cooked = "";
    for (var i = 0; i < raw.length; i++) {
        var ch = raw.charAt(i);
        if (ch != space)
            cooked += ch;
    }

    return cooked;
}

function insertLarjassCharacters(raw, mid, poses) {
    var cooked = raw;

    // work from back to front
    for (var i=poses.length; i; i--) {
        var pos = poses[i-1];
        var pre = cooked.substring(0, pos);
        var post = cooked.substring(pos);
        cooked = pre + mid + post;
    }

    return cooked;
}

function convertLarjassWord(raw) {
    var cooked;
    var mid = String.fromCodePoint(wordJoiner)
        + String.fromCodePoint(utf8BOM)
        + String.fromCodePoint(utf8BOM)
        + String.fromCodePoint(wordJoiner)

    if (raw.length<3) {
        cooked = raw;
    } else if (raw.length==5) {
        // xxx#xx
        cooked = insertLarjassCharacters(raw, mid, [3]);
    } else if (raw.length<5) {
        // xx#x or xx#xx
        cooked = insertLarjassCharacters(raw, mid, [2]);
    } else if (raw.length<7) {
        // xx#xx#x xx#xx#xx
        cooked = insertLarjassCharacters(raw, mid, [2, 4]);
    } else {
        // xx#xx#xx#xx ... 
        cooked = insertLarjassCharacters(raw, mid, [2, 4, 6]);
    }

    return cooked;
}

function convertLarjass(raw) {
    var cooked = "";
    var words = raw.split(" ");
    words.forEach(function(word){
        var cookedWord = convertLarjassWord(word);
        cooked += cookedWord + " ";          
    });

    return cooked.trim();
}

function convertText() {
    var charSet = $('#charSet').val();
    var rawText = $('#rawText').val();
    var cookedText = rawText;

    if (charSet == 'nbs') {
        var space = String.fromCodePoint(zeroWidthNoBreakSpace);
        cookedText = addSpaces(rawText, space);
    } else if (charSet == 'osm') {
        var space = String.fromCodePoint(oghamSpaceMark);
        cookedText = addSpaces(rawText, space);
    } else if (charSet == 'mss') {
        cookedText = convertString(rawText, mssLowerA, mssUpperA);
    } else if (charSet == 'circles') {
        cookedText = convertString(rawText, circlesLowerA, circlesUpperA);
    } else if (charSet == 'larjass') {
        cookedText = convertLarjass(rawText);
    }

    // Define our data object
    var context = {
        "rawText": rawText,
        "rawLength": rawText.length,
        "cookedText": cookedText,
        "cookedLength": cookedText.length,
    };

    $('#rawLength').val(context.rawLength);
    $('#cookedText').val(context.cookedText);
    $('#cookedLength').val(context.cookedText.length);

    console.log("context", context);

    //Get the contents from the script block 
    var source = $("#result-template").html();
    //console.log("source\n", source);

    //Compile into a template
    template = Handlebars.compile(source);

    //The raw text is "{{rawText}}" and is {{rawLength}} characters long.
    //The cooked text is "{{cookedText}}" and is {{cookedLength}} characters long.

    // Pass our data to the template
    var compiledHtml = template(context);
    //console.log("compiledHtml\n", compiledHtml);

    $("#resultDiv").html(compiledHtml);
}

function unconvertText() {
    var charSet = $('#charSet').val();
    var rawText = $('#rawText').val();
    var cookedText = rawText;

    if (charSet == 'nbs') {
        var space = String.fromCodePoint(zeroWidthNoBreakSpace);
        cookedText = removeSpaces(rawText, space);
    } else if (charSet == 'osm') {
        var space = String.fromCodePoint(oghamSpaceMark);
        cookedText = removeSpaces(rawText, space);
    } else if (charSet == 'mss') {
        cookedText = unconvertString(rawText, mssLowerA, mssUpperA);
    } else if (charSet == 'circles') {
        cookedText = unconvertString(rawText, circlesLowerA, circlesUpperA);
    }

    // Define our data object
    var context = {
        "rawText": rawText,
        "rawLength": rawText.length,
        "cookedText": cookedText,
        "cookedLength": cookedText.length,
    };

    $('#rawLength').val(context.rawLength);
    $('#cookedText').val(context.cookedText);
    $('#cookedLength').val(context.cookedText.length);

    console.log("context", context);

    //Get the contents from the script block 
    var source = $("#result-template").html();
    //console.log("source\n", source);

    //Compile into a template
    template = Handlebars.compile(source);

    // Pass our data to the template
    var compiledHtml = template(context);
    //console.log("compiledHtml\n", compiledHtml);

    $("#resultDiv").html(compiledHtml);
}


function Test() {
    var originalText = $('#rawText').val();
    convertText();
    var cookedText = $('#cookedText').val();

    $('#rawText').val(cookedText);
    unconvertText();

    var finalText = $('#cookedText').val();

    console.log(originalText);
    console.log(finalText);
    console.log(originalText==finalText);
}

$(function () {
    //console.log("start");

    $("#convertButton").click(convertText);
    $("#unconvertButton").click(unconvertText);

    $("#testButton").hide();
    $("#testButton").click(Test);
});

/// <reference path="typings/jquery/jquery.d.ts" />

var zeroWidthNoBreakSpace = 0xfeff;
var oghamSpaceMark = 0x1680;

var asciiLowerA = 97;
var asciiUpperA = 65;

var mssLowerA = 0x1D5BA;
var mssUpperA = 0x1D5A0;

var circlesLowerA = 0x24d0;
var circlesUpperA = 0x24B6;

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

function convertText() {
    var charSet = $('#charSet').val();
    var rawText = $('#rawText').val();

    if (charSet == 'nbs') {
        var space = String.fromCodePoint(zeroWidthNoBreakSpace);
        var cookedText = addSpaces(rawText, space);
    } else if (charSet == 'osm') {
        var space = String.fromCodePoint(oghamSpaceMark);
        var cookedText = addSpaces(rawText, space);
    } else if (charSet == 'mss') {
        var cookedText = convertString(rawText, mssLowerA, mssUpperA);
    } else if (charSet == 'circles') {
        var cookedText = convertString(rawText, circlesLowerA, circlesUpperA);
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

    if (charSet == 'nbs') {
        var space = String.fromCodePoint(zeroWidthNoBreakSpace);
        var cookedText = removeSpaces(rawText, space);
    } else if (charSet == 'osm') {
        var space = String.fromCodePoint(oghamSpaceMark);
        var cookedText = removeSpaces(rawText, space);
    } else if (charSet == 'mss') {
        var cookedText = unconvertString(rawText, mssLowerA, mssUpperA);
    } else if (charSet == 'circles') {
        var cookedText = unconvertString(rawText, circlesLowerA, circlesUpperA);
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

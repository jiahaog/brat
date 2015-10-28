/**
 * Created by JiaHao on 27/10/15.
 */

var fs = require('fs');
var path = require('path');
var normalizeNewline = require('normalize-newline');

function occurenceIndexes(inp, toFind) {
    var indices = [];
    var element = toFind;
    var idx = inp.indexOf(element);
    while (idx != -1) {
        indices.push(idx);
        idx = inp.indexOf(element, idx + 1);
    }
    return indices;
}

const ANNONATION = {
    start: '{',
    end: '}'
};

/**
 * Parses a file at a path
 * @param path
 * @returns {Array}
 * @param annotation
 */
function parseText(path, annotation) {
    var rawText = normalizeNewline(fs.readFileSync(path).toString());
    var annotationToken = annotation || ANNONATION;

    var startOccurances = occurenceIndexes(rawText, annotationToken.start);
    var endOccurances = occurenceIndexes(rawText, annotationToken.end);

    var allOccurances = startOccurances.concat(endOccurances).sort(function(a, b){return a-b});
    var subtractIndexes = {};

    for (var i = 0; i < allOccurances.length; i++) {
        subtractIndexes[allOccurances[i]] = i;
    }

    var result = [];
    var stack = [];  // stack of start occurances

    var counter = 0;
    var startOccuranceCounter = 0;
    var endOccuranceCounter = 0;

    var startOccuranceNext;
    var endOccuranceNext;

    while (counter < rawText.length) {

        startOccuranceNext = startOccurances[startOccuranceCounter];
        endOccuranceNext = endOccurances[endOccuranceCounter];

        if (counter === startOccuranceNext) {
            stack.push(startOccuranceNext);
            startOccuranceCounter+=1;
        } else if (counter === endOccuranceNext) {
            var stackNext = stack.pop();
            result.push([stackNext, endOccuranceNext]);
            endOccuranceCounter+=1;
        }

        counter += 1;

    }

    var subtractFunction = function (element) {
        return element - subtractIndexes[element];
    };

    result = result.map(function (tuple) {
        return tuple.map(subtractFunction);
    });

    return result;
}

module.exports = parseText;

if (require.main === module) {


    var expected = [
        [6, 10],
        [35, 39],
        [71, 76],
        [296, 303],
        [356,362]
    ];

    var toParsePath =  path.join(__dirname, '../', 'examples/annotatedData.txt');
    var result = parseText(toParsePath);
}

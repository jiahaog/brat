var chai = require('chai');
var assert = chai.assert;
var _ = require('underscore');

var parser = require('./../lib/parser');
var ANNOTATED_PATH = __dirname + '/inp/annotatedData.txt';

describe('Parser', function () {
    this.timeout(50000);
    it('Can get positions from annotated text', function () {

        var expected = [
            [6, 10],
            [6, 15],
            [35, 39],
            [71, 76],
            [296, 303],
            [356,362]
        ];

        var results = parser(ANNOTATED_PATH);
        var resultsCorrect = _.isEqual(expected, results);
        assert.isTrue(resultsCorrect);
    });
});
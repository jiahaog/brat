/**
 * Created by JiaHao on 27/10/15.
 */

var brat = require('./brat');
var parser = require('./parser');
var async = require('async');

function saveToBrat(userId, annotatedPath) {
    var parsedPositions = parser(annotatedPath);

    async.waterfall([
        function (callback) {
            brat.login(userId, function (error, sid) {
                callback(error, sid);
            });
        },

        function (sid, callback) {
            brat.annotateText(userId, sid, parsedPositions, function (error, sid, body) {
                callback(error, sid);
            })
        },

        function (sid, callback) {
            brat.errorCheck(userId, sid, function (error, sid, problems, body) {
                if (problems) {
                    callback(problems, sid, problems);
                    return;
                }

                callback(error, sid, problems);
            });
        }

    ], function (error) {
        if (error) {
            console.error('Error:');
            console.error(error);
            return;
        }
        console.log('Done!');
    });
}

function getProblemSpans(userId, callback) {
    async.waterfall([
        function (callback) {
            brat.login(userId, function (error, sid) {
                callback(error, sid);
            });
        },

        function (sid, callback) {
            brat.errorCheck(userId, sid, function (error, sid, problems, body) {
                callback(error, sid, problems);
            });
        }

    ], function (error, sid, problems) {
        if (error) {
            callback(error, sid, problems);
            return;
        }

        callback(null, sid, problems);
    });
}

/**
 * Deletes tags in a range
 * @param userId
 * @param start {number} inclusive
 * @param end {number} exclusive
 * @param callback
 */
function deleteSpans(userId, start, end, callback) {
    var problems = [];
    for (var i = start; i < end; i++) {
        problems.push('T' + i);
    }

    console.log(problems);
    async.waterfall([
        function (callback) {
            brat.login(userId, function (error, sid) {
                callback(error, sid);
            });
        },
        function (sid, callback) {
            brat.deleteSpans(userId, problems, sid, function (error) {
                if (error) {
                    callback(error, sid);
                    return;
                }
                console.log('Fixed problem fields: ' + problems);
                callback(null, sid);
            })
        }
    ], callback);
}

function fixProblems(userId, callback) {
    async.waterfall([
        function (callback) {
            getProblemSpans(userId, function (error, sid, problems) {
                callback(error, sid, problems);
            });
        },
        function (sid, problems, callback) {
            brat.deleteSpans(userId, problems, sid, function (error) {
                if (error) {
                    callback(error, sid);
                    return;
                }
                console.log('Fixed problem fields: ' + problems);
                callback(null, sid);
            });
        }
    ], callback);
}

if (require.main === module) {
    var path = require('path');
    var toParsePath =  path.join(__dirname, '../', 'examples/annotatedData.txt');
    var userId = 100000;
    //saveToBrat(userId, toParsePath);
    deleteSpans(userId, 47, 96, function (error) {
        console.log(error);
    });
}

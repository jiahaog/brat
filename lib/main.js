/**
 * Created by JiaHao on 27/10/15.
 */

var brat = require('./base');
var parser = require('./parser');
var async = require('async');
var _ = require('underscore');

function saveToBrat(userId, annotatedPath) {
    var parsedPositions = parser(annotatedPath);
    async.waterfall([
        function (callback) {
            brat.login(userId, function (error, sid) {
                callback(error, sid);
            });
        },
        function (sid, callback) {
            brat.getTags(userId, sid, function (error, sid, tags) {
                if (error) {
                    callback(error, sid);
                    return;
                }

                var allTagPositions = tags.map(function (element) {
                    return element.position;
                });
                console.log(allTagPositions);
                
                var duplicatesRemoved = parsedPositions.filter(function (currentTag) {
                    for (var i = 0; i < allTagPositions.length; i++) {
                        var currentAllTag = allTagPositions[i];
                        if (_.isEqual(currentAllTag, currentTag)) {
                            return false;
                        }
                    }
                    return true;
                });

                console.log(duplicatesRemoved);
                callback(null, sid, duplicatesRemoved);
            });
        },
        function (sid, duplicatesRemoved, callback) {
            brat.annotateText(userId, sid, duplicatesRemoved, function (error, sid, body) {
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
                console.log('Removed problem fields: ' + problems);
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

module.exports = {
    saveToBrat: saveToBrat
};

if (require.main === module) {
    var path = require('path');
    var toParsePath =  path.join(__dirname, '../', 'examples/annotatedData.txt');
    var userId = 1000000;
    saveToBrat(userId, toParsePath);
    //deleteSpans(userId, 47, 150, function (error) {
    //    console.log(error);
    //});
}

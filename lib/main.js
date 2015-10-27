/**
 * Created by JiaHao on 27/10/15.
 */

var brat = require('./base');
var parser = require('./parser');
var async = require('async');
var _ = require('underscore');

/**
 * Default callback
 * @param error
 */
function defaultCallback(error) {
    if (error) {
        console.error('Error:');
        console.error(error);
        return;
    }
    console.log('Done!');
}

/**
 * @param userId {string}
 * @param annotatedPath {string}
 * @param [callback]
 */
function saveToBrat(userId, annotatedPath, callback) {
    var parsedPositions = parser(annotatedPath);
    var done = callback || defaultCallback;

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
                
                var duplicatesRemoved = parsedPositions.filter(function (currentTag) {
                    for (var i = 0; i < allTagPositions.length; i++) {
                        var currentAllTag = allTagPositions[i];
                        if (_.isEqual(currentAllTag, currentTag)) {
                            return false;
                        }
                    }
                    return true;
                });

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

    ], done);
}

/**
 * @param userId
 * @param callback
 */
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
    var done = callback || defaultCallback;
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
    ], done);
}

/**
 *
 * @param userId {string}
 * @param [callback]
 */
function fixProblems(userId, callback) {
    var done = callback || defaultCallback;
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
    ], done);
}

/**
 *
 * @param userId
 * @param [callback]
 */
function removeDuplicates(userId, callback) {
    var done = callback || defaultCallback;
    async.waterfall([
        function (callback) {
            brat.login(userId, function (error, sid) {
                callback(error, sid);
            });
        },
        function (sid, callback) {
            brat.getDuplicateTags(userId, sid, function (error, sid, tags) {

                callback(error, sid, tags);
            });
        },
        function (sid, problems, callback) {
            brat.deleteSpans(userId, problems, sid, function (error) {
                if (error) {
                    callback(error, sid);
                    return;
                }
                console.log('Fixed duplicate fields: ' + problems);
                callback(null, sid);
            });
        }
    ], done);
}

module.exports = {
    saveToBrat: saveToBrat,
    deleteSpans: deleteSpans,
    fixProblems: fixProblems
};

if (require.main === module) {
    var path = require('path');
    var toParsePath =  path.join(__dirname, '../', 'examples/annotatedData.txt');
    var userId = 1000000;
    //saveToBrat(userId, toParsePath);
    //deleteSpans(userId, 47, 150, function (error) {
    //    console.log(error);
    //});

    //removeDuplicates(userId, function (error) {
    //    console.log(error);
    //});
}

var request = require('request');
var crypto = require('crypto');
var async = require('async');
var _ = require('underscore');
var HEADERS = {
    Pragma: 'no-cache',
    Origin: 'http://brat.statnlp.com',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: '*/*',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
    Connection: 'keep-alive',
    Referer: 'http://brat.statnlp.com/main/',
    DNT: '1'
};

var ENDPOINT = 'http://brat.statnlp.com/main/ajax.cgi';
var ASYNC_LIMIT = 1;

/**
 * @callback bratCallback
 * @param error
 * @param sid Unique to the current user
 * @param body Response body
 */

/**
 * @param userId
 * @param sid
 * @param positions {Array} Pass in an array of tuples of offsets, e.g [[1785,1790],[1790,1792]]
 * @param callback
 */
function annotateText(userId, sid, positions, callback) {

    var singleEntry = function (position, callback) {
        var offsets = JSON.stringify([position]);
        var formData = {
            action: 'createSpan',
            offsets:offsets,
            document:'sms_corpus',
            type: 'Noun-Phrase',
            comment: '',
            attributes: {},
            normalizations:[],
            protocol:1
        };

        formData.collection = '/sms_corpus/students/' + userId.toString() + '/';

        bratRequest(sid, formData, function (error, response, body) {
            callback(error, sid, body);
        });
    };

    async.eachLimit(positions, ASYNC_LIMIT, function (position, callback) {
        singleEntry(position, callback);
    }, function (error) {
        callback(error);
    });
}

function getProblemSpans(messages) {
    var re = /T\d+/g;
    var s = messages;
    var m;

    var result = [];

    do {
        m = re.exec(s);
        if (m) {
            result.push(m[0]);
        }
    } while (m);
    return result;
}

/**
 *
 * @param {string} sid
 * @param {{}} formData
 * @param {bratCallback} callback
 */
function bratRequest(sid, formData, callback) {
    var headers = JSON.parse(JSON.stringify(HEADERS));
    headers.Cookie = 'sid=' + sid;
    request.post({
            url: ENDPOINT,
            form: formData,
            headers: headers
        },
        function (error, response, body) {
            if (error) {
                callback(error);
                return;
            }

            var bodyObj = JSON.parse(body);
            var exception = bodyObj['exception'];

            var errorObj = { body: body };
            errorObj['problems'] = getProblemSpans(bodyObj['messages']);

            if (exception) {
                callback(errorObj);
                return;
            }

            //var bodyMessages = JSON.stringify(bodyObj['messages']);
            //if (bodyMessages.indexOf('error') > -1) {
            //    callback(errorObj);
            //    return;
            //}

            callback(null, sid, bodyObj);
        }
    );
}

function login(user, callback) {
    var sid = crypto.randomBytes(20).toString('hex');
    var formData = {
        action:'login',
        user:user.toString(),
        password:user.toString(),
        protocol:1
    };

    bratRequest(sid, formData, function (error, response, body) {
        callback(error, sid, body);
    });
}

function getDocument(userId, sid, callback) {
    var formData = {
        action: 'getDocument',
        document:'sms_corpus',
        protocol:1
    };
    formData.collection = '/sms_corpus/students/' + userId.toString() + '/';

    bratRequest(sid, formData, function (error, response, body) {
        callback(error, sid, body)
    })
}

/**
 * Checks if there are any errors
 * @param userId
 * @param sid
 * @param callback
 */
function errorCheck(userId, sid, callback) {
    getDocument(userId, sid, function (error, sid, body) {
        // assumes no error and returns data in 3rd callback parameter

        if (error) {
            var problems = error.problems
        } else {
            problems = null;
        }
        callback(null, sid, problems, body);
    });
}

function getTags(userId, sid, callback) {
    getDocument(userId, sid, function (error, sid, body) {
        if (error) {
            callback(error, sid);
            return;
        }

        var tags = body['entities'];
        var tagsParsed = tags.map(function (element) {
            return {
                tag: element[0],
                type: element[1],
                position: element[2][0]
            };
        });

        callback(null, sid, tagsParsed);
    });
}

function arrayInArray(bigArray, check) {
    return bigArray.some(function (element) {
        return _.isEqual(check, element);
    });
}

function arrayGetDuplicates(duplicates) {
    var unique = [];
    return duplicates.filter(function (element) {
        var position = element.position;
        if (arrayInArray(unique, position)) {
            return true;
        }

        unique.push(position);
        return false;
    });
}

function getDuplicateTags(userId, sid, callback) {
    getTags(userId, sid, function (error, sid, tags) {
        if (error) {
            callback(error);
            return;
        }
        
        var duplicates = arrayGetDuplicates(tags);
        var duplicateTagNumbers = duplicates.map(function (element) {
            return element.tag;
        });

        callback(null, sid, duplicateTagNumbers);
    });
}

function deleteSpan(userId, spanId, sid, callback) {
    var formData = {
        action: 'deleteSpan',
        offsets: '',
        type: 'Noun-Phrase',
        id: spanId,
        document:'sms_corpus',
        protocol:1
    };
    formData.collection = '/sms_corpus/students/' + userId.toString() + '/';

    bratRequest(sid, formData, function (error, sid, body) {
        // somehow error is always truthy here even on success, so we just pass it
        callback(null, sid, body);
    })
}

function deleteSpans(userId, problems, sid, callback) {
    async.eachLimit(problems, 1, function (problem, callback) {
        deleteSpan(userId, problem, sid, function (error) {
            callback(error, sid);
        });
    }, callback);
}

module.exports = {
    login: login,
    annotateText: annotateText,
    getDocument: getDocument,
    deleteSpans: deleteSpans,
    errorCheck: errorCheck,
    getTags: getTags,
    getDuplicateTags: getDuplicateTags
};

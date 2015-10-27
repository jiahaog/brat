/**
 * Created by JiaHao on 27/10/15.
 */
var fs = require('fs');
var path = require('path');
var usage = fs.readFileSync(__dirname + '/usage.txt').toString();
var argv = require('minimist')(process.argv.slice(2, 4));
var brat = require('./main');

var userId = argv._[0];
var annotatedPath = argv._[1];

if (!userId || !annotatedPath) {
    console.error(usage);
    return;
}

if (!path.parse(annotatedPath)) {
    console.error(usage);
    return;
}

brat.saveToBrat(userId, annotatedPath);

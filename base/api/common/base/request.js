"use strict";
var http = require('http');
var https = require('https');
var url_1 = require('url');
var common_1 = require('./common');
var lodash_1 = require('lodash');
var fs_1 = require('fs');
var zlib_1 = require('zlib');
function request(options) {
    var req;
    return new Promise(function (c, e) {
        var endpoint = url_1.parse(options.url);
        var rawRequest = endpoint.protocol === 'https:' ? https.request : http.request;
        var opts = {
            hostname: endpoint.hostname,
            port: endpoint.port ? parseInt(endpoint.port) : (endpoint.protocol === 'https:' ? 443 : 80),
            path: endpoint.path,
            method: options.type || 'GET',
            headers: options.headers,
            agent: options.agent,
            rejectUnauthorized: common_1.isBoolean(options.strictSSL) ? options.strictSSL : true
        };
        if (options.user && options.password) {
            opts.auth = options.user + ':' + options.password;
        }
        req = rawRequest(opts, function (res) {
            var followRedirects = common_1.isNumber(options.followRedirects) ? options.followRedirects : 3;
            if (res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
                request(lodash_1.assign({}, options, {
                    url: res.headers['location'],
                    followRedirects: followRedirects - 1
                })).then(c, e);
            }
            else {
                var stream = res;
                if (res.headers['content-encoding'] === 'gzip') {
                    stream = stream.pipe(zlib_1.createGunzip());
                }
                c({ req: req, res: res, stream: stream });
            }
        });
        req.on('error', e);
        if (options.timeout) {
            req.setTimeout(options.timeout);
        }
        if (options.data) {
            req.write(options.data);
        }
        req.end();
    });
}
exports.request = request;
function isSuccess(context) {
    return (context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
}
function hasNoContent(context) {
    return context.res.statusCode === 204;
}
function download(filePath, context) {
    return new Promise(function (c, e) {
        var out = fs_1.createWriteStream(filePath);
        out.once('finish', function () { return c(null); });
        context.stream.once('error', e);
        context.stream.pipe(out);
    });
}
exports.download = download;
function asText(context) {
    return new Promise(function (c, e) {
        if (!isSuccess(context)) {
            return e('Server returned ' + context.res.statusCode);
        }
        if (hasNoContent(context)) {
            return c(null);
        }
        var buffer = [];
        context.stream.on('data', function (d) { return buffer.push(d); });
        context.stream.on('end', function () { return c(buffer.join('')); });
        context.stream.on('error', e);
    });
}
exports.asText = asText;
function asJson(context) {
    return new Promise(function (c, e) {
        if (!isSuccess(context)) {
            return e('Server returned ' + context.res.statusCode);
        }
        if (hasNoContent(context)) {
            return c(null);
        }
        if (!/application\/json/.test(context.res.headers['content-type'])) {
            return e('Response doesn\'t appear to be JSON');
        }
        var buffer = [];
        context.stream.on('data', function (d) { return buffer.push(d); });
        context.stream.on('end', function () { return c(JSON.parse(buffer.join(''))); });
        context.stream.on('error', e);
    });
}
exports.asJson = asJson;
//# sourceMappingURL=request.js.map
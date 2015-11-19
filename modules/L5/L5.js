"use strict";
/**
 *
 * AJAX Proxy
 * @author coverguo
 *
 */
var Promise = require('./lib/promise'),
    _ = require('lodash'),
    http = require('http'),
    url = require('url'),
    Cookie = require('./lib/Cookie/cookie'),
    zlib = require('zlib'), //压缩
    L5 = require('./L5.api.js');

function createPromise() {
    var args;
    var promise = new Promise(function() {
        args = [].slice.call(arguments);
    });
    promise.resolve = args[0];
    promise.reject = args[1];
    return promise;
}

Promise.prototype.always = function(foo) {
    return this.then(foo, foo);
};

var _noop = function() {},
    _extend = function(target, srcs) {
        if (arguments.length === 1) return _extend(this, target);
        srcs = [].slice.call(arguments, 1);
        var i = 0,
            l = srcs.length,
            src, key;
        for (; i < l; i++) {
            src = srcs[i];
            for (key in src) {
                target[key] = src[key];
            }
        }
        return target;
    },
    encryptSkey = function(str) {
        if (!str) {

            return "";
        }
        var hash = 5381;
        for (var i = 0, len = str.length; i < len; ++i) {
            hash += (hash << 5) + str.charAt(i).charCodeAt(); // jshint ignore:line
        }
        return hash & 0x7fffffff; // jshint ignore:line
    },
    getSkey = function() {
        if (Login.isWeixinUser()) {
            return cookie.get('uid_a2') || '';
        } else {
            return cookie.get('skey') || '';
        }
    };

function Loader(req, res, opt) {
    this._proxyRequest = req;
    this._proxyResponse = res;
}


Loader.prototype.getUin = function(req) {
    var cookies = this._proxyRequest.headers.cookie || "";
    if (cookies) {
        cookies = Cookie.parse(cookies);
        var uin = cookies["uin"];
        return uin.replace("o0", "");
    } else {
        return "";
    }
};

Loader.prototype.request = function(opt) {

    var info, key, Content;

    return opt.l5api ? this.l5Request(opt) : this.doRequest(opt);

};

//L5带你去ajax
Loader.prototype.l5Request = function(opt) {
    var that = this,
        defer = createPromise(),
        l5api = _.extend({
            modid: 432385, // 这里的modid和cmd是申请的L5 id，其实也可以不用hard code啦，用opt传进来的就好。
            cmd: 131072
        }, opt.l5api);

    if (l5api.modid === 0) {
        return this.doRequest(opt);
    }
    L5.ApiGetRoute({
        modid: l5api.modid,
        cmd: l5api.cmd
    }).then(function(route) {

        var start = new Date();

        opt.ip = route.ip;
        opt.port = route.port;

        //开始真正的请求
        that.doRequest(opt).then(function(d) {
            //加上toip
            d = _.extend({
                toIp: opt.ip
            }, d);
            defer.resolve(d);
        }, function(d) {
            //加上toip
            d = _.extend({
                toIp: opt.ip
            }, d);
            defer.reject(d);
        }).always(function(d) {

            if (d.opt && d.opt.headers && d.opt.headers['tencent-leakscan']) {
                // 忽略安全中心请求
                return;
            }

            var end = new Date();

            //上报调用结果
            L5.ApiRouteResultUpdate({
                modid: l5api.modid,
                cmd: l5api.cmd,
                usetime: end - start,
                ret: (d && d.hasError) ? -1 : 0,
                ip: route.ip,
                port: route.port,
                pre: route.pre,
                flow: route.flow
            });

        });

    }, function(d) {
        if (opt.dcapi) {
            dcapi.report({
                fromId: opt.dcapi.fromId,
                toId: opt.dcapi.toId,
                interfaceId: opt.dcapi.interfaceId,
                toIp: '127.0.0.1',
                code: d.ret,
                isFail: 1,
                delay: 100
            });
        }

        defer.reject({
            opt: opt,
            buffer: null,
            result: null,
            responseText: null,
            hasError: true,
            msg: 'L5 get error! ' + d.ret,
            response: null,
            toIp: "127.0.0.1"
        });

        opt.error && defer.fail(opt.error);
    });

    return defer;
}


//普通请求
Loader.prototype.doRequest = function(opt) {
    var self = this;

    try{


    var defer = createPromise(),
        that = this,
        isConnect = false,
        times = {
            start: 0,
            response: 0,
            end: 0
        };


    opt = _.extend({
        retry: 1, //重试次数
        port: 80,
        host: '',
        type: 'GET',
        url: '',
        path: '',
        headers: {},
        timeout: 2000,
        data: {},
        body: null,
        success: null,
        error: null,
        jsonpCallback: null,
        dataType: 'json',
        send: null,
        autoToken: true, //自动带token
        enctype: 'application/x-www-form-urlencoded', //multipart/form-data
    }, opt);

    opt.type = opt.type.toUpperCase();

    if (opt.url) {
        var obj = url.parse(opt.url);
        opt.host = obj.hostname || obj.host;
        opt.port = opt.port || obj.port || 80;
        opt.path = obj.path || obj.path;
    }
    //如果需要带上cookie则带上
    if (opt.withCookie) {
        opt.headers.Cookie = this._proxyRequest.headers.cookie || "";
    }

    var arr = [];

    if (!opt.data) {
        opt.data = {};
    }

    //设置bkn
    if (opt.autoToken) {
        if (opt.headers.Cookie) {
            var cookies = Cookie.parse(opt.headers.Cookie);
            var skey = cookies["skey"];
            opt.data["bkn"] = encryptSkey(skey);
        }
    }

    //加入到参数数组上
    for (key in opt.data) {
        v = opt.data[key];
        if (v !== undefined && v !== null) {
            arr.push([key, encodeURIComponent(v)].join('='));
        }
    };


    if (arr.length > 0) {
        if (opt.type === 'POST') {
            if (opt.enctype === 'multipart/form-data') {

                opt.boundary = opt.boundary || Math.random().toString(16);
                opt.headers['Content-Type'] = 'multipart/form-data; boundary=' + opt.boundary;

                arr = [];
                for (key in opt.data) {
                    v = opt.data[key];
                    if (v !== undefined && v !== null) {
                        arr.push(
                            [
                                '--' + opt.boundary,
                                'Content-Type: text/plain; charset=utf-8',
                                'Content-Disposition: form-data; name="' + key + '"',
                                '',
                                v
                            ].join('\r\n')
                        );
                    }
                }

                arr.push('--' + opt.boundary + '--');
                opt.body = arr.join('\r\n');

            } else {
                opt.headers['Content-Type'] = opt.headers['Content-Type'] || opt.enctype;
                opt.body = arr.join('&');
            }
        } else {
            if (opt.path.indexOf('?') === -1) {
                opt.path = opt.path + '?' + arr.join('&');
            } else {
                opt.path = opt.path + '&' + arr.join('&');
            }
        }

    }


    if (opt.host) {
        opt.headers.host = opt.host;
    } else {
        opt.host = opt.headers.host;
    }

    // TODO
    if (opt.referer) {
        opt.headers.Referer = opt.referer;
    }

    defer.done(function(result) {
        self._doneAll = self._doneAll || {};
        self._doneAll[opt.url.replace(/\?.*$/, '')] = result.responseText;
        opt.success && opt.success(result);
    });

    opt.error && defer.fail(opt.error);

    //开始时间点
    times.start = new Date().getTime();

    //解决undefined报错问题
    var key;
    for (key in opt.headers) {
        var v = opt.headers[key];

        if (v === undefined) {
            opt.headers[key] = '';
        }

    };

    if (opt.type === 'POST' && opt.dataType === 'proxy' && this._proxyRequest) {
        if (this._proxyRequest.REQUEST.body) {
            opt.body = this._proxyRequest.REQUEST.body;
        } else {
            opt.send = function(request) {
                that._proxyRequest.on('data', function(buffer) {
                    request.write(buffer);
                });

                that._proxyRequest.once('end', function(buffer) {
                    that._proxyRequest.removeAllListeners('data');
                    request.end();
                });
            }
        }
    }

    if (opt.type === 'GET' && opt.headers['content-length']) {
        opt.headers['content-length'] = 0;
    } else if (opt.body) {
        if (Buffer.isBuffer(opt.body)) {

        } else {
            opt.body = new Buffer(opt.body, 'UTF-8');
        }

        opt.headers['Content-Length'] = opt.body.length;
    }

    //发出请求
    var request = http.request({
        agent: false,
        host: opt.ip || opt.host,
        port: opt.port,
        path: opt.path,
        method: opt.type,
        headers: opt.headers
    });

    request.setNoDelay(true);
    request.setSocketKeepAlive(false);

    // 无论失败还是成功都会调用
    defer.always(function() {
        clearTimeout(tid);
        request.removeAllListeners();
        request.abort();
        request.destroy();
        request = null;
        tid = null;
    });

    //超时处理
    var tid = setTimeout(function() {
        request.emit('fail', new Error('request timeout'));
    }, opt.timeout);

    //监听error事件
    request.once('error', function(err) {
        request.emit('fail', err);
    });

    //监听fail事件
    request.once('fail', function(err) {
        //结束时间点
        times.end = new Date().getTime();
        if (opt.retry > 0) {
            opt.retry = opt.retry - 1;
            that.request(opt).done(function(d) {
                defer.resolve(d);
            }, function(d) {
                defer.reject(d);
            });
            return;
        } else {
            //report(opt,1,513 + opt.retry);
        }

        defer.reject({
            opt: opt,
            hasError: true,
            e: err,
            msg: 'request error:' + JSON.stringify(err),
            times: times
        });

    });

    request.once('connect', function() {
        isConnect = true;
    });

    request.once('socket', function() {});

    request.once('response', function(response) {

        var result = [];
        var pipe = response;
        var isProxy = false;
        var key;

        if (opt.dataType === 'proxy' && that._proxyResponse) {
            isProxy = true;
        }

        //不能省掉，加上响应请求级变量
        process.domain && process.domain.add(response);

        opt.statusCode = response.statusCode;
        opt.remoteAddress = request.socket && request.socket.remoteAddress;
        opt.remotePort = request.socket && request.socket.remotePort;

        times.response = new Date().getTime();


        if (typeof opt.response === 'function') {
            opt.response(response);
        }

        if (opt.dataType === 'buffer' || isProxy) {
            // logger.debug(logPre + 'response buffer');
        } else {
            if (response.headers['content-encoding'] === 'gzip') {

                pipe = zlib.createGunzip();
                response.on('data', function(buffer) {
                    pipe.write(buffer);
                });
                response.once('end', function() {
                    pipe.end();
                });
            } else if (response.headers['content-encoding'] === 'deflate') {

                pipe = zlib.createInflateRaw();

                response.on('data', function(buffer) {
                    pipe.write(buffer);
                });
                response.once('end', function() {
                    pipe.end();
                });
            }
        }

        if (isProxy) {
            if (response.headers['transfer-encoding'] !== 'chunked') {
                that._proxyResponse.useChunkedEncodingByDefault = false;
            }
            that._proxyResponse.writeHead(response.statusCode, response.headers);
        }

        pipe.on('data', function(chunk) {

            if (isProxy) {
                that._proxyResponse.write(chunk);
            } else {
                result.push(chunk);
            }
        });

        pipe.once('close', function() {
            this.emit('done');
        });

        pipe.once('end', function() {
            this.emit('done');
        });

        pipe.once('done', function() {

            var obj, responseText, buffer, code, sandbox;
            var key, Content;

            this.removeAllListeners('close');
            this.removeAllListeners('end');
            this.removeAllListeners('data');
            this.removeAllListeners('done');

            times.end = new Date().getTime();
            buffer = Buffer.concat(result);
            result = [];


            if (isProxy) {

                that._proxyResponse.end();

                defer.resolve({
                    opt: opt,
                    buffer: buffer,
                    result: null,
                    responseText: responseText,
                    hasError: false,
                    msg: 'success',
                    response: response,
                    times: times
                });


                return;
            }

            if (opt.dataType === response.statusCode) {
                defer.resolve({
                    opt: opt,
                    buffer: buffer,
                    result: null,
                    responseText: responseText,
                    hasError: false,
                    msg: 'success',
                    response: response,
                    times: times
                });

                return;
            }

            if (opt.dataType === 'json' || opt.dataType === 'jsonp' || opt.dataType === 'text' || opt.dataType === 'html') {
                responseText = buffer.toString('UTF-8');
            }


            if (responseText) {
                buffer = null;
            }

            if (response.statusCode !== 200) {
                defer.reject({
                    opt: opt,
                    buffer: buffer,
                    result: null,
                    responseText: responseText,
                    hasError: true,
                    msg: 'request statusCode : ' + response.statusCode,
                    response: response,
                    times: times
                });

                return;
            }

            if (opt.dataType === 'json' || opt.dataType === 'jsonp') {

                try {

                    if (opt.jsonpCallback) {
                        code = 'var result = null; var ' + opt.jsonpCallback + ' = function($1){result = $1;};\n';
                        code += responseText;
                        code += ';return result;';
                    } else {
                        code = 'return (' + responseText + ');';
                    }

                    obj = new Function(code)();


                } catch (e) {

                    if (opt.dataType === 'json') {
                        try {
                            obj = JSON.parse(responseText);
                            e = null;
                        } catch (e) {}
                    }

                    if (e) {

                        defer.reject({
                            opt: opt,
                            buffer: buffer,
                            result: null,
                            responseText: responseText,
                            hasError: false,
                            msg: 'parse error',
                            response: response,
                            times: times
                        });

                        key = [window.request.headers.host, context.mod_act, e.message].join(':');

                        return;
                    }

                }

                if (obj) {
                    code = obj.code || 0;
                }

            } else {
                code = {
                    isFail: 0,
                    code: 200
                };

                if (response.headers['x-code']) {
                    code = ~~response.headers['x-code'];
                }

                obj = responseText;
            }

            if (typeof opt.formatCode === 'function') {
                code = opt.formatCode(obj, opt, response);
            }

            //支持{isFail:0,code:1,message:''}
            if (typeof code === 'object') {

                if (typeof code.isFail !== 'number') {
                    code.isFail = ~~code.isFail;
                }

                if (typeof code.code !== 'number') {
                    code.code = ~~code.code;
                }

            } else {

                if (typeof code !== 'number') {
                    code = ~~code;
                }


            }


            defer.resolve({
                opt: opt,
                buffer: buffer,
                result: obj,
                responseText: responseText,
                hasError: false,
                msg: 'success!',
                response: response,
                times: times
            });
        });

    });

    if (opt.send) {
        opt.send(request);
    } else {

        if (opt.body) {

            request.useChunkedEncodingByDefault = false;
            try {
                request.write(opt.body);
            } catch (e) {
                //logger.info(e.stack);
            }
        }

        request.end();
    }

    return defer;
    }catch(e){
        console.log(e);
    }
};

Loader.prototype.all = function(datas) {
    var self = this;
    var keys = [];
    return Promise.all(_.map(datas, function(item, k) {
        keys.push(k);
        if (item.then) {
            return self.request(item).then(item.then);
        } else {
            return self.request(item);
        }
    })).then(function(args) {
        var data = {};
        args.forEach(function(item, i) {
            data[keys[i]] = item;
        });
        return data;
    });
}

Loader.prototype.getDoneAll = function() {
    return this._doneAll || {};
};

_extend(Loader, {
    create: function(req, res) {
        return new Loader(req, res);
    }
});

module.exports = Loader;

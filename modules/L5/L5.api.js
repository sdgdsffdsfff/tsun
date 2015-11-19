/**
 * L5  API
 * (1) L5.ApiGetRoute 获取路由
 * (2) L5.ApiRouteResultUpdate 上报结果
 *
 * */

var Deferred    = require('./lib/Deferred'),
    L5          = require('./qos_client_for_node.js');


//获取路由
this.ApiGetRoute = function(options){

    var defer   = Deferred.create();
    var res     = this.ApiGetRouteSync(options);

    if(res.ret >= 0){
        defer.resolve(res);
    }else{
        defer.reject(res);
    }

    return defer;
}

//上报结果
this.ApiRouteResultUpdate = function(options){

    var defer   = Deferred.create();
    var res     = this.ApiRouteResultUpdateSync(options);

    if(res.ret >= 0){
        defer.resolve(res);
    }else{
        defer.reject(res);
    }

    return defer;
}

//获取路由
this.ApiGetRouteSync = function(options){

    var opt     = Deferred.extend({
        modid: 0,
        cmd: 0,
        timeout: 100,           //ms
        debug: false
    },options);

    var res;
    var start   = Date.now();

    try{
        res = L5.ApiGetRoute(opt);
    }catch(e){
    }

    if(!res){
        res = {
            ret: -1,
            modid:opt.modid,
            cmd: opt.cmd
        };

    }

    if(res.ret >= 0){

    }else{

    }

    return res;
};

//上报结果
this.ApiRouteResultUpdateSync = function(options){

    var opt     = Deferred.extend({
        modid: 0,
        cmd: 0,
        timeout: 100,
        usetime: 200,           //ms
        ret: 0,
        ip: '',
        port: 80,
        pre: 0,
        flow: 0,
        debug: false
    },options);

    var res;
    var start   = Date.now();

    try{
        res = L5.ApiRouteResultUpdate(opt);
    }catch(e){
    }

    if(!res){
        res = {
            ret: 0,
            modid:opt.modid,
            cmd: opt.cmd
        };

    }

    if(res.ret >= 0){


    }else{


    }

    return res;
}


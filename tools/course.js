var request = require('request');
var L5 = require('../modules/L5/l5');
var course;
(function (course) {
    function couseFormat(data) {
        return {
            id: data.id,
            name: data.name,
            cover: data.cover_url,
            startTime: data.starttime,
            endTime: data.endtime,
            price: data.price,
            agency: {
                id: data.agency_id,
                name: data.agency_name,
                domain: data.agency_domain,
                cover: data.agency_cover_url
            },
            room: {
                id: data.room_id,
                url: data.room_url
            }
        };
    }
    /** 
    * 获取课程列表
    */
    function list(param, req) {
        param.count || (param.count = 10);
        param.page || (param.page = 1);
        var promise = new Promise(function (resolve, reject) {
            var arr = [];
            Object.keys(param).forEach(function (key) {
                arr.push(key + "=" + param[key]);
            });
            var listReuest = L5.create(req);
            listReuest.request({
                url: 'http://m.ke.qq.com/cgi-bin/pubAccount/courseList',
                type: 'GET',
                withCookie: true,
                referer: 'http://m.ke.qq.com/courseList.html',
                data: data,
                l5api: {
                    modid: 432385,
                    cmd: 131072
                }
            }).then(function (d) {
                if(d.result.retcode !=0) {
                    dataList = [];
                }else{
                    // 容错
                    dataList = d.result.result.list || [];
                }
                resolve(dataList.map(couseFormat));
            }, function (d) {
                    reject(err || new Error("statusCode is " + res.statusCode));
            });
            //request({
            //    url: "http://m.ke.qq.com/cgi-bin/pubAccount/courseList?is_ios=0&count=10&page=1&pay_type=0&priority=1&" + arr.join('&'),
            //    headers: {
            //        'Referer': 'http://m.ke.qq.com',
            //        'Cookie': req.headers['Cookie']
            //    }
            //}, function (err, res, body) {
            //    if (!err && res.statusCode === 200) {
            //        resolve(JSON.parse(body).result.list.map(couseFormat));
            //    }
            //    else {
            //        reject(err || new Error("statusCode is " + res.statusCode));
            //    }
            //});
        });
        return promise;
    }
    course.list = list;
})(course || (course = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = course;

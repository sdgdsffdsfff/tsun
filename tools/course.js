var request = require('request');
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
    function list(mt, tt, st, req) {
        var promise = new Promise(function (resolve, reject) {
            const arr = [
                `mt=1001`
            ];
            request({
                url: `http://m.ke.qq.com/cgi-bin/pubAccount/courseList?is_ios=0&count=10&page=1&pay_type=0&priority=1&${arr.join('&')}`,
                headers: {
                    'Referer': 'http://m.ke.qq.com',
                    'Cookie': req.headers['Cookie']
                }
            }, function (err, res, body) {
                if (!err && res.statusCode === 200) {
                    resolve(JSON.parse(body).result.list.map(couseFormat));
                }
                else {
                    reject(err || new Error(`statusCode is ${res.statusCode}`));
                }
            });
        });
        return promise;
    }
    course.list = list;
})(course || (course = {}));
exports.default = course;

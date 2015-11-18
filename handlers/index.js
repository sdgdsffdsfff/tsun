var course_1 = require('../tools/course');
module.exports = function (request, reply) {
    var param = {}, query = request.query;
    if (query.mt)
        param.mt = query.mt;
    if (query.tt)
        param.tt = query.tt;
    if (query.st)
        param.st = query.st;
    course_1.default.list(param, request)
        .then(function (courselist) {
        reply.view('index', {
            list: courselist
        });
    });
};

const Course = require('../tools/course').default;

module.exports = function (request, reply) {
    const param = {},
        query = request.query;
        
    if (query.mt) param.mt = query.mt;
    if (query.tt) param.tt = query.tt;
    if (query.st) param.st = query.st;
    
    Course.list(param, request)
        .then(function (courselist) {
            reply.view('index', {
                list: courselist
            });
        });
};
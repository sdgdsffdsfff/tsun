import Course from '../tools/course';

export = function (request, reply) {
    const param: { mt?: number, tt?: number, st?: number } = {},
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
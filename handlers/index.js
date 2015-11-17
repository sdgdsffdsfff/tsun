var Course = require('../tools/course');
const handler = function (request, reply) {
    Course.default.list(1, 2, 3, request)
        .then(function (courselist) {
            reply.view('index', {
                list: courselist
            });
        });
};

module.export = handler;
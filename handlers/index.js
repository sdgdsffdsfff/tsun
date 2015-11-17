import Course from '../tools/course';

const handler = function (request, reply) {
    Course.list({ mt: 1001 }, request)
        .then(function (courselist) {
            reply.view('index', {
                list: courselist
            });
        });
};

module.export = handler;
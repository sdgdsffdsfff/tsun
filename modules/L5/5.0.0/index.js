var L5 = require('./build/Release/qos_client_for_node.node');

console.log()
console.log(L5);
console.log()
console.log('-----------------------------------------ApiGetRoute start');

var res = L5.ApiGetRoute({
	modid: 171393,
	cmd: 65536,
	timeout: 0.2,
	debug: true
});

console.log()
console.log(res);

console.log('-----------------------------------------ApiGetRoute end');
console.log()
console.log('---------------------------------ApiRouteResultUpdate start');

var res = L5.ApiRouteResultUpdate({
	modid: 171393,
	cmd: 65536,
	usetime: 100,
	ret: 0,
	ip: res.ip,
	port: res.port,
	pre: res.pre,
	flow: res.flow,
	debug: true
});

console.log()
console.log(res);

console.log('---------------------------------ApiRouteResultUpdate end');

console.log()
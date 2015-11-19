var L5 = require('./build/Release/qos_client_for_node.node');

console.log()
console.log('-----------------------------------------ApiGetRoute benchmark');


var start = new Date();
for(var i = 0, len = 10000; i < len; i++){
	var res = L5.ApiGetRoute({
		modid: 140993,
		cmd: 65536,
		timeout: 0.2,
		debug: false
	});
}
var end = new Date();

console.log([len,' times cost ',end-start,'ms'].join(''));

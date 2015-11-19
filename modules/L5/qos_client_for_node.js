var isWindows	= require('./lib/isWindows.js');

if(isWindows.isWindows){
    module.exports = null;
}else{
    module.exports = require("./lib/qos_client_for_node.node");
}

/**
 * 
 * jq Deferred
 * seajs.use('common/node/Deferred/test/testDeferred.js')
 * 
 */



var Deferred = require('Deferred');

var defer1 = Deferred.create();
var defer2 = Deferred.create();
var defer3 = Deferred.create();

Deferred.when(defer1,defer2).done(function(d1,d2){
	console.log(d1);
	console.log(d2);
});

console.log('start...');

setTimeout(function(){
	defer1.resolve('defer1 ok');
	defer3.reject();
},2000);

setTimeout(function(){
	defer2.resolve('defer2 ok');
},3000);

defer3.fail(function(){
	console.log('defer2 fail');
});


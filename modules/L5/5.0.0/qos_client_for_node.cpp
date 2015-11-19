#include <node.h>
#include <node_buffer.h>
#include <v8.h>
#include "qos_client.h"

#define BUILDING_NODE_EXTENSION

using namespace v8;

template<class Value> void ApiGetRoute(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();
	EscapableHandleScope scope(isolate);
  
	Local<Object>	opt			= args[0]->ToObject();
	Local<Object>	res			= Object::New(isolate);
	bool			debug		= opt->Get(String::NewFromUtf8(isolate, "debug"))->BooleanValue();
	int				modid		= (int)opt->Get(String::NewFromUtf8(isolate,"modid"))->NumberValue();
	int				cmd			= (int)opt->Get(String::NewFromUtf8(isolate,"cmd"))->NumberValue();
	float			timeout		= (float)opt->Get(String::NewFromUtf8(isolate,"timeout"))->NumberValue();
	
	int				ret			= 0;
	string  		err_msg;
	float 			tm_out		= timeout;
	QOSREQUEST		req;										//新建QOSREQUEST对象
  
  
	//给modid,cmdid赋值
	req._modid		= modid;
	req._cmd		= cmd;
	
	
	if(debug){
		printf("[c++] modid: %i\n"		,modid);
		printf("[c++] cmd: %i\n"			,cmd);
		printf("[c++] timeout: %f\n"		,timeout);
	}
	
  
	ret = ApiGetRoute(req,tm_out,err_msg); //获取路由信息
	
	res->Set(String::NewFromUtf8(isolate, "ret", String::kInternalizedString),		Number::New(isolate, ret));
	res->Set(String::NewFromUtf8(isolate, "cmd", String::kInternalizedString),		Number::New(isolate, cmd));
	res->Set(String::NewFromUtf8(isolate, "modid", String::kInternalizedString),	Number::New(isolate, modid));
	res->Set(String::NewFromUtf8(isolate, "timeout", String::kInternalizedString),	Number::New(isolate, timeout));
	
	res->Set(String::NewFromUtf8(isolate, "ip", String::kInternalizedString),		String::NewFromUtf8(isolate, req._host_ip.c_str()));
	res->Set(String::NewFromUtf8(isolate, "port", String::kInternalizedString),		Number::New(isolate, req._host_port));
	res->Set(String::NewFromUtf8(isolate, "pre", String::kInternalizedString),		Number::New(isolate, req._pre));
	res->Set(String::NewFromUtf8(isolate, "flow", String::kInternalizedString),		Number::New(isolate, req._flow));
	res->Set(String::NewFromUtf8(isolate, "msg", String::kInternalizedString),		String::NewFromUtf8(isolate, err_msg.c_str()));
	
	
	args.GetReturnValue().Set(res);
}


template<class Value>  void ApiRouteResultUpdate(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();
	EscapableHandleScope scope(isolate);
  
	Local<Object>	opt			= args[0]->ToObject();
	Local<Object>	res			= Object::New(isolate);
	
	String::Utf8Value	ip	( opt->Get(String::NewFromUtf8(isolate,"ip")) );
	
	bool			debug		= opt->Get(String::NewFromUtf8(isolate,"debug"))->BooleanValue();
	int				modid		= (int)opt->Get(String::NewFromUtf8(isolate,"modid"))->NumberValue();
	int				cmd			= (int)opt->Get(String::NewFromUtf8(isolate,"cmd"))->NumberValue();
	int				usetime		= (int)opt->Get(String::NewFromUtf8(isolate,"usetime"))->NumberValue();
	int				pre			= (int)opt->Get(String::NewFromUtf8(isolate,"pre"))->NumberValue();
	int				flow		= (int)opt->Get(String::NewFromUtf8(isolate,"flow"))->NumberValue();
	int				code		= (int)opt->Get(String::NewFromUtf8(isolate,"ret"))->NumberValue();
	unsigned short	port		= (unsigned short)opt->Get(String::NewFromUtf8(isolate,"port"))->NumberValue();
	
	
	int				ret			= 0;
	char			*ps_host	= *ip;
	string  		err_msg;
	QOSREQUEST		req;										//新建QOSREQUEST对象
  
  
	//给modid,cmdid赋值
	req._modid		= modid;
	req._cmd		= cmd;
	
	req._host_ip	= string(ps_host);
	req._host_port	= port;
	req._pre		= pre;
	req._flow		= flow;
	
	
	if(debug){
		printf("[c++] modid: %i\n"			,modid);
		printf("[c++] cmd: %i\n"			,cmd);
		printf("[c++] usetime: %i\n"		,usetime);
		printf("[c++] code: %i\n"			,code);
		printf("[c++] ip: %s\n"				,ps_host);
		printf("[c++] port: %i\n"			,port);
		
		printf("[c++] _host_ip: %s\n"		,req._host_ip.c_str());
		printf("[c++] _host_port: %i\n"		,req._host_port);
		printf("[c++] _pre: %i\n"			,req._pre);
		printf("[c++] _flow: %i\n"			,req._flow);
	}
	
  
	ret = ApiRouteResultUpdate(req,code,usetime,err_msg);			//上报返回值
	
	res->Set(String::NewFromUtf8(isolate, "ret", String::kInternalizedString),		Number::New(isolate, ret));
	res->Set(String::NewFromUtf8(isolate, "cmd", String::kInternalizedString),		Number::New(isolate, cmd));
	res->Set(String::NewFromUtf8(isolate, "modid", String::kInternalizedString),	Number::New(isolate, modid));
	res->Set(String::NewFromUtf8(isolate, "usetime", String::kInternalizedString),	Number::New(isolate, usetime));
	
	res->Set(String::NewFromUtf8(isolate, "ip", String::kInternalizedString),		String::NewFromUtf8(isolate, req._host_ip.c_str()));
	res->Set(String::NewFromUtf8(isolate, "port", String::kInternalizedString),		Number::New(isolate, req._host_port));
	res->Set(String::NewFromUtf8(isolate, "pre", String::kInternalizedString),		Number::New(isolate, req._pre));
	res->Set(String::NewFromUtf8(isolate, "flow", String::kInternalizedString),		Number::New(isolate, req._flow));
	res->Set(String::NewFromUtf8(isolate, "msg", String::kInternalizedString),		String::NewFromUtf8(isolate, err_msg.c_str()));
	
	args.GetReturnValue().Set(res);
}


void init(Local<Object> target) {
	Isolate* isolate = Isolate::GetCurrent();
	target->Set(String::NewFromUtf8(isolate, "ApiGetRoute", String::kInternalizedString),				FunctionTemplate::New(isolate, ApiGetRoute)->GetFunction());
	target->Set(String::NewFromUtf8(isolate, "ApiRouteResultUpdate", String::kInternalizedString),		FunctionTemplate::New(isolate, ApiRouteResultUpdate)->GetFunction());
}

NODE_MODULE(qos_client_for_node, init)
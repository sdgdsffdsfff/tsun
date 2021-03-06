import * as request from 'request';
import * as http from 'http';

/**
* 房间
*/
export interface Room {
	/**
	* id
	*/
	id: number;
	/**
	* 地址
	*/
	url: string;
}

/**
* 机构
*/
export interface Agency {
	/**
	* id
	*/
	id: number;
	/**
	* 名字
	*/
	name: string;
	/**
	* 域名
	*/
	domain: string;
	/**
	* 封面地址
	*/
	cover: string;
}
	
/**
* 课程
*/
export interface Course {
	/**
	* id 
	*/ 
	id: number;
	/**
	* 名称
	*/
	name: string;
	/**
	* 封面地址
	*/
	cover: string;
	/**
	* 开始时间
	*/
	startTime: number;
	/**
	* 结束时间
	*/
	endTime: number;
	/**
	* 费用
	*/
	price: number;
	/**
	* 机构信息
	*/
	agency: Agency;
	/**
	* 房间信息
	*/
	room: Room;
}

namespace course {
	
	function couseFormat(data: any): Course {
		return {
			id: data.id,
			name: data.name,
			cover: data.cover_url,
			startTime: data.starttime,
			endTime: data.endtime,
			price: data.price,
			agency: {
				id: data.agency_id,
				name: data.agency_name,
				domain: data.agency_domain,
				cover: data.agency_cover_url
			},
			room: {
				id: data.room_id,
				url: data.room_url
			}
		};
	}
	
	
	/**
	* 获取课程列表
	*/
	export function list(param: {
		/**
		* 一级类目
		*/
		mt?: number,
		/**
		* 二级类目
		*/
		tt?: number,
		/**
		* 三级类目
		*/
		st?: number,
		/**
		* 每页条数，默认10
		*/
		count?: number,
		/**
		* 页数，默认1
		*/
		page?: number,
		/**
		* 排序方式
		*/
		sort?: number
	}, req: http.ServerRequest): Promise<Course[]> {
		
		param.count || (param.count = 10);
		param.page || (param.page = 1);
		
		var promise = new Promise(function (resolve, reject) {
			let arr: string[] = [];
			Object.keys(param).forEach(function (key) {
				arr.push(`${key}=${param[key]}`);
			});
			request({
				url: `http://m.ke.qq.com/cgi-bin/pubAccount/courseList?is_ios=0&count=10&page=1&pay_type=0&priority=1&${arr.join('&')}`,
				headers: {
					'Referer': 'http://m.ke.qq.com',
					'Cookie': req.headers['Cookie']
				}
			}, function (err, res, body) {
				if (!err && res.statusCode === 200) {
					resolve(<Course[]>JSON.parse(body).result.list.map(couseFormat));
				} else {
					reject(err || new Error(`statusCode is ${res.statusCode}`));
				}
			});
		});
		
		return promise;
	}
}

export default course;
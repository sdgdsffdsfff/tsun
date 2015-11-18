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
declare namespace course {
    /**
    * 获取课程列表
    */
    function list(param: {
        /**
        * 一级类目
        */
        mt: number;
        /**
        * 二级类目
        */
        tt?: number;
        /**
        * 三级类目
        */
        st?: number;
        /**
        * 每页条数，默认10
        */
        count?: number;
        /**
        * 页数，默认1
        */
        page?: number;
        /**
        * 排序方式
        */
        sort?: number;
    }, req: http.ServerRequest): Promise<Course[]>;
}
export default course;

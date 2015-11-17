import * as http from 'http';
declare namespace course {
    /**
    * 房间
    */
    interface Room {
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
    interface Agency {
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
    interface Course {
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
    interface CourseList {
        list: Course[];
    }
    /**
    * 获取课程列表
    */
    function list(mt: number, tt: number, st: number, req: http.ServerRequest): Promise<Course[]>;
}
export default course;

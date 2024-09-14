/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2024-09-14 14:57:03
 */
import { requestPost } from '@/service/request';




// MOD-- 功能介绍 相关
// 查询功能介绍列表
export function getEngineFunctionList() {
    // return requestPost('/message/GetMessageNum', { params: { type: 0 } });
    return requestPost('/engineFunction/list');
}

/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2024-09-19 15:40:04
 */
import { requestPost, requestGet } from '@/service/request';





// MOD-- 场景 相关
// 获取场景信息
export function getSceneById(sceneId: string) {
    return requestGet(`/scene/v3/${sceneId}`);
}



// MOD-- 目录树 相关
// 根据场景ID查询树
export function getSingleSceneTreeById(data: any) {
    return requestPost('/sceneTree/v3/getTreeById', data);
}



// MOD-- 数据集 相关
// 获取工程信息模型
export function getProjectModel(data: any) {
    return requestPost('/dataSet/v3/viewDataSetModel', data);
}



// MOD-- 用户 相关
// 获取用户自定义视角
export function getViewAngleService(data: any) {
    return requestPost('/userDefined/v3/VisualAngle', data);
}
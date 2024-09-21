/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2024-09-20 18:47:36
 */
import { requestPost, requestGet } from '@/service/request';





// MOD-- 场景 相关
// 获取场景信息
export function getSceneById(sceneId: string) {
    return requestGet(`/scene/v3/${sceneId}`);
}

// 根据查询条件查询场景
export function getSceneById_old(sceneId: string) {
    return requestGet(`/sharedAccess/v3/${sceneId}`);
}


// MOD-- 目录树 相关
// 根据场景ID查询树
export function getSingleSceneTreeById(data: any) {
    return requestPost('/sceneTree/v3/getTreeById', data);
}

// 根据树id查询树
export function getSingleSceneTreeById_old(sceneId: string) {
    return requestGet(`/sharedAccess/v3/sceneTree/${sceneId}`);
}


// MOD-- 数据集 相关
// 获取工程信息模型
export function getProjectModel(data: any) {
    return requestPost('/dataSet/v3/viewDataSetModel', data);
}

// 获取数据集模型
export function getProjectModel_old(data: any) {
    return requestPost('/sharedAccess/v3/viewDatasetModel', data);
}



// MOD-- 用户 相关
// 获取用户自定义视角
export function getViewAngleService(data: any) {
    return requestPost('/userDefined/v3/VisualAngle', data);
}
/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2025-11-19 12:01:05
 */
import { requestPost, requestGet } from '@/service/request';





// MOD-- 分享 相关
// 获取分享链接信息
export function getSharedUrlInfo(shareId: string) {
    return requestPost(`/share/v3/longUrl/${shareId}`);
}


// 获取分享信息
export function getSharedInfo() {
    return requestPost(`/share/v3/getSharedInfo`);
}


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


// 获取模型目录树
export function getProjectTree(data: any) {
    return requestPost('/dataSet/v3/dataSetRootNodes', data);
}



// MOD-- CAD 相关
// 获取数据集下的文件列表
export function getCadDatasetFiles(data: any) {
    return requestPost('/cadTree/v3/file/list', data);
}


// MOD-- 用户 相关
// 获取用户自定义视角
export function getViewAngleService(data: any) {
    return requestPost('/userDefined/v3/VisualAngle', data);
}


// MOD-- 开挖 相关
// 分享查看界面获取开挖纹理列表
export function getSharedExtrudeTexturesList() {
    return requestGet('/sceneTree/v3/getSceneExcavateIntrinsicTextureImages');
}
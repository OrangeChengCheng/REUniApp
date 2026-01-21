/*
 * @Author: Lemon C
 * @Date: 2025-11-19 14:50:45
 * @LastEditTime: 2026-01-20 16:50:04
 */
import {
    getSharedUrlInfo,
    getSharedInfo,
    getSceneById,
    getSingleSceneTreeById,
    getProjectTree,
    getProjectModel,
    getCadDatasetFiles,
    getSharedExtrudeTexturesList,
} from '@/service/interface';

import dataTool from '@/utils/dataTool';

import { useStateStore } from '@/stores/state';


interface ApiMethods {
    getSharedUrlInfo(params: any): Promise<any>;
    getSharedInfo(toast: boolean): Promise<any>;
    getSceneInfo(params: any): Promise<any>;
    getSceneTree(params: any, sceneInfo: any): Promise<any>;
    getModelTree(params: any): Promise<any>;
    getDataSetList(params: any, urlInfo: any): Promise<any>;
    getCadDataSetList(params: any): Promise<any>;
    getExtrudeTexList(sceneTree: any): Promise<any>;
}

const api: ApiMethods = {
    // MARK Service 根据分享id获取分享url信息
    getSharedUrlInfo: async (params: any): Promise<any> => {
        try {
            const res = await getSharedUrlInfo(params);
            if (res.isSuccess) {
                if (!res.data) {
                    throw new Error(res.errMsg || '获取分享信息失败');
                }
                let shareUrlInfo = res.data;
                if (!shareUrlInfo || !shareUrlInfo.shareItem.platformMode || !shareUrlInfo.shareItem.loginMode) {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
                // 判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
                if (shareUrlInfo.shareItem.loginMode.value === 'Private') {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
                if (shareUrlInfo.shareItem.platformMode.value === 'BlackHole') {
                    shareUrlInfo.shareItem.source = 1;
                    return shareUrlInfo;
                } else if (shareUrlInfo.shareItem.platformMode.value === 'StarRiver') {
                    shareUrlInfo.shareItem.source = 2;
                    return shareUrlInfo;
                } else if (shareUrlInfo.shareItem.platformMode.value === 'Nebula') {
                    shareUrlInfo.shareItem.source = 3;
                    return shareUrlInfo;
                } else {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
            } else {
                throw new Error(res.errMsg || '获取分享信息失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 根据token获取分享信息
    getSharedInfo: async (toast: boolean = true): Promise<any> => {
        try {
            const res = await getSharedInfo(toast);
            if (res.isSuccess) {
                console.log(res);
                if (!res.data) {
                    throw new Error(res.errMsg || '获取分享信息失败');
                }
                let shareInfo = res.data;
                if (!shareInfo || !shareInfo.platformMode || !shareInfo.loginMode) {
                    shareInfo.source = 0;
                    return shareInfo;
                }
                // 判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
                if (shareInfo.loginMode.value === 'Private') {
                    shareInfo.source = 0;
                    return shareInfo;
                }
                if (shareInfo.platformMode.value === 'BlackHole') {
                    shareInfo.source = 1;
                    return shareInfo;
                } else if (shareInfo.platformMode.value === 'StarRiver') {
                    shareInfo.source = 2;
                    return shareInfo;
                } else if (shareInfo.platformMode.value === 'Nebula') {
                    shareInfo.source = 3;
                    return shareInfo;
                } else {
                    shareInfo.source = 0;
                    return shareInfo;
                }
            } else {
                throw new Error(res.errMsg || '获取分享信息失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取场景信息
    getSceneInfo: async (params: any): Promise<any> => {
        try {
            const res = await getSceneById(params);
            if (res.isSuccess) {
                let info = {
                    coordinates: res.data.coordinates,
                    dataSetPosition: res.data.dataSetPosition,
                    sceneName: res.data.sceneName,
                    componentTreeId: res.data.componentTreeId,
                    componentPosition: res.data.componentPosition,
                };
                return info;
            } else {
                throw new Error(res.errMsg || '获取场景信息失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取场景目录树
    getSceneTree: async (params: any, sceneInfo: any): Promise<any> => {
        try {
            const res = await getSingleSceneTreeById(params);
            if (res.isSuccess) {
                const treeList = dataTool.handle_formatSceneTree(res.data, sceneInfo);
                return treeList;
            } else {
                throw new Error(res.errMsg || '场景目录树获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取模型目录树
    getModelTree: async (params: any): Promise<any> => {
        try {
            const res = await getProjectTree(params);
            if (res.isSuccess) {
                return res.data;
            } else {
                throw new Error(res.errMsg || '模型目录树获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取开挖纹理列表
    getExtrudeTexList: async (sceneTree: any): Promise<any> => {
        const state_store = useStateStore();
        const allLeafNodes = dataTool.handle_findAllNodeByLevel(sceneTree, 2);
        const allExtrudes = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportExtrudeType);
        if (!allExtrudes.length) return [];

        try {
            const res = await getSharedExtrudeTexturesList();
            if (res.isSuccess) {
                const intrinsicTextures = res.data.intrinsicTextures;
                let textureList: any[] = [];
                if (intrinsicTextures && intrinsicTextures.length) {
                    textureList = intrinsicTextures.map((item: any) => {
                        const picPath = `${state_store.downloadUrl}/${item.fileDataId}?token=${state_store.token}`;
                        const size = [5.0, 5.0];
                        return {
                            picPath: picPath,
                            picSize: size,
                            textureGuid: item.TextureImageId,
                        };
                    });
                }
                return textureList;
            } else {
                throw new Error(res.errMsg || '挤出纹理信息获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取数据集资源地址
    getDataSetList: async (params: any, urlInfo: any): Promise<any> => {
        try {
            const res = await getProjectModel(params);
            if (res.isSuccess) {
                let dataSetList: any[] = [];
                res.data.forEach((item: any) => {
                    let dataSetCRS = dataTool.handle_dataSetCRS(item);
                    let dataSetCRSNorth = dataTool.handle_dataSetCRSNorth(item);
                    let engineOrigin = dataTool.handle_engineOrigin(item);
                    let dataSetSGContent = item.context ? item.context : '';
                    dataSetList.push({
                        dataSetId: item.dataSetId,
                        resourcesAddress: urlInfo.isMinio ? `${item.resourcesAddress}${item.resId}` : item.resourcesAddress,
                        rotate: item.rotate?.split(' ').map(Number),
                        scale: item.scale?.split(' ').map(Number),
                        offset: item.translation?.split(' ').map(Number),
                        dataSetCRS: dataSetCRS,
                        dataSetCRSNorth: dataSetCRSNorth,
                        engineOrigin: engineOrigin,
                        dataSetSGContent: dataSetSGContent,
                        dataSetType: item.dataSetType,
                    });
                });
                return dataSetList;
            } else {
                throw new Error(res.errMsg || '资源地址获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取数据集下CAD资源地址
    getCadDataSetList: async (params: any): Promise<any> => {
        try {
            const res = await getCadDatasetFiles(params);
            if (res.isSuccess) {
                let dataSetList: any[] = [];
                if (res.data.items && res.data.items.length > 0) {
                    let cad_file = res.data.items[0];
                    const cadUnitMap: any = {
                        Meter: 'CAD_UNIT_Meter',
                        Centimeter: 'CAD_UNIT_Centimeter',
                        Millimeter: 'CAD_UNIT_Millimeter',
                        Kilometer: 'CAD_UNIT_Kilometer',
                        Inch: 'CAD_UNIT_Inch',
                        Foot: 'CAD_UNIT_Foot',
                        Mile: 'CAD_UNIT_Mile',
                    };
                    dataSetList.push({
                        dataSetId: 're_cad',
                        resourcesAddress: cad_file.resourcesAddress,
                        unit: cadUnitMap[cad_file.unit || 'Meter'],
                    });
                }
                return dataSetList;
            } else {
                throw new Error(res.errMsg || 'CAD资源地址获取失败');
            }
        } catch (error) {
            throw error;
        }
    },
}


export default api;
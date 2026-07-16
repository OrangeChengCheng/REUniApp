/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2026-07-13 11:22:37
 */

import { useStateStore } from '@/stores/state';
import { useCardStore } from '@/stores/card';
import { newCard, type Card } from '@/types/class';

interface ApiMethods {
    unipluginLog(log: string): void;
    realEngineRender(data: any): Promise<any>;
    getREModule(): any;
    registerAppMsg(onCallBack: (data: any) => void): Promise<void>; // 添加一个回调参数来处理每条消息
    sendMsgUniToApp(data: any): void;
    showShareRes(urlInfo: any, isClick: boolean, onUpdate: () => void): void;//查看分享资源
    showSceneRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
    showModelRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
    showModelTypeRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
    showCadTypeRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
}

const api: ApiMethods = {
    // MARK re-api 获取插件对象
    getREModule: (): any => {
        if (Object.prototype.hasOwnProperty.call(uni, 'requireNativePlugin')) {
            return uni.requireNativePlugin('REUniPlugin-REModule');
        } else {
            return null;
        }
    },

    // MARK re-api 插件打印信息
    unipluginLog: (log: string) => {
        api.getREModule()?.unipluginLog({ msg: log });
    },

    // MARK re-api 加载模型
    realEngineRender: (data: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            api.unipluginLog('render: ' + JSON.stringify(data));
            api.getREModule()?.realEngineRender(data, (ret: any) => {
                resolve(ret);
            });
        });
    },

    // MARK re-api 原生&uni-app通信
    registerAppMsg: async (onCallBack: (data: any) => void): Promise<void> => {
        const reModule = api.getREModule();
        if (reModule && reModule.registerAppMsg) {
            reModule.registerAppMsg((res: any) => {
                api.unipluginLog('registerAppMsg: ' + JSON.stringify(res));
                // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
                onCallBack(res);
            });
        } else {
            api.unipluginLog('registerAppMsg: 消息监听机制加载失败');
        }
    },

    // MARK re-api 向app发送数据
    sendMsgUniToApp: (data: any) => {
        api.getREModule()?.sendMsgUniToApp(data);
    },

    // MARK re-api 查看分享链接资源
    showShareRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void) => {
        const state_store = useStateStore();
        try {
            // 获取分享信息
            state_store.updateCurSource(urlInfo.shareItem?.source);

            if (urlInfo.shareType === 2) {
                await api.showSceneRes(urlInfo, isClick, onUpdate);
            } else {
                await api.showModelRes(urlInfo, isClick, onUpdate);
            }
        } catch (error) {
            uni.hide_loading();
            throw error;
        }
    },
    // MARK re-api 查看分享链接资源 -- 场景资源
    showSceneRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        const card_store = useCardStore();
        const state_store = useStateStore();
        // uni.show_loading();
        try {
            const shareData = await uni.$tool.card_getSceneData(urlInfo);
            const cardData: Card = card_store.handleCardData(urlInfo, shareData, !isClick);
            let projName = cardData.projName;

            // 新添加的分享数据更新到缓存列表
            // 这个方法肯定会被调用，只不过一个是空函数，一个是有操作的函数
            if (onUpdate) {
                onUpdate();
            }

            uni.hide_loading();

            const engineData = {
                name: 'uni-app',
                noExternalNetwork: state_store.noExternalNetwork,
                token: shareData.token,
                baseUrl: shareData.baseUrl,
                source: shareData.source,
                shareUrl: shareData.url,
                projName: projName,
                worldCRS: shareData.worldCRS,
                urlHeaderList: shareData.urlHeaderList,
                authorData: shareData.authorData,
                dataSetList: shareData.dataSetList,
                shareType: shareData.shareType,
                sceneId: shareData.id,
                camDefaultDataSetId: shareData.camDefaultDataSetId,
                shareViewMode: shareData.shareViewMode,
                defaultCamLoc: shareData.defaultCamLoc,
                entityList: shareData.entityList,
                waterList: shareData.waterList,
                extrudeList: shareData.extrudeList,
                extrudeTexList: shareData.extrudeTexList,
                monomerList: shareData.monomerList,
                projectionList: shareData.projectionList,
            };
            console.log('引擎信息: ', JSON.stringify(engineData));
            uni.$re.realEngineRender(engineData).then((result) => {
                console.log(result);
                uni.$re.unipluginLog(JSON.stringify(result));
            });
        } catch (error: any) {
            uni.hide_loading();
            uni.showToast({ title: error.message || '获取数据失败', icon: 'none' });
            throw error; // 向上抛出错误
        }
    },

    // MARK re-api 查看分享链接资源 -- 模型资源
    showModelRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        switch (urlInfo.shareDataType) {
            case 'bim': // 短链接请求获取
            case 'Bim': // 长连接获取
            case 'Rs':
            case 'Wmts':
            case 'Osgb':
            case 'PointCloud':
                await api.showModelTypeRes(urlInfo, isClick, onUpdate);
                break;
            case 'CAD': // 短链接请求获取
            case 'Cad': // 长连接获取
                await api.showCadTypeRes(urlInfo, isClick, onUpdate);
                break;
            default:
                uni.hide_loading();
                // 使用延时解决弹窗关闭后的提示显示异常的问题，因为弹窗关闭有200的延迟
                setTimeout(() => {
                    uni.showToast({ title: '暂不支持该数据类型', icon: 'none' });
                }, 210);
                break;
        }
    },

    // MARK re-api 查看模型类型数据
    showModelTypeRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        const card_store = useCardStore();
        const state_store = useStateStore();
        // uni.show_loading();
        try {
            const shareData = await uni.$tool.card_getBimData(urlInfo);
            const cardData: Card = card_store.handleCardData(urlInfo, shareData, !isClick);
            let projName = cardData.projName;

            // 新添加的分享数据更新到缓存列表
            // 这个方法肯定会被调用，只不过一个是空函数，一个是有操作的函数
            if (onUpdate) {
                onUpdate();
            }

            uni.hide_loading();

            const engineData = {
                name: 'uni-app',
                noExternalNetwork: state_store.noExternalNetwork,
                token: shareData.token,
                baseUrl: shareData.baseUrl,
                source: shareData.source,
                shareUrl: shareData.url,
                projName: projName,
                sceneId: shareData.id,
                urlHeaderList: shareData.urlHeaderList,
                authorData: shareData.authorData,
                dataSetList: shareData.dataSetList,
                shareType: shareData.shareType,
                shareDataType: shareData.shareDataType,
                defaultCamLoc: shareData.defaultCamLoc,
            };
            console.log('引擎信息: ', JSON.stringify(engineData));
            uni.$re.realEngineRender(engineData).then((result) => {
                uni.$re.unipluginLog(JSON.stringify(result));
            });
        } catch (error: any) {
            uni.hide_loading();
            uni.showToast({ title: error.message || '获取数据失败', icon: 'none' });
            throw error;
        }
    },

    // MARK re-api 查看CAD类型数据
    showCadTypeRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        const card_store = useCardStore();
        const state_store = useStateStore();
        // uni.show_loading();
        try {
            const shareData = await uni.$tool.card_getCadData(urlInfo);
            const cardData: Card = card_store.handleCardData(urlInfo, shareData, !isClick);
            let projName = cardData.projName;

            // 新添加的分享数据更新到缓存列表
            // 这个方法肯定会被调用，只不过一个是空函数，一个是有操作的函数
            if (onUpdate) {
                onUpdate();
            }

            uni.hide_loading();

            const engineData = {
                name: 'uni-app',
                noExternalNetwork: state_store.noExternalNetwork,
                token: shareData.token,
                baseUrl: shareData.baseUrl,
                source: shareData.source,
                shareUrl: shareData.url,
                projName: projName,
                sceneId: shareData.id,
                urlHeaderList: shareData.urlHeaderList,
                authorData: shareData.authorData,
                dataSetList: shareData.dataSetList,
                shareType: shareData.shareType,
                shareDataType: shareData.shareDataType,
            };
            console.log('引擎信息: ', JSON.stringify(engineData));
            uni.$re.realEngineRender(engineData).then((result) => {
                uni.$re.unipluginLog(JSON.stringify(result));
            });
        } catch (error: any) {
            uni.hide_loading();
            uni.showToast({ title: error.message || '获取数据失败', icon: 'none' });
            throw error;
        }
    },

}

export default api;
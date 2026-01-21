/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2026-01-21 10:36:00
 */

const RE_AppVersion = "2.0.1";
const RE_NeedUpdate = true;

import { useCardStore } from '@/stores/card';
import { useDeviceStore } from '@/stores/device';
import { useStateStore } from '@/stores/state';
import uniApi from '@/utils/uniApi';
import serviceApi from '@/utils/serviceApi';
import dataTool from '@/utils/dataTool';
import { newShare, type Share } from '@/types/class';

interface ApiMethods {
    url_base(url: string): string;
    url_handle(url: string): Promise<any>;
    time_compare(frontTime: Date, backTime: Date): string;
    time_To_IOSDate(timeStr: string): string;
    time_format(utcTime: Date): string;
    time_pad2(n: any): any;
    cam_defauleDataSet(dataSetList: any): string;
    update_data(): void;
    del_data(): void;
    compareVersions(version1: string, version2: string): number;
    getAppVersion(): string;
    initializeData(): void;
    card_getProjName(urlInfo: any): Promise<any>;
    card_getSceneData(urlInfo: any): Promise<any>;
    card_getBimData(urlInfo: any): Promise<any>;
    card_getCadData(urlInfo: any): Promise<any>;
}

const api: ApiMethods = {
    url_base: (url: string): string => {
        if (url.length <= 0) return "";
        url = url.trim();

        // 定义需要忽略的路径关键词数组
        // const ignorePathKeywords = ["BlackHole", "StarRiver"];
        const ignorePathKeywords: Array<string> = [];

        // 步骤1：截断 # 及之后的hash部分（如#/dataSetShare/...）
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
            url = url.substring(0, hashIndex);
        }

        // 步骤2：截断 index.html 及之后的内容
        const indexHtmlStr = "index.html";
        const indexHtmlIndex = url.indexOf(indexHtmlStr);
        if (indexHtmlIndex !== -1) {
            url = url.substring(0, indexHtmlIndex);
        }

        // 步骤3：提取协议（http:///https://）
        const protocolEndIndex = url.indexOf('://');
        if (protocolEndIndex === -1) return ""; // 无合法协议，返回空
        const protocol = url.substring(0, protocolEndIndex + 3); // 如 "https://"

        // 步骤4：提取协议后的部分（域名/端口+路径）
        const afterProtocol = url.substring(protocolEndIndex + 3);
        // 找到协议后第一个 "/" 的位置（区分域名/端口和路径）
        const firstSlashAfterProtocol = afterProtocol.indexOf('/');

        let baseUrl = "";
        if (firstSlashAfterProtocol === -1) {
            // 无路径，直接返回 协议+域名/端口
            baseUrl = protocol + afterProtocol;
        } else {
            // 拆分 域名/端口 和 后续路径
            const domainAndPort = afterProtocol.substring(0, firstSlashAfterProtocol); // 如 "test.com" 或 "192.168.31.7:9012"
            const pathPart = afterProtocol.substring(firstSlashAfterProtocol); // 如 "/StarRiver/sub" 或 "/bimhlw"

            // 步骤5：判断路径中是否包含需要忽略的关键词（任意层级都匹配）
            const isIgnorePath = ignorePathKeywords.some(keyword =>
                pathPart.includes(keyword)
            );

            if (isIgnorePath) {
                // 包含忽略关键词，仅保留 协议+域名/端口
                baseUrl = protocol + domainAndPort;
            } else {
                // 不包含忽略关键词，保留 协议+域名/端口+路径（清理末尾/）
                const cleanPath = pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart;
                baseUrl = protocol + domainAndPort + cleanPath;
            }
        }

        // 步骤6：最终清理末尾多余的 /（保证格式统一）
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }

        return baseUrl;
    },
    // MARK tool 处理分享链接
    url_handle: async (url: string): Promise<any> => {

        try {
            url = url.trim();

            uni.$re.unipluginLog('url = ' + url);
            if (url.length <= 0) return null;

            //提取baseUrl（域名和端口号）
            let baseUrl = api.url_base(url);

            // 短链接分享数据
            if (url.includes("#/shareViews/") || url.includes("#/shareView/")) {
                // 提取短链接中的ID（适配两种格式）
                const shareViewIndex = url.includes('#/shareViews/')
                    ? url.indexOf('#/shareViews/')
                    : url.indexOf('#/shareView/');
                // 计算基础路径长度（根据实际格式取对应的长度）
                const basePathLength = url.includes('#/shareViews/')
                    ? '#/shareViews/'.length
                    : '#/shareView/'.length;

                const idStartIndex = shareViewIndex + basePathLength;
                let idEndIndex = url.indexOf('?', idStartIndex); // 处理可能的查询参数
                const _shareId = idEndIndex !== -1
                    ? url.substring(idStartIndex, idEndIndex)
                    : url.substring(idStartIndex);

                const state_store = useStateStore();
                state_store.updateCurrBaseUrl(baseUrl);
                try {
                    const urlData = await uni.$service.getSharedUrlInfo(_shareId);
                    if (!urlData || !urlData.token) return null;
                    let _shareType: number = 0; // 判断分享链接类型 0：无 1：模型 2：场景
                    if (urlData.viewMode.length > 0) {
                        _shareType = 2;
                    } else if (urlData.viewMode == "") {
                        _shareType = 1;
                    }

                    // 解构urlData，分离出需要替换的字段和剩余字段
                    const {
                        resourceId,
                        viewMode,
                        dataType,
                        ...restUrlData
                    } = urlData;

                    // 构造最终的params，只保留你指定的参数名，无原始冲突字段
                    const params = {
                        url: url,
                        shareId: _shareId,
                        baseUrl: baseUrl,
                        shareType: _shareType,
                        id: urlData.resourceId,
                        shareViewMode: urlData.viewMode,
                        shareDataType: urlData.dataType,
                        ...restUrlData
                    }

                    // 获取项目名称
                    state_store.updateCurrToken(urlData.token);
                    const projName = await api.card_getProjName(params);
                    params.projName = projName || '';

                    uni.$re.unipluginLog('params = ' + JSON.stringify(params));
                    return params;
                } catch (error) {
                    return null;
                }

            } else {

                // 使用字符串截取方式，无法使用URL的方式，uniapp在真机上无法使用URL方式
                let shareType: number = 0; // 判断分享链接类型 0：无 1：模型 2：场景
                if (url.includes('sceneShare/view')) {
                    shareType = 2;
                } else if (url.includes('dataSetShare/view')) {
                    shareType = 1;
                }
                if (!shareType) return null;
                if (!url.includes('token')) return null; // 分享链接不包含token报错

                let searchType = shareType === 2 ? '#/sceneShare/view' : '#/dataSetShare/view';
                let startIndex = url.indexOf(searchType) + searchType.length; // 找到 searchType 在URL中的位置
                let valueStartIndex = url.indexOf('/', startIndex + 1) + 1; // 计算所需值的起始位置（即第二个"/"之后的位置）
                let valueEndIndex = url.indexOf('?', valueStartIndex + 1);
                let _id = url.substring(valueStartIndex, valueEndIndex); // 截取所需的值

                let tokenStartIndex = url.indexOf('token=') + 'token='.length; // 计算token的起始位置（即"token="之后的位置）
                let tokenEndIndex = url.indexOf('&', tokenStartIndex); // 如果URL中有其他查询参数，找到"&"字符的位置，作为token的结束位置
                let _token = tokenEndIndex !== -1 ? url.substring(tokenStartIndex, tokenEndIndex) : url.substring(tokenStartIndex); // 截取并输出token的

                // 解析viewMode和dataType
                let viewModeIndex = url.indexOf('viewMode=');
                let dataTypeIndex = url.indexOf('dataType=');
                let _viewMode = "", _dataType = "";

                if (viewModeIndex !== -1) {
                    let viewModeEndIndex = url.indexOf('&', viewModeIndex + 'viewMode='.length);
                    _viewMode = viewModeEndIndex !== -1 ? url.substring(viewModeIndex + 'viewMode='.length, viewModeEndIndex) : url.substring(viewModeIndex + 'viewMode='.length);
                }

                if (dataTypeIndex !== -1) {
                    let dataTypeEndIndex = url.indexOf('&', dataTypeIndex + 'dataType='.length);
                    _dataType = dataTypeEndIndex !== -1 ? url.substring(dataTypeIndex + 'dataType='.length, dataTypeEndIndex) : url.substring(dataTypeIndex + 'dataType='.length);
                }

                const state_store = useStateStore();
                state_store.updateCurrToken(_token);
                state_store.updateCurrBaseUrl(baseUrl);
                try {
                    const shareData = await uni.$service.getSharedInfo(false);
                    const params = {
                        url: url,
                        baseUrl: baseUrl,
                        shareType: shareType,
                        id: _id,
                        token: _token,
                        shareViewMode: _viewMode,
                        shareDataType: _dataType,
                        shareItem: shareData,
                    };
                    uni.$re.unipluginLog('params = ' + JSON.stringify(params));
                    return params;

                } catch (error: any) {
                    if (error.statusCode == 404) {
                        const params = {
                            url: url,
                            baseUrl: baseUrl,
                            shareType: shareType,
                            id: _id,
                            token: _token,
                            shareViewMode: _viewMode,
                            shareDataType: _dataType,
                        };
                        uni.$re.unipluginLog('params = ' + JSON.stringify(params));
                        return params;
                    } else {
                        return null;
                    }
                }
            }

        } catch (error) {
            throw null;
        }
    },

    // MARK tool 时间对比
    time_compare: (frontTime: Date, backTime: Date): string => {
        let diff = Math.abs(backTime.getTime() - frontTime.getTime());
        let days = Math.floor(diff / (1000 * 60 * 60 * 24));
        let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        let minutes = Math.floor((diff / (1000 * 60)) % 60);

        if (days > 0) {
            return `${days}天`;
        } else if (hours > 0) {
            return `${hours}小时`;
        } else {
            return `${minutes}分钟`;
        }
    },

    //  MARK tool 处理时间对象，iOS 原生只兼容 yyyy/MM/dd HH:mm:ss 或 ISO 标准格式（yyyy-MM-dd'T'HH:mm:ss）
    time_To_IOSDate: (timeStr: string): string => {
        if (!timeStr || !timeStr.length) return '';
        return timeStr.replace(/-/g, '/');
    },

    // MARK tool 时间格式化
    time_format: (utcTime: any): string => {
        // 空值直接返回空
        if (!utcTime || utcTime === 'null' || utcTime === 'undefined') return "";

        let date = new Date(Date.parse(utcTime));

        let year = date.getFullYear();
        let month = api.time_pad2(date.getMonth() + 1);
        let day = api.time_pad2(date.getDate());
        let hour = api.time_pad2(date.getHours());
        let minute = api.time_pad2(date.getMinutes());
        let second = api.time_pad2(date.getSeconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },

    time_pad2: (n: any): any => {
        return n < 10 ? "0" + n : n;
    },

    // MARK tool 获取默认相机定位目标
    cam_defauleDataSet: (dataSetList: any): string => {
        let find = dataSetList.find((e: any) => e.dataSetType === 0);
        if (find) {
            return find.dataSetId;
        } else {
            return '';
        }
    },

    // MARK tool 提示更新数据
    update_data: (): void => {
        const device_store = useDeviceStore();
        if (RE_NeedUpdate) {
            const card_store = useCardStore();

            if (!card_store.cardList || card_store.cardList.length <= 0) return;
            let needUpdata = false;
            const appVersion = device_store.appVersion;
            if (appVersion.length) {
                if (api.compareVersions(RE_AppVersion, appVersion) > 0) {
                    needUpdata = true;
                }
            } else {
                needUpdata = true;
            }
            device_store.update_appVersion(RE_AppVersion);
            if (needUpdata) {
                uni.showModal({
                    title: '更新提示',
                    content: '版本更新后旧分享数据无法使用，请删除后重新扫码获取（取消后可以在设置中重新删除）',
                    success: function (res) {
                        if (res.confirm) {
                            api.initializeData();
                        }
                    }
                });
            }
        } else {
            device_store.update_appVersion(RE_AppVersion);
        }
    },

    compareVersions: (version1: string, version2: string): number => {
        // 拆分版本号为数字数组
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);

        // 取最长的数组长度进行比较
        const maxLength = Math.max(v1.length, v2.length);

        for (let i = 0; i < maxLength; i++) {
            // 若某一版本号长度不足，用 0 补位
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;

            if (num1 > num2) return 1; // version1 更大
            if (num1 < num2) return -1; // version2 更大
        }

        return 0; // 版本号相等
    },

    // MARK tool 提示删除数据
    del_data: (): void => {
        uni.showModal({
            title: '提示',
            content: '是否清除所有的存储数据（卡片列表和配置信息）',
            success: function (res) {
                if (res.confirm) {
                    api.initializeData();
                }
            }
        });
    },

    // MARK config 获取AppVersion
    getAppVersion: (): string => {
        const info = uniApi.get_SystemInfo();
        return info.appVersion || RE_AppVersion;
    },

    // MARK config 初始化数据
    initializeData: (): void => {
        const card_store = useCardStore();
        uni.$service.updateServerWhiteList([]);//清空白名单数据
        card_store.clearCardList();//清空卡片列表
    },

    // MARK Service 获取项目名称
    card_getProjName: async (urlInfo: any): Promise<any> => {
        if (urlInfo.shareType === 2) {
            const sceneInfo = await serviceApi.getSceneInfo(urlInfo.id);
            return sceneInfo?.sceneName;
        } else {
            const modelInfo = await serviceApi.getModelTree({ dataSetId: urlInfo.id });
            const find_obj = modelInfo?.find((item: any) => item.dataSetId === urlInfo.id);
            return find_obj ? find_obj.dataSetName : '项目查询失败';
        }
    },

    // MARK tool 处理场景分享的卡片数据
    card_getSceneData: async (urlInfo: any): Promise<any> => {
        // 获取场景信息
        const res_1 = await serviceApi.getSceneInfo(urlInfo.id);
        // 获取场景树
        const res_2 = await serviceApi.getSceneTree({ sceneId: urlInfo.id, isPublished: true }, res_1);
        // 处理数据集ID列表
        const dataSetIdList = dataTool.handle_dataSetIdList(res_2, res_1);
        // 获取挤出纹理信息
        const extrudeTexList = await serviceApi.getExtrudeTexList(res_2);
        // 并行处理各种数据
        const [terrainList, entityList, waterList, extrudeList, monomerList] = await Promise.all([
            dataTool.handle_terrainDataSetList(res_2, 2),
            dataTool.handle_entityData(res_2, res_1.componentPosition),
            dataTool.handle_waterData(res_2),
            dataTool.handle_extrudeData(res_2, extrudeTexList),
            dataTool.handle_monomerData(res_2),
        ]);

        // 获取数据集信息
        const res_3 = await serviceApi.getDataSetList({ dataSetIds: dataSetIdList }, urlInfo);

        const dataSetList_temp1: any[] = dataTool.handle_dataSetTrans(res_3, res_1.dataSetPosition);
        const dataSetList_temp2 = dataTool.handle_terrainLayerLev(dataSetList_temp1, terrainList);
        const dataSetList = dataTool.handle_dataSetId(dataSetList_temp2);
        const urlHeaderList = dataTool.handle_dataSetResHeader(dataSetList_temp2, urlInfo);
        const authorData = dataTool.handle_dataSetResAuthorInfo(urlInfo);

        const cam_dataSetId = api.cam_defauleDataSet(dataSetList);

        const shareData: Share = newShare({
            url: urlInfo.url,
            shareId: urlInfo.shareId,
            token: urlInfo.token,
            baseUrl: urlInfo.baseUrl,
            source: urlInfo.shareItem?.source,
            projName: urlInfo.projName,
            id: urlInfo.id,
            lastTime: new Date(),
            endTime: api.time_To_IOSDate(urlInfo.shareItem?.endTime),
            shareFormUserExpirationTime: api.time_To_IOSDate(urlInfo.shareItem?.shareFormUserExpirationTime),
            urlHeaderList: urlHeaderList,
            authorData: authorData,
            dataSetList: dataSetList,
            worldCRS: res_1.coordinates,
            shareType: 2,
            camDefaultDataSetId: cam_dataSetId,
            shareViewMode: urlInfo.shareViewMode,
            entityList: entityList,
            waterList: waterList,
            extrudeList: extrudeList,
            extrudeTexList: extrudeTexList,
            monomerList: monomerList,
        });

        return shareData;
    },

    // MARK tool 处理单模型分享的卡片数据
    card_getBimData: async (urlInfo: any): Promise<any> => {
        // 获取资源数据
        const dataSetList = await serviceApi.getDataSetList({ dataSetIds: [urlInfo.id] }, urlInfo);
        const urlHeaderList = dataTool.handle_dataSetResHeader(dataSetList, urlInfo);
        const authorData = dataTool.handle_dataSetResAuthorInfo(urlInfo);

        const shareData: Share = newShare({
            url: urlInfo.url,
            shareId: urlInfo.shareId,
            token: urlInfo.token,
            baseUrl: urlInfo.baseUrl,
            source: urlInfo.shareItem?.source,
            projName: urlInfo.projName,
            id: urlInfo.id,
            lastTime: new Date(),
            endTime: api.time_To_IOSDate(urlInfo.shareItem?.endTime),
            shareFormUserExpirationTime: api.time_To_IOSDate(urlInfo.shareItem?.shareFormUserExpirationTime),
            urlHeaderList: urlHeaderList,
            authorData: authorData,
            dataSetList: dataSetList,
            shareType: 1,
            shareDataType: urlInfo.shareDataType,
        });

        return shareData;
    },

    // MARK tool 处理CAD分享的卡片数据
    card_getCadData: async (urlInfo: any): Promise<any> => {
        // 获取资源数据
        const cadDataSetList = await serviceApi.getCadDataSetList({ dataSetId: urlInfo.id });
        const urlHeaderList = dataTool.handle_dataSetResHeader(cadDataSetList, urlInfo);
        const authorData = dataTool.handle_dataSetResAuthorInfo(urlInfo);

        const shareData: Share = newShare({
            url: urlInfo.url,
            shareId: urlInfo.shareId,
            token: urlInfo.token,
            baseUrl: urlInfo.baseUrl,
            source: urlInfo.shareItem?.source,
            projName: urlInfo.projName,
            id: urlInfo.id,
            lastTime: new Date(),
            endTime: api.time_To_IOSDate(urlInfo.shareItem?.endTime),
            shareFormUserExpirationTime: api.time_To_IOSDate(urlInfo.shareItem?.shareFormUserExpirationTime),
            urlHeaderList: urlHeaderList,
            authorData: authorData,
            dataSetList: cadDataSetList,
            shareType: 1,
            shareDataType: urlInfo.shareDataType,
        });

        return shareData;
    },
}


export default api;
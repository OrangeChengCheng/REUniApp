/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2025-12-01 12:10:32
 */

const RE_AppVersion = "1.0.8";
const RE_NeedUpdate = true;

import { useCardStore } from '@/stores/card';
import { useDeviceStore } from '@/stores/device';
import { useStateStore } from '@/stores/state';


interface ApiMethods {
    url_handle(url: string): Promise<any>;
    time_compare(frontTime: Date, backTime: Date): string;
    time_format(utcTime: Date): string;
    time_pad2(n: any): any;
    cam_defauleDataSet(dataSetList: any): string;
    update_data(): void;
    del_data(): void;
    compareVersions(version1: string, version2: string): number;
    getAppVersion(): string;
    initializeData(): void;
}

const api: ApiMethods = {
    // MARK tool 处理分享链接
    url_handle: async (url: string): Promise<any> => {

        try {
            url = url.trim();

            uni.$re.unipluginLog('url = ' + url);
            if (url.length <= 0) return null;

            //提取baseUrl（域名和端口号）
            let baseUrl = '';
            // 判断协议类型（http:// 或 https://）
            const protocolEndIndex = url.indexOf('://');
            if (protocolEndIndex !== -1) {
                // 从协议结束位置（://后）开始，寻找第一个“/”
                const pathStartIndex = url.indexOf('/', protocolEndIndex + 3);
                if (pathStartIndex !== -1) {
                    // 截取从开头到第一个“/”的部分，即为baseUrl
                    baseUrl = url.substring(0, pathStartIndex);
                } else {
                    // 若没有“/”，则整个URL即为baseUrl（如单独的域名）
                    baseUrl = url;
                }
            }

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
                const urlData = await uni.$service.getSharedUrlInfo(_shareId);
                if (!urlData || !urlData.token) return null;
                let _shareType: number = 0; // 判断分享链接类型 0：无 1：模型 2：场景
                if (urlData.viewMode.length > 0) {
                    _shareType = 2;
                } else if (urlData.viewMode == "") {
                    _shareType = 1;
                }
                const params = { url: url, baseUrl: baseUrl, shareType: _shareType, shareId: _shareId, id: urlData.resourceId, token: urlData.token, shareViewMode: urlData.viewMode, shareDataType: urlData.dataType };
                return params;
            }

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
            // let valueEndIndex = url.indexOf('/', valueStartIndex); // 计算所需值的结束位置（即第三个"/"之前的位置）
            let valueEndIndex = url.indexOf('?', valueStartIndex + 1);
            let _id = url.substring(valueStartIndex, valueEndIndex); // 截取所需的值

            // let projNameStartIndex = valueEndIndex + 1;
            // let projNameEndIndex = url.indexOf('?', projNameStartIndex);
            // let _projNameCode = url.substring(projNameStartIndex, projNameEndIndex); // 截取所需的值
            // let _projName = decodeURIComponent(_projNameCode);

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

            let params = { url: url, baseUrl: baseUrl, shareType: shareType, projName: "", id: _id, token: _token, shareViewMode: _viewMode, shareDataType: _dataType };
            uni.$re.unipluginLog('params = ' + JSON.stringify(params));
            return params;

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

    // MARK tool 时间格式化
    time_format: (utcTime: any): string => {
        // 空值直接返回空
        if (!utcTime || utcTime === 'null' || utcTime === 'undefined') return "";

        let date: Date;
        // 处理iOS兼容：替换时间字符串中的-为/，处理T分隔符（ISO格式）
        const timeStr = typeof utcTime === 'string'
            ? utcTime.replace(/-/g, '/').replace('T', ' ').replace(/\.\d+Z/, '')
            : utcTime;

        try {
            // 优先用时间戳/标准格式初始化
            date = new Date(timeStr);
            // 检测是否为无效日期（iOS解析失败会返回Invalid Date）
            if (isNaN(date.getTime())) {
                return ""; // 解析失败返回空
            }
        } catch (e) {
            return ""; // 异常兜底
        }

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
        return RE_AppVersion;
    },

    // MARK config 初始化数据
    initializeData: (): void => {
        const card_store = useCardStore();
        uni.$service.updateServerWhiteList([]);//清空白名单数据
        card_store.clearCardList();//清空卡片列表
    },
}


export default api;
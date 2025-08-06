/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2025-08-04 16:52:02
 */

const RE_AppVersion = "1.0.8";
const RE_NeedUpdate = true;

let card_store: any;
async function getCardStore() {
    // 异步导入
    const { useCardStore } = await import('@/stores/card');
    card_store = useCardStore();
}
getCardStore();

interface ApiMethods {
    url_handle(url: string): any;
    time_compare(frontTime: Date, backTime: Date): string;
    time_format(utcTime: Date): string;
    time_pad2(n: any): any;
    cam_defauleDataSet(dataSetList: any): string;
    update_data(): void;
    del_data(): void;
    getAppVersion(): string;
    initializeData(): void;
}

const api: ApiMethods = {
    // MARK tool 处理分享链接
    url_handle: (url: string): any => {
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
        if (!utcTime) return "";
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
        if (RE_NeedUpdate) {
            if (!uni.getStorageSync('RE_updateData')) {
                uni.showModal({
                    title: '更新提示',
                    content: '版本更新后旧分享数据无法使用，请删除后重新扫码获取（取消后可以在设置中重新删除）',
                    success: function (res) {
                        if (res.confirm) {
                            api.initializeData();
                        }
                        uni.setStorageSync('RE_updateData', true);
                    }
                });
            }
        } else {
            uni.setStorageSync('RE_updateData', false);
        }
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
        uni.$server.updateServerWhiteList([]);//清空白名单数据
        card_store.clearCardList();//清空卡片列表
    },
}


export default api;
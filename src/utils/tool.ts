/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2025-07-30 14:48:00
 */

import { getSceneById, getProjectTree } from '@/service/interface';

interface ApiMethods {
    url_handle(url: string): any;
    time_compare(frontTime: Date, backTime: Date): string;
    cam_defauleDataSet(dataSetList: any): string;
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

    // MARK tool 获取默认相机定位目标
    cam_defauleDataSet: (dataSetList: any): string => {
        let find = dataSetList.find((e: any) => e.dataSetType === 0);
        if (find) {
            return find.dataSetId;
        } else {
            return '';
        }
    },

}


// // MARK Service 获取项目名称
// const getProjName = (params: any): Promise<any> => {
//     return new Promise<any>((resolve, reject) => {
//         if (params.shareType === 2) {
//             getSceneInfo(params.id)
//                 .then((res) => {
//                     resolve(res?.sceneName);
//                 })
//                 .catch((err) => {
//                     reject(err);
//                 });
//         } else {
//             getModelTree({ dataSetId: params.id })
//                 .then((res) => {
//                     let find_obj = res?.find((item: any) => item.dataSetId === params.id);
//                     if (find_obj) {
//                         resolve(find_obj.dataSetName);
//                     } else {
//                         reject('项目查询失败');
//                     }
//                 })
//                 .catch((err) => {
//                     reject(err);
//                 });
//         }
//     });
// };

// // MARK Service 获取模型目录树
// const getModelTree = (paran: any): Promise<any> => {
//     return new Promise<any>((resolve, reject) => {
//         getProjectTree(paran).then((res) => {
//             if (res.data) {
//                 resolve(res.data);
//             } else {
//                 reject(new Error('模型目录树获取失败！'));
//             }
//         });
//     });
// };

// // MARK Service 获取场景信息
// const getSceneInfo = (paran: any): Promise<any> => {
//     return new Promise<any>((resolve, reject) => {
//         getSceneById(paran).then((res) => {
//             if (res.data) {
//                 resolve(res.data);
//             } else {
//                 reject(new Error('场景目录树获取失败！'));
//             }
//         });
//     });
// };

export default api;
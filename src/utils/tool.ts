/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2024-09-27 10:30:58
 */


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
        let valueEndIndex = url.indexOf('/', valueStartIndex); // 计算所需值的结束位置（即第三个"/"之前的位置）
        let _id = url.substring(valueStartIndex, valueEndIndex); // 截取所需的值

        let projNameStartIndex = valueEndIndex + 1;
        let projNameEndIndex = url.indexOf('?', projNameStartIndex);
        let _projNameCode = url.substring(projNameStartIndex, projNameEndIndex); // 截取所需的值
        let _projName = decodeURIComponent(_projNameCode);

        let tokenStartIndex = url.indexOf('token=') + 'token='.length; // 计算token的起始位置（即"token="之后的位置）
        let tokenEndIndex = url.indexOf('&', tokenStartIndex); // 如果URL中有其他查询参数，找到"&"字符的位置，作为token的结束位置
        let _token = tokenEndIndex !== -1 ? url.substring(tokenStartIndex, tokenEndIndex) : url.substring(tokenStartIndex); // 截取并输出token的

        let params = { url: url, shareType: shareType, projName: _projName, id: _id, token: _token };
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

export default api;
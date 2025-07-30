/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:21
 * @LastEditTime: 2025-07-30 14:33:53
 */


const RE_ServerURl_HD = "https://engine3.bjblackhole.com";
const RE_ServerURl_XH = "http://realbim.bjblackhole.cn:16060/";
const RE_DownloadUrl = "/DownloadService/blackHole3D/files/Download";

interface ApiMethods {
    getCurDownloadUrl(): string;
    getCurBaseUrl(): string;
    updateCurBaseUrl(url: string): void;
    getCurToken(): string;
    updateCurToken(token: string): void;
    getServerWhiteList(): any;
    updateServerWhiteList(list: any): void;
    checkWhiteListContain(url: string): boolean;
    getTimeout(): number;
}


const api: ApiMethods = {
    // MARK config 获取当前的服务资源地址
    getCurDownloadUrl: (): string => {
        const baseUrl = api.getCurBaseUrl();
        return `${baseUrl}${RE_DownloadUrl}`;
    },


    // MARK config 获取最新服务配置地址
    getCurBaseUrl: (): string => {
        let baseUrl: string = uni.getStorageSync('RE_Server_BaseUrl') || "";
        if (!baseUrl || baseUrl.length <= 0) {
            baseUrl = RE_ServerURl_HD;
        }
        return baseUrl;
    },

    // MARK config 更新最新服务配置地址
    updateCurBaseUrl: (url: string): void => {
        uni.setStorageSync('RE_Server_BaseUrl', url);
    },

    // MARK config 获取最新Token
    getCurToken: (): string => {
        const token: string = uni.getStorageSync('RE_Server_Token') || "";
        return token;
    },

    // MARK config 更新Token
    updateCurToken: (token: string): void => {
        uni.setStorageSync('RE_Server_Token', token);
    },

    // MARK config 获取服务白名单
    getServerWhiteList: (): any => {
        let whiteList: any[] = JSON.parse(uni.getStorageSync('RE_Server_WhiteList') || '[]');
        if (!whiteList || whiteList.length <= 0) {
            whiteList.push(RE_ServerURl_HD);
            whiteList.push(RE_ServerURl_XH);
            api.updateServerWhiteList(whiteList);
        }
        return whiteList;
    },

    // MARK config 更新服务白名单
    updateServerWhiteList: (list: any): void => {
        const list_json = JSON.stringify(list);
        uni.setStorageSync('RE_Server_WhiteList', list_json);
    },

    // MARK config 检查是否是白名单范围
    checkWhiteListContain: (url: string): boolean => {
        const whiteList = api.getServerWhiteList();
        if (whiteList.includes(url)) {
            return true;
        }
        return false;
    },


    // MARK config 获取通用请求超时时间
    getTimeout: (): number => {
        return 30000;
    },

}



export default api;
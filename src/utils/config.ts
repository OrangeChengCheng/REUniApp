/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:21
 * @LastEditTime: 2025-06-03 12:36:20
 */


const RE_ServerURl = "https://engine3.bjblackhole.com";
const RE_DownloadUrl = "/DownloadService/blackHole3D/files/Download";

interface ApiMethods {
    getServerUrl(): string;
    updateServerUrl(url: string): void;
    getDownloadUrl(): string;
    getTimeout(): number;
}


const api: ApiMethods = {
    // MARK config 获取当前的服务配置地址
    getServerUrl: (): string => {
        let private_serverUrl = uni.getStorageSync('RE_private_serverUrl');
        if (!private_serverUrl || private_serverUrl.length <= 0) {
            return RE_ServerURl;
        } else {
            return private_serverUrl;
        }
    },

    // MARK config 获取当前的服务资源地址
    getDownloadUrl: (): string => {
        let private_serverUrl = uni.getStorageSync('RE_private_serverUrl');
        if (!private_serverUrl || private_serverUrl.length <= 0) {
            return `${RE_ServerURl}${RE_DownloadUrl}`;
        } else {
            return `${private_serverUrl}${RE_DownloadUrl}`;
        }
    },


    // MARK config 更新服务配置地址
    updateServerUrl: (url: string): void => {
        uni.setStorageSync('RE_private_serverUrl', url);
    },


    // MARK config 获取通用请求超时时间
    getTimeout: (): number => {
        return 30000;
    },

}



export default api;
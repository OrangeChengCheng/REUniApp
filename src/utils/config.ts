/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:21
 * @LastEditTime: 2025-05-21 16:09:00
 */




interface ApiMethods {
    getServerUrl(): string;
    updateServerUrl(url: string): void;
    getTimeout(): number;
}


const api: ApiMethods = {
    // MARK config 获取当前的服务配置地址
    getServerUrl: (): string => {
        let private_serverUrl = uni.getStorageSync('RE_private_serverUrl');
        if (!private_serverUrl || private_serverUrl.length <= 0) {
            return 'https://engine3.bjblackhole.com/blackHole3D/project';
        } else {
            return private_serverUrl;
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
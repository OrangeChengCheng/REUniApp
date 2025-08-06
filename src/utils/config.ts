/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:21
 * @LastEditTime: 2025-08-06 11:16:18
 */


const RE_ServerURl_HD = "https://engine3.bjblackhole.com";
// const RE_ServerURl_XH = "http://realbim.bjblackhole.cn:16060";


interface ApiMethods {
    getServerWhiteList(): any;
    updateServerWhiteList(list: any): void;
    getTimeout(): number;
}


const api: ApiMethods = {
    // MARK config 获取服务白名单
    getServerWhiteList: (): any => {
        // api.updateServerWhiteList([]);//清空数据
        let whiteList: any[] = JSON.parse(uni.getStorageSync('RE_Server_WhiteList') || '[]');
        if (!whiteList || whiteList.length <= 0) {
            whiteList.push({ url: RE_ServerURl_HD, type: 1 });
            // whiteList.push({ url: RE_ServerURl_XH, type: 2 });
            api.updateServerWhiteList(whiteList);
        }
        return whiteList;
    },

    // MARK config 更新服务白名单
    updateServerWhiteList: (list: any): void => {
        const list_json = JSON.stringify(list);
        uni.setStorageSync('RE_Server_WhiteList', list_json);
    },


    // MARK config 获取通用请求超时时间
    getTimeout: (): number => {
        return 30000;
    },

}



export default api;
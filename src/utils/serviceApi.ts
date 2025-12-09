/*
 * @Author: Lemon C
 * @Date: 2025-11-19 14:50:45
 * @LastEditTime: 2025-12-09 11:45:37
 */
import {
    getSharedUrlInfo,
    getSharedInfo,
} from '@/service/interface';



interface ApiMethods {
    getSharedUrlInfo(params: any): Promise<any>;
    getSharedInfo(toast: boolean): Promise<any>;
}

const api: ApiMethods = {
    // MARK 根据分享id获取分享url信息
    getSharedUrlInfo: async (params: any): Promise<any> => {
        try {
            const res = await getSharedUrlInfo(params);
            if (res.isSuccess) {
                console.log(res);
                if (!res.data) {
                    throw new Error(res.errMsg || '获取分享信息失败');
                }
                let shareUrlInfo = res.data;
                if (!shareUrlInfo || !shareUrlInfo.shareItem.platformMode || !shareUrlInfo.shareItem.loginMode) {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
                // 判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
                if (shareUrlInfo.shareItem.loginMode.value === 'Private') {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
                if (shareUrlInfo.shareItem.platformMode.value === 'BlackHole') {
                    shareUrlInfo.shareItem.source = 1;
                    return shareUrlInfo;
                } else if (shareUrlInfo.shareItem.platformMode.value === 'StarRiver') {
                    shareUrlInfo.shareItem.source = 2;
                    return shareUrlInfo;
                } else if (shareUrlInfo.shareItem.platformMode.value === 'Nebula') {
                    shareUrlInfo.shareItem.source = 3;
                    return shareUrlInfo;
                } else {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
            } else {
                throw new Error(res.errMsg || '获取分享信息失败');
            }
        } catch (error) {
            throw error;
        }
    },


    // MARK 根据token获取分享信息
    getSharedInfo: async (toast: boolean = true): Promise<any> => {
        try {
            const res = await getSharedInfo(toast);
            if (res.isSuccess) {
                console.log(res);
                if (!res.data) {
                    throw new Error(res.errMsg || '获取分享信息失败');
                }
                let shareInfo = res.data;
                if (!shareInfo || !shareInfo.platformMode || !shareInfo.loginMode) {
                    shareInfo.source = 0;
                    return shareInfo;
                }
                // 判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
                if (shareInfo.loginMode.value === 'Private') {
                    shareInfo.source = 0;
                    return shareInfo;
                }
                if (shareInfo.platformMode.value === 'BlackHole') {
                    shareInfo.source = 1;
                    return shareInfo;
                } else if (shareInfo.platformMode.value === 'StarRiver') {
                    shareInfo.source = 2;
                    return shareInfo;
                } else if (shareInfo.platformMode.value === 'Nebula') {
                    shareInfo.source = 3;
                    return shareInfo;
                } else {
                    shareInfo.source = 0;
                    return shareInfo;
                }
            } else {
                throw new Error(res.errMsg || '获取分享信息失败');
            }
        } catch (error) {
            throw error;
        }
    },
}


export default api;
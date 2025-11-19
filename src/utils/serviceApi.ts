/*
 * @Author: Lemon C
 * @Date: 2025-11-19 14:50:45
 * @LastEditTime: 2025-11-19 16:06:58
 */
import {
    getSharedUrlInfo,
} from '@/service/interface';



interface ApiMethods {
    getSharedUrlInfo(params: any): Promise<any>;
}

const api: ApiMethods = {
    // MARK 根据分享id获取分享url信息
    getSharedUrlInfo: async (params: any): Promise<any> => {
        try {
            const res = await getSharedUrlInfo(params);
            if (res.isSuccess) {
                return res.data;
            } else {
                throw new Error(res.errMsg || '获取分享信息失败');
            }
        } catch (error) {
            throw error;
        }
    },
}


export default api;
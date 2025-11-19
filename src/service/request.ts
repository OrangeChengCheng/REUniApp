/*
 * @Author: Lemon C
 * @Date: 2024-09-14 12:21:00
 * @LastEditTime: 2025-11-19 17:11:17
 */


import { useStateStore } from '@/stores/state';

export function requestPost(url: string, data?: object): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        const state_store = useStateStore();
        uni.request({
            url: `${state_store.baseUrl}/${state_store.sourceRoute}/project${url}`,
            data: data || {},
            method: 'POST',
            timeout: uni.$service.commonTimeout,
            header: {
                'content-type': 'application/json',
                'authorization': state_store.token,
                'App3D': true,
            },
            success: (res: any) => {
                if (res.statusCode && res.statusCode == 200) {
                    let data: any = res.data;
                    if (data.data && data.data == '{}') {
                        data.data = {};
                    }
                    resolve(res.data);
                }
                else {
                    if (res.statusCode == 504 || res.statusCode == 404) {
                        uni.showToast({ title: '服务器错误，请稍候再试!', icon: 'none' });
                    } else if (res.statusCode == 403) {
                        uni.showToast({ title: '权限不足,请联系管理员!', icon: 'none' });
                    } else if (res.statusCode == 401) {
                        uni.showToast({ title: '登录信息已过期，请重新登录!', icon: 'none' });
                    } else {
                        uni.showToast({ title: '未知错误!', icon: 'none' });
                    }
                    res.url = `${state_store.baseUrl}/${state_store.sourceRoute}/project${url}`;
                    res.authorization = state_store.token;
                    res.data = data;
                    uni.$re.unipluginLog(JSON.stringify(res));
                    reject(res);
                }
            },
            fail: (err) => {
                uni.showToast({ title: JSON.stringify(err), icon: 'none' });
                uni.$re.unipluginLog(JSON.stringify(err));
                reject(err);
            },
        });
    });
}


export function requestGet(url: string, data?: object): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        const state_store = useStateStore();
        uni.request({
            url: `${state_store.baseUrl}/${state_store.sourceRoute}/project${url}`,
            data: data || {},
            method: 'GET',
            timeout: uni.$service.commonTimeout,
            header: {
                'content-type': 'application/json',
                'authorization': state_store.token,
                'App3D': true,
            },
            success: (res: any) => {
                if (res.statusCode && res.statusCode == 200) {
                    let data: any = res.data;
                    if (data.data && data.data == '{}') {
                        data.data = {};
                    }
                    resolve(res.data);
                }
                else {
                    if (res.statusCode == 504 || res.statusCode == 404) {
                        uni.showToast({ title: '服务器错误，请稍候再试!', icon: 'none' });
                    } else if (res.statusCode == 403) {
                        uni.showToast({ title: '权限不足,请联系管理员!', icon: 'none' });
                    } else if (res.statusCode == 401) {
                        uni.showToast({ title: '登录信息已过期，请重新登录!', icon: 'none' });
                    } else {
                        uni.showToast({ title: '未知错误!', icon: 'none' });
                    }
                    res.url = `${state_store.baseUrl}/${state_store.sourceRoute}/project${url}`;
                    res.authorization = state_store.token;
                    res.data = data;
                    uni.$re.unipluginLog(JSON.stringify(res));
                    reject(res);
                }
            },
            fail: (err) => {
                uni.showToast({ title: JSON.stringify(err), icon: 'none' });
                uni.$re.unipluginLog(JSON.stringify(err));
                reject(err);
            },
        });
    });
}




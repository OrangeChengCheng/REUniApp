/*
 * @Author: Lemon C
 * @Date: 2024-09-14 12:21:00
 * @LastEditTime: 2024-09-19 15:29:54
 */





export function requestPost(url: string, data?: object): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        if (!checkToken()) { reject(new Error); return; }
        uni.request({
            // url: "http://192.168.31.6:9202/api/developercenter" + url,
            url: uni.$window.serverUrl + url,
            data: data || {},
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'authorization': uni.getStorageSync('RE_TokenId'),
            },
            success: (res) => {
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
        if (!checkToken()) { reject(new Error); return; }
        uni.request({
            url: uni.$window.serverUrl + url,
            data: data || {},
            method: 'GET',
            header: {
                'content-type': 'application/json',
                'authorization': uni.getStorageSync('RE_TokenId'),
            },
            success: (res) => {
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



function checkToken() {
    if (!uni.getStorageSync('RE_TokenId') || uni.getStorageSync('RE_TokenId').length <= 0) {
        uni.showToast({ title: '链接无效，请联系管理员!', icon: 'none' });
        return false;
    } else {
        return true;
    }
}
interface ApiMethods {
    scan_code(): Promise<any>;
    scan_checkPermission(): number;
    scan_authorize(): Promise<any>;
    scan_QRCode(): Promise<any>;
    show_loading(): void;
    hide_loading(): void;
}

const api: ApiMethods = {
    // MARK uni-api 扫码（二维码）
    scan_code: (): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            const permissionType: number = api.scan_checkPermission();
            if (permissionType == 0) {
                api.scan_authorize().then((e: any) => {
                    api.scan_QRCode().then((res) => {
                        resolve(res);
                    }).catch(reject);
                }).catch(reject);
            } else if (permissionType == 2) {
                api.scan_QRCode().then((res) => {
                    resolve(res);
                }).catch(reject);
            }
        });
    },

    // MARK uni-api 鉴权
    scan_checkPermission: (): number => {
        if (Object.prototype.hasOwnProperty.call(uni, 'getAppAuthorizeSetting')) {
            const appAuthorizeSetting = uni.getAppAuthorizeSetting();
            if (appAuthorizeSetting.cameraAuthorized && appAuthorizeSetting.cameraAuthorized.length) {
                // 相机权限
                if (appAuthorizeSetting.cameraAuthorized == 'denied') {
                    // 用户拒绝了相机的使用权限，需要自行打开
                    uni.showToast({ title: '您已拒绝了授权，请前往设置进行打开', icon: 'none' });
                    return 1;
                } else if (appAuthorizeSetting.cameraAuthorized == 'not determined') {
                    // 用户未授权相机的使用权限
                    return 0;
                } else if (appAuthorizeSetting.cameraAuthorized == 'authorized') {
                    // 用户已授权相机的使用权限
                    return 2;
                }
            }
        }
        uni.showToast({ title: '相机权限异常', icon: 'none' });
        return -1;
    },

    // MARK uni-api 授权（相机）
    scan_authorize: (): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            if (!Object.prototype.hasOwnProperty.call(uni, 'authorize')) {
                uni.showToast({ title: '授权获取失败', icon: 'none' });
                reject(new Error('授权获取失败'));
            }
            // 获取相机授权
            uni.authorize({
                scope: 'scope.camera',
                success() {
                    // 用户同意授权
                    resolve(true);
                },
                fail() {
                    // 用户拒绝授权
                    uni.showToast({ title: '您拒绝了授权', icon: 'none' });
                    reject(new Error('您拒绝了授权'));
                },
            });
        });
    },

    // MARK uni-api 扫码调用（二维码）
    scan_QRCode: (): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            if (!Object.prototype.hasOwnProperty.call(uni, 'scanCode')) {
                uni.showToast({ title: '扫码失败', icon: 'none' });
                reject(new Error('扫码失败'));
            }
            // 扫二维码
            uni.scanCode({
                success: (res) => {
                    uni.$re.unipluginLog('扫码内容： ' + JSON.stringify(res));
                    resolve(res.result);
                },
                fail: (err) => {
                    uni.showToast({ title: err.errMsg, icon: 'none' });
                    uni.$re.unipluginLog(JSON.stringify(err));
                    reject(err);
                },
            });
        });
    },

    // MARK uni-app  展示loading
    show_loading: () => {
        uni.showLoading({
            title: '加载中...',
        });
    },

    // MARK uni-app  隐藏loading
    hide_loading: () => {
        uni.hideLoading();
    },

}

export default api;
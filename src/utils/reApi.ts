

interface ApiMethods {
    unipluginLog(log: string): void;
    getREModule(): any;
}

const api: ApiMethods = {
    // MARK re-api 获取插件对象
    getREModule: (): any => {
        if (Object.prototype.hasOwnProperty.call(uni, 'requireNativePlugin')) {
            const reModule = uni.requireNativePlugin('REUniPlugin-REModule');
            return reModule;
        } else {
            uni.showToast({ title: '加载插件失败', icon: 'none' });
            return null;
        }
    },

    // MARK re-api 插件打印信息
    unipluginLog: (log: string) => {
        api.getREModule()?.unipluginLog({ msg: log });
    },
}

export default api;
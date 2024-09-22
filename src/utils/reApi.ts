/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2024-09-22 16:39:51
 */


interface ApiMethods {
    unipluginLog(log: string): void;
    realEngineRender(data: object): Promise<any>;
    getREModule(): any;
}

const api: ApiMethods = {
    // MARK re-api 获取插件对象
    getREModule: (): any => {
        if (Object.prototype.hasOwnProperty.call(uni, 'requireNativePlugin')) {
            const reModule = uni.requireNativePlugin('REUniPlugin-REModule');
            return reModule;
        } else {
            // uni.showToast({ title: '加载插件失败', icon: 'none' });
            return null;
        }
    },

    // MARK re-api 插件打印信息
    unipluginLog: (log: string) => {
        api.getREModule()?.unipluginLog({ msg: log });
    },

    // MARK re-api 加载模型
    realEngineRender: (data: object): Promise<any> => {
        return new Promise<any>((resolve) => {
            api.getREModule()?.realEngineRender(data, (ret: any) => {
                resolve(ret);
            });
        });
    },

}

export default api;
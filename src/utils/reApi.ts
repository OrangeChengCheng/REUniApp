/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2024-11-08 14:27:25
 */


interface ApiMethods {
    unipluginLog(log: string): void;
    realEngineRender(data: any): Promise<any>;
    getREModule(): any;
    reAppToUniMessageHandler(onMessage: (message: any) => void): Promise<void>; // 添加一个回调参数来处理每条消息
    reUniPostData(data: any): void;
}

const api: ApiMethods = {
    // MARK re-api 获取插件对象
    getREModule: (): any => {
        if (Object.prototype.hasOwnProperty.call(uni, 'requireNativePlugin')) {
            // const reModule = uni.requireNativePlugin('REUniPlugin-REModule');
            return uni.requireNativePlugin('REUniPlugin-REModule');
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
    realEngineRender: (data: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            api.unipluginLog('render: ' + JSON.stringify(data));
            api.getREModule()?.realEngineRender(data, (ret: any) => {
                resolve(ret);
            });
        });
    },

    // MARK re-api 原生&uni-app通信
    reAppToUniMessageHandler: async (onMessage: (message: any) => void): Promise<void> => {
        let shouldContinue = true; // 停止条件的变量

        // 定义一个递归的async函数来处理回调和继续监听
        const listenForMessages = async (): Promise<void> => {
            if (!shouldContinue) {
                return; // 停止条件满足，退出递归
            }

            const reModule = api.getREModule();
            if (reModule && reModule.reAppToUniMessageHandler) {
                // 调用插件的reMessageHandler方法并等待回调
                await new Promise<void>((resolve) => {
                    reModule.reAppToUniMessageHandler((ret: any) => {
                        // 处理回调返回的数据（如果需要的话）
                        onMessage(ret);
                        // 递归调用listenForMessages来继续监听
                        resolve();
                    });
                });

                // 如果仍然需要继续监听，再次调用listenForMessages
                if (shouldContinue) {
                    await listenForMessages();
                }
            } else {
                // 插件未加载或reMessageHandler方法不存在，退出递归
                shouldContinue = false;
            }
        };

        // 开始递归监听消息
        await listenForMessages();
    },

    // MARK re-api 向app发送数据
    reUniPostData: (data: any) => {
        api.getREModule()?.reUniPostData(data);
    },

}

export default api;
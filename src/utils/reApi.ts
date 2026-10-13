/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2026-10-13 16:15:44
 */

import { useStateStore } from '@/stores/state';
import { useCardStore } from '@/stores/card';
import { useMessageStore } from '@/stores/message';
import { newCard, type Card } from '@/types/class';

interface ApiMethods {
    unipluginLog(log: string): void;
    realEngineRender(data: any): Promise<any>;
    getREModule(): any;
    registerAppMsg(onCallBack: (data: any) => void): Promise<void>; // 添加一个回调参数来处理每条消息
    sendMsgUniToApp(data: any): void;
    showShareRes(urlInfo: any, isClick: boolean, onUpdate: () => void): void;//查看分享资源
    showSceneRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
    showModelRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
    showModelTypeRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
    showCadTypeRes(urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void>;
    entitySel(selInfo: any, sceneInfo: any, treeList: any): void;
}

const api: ApiMethods = {
    // MARK re-api 获取插件对象
    getREModule: (): any => {
        if (Object.prototype.hasOwnProperty.call(uni, 'requireNativePlugin')) {
            return uni.requireNativePlugin('REUniPlugin-REModule');
        } else {
            return null;
        }
    },

    // MARK re-api 插件打印信息
    unipluginLog: (log: string) => {
        api.getREModule()?.unipluginLog({ msg: log });
    },

    // MARK re-api 加载模型
    /**
     * 触发引擎渲染（uni -> app）
     *
     * 数据处理策略：
     * - 小数据（byteSize < THRESHOLD）：直接通过原生插件一次传过去，走 Intent extra
     * - 大数据：采用"分片传输 + ACK 逐片确认"的方式，避免单次 IPC 传输过大导致 WebView
     *   渲染进程拥塞（Chromium 的 IPCFutexPageQueue 报错），同时也绕过 Intent 1MB 限制
     *
     * 分片传输协议（本函数与原生 REModule 配合）：
     *   JS 侧                      原生侧
     *   -------                    --------
     *   发 CHUNK_START       ->    创建 ChunkBuffer
     *                       <-    回 ACK(index=-1)
     *   发 CHUNK_DATA[0]    ->    写入 chunkList[0]
     *                       <-    回 ACK(index=0)
     *   ...
     *   发 CHUNK_DATA[N-1]  ->    写入 chunkList[N-1]
     *                       <-    回 ACK(index=N-1)
     *   发 CHUNK_END        ->    校验完整性，isComplete=true
     *                       <-    回 ACK(index=totalChunk)
     *   调 realEngineRender({msgId})  ->  启动 REEngineActivity，从 chunkMap 取数据
     *
     * @param data  业务侧构造的引擎渲染数据对象
     * @returns     Promise，resolve 时机为 REEngineActivity 成功启动后（原生回调）
     */
    realEngineRender: (data: any): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            try {
                // ============ 前置检查：原生插件是否存在 ============
                // 关键：浏览器/无原生环境必须静默跳过，不能 reject
                const reModule = api.getREModule();
                if (!reModule) {
                    // 不 resolve 也不 reject，Promise 保持 pending
                    // 这样调用方 .then() 不会触发，也不会抛未捕获异常
                    return;
                }

                // 1. 序列化 + 计算字节数（Blob 在 App 端不存在，用自定义 utf8ByteLength）
                const fullJson = JSON.stringify(data);
                const byteSize = uni.$tool.utf8ByteLength(fullJson);

                // 分片阈值：小于此值走单次发送，避免分片开销
                const THRESHOLD = 200 * 1024; // 200KB

                api.unipluginLog(`realEngineRender 入口 byteSize=${uni.$tool.formatByte(byteSize)}`);

                // ============ 分支 A：小数据，直接单次传输 ============
                if (byteSize < THRESHOLD) {
                    api.getREModule()?.realEngineRender(data, (ret: any) => {
                        resolve(ret);
                    });
                    return;
                }

                // ============ 分支 B：大数据，走分片传输 ============

                // 为本次分片生成唯一 msgId，原生侧用它关联 ChunkBuffer
                const msgId = uni.$tool.generateUUID();

                // 分片大小：200KB/片
                // - 太小 -> 片数多，ACK 往返次数多，总耗时长
                // - 太大 -> 单次 IPC 压力大，容易触发 Chromium 拥塞
                const chunkMaxBytes = 200 * 1024;
                const chunks = uni.$tool.splitStringByByteLength(fullJson, chunkMaxBytes);
                const totalChunk = chunks.length;

                api.unipluginLog(
                    `分片准备完成 msgId:${msgId}, totalChunk:${totalChunk}, byteSize:${uni.$tool.formatByte(byteSize)}`
                );

                // ============ 发送状态机 ============
                //
                // 索引设计（sendIndex 从 0 开始自增）：
                //   0                -> 发 CHUNK_START
                //   1 ~ totalChunk   -> 发 CHUNK_DATA[0..totalChunk-1]
                //   totalChunk + 1   -> 发 CHUNK_END
                //   totalChunk + 2   -> 调用 realEngineRender({msgId})
                //
                // 每收到一片 ACK，sendIndex 自增，用 setTimeout 延迟发送下一片，
                // 给 WebView 渲染进程一点时间处理 IPC 队列，降低拥塞风险。
                let sendIndex = 0;

                // 复用 message store 做 ACK 消息分发（registerAppMsg 会把原生消息投递进来）
                const message_store = useMessageStore();

                /**
                 * 清理 ACK 监听，防止：
                 * - 分片结束后 handler 残留，造成内存泄漏
                 * - 后续其他分片任务的 ACK 被本任务的 handler 误处理
                 */
                function cleanup() {
                    message_store.removeMessageHandler(message_store.M_AppToUni_Subpackage, ackHandler);
                }

                /**
                 * ACK 处理：每收到一片的确认，才发下一片
                 * 通过 payload.msgId 过滤，只处理本次分片任务的 ACK
                 */
                function ackHandler(payload: any) {
                    if (!payload || payload.type !== "CHUNK_ACK" || payload.msgId !== msgId) return;
                    api.unipluginLog(
                        `收到分片ACK msgId:${msgId}, ackIndex:${payload.index}, sendIndex:${sendIndex}`
                    );
                    sendIndex++;
                    // 延迟发送下一片，让出主线程给渲染进程处理 IPC
                    setTimeout(sendNextChunk, 30);
                }

                /**
                 * 状态机驱动：根据 sendIndex 决定当前应该发什么
                 * 每次调用只发一条消息，等下一条 ACK 回来后再进下一次
                 */
                function sendNextChunk() {
                    const reModule = api.getREModule();
                    if (!reModule) {
                        // 原生插件未加载，直接失败
                        cleanup();
                        reject(new Error('getREModule is null'));
                        return;
                    }

                    if (sendIndex === 0) {
                        // ---- 阶段 1：发送分片开始标志 ----
                        // 告知原生侧准备接收分片，携带片数和总字节数（用于校验）
                        api.unipluginLog(`发送CHUNK_START msgId:${msgId}`);
                        reModule.sendMsgUniToApp({
                            flag: "CHUNK_START",
                            msgId,
                            totalChunk,
                            totalLen: byteSize
                        });

                    } else if (sendIndex >= 1 && sendIndex <= totalChunk) {
                        // ---- 阶段 2：发送分片数据 ----
                        // sendIndex 从 1 开始，对应 chunks 数组下标 0
                        const chunkArrIndex = sendIndex - 1;
                        api.unipluginLog(
                            `发送CHUNK_DATA msgId:${msgId}, index:${chunkArrIndex}/${totalChunk - 1}`
                        );
                        reModule.sendMsgUniToApp({
                            flag: "CHUNK_DATA",
                            msgId,
                            chunkIndex: chunkArrIndex,
                            chunkData: chunks[chunkArrIndex]
                        });

                    } else if (sendIndex === totalChunk + 1) {
                        // ---- 阶段 3：发送分片结束标志 ----
                        // 原生侧收到后会校验 chunkList.size == totalChunk，然后标记 isComplete
                        api.unipluginLog(`发送CHUNK_END msgId:${msgId}`);
                        reModule.sendMsgUniToApp({
                            flag: "CHUNK_END",
                            msgId
                        });

                    } else if (sendIndex === totalChunk + 2) {
                        // ---- 阶段 4：通知原生启动 Activity ----
                        // 只传 msgId，原生侧从 chunkMap 取数据组装，避免 Intent 传大数据
                        api.unipluginLog(`分片全部接收完成，调用realEngineRender msgId:${msgId}`);
                        cleanup(); // 清理 ACK 监听，后续不再需要
                        reModule.realEngineRender({ msgId }, (ret: any) => {
                            resolve(ret);
                        });

                    } else {
                        // ---- 异常：状态机越界 ----
                        // 理论上不会发生，兜底防止 Promise 永不 resolve
                        api.unipluginLog(`sendIndex 异常: ${sendIndex}`);
                        cleanup();
                        reject(new Error('sendIndex error: ' + sendIndex));
                    }
                }

                // 关键：ACK 监听必须在启动发送之前注册
                // 否则可能出现：CHUNK_START 刚发出去 ACK 就回来了，但 handler 还没注册 -> ACK 丢失 -> 流程卡死
                message_store.addMessageHandler(message_store.M_AppToUni_Subpackage, ackHandler);

                // 启动状态机
                sendNextChunk();

            } catch (e: any) {
                // 兜底捕获：任何 JS 异常都必须 reject，否则 Promise 永久 pending
                api.unipluginLog('realEngineRender JS异常: ' + (e && e.message ? e.message : String(e)));
                reject(e);
            }
        });
    },



    // MARK re-api 原生&uni-app通信
    /**
     * 注册【app -> uni】消息监听（uni 侧调用一次，全局生效）
     *
     * 原生侧通过 REModule.sendMsgAppToUni() 发出的所有消息，都会通过这个回调进入 JS 层。
     *
     * 本函数做两件事：
     * 1. 把消息分发到 message_store，让业务侧通过消息名注册的 handler 能收到（解耦）
     * 2. 调用 onCallBack 给调用方，保留"注册时传入回调"这种传统用法
     *
     * 为什么要分发到 message_store：
     *   分片 ACK 的 handler 是在 realEngineRender 内部注册的（见 useMessageStore 的用法），
     *   如果不做分发，分片 ACK 无法路由到 realEngineRender 里的 ackHandler，分片流程会卡死。
     *
     * @param onCallBack 消息回调，每条 app -> uni 消息都会调用一次。
     *                   注意：这不是 Promise 的 resolve，函数会一直存活接收消息。
     */
    registerAppMsg: async (onCallBack: (data: any) => void): Promise<void> => {
        const reModule = api.getREModule();

        // 防御：插件未加载或未暴露 registerAppMsg 方法时直接降级
        if (reModule && reModule.registerAppMsg) {
            reModule.registerAppMsg((res: any) => {
                // 关键：把消息分发到 message_store，触发按消息名注册的所有 handler
                //
                // 为什么必须做这一步：
                //   realEngineRender 内部通过
                //     message_store.addMessageHandler(M_AppToUni_Subpackage, ackHandler)
                //   注册了 ACK 处理器。如果不在这里 sendMessage，ackHandler 永远不会被调用，
                //   分片发送就会卡在等 ACK 上，Promise 永远 pending。
                const messageStore = useMessageStore();
                messageStore.sendMessage(messageStore.M_AppToUni_Subpackage, res);

                // 兼容旧用法：注册时传入的回调也会被调用
                // 业务侧如果直接用 onCallBack 做分发（而不是通过 message_store），也能正常工作
                onCallBack(res);
            });
        } else {
            // 插件缺失属于严重异常：意味着 uni 侧收不到任何 app 消息
            // 一般是原生插件未正确集成/未打包进 APK
            api.unipluginLog('registerAppMsg: 消息监听机制加载失败');
        }
    },

    // MARK re-api 向app发送数据
    sendMsgUniToApp: (data: any) => {
        api.getREModule()?.sendMsgUniToApp(data);
    },

    // MARK re-api 查看分享链接资源
    showShareRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void) => {
        const state_store = useStateStore();
        try {
            // 获取分享信息
            state_store.updateCurSource(urlInfo.shareItem?.source);

            if (urlInfo.shareType === 2) {
                await api.showSceneRes(urlInfo, isClick, onUpdate);
            } else {
                await api.showModelRes(urlInfo, isClick, onUpdate);
            }
        } catch (error) {
            uni.hide_loading();
            throw error;
        }
    },
    // MARK re-api 查看分享链接资源 -- 场景资源
    showSceneRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        const card_store = useCardStore();
        card_store.sceneInfo = null;
        card_store.treeList = null;
        const state_store = useStateStore();
        // uni.show_loading();
        try {
            const { shareData, sceneInfo, treeList } = await uni.$dataTool.card_getSceneData(urlInfo);
            card_store.sceneInfo = sceneInfo;
            card_store.treeList = treeList;
            const cardData: Card = card_store.handleCardData(urlInfo, shareData, !isClick);
            let projName = cardData.projName;

            // 新添加的分享数据更新到缓存列表
            // 这个方法肯定会被调用，只不过一个是空函数，一个是有操作的函数
            if (onUpdate) {
                onUpdate();
            }

            uni.hide_loading();

            const engineData = {
                name: 'uni-app',
                noExternalNetwork: state_store.noExternalNetwork,
                token: shareData.token,
                baseUrl: shareData.baseUrl,
                source: shareData.source,
                shareUrl: shareData.url,
                projName: projName,
                worldCRS: shareData.worldCRS,
                urlHeaderList: shareData.urlHeaderList,
                authorData: shareData.authorData,
                dataSetList: shareData.dataSetList,
                shareType: shareData.shareType,
                sceneId: shareData.id,
                camDefaultDataSetId: shareData.camDefaultDataSetId,
                shareViewMode: shareData.shareViewMode,
                defaultCamLoc: shareData.defaultCamLoc,
                entityList: shareData.entityList,
                waterList: shareData.waterList,
                extrudeList: shareData.extrudeList,
                extrudeTexList: shareData.extrudeTexList,
                monomerList: shareData.monomerList,
                projectionList: shareData.projectionList,
            };


            console.log('引擎信息: ', JSON.stringify(engineData));
            uni.$re.realEngineRender(engineData).then((result) => {
                console.log(result);
                uni.$re.unipluginLog(JSON.stringify(result));
            });
        } catch (error: any) {
            uni.hide_loading();
            uni.showToast({ title: error.message || '获取数据失败', icon: 'none' });
            throw error; // 向上抛出错误
        }
    },

    // MARK re-api 查看分享链接资源 -- 模型资源
    showModelRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        switch (urlInfo.shareDataType) {
            case 'bim': // 短链接请求获取
            case 'Bim': // 长连接获取
            case 'Rs':
            case 'Wmts':
            case 'Osgb':
            case 'PointCloud':
                await api.showModelTypeRes(urlInfo, isClick, onUpdate);
                break;
            case 'CAD': // 短链接请求获取
            case 'Cad': // 长连接获取
                await api.showCadTypeRes(urlInfo, isClick, onUpdate);
                break;
            default:
                uni.hide_loading();
                // 使用延时解决弹窗关闭后的提示显示异常的问题，因为弹窗关闭有200的延迟
                setTimeout(() => {
                    uni.showToast({ title: '暂不支持该数据类型', icon: 'none' });
                }, 210);
                break;
        }
    },

    // MARK re-api 查看模型类型数据
    showModelTypeRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        const card_store = useCardStore();
        const state_store = useStateStore();
        // uni.show_loading();
        try {
            const shareData = await uni.$dataTool.card_getBimData(urlInfo);
            const cardData: Card = card_store.handleCardData(urlInfo, shareData, !isClick);
            let projName = cardData.projName;

            // 新添加的分享数据更新到缓存列表
            // 这个方法肯定会被调用，只不过一个是空函数，一个是有操作的函数
            if (onUpdate) {
                onUpdate();
            }

            uni.hide_loading();

            const engineData = {
                name: 'uni-app',
                noExternalNetwork: state_store.noExternalNetwork,
                token: shareData.token,
                baseUrl: shareData.baseUrl,
                source: shareData.source,
                shareUrl: shareData.url,
                projName: projName,
                sceneId: shareData.id,
                urlHeaderList: shareData.urlHeaderList,
                authorData: shareData.authorData,
                dataSetList: shareData.dataSetList,
                shareType: shareData.shareType,
                shareDataType: shareData.shareDataType,
                defaultCamLoc: shareData.defaultCamLoc,
            };
            console.log('引擎信息: ', JSON.stringify(engineData));
            uni.$re.realEngineRender(engineData).then((result) => {
                uni.$re.unipluginLog(JSON.stringify(result));
            });
        } catch (error: any) {
            uni.hide_loading();
            uni.showToast({ title: error.message || '获取数据失败', icon: 'none' });
            throw error;
        }
    },

    // MARK re-api 查看CAD类型数据
    showCadTypeRes: async (urlInfo: any, isClick: boolean, onUpdate: () => void): Promise<void> => {
        const card_store = useCardStore();
        const state_store = useStateStore();
        // uni.show_loading();
        try {
            const shareData = await uni.$dataTool.card_getCadData(urlInfo);
            const cardData: Card = card_store.handleCardData(urlInfo, shareData, !isClick);
            let projName = cardData.projName;

            // 新添加的分享数据更新到缓存列表
            // 这个方法肯定会被调用，只不过一个是空函数，一个是有操作的函数
            if (onUpdate) {
                onUpdate();
            }

            uni.hide_loading();

            const engineData = {
                name: 'uni-app',
                noExternalNetwork: state_store.noExternalNetwork,
                token: shareData.token,
                baseUrl: shareData.baseUrl,
                source: shareData.source,
                shareUrl: shareData.url,
                projName: projName,
                sceneId: shareData.id,
                urlHeaderList: shareData.urlHeaderList,
                authorData: shareData.authorData,
                dataSetList: shareData.dataSetList,
                shareType: shareData.shareType,
                shareDataType: shareData.shareDataType,
            };
            console.log('引擎信息: ', JSON.stringify(engineData));
            uni.$re.realEngineRender(engineData).then((result) => {
                uni.$re.unipluginLog(JSON.stringify(result));
            });
        } catch (error: any) {
            uni.hide_loading();
            uni.showToast({ title: error.message || '获取数据失败', icon: 'none' });
            throw error;
        }
    },

    // MARK re-api 单构件批量选择
    entitySel: (selInfo: any, sceneInfo: any, treeList: any) => {
        if (!selInfo || !sceneInfo || !treeList) return;
        if (selInfo.dataSetId != sceneInfo.componentTreeId) return;
        
        const entitySetNodes = uni.$entityTool.getEntitySetNodes(treeList);
        const entitySetNodeIds = entitySetNodes.map((el: any) => el.nodeId);
        const entityNodes = uni.$entityTool.getEntityNodes(treeList);
        
        const entityNode = entityNodes.find((el: any) => el.elemId === selInfo.elemId);
        if (entitySetNodeIds.includes(entityNode.parentId)) {
            const entitySet = entitySetNodes.find((el: any) => el.nodeId === entityNode.parentId);
            const elemIdList = entitySet.subEntities.map((el: any) => el.elemId);
            api.sendMsgUniToApp({ type: "addToSelElems", data: { dataSetId: sceneInfo.componentTreeId, elemIdList: elemIdList } });
        }
    },

}

export default api;
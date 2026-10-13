/*
 * @Author: Lemon C
 * @Date: 2024-11-09 12:30:58
 * @LastEditTime: 2026-10-13 11:15:08
 */
import { defineStore } from 'pinia';

interface MessageHandler {
    handlers: Array<(payload: any) => void>;
}

interface MessageState {
    messageObj: {
        [key: string]: MessageHandler | undefined;
    };
    M_AppToUni: string,
    M_AppToUni_Subpackage: string,
    M_AppToUni_Listen_SystemSel: string,
}

export const useMessageStore = defineStore('message', {
    state: (): MessageState => ({
        messageObj: {},
        M_AppToUni: 'msg_appToUni',//app发送消息到uni
        M_AppToUni_Subpackage: 'msg_appToUni_ubpackage',//app发送消息到uni 数据分包消息
        M_AppToUni_Listen_SystemSel: 'msg_appToUni_listen_systemSel',//app发送消息到uni 点击回调
    }),
    actions: {
        // MARK 发送消息
        sendMessage(messageName: string, payload: any) {
            const messageHandler = this.messageObj[messageName];
            if (!messageName || !messageHandler || !messageHandler.handlers) {
                return;
            }
            messageHandler.handlers.forEach((handler) => handler(payload));
        },

        // MARK 注册消息
        addMessageHandler(messageName: string, handler: any) {
            if (!messageName || !this.messageObj) return;
            if (!this.messageObj[messageName]) {
                this.messageObj[messageName] = {
                    handlers: [],
                };
            }
            this.messageObj[messageName].handlers.push(handler);
        },

        // MARK 移除消息
        removeMessageHandler(messageName: string, handler: any): boolean {
            // 消息不存在直接返回 false
            if (!messageName || !this.messageObj || !this.messageObj[messageName]) return false;
            const target = this.messageObj[messageName]!;
            // 过滤掉当前 handler
            target.handlers = target.handlers.filter((h) => h !== handler);
            // 数组为空，删除消息key
            if (target.handlers.length === 0) {
                delete this.messageObj[messageName];
            }
            return true;
        }

    }
});
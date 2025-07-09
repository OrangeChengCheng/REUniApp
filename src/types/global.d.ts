/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2025-07-09 11:16:16
 */


import type { Uni as _Uni } from '@dcloudio/types'

declare global {
    /**
     * 拓展全局变量Uni
    */
    interface Uni extends _Uni {
        $u: {
            toast(title: string): void;
        }
        $re: {
            unipluginLog(log: string): void;
            realEngineRender(data: any): Promise<any>;
            registerAppMsg(onCallBack: (data: any) => void): Promise<void>;
            sendMsgUniToApp(data: any): void;
        }
        $window: {
            serverUrl: string,
            downloadUrl: string,
            commonTimeout: number,
        };
        $tool: {
            url_handle(utl: string): any;
            time_compare(frontTime: Date, backTime: Date): string;
            cam_defauleDataSet(dataSetList: any): string;
        };
        scan_code(): Promise<any>;
        show_loading(): void;
        hide_loading(): void;
        update_serverUrl(url: string): void;
        get_serverUrl(): string;
    }
}




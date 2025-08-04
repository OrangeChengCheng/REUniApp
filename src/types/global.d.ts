/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2025-08-04 16:52:14
 */


import type { Uni as _Uni } from '@dcloudio/types'

declare global {
    /**
     * 拓展全局变量Uni
    */
    interface Uni extends _Uni {
        $re: {
            unipluginLog(log: string): void;
            realEngineRender(data: any): Promise<any>;
            registerAppMsg(onCallBack: (data: any) => void): Promise<void>;
            sendMsgUniToApp(data: any): void;
        }
        $server: {
            commonTimeout: number,
            getCurDownloadUrl(): string;
            getCurBaseUrl(): string;
            updateCurBaseUrl(url: string): void;
            getCurSource(): number;
            getCurSourcePath(): string;
            updateCurSource(source: number): void;
            getCurToken(): string;
            updateCurToken(token: string): void;
            getServerWhiteList(): any;
            updateServerWhiteList(list: any): void;
        };
        $tool: {
            update_data(): void;
            del_data(): void;
            getAppVersion(): string;
            initializeData(): void;
            url_handle(utl: string): any;
            time_compare(frontTime: Date, backTime: Date): string;
            cam_defauleDataSet(dataSetList: any): string;
        };
        scan_code(): Promise<any>;
        show_loading(): void;
        hide_loading(): void;
    }
}




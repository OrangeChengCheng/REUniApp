/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2025-12-01 16:44:38
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
        $service: {
            commonTimeout: number,
            getServerWhiteList(): any;
            updateServerWhiteList(list: any): void;
            getSharedUrlInfo(params: any): Promise<any>;
        };
        $tool: {
            update_data(): void;
            del_data(): void;
            getAppVersion(): string;
            initializeData(): void;
            url_base(url: string): string;
            url_handle(url: string): Promise<any>;
            time_To_Date(timeStr: string): Date;
            time_compare(frontTime: Date, backTime: Date): string;
            time_format(utcTime: Date): string;
            cam_defauleDataSet(dataSetList: any): string;
        };
        $rsa: {
            initRsaPublicKey(xmlPublicKey: string): void;
            rsaEncrypt(data: string): string;
        };
        scan_code(): Promise<any>;
        show_loading(): void;
        hide_loading(): void;
    }
}




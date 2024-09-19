/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2024-09-18 14:59:17
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
            realEngineRender(data: object): Promise<any>;
        }
        $window: {
            serverBaseUrl: string;
            serverUrl: string,
            imageBaseUrl: string,
            exampleUrl: string,
            downloadBaseUrl: string,
            commonTimeout: number,
        };
    }
}




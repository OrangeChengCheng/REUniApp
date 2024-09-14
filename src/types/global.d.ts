/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2024-09-14 14:29:14
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
        }
        $window: Object;
    }
}




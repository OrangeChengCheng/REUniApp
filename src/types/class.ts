/*
 * @Author: Lemon C
 * @Date: 2024-09-23 16:54:42
 * @LastEditTime: 2024-09-27 10:33:59
 */


export interface Share {
    url: string;
    projName: string;
    id: string;
    lastTime: Date;
    dataSetList: any;
    worldCRS: string;
    collect: boolean;
    shareType: number; // 0：无 1：模型 2：场景
    camDefaultDataSetId: string;
}

export const newShare = (overrides?: Partial<Share>): Share => {
    return {
        url: "",
        projName: "",
        id: "",
        lastTime: new Date(),
        dataSetList: [],
        worldCRS: "",
        collect: false,
        shareType: 0,
        camDefaultDataSetId: "",
        ...overrides
    };
};



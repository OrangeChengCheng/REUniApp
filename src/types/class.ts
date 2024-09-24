/*
 * @Author: Lemon C
 * @Date: 2024-09-23 16:54:42
 * @LastEditTime: 2024-09-24 11:12:27
 */


export interface Share {
    url: string;
    projName: string;
    id: string;
    lastTime: Date;
    dataSetList: any;
    worldCRS: string;
    collect: boolean;
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
        ...overrides
    };
};



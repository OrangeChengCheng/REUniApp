/*
 * @Author: Lemon C
 * @Date: 2024-09-23 16:54:42
 * @LastEditTime: 2024-09-23 18:26:20
 */


export interface Share {
    url: string;
    projName: string;
    id: string;
    lastTime: Date;
    dataSetList: object;
    worldCRS: string;
}

export const newShare = (overrides?: Partial<Share>): Share => {
    return {
        url: "",
        projName: "",
        id: "",
        lastTime: new Date(),
        dataSetList: {},
        worldCRS: "",
        ...overrides
    };
};
/*
 * @Author: Lemon C
 * @Date: 2024-09-23 16:54:42
 * @LastEditTime: 2025-08-04 14:21:46
 */


export interface Share {
    appVersion: string;
    url: string;
    token: string;
    baseUrl: string;
    source: number;//判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
    projName: string;
    id: string;
    lastTime: Date;
    endTime: Date;
    shareFormUserExpirationTime: Date;
    dataSetList: any;
    worldCRS: string;
    collect: boolean;
    shareType: number; // 0：无 1：模型 2：场景
    camDefaultDataSetId: string;
    shareViewMode: string; // 场景显示类型：Sphere：球面  Plane: 平面
    shareDataType: string; // 数据集类型： Bim：模型 Rs：遥感影像 Wmts：wmts地图 osgb：倾斜摄影 Panorama：全景 PointCloud：点云 Cad：二维图纸 Vector：单构件
    defaultCamLoc: any; // 默认相机信息 
    entityList: any; // 单构件列表 
    waterList: any; // 水面列表 
    extrudeList: any; // 挤出列表 
    extrudeTexList: any; // 挤出纹理列表 
}

export const newShare = (overrides?: Partial<Share>): Share => {
    return {
        appVersion: "",
        url: "",
        token: "",
        baseUrl: "",
        projName: "",
        source: 0,
        id: "",
        lastTime: new Date(),
        endTime: new Date(),
        shareFormUserExpirationTime: new Date(),
        dataSetList: [],
        worldCRS: "",
        collect: false,
        shareType: 0,
        camDefaultDataSetId: "",
        shareViewMode: "",
        shareDataType: "",
        defaultCamLoc: {},
        entityList: [],
        waterList: [],
        extrudeList: [],
        extrudeTexList: [],
        ...overrides
    };
};




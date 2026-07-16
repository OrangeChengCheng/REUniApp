/*
 * @Author: Lemon C
 * @Date: 2024-09-23 16:54:42
 * @LastEditTime: 2026-07-13 11:21:44
 */


export interface Card {
    shareUrl: string,
    shareId: string,
    source: number;//判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
    projName: string;
    lastTime: Date;
    endTime: string;
    shareFormUserExpirationTime: string;
    collect: boolean;
}

export const newCard = (overrides?: Partial<Card>): Card => {
    return {
        shareUrl: "",
        shareId: "",
        projName: "",
        source: 0,
        lastTime: new Date(),
        endTime: "",
        shareFormUserExpirationTime: "",
        collect: false,
        ...overrides
    };
};

export interface Share {
    url: string;
    shareId: string,
    token: string;
    baseUrl: string;
    source: number;//判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
    projName: string;
    id: string;
    lastTime: Date;
    endTime: string;
    shareFormUserExpirationTime: string;
    dataSetList: any;
    urlHeaderList: any;//请求头列表
    authorData: any,//授权信息
    worldCRS: string;
    shareType: number; // 0：无 1：模型 2：场景
    camDefaultDataSetId: string;
    shareViewMode: string; // 场景显示类型：Sphere：球面  Plane: 平面
    shareDataType: string; // 数据集类型： bim/Bim：模型 bimGroup：模型组 Rs：遥感影像 Wmts：wmts地图 Osgb：倾斜摄影 Panorama：全景 PointCloud：点云 CAD/Cad：二维图纸 Vector：单构件
    defaultCamLoc: any; // 默认相机信息 
    entityList: any; // 单构件列表 
    waterList: any; // 水面列表 
    extrudeList: any; // 挤出列表 
    extrudeTexList: any; // 挤出纹理列表 
    monomerList: any; // 单体化列表 
    projectionList: any; // 视频投射列表 
}

export const newShare = (overrides?: Partial<Share>): Share => {
    return {
        url: "",
        shareId: "",
        token: "",
        baseUrl: "",
        projName: "",
        source: 0,
        id: "",
        lastTime: new Date(),
        endTime: "",
        shareFormUserExpirationTime: "",
        urlHeaderList: [],
        authorData: {},
        dataSetList: [],
        worldCRS: "",
        shareType: 0,
        camDefaultDataSetId: "",
        shareViewMode: "",
        shareDataType: "",
        defaultCamLoc: {},
        entityList: [],
        waterList: [],
        extrudeList: [],
        extrudeTexList: [],
        monomerList: [],
        projectionList: [],
        ...overrides
    };
};




/*
 * @Author: Lemon C
 * @Date: 2024-11-09 10:46:29
 * @LastEditTime: 2025-07-10 11:27:14
 */
import { defineStore } from 'pinia'
import { getSharedExtrudeTexturesList } from '@/service/interface'

/**
    0 BIM模型
    13 遥感影像
    10 WMTS地图服务
    11 倾斜摄影
    14 360全景图
    15 点云
    16 二维图纸
    17 公共构件
    18 我的构件
    19 发布后的构件(场景发布)
    20 矢量
    21 场景CAD
    22 场景矢量
    23 水面
*/

interface StateMold {
    allDataSetType: Array<Number>,
    entityDataSetType: Array<Number>,
    sceneDataSetType: Array<Number>,
    appSupportDataSetType: Array<Number>,
    appSupportEntityType: Number,
    appSupportWaterType: Number,
    appSupportExtrudeType: Number,
    launchOnce: Boolean,
    agreePolicy: Boolean,
    extrudeTexList: Array<any>,
}


export const useStateStore = defineStore('state', {
    state: (): StateMold => ({
        allDataSetType: [0, 13, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22],
        entityDataSetType: [17, 18, 19],
        sceneDataSetType: [0, 13, 10, 11, 14, 15, 17, 18, 19, 21, 22],
        appSupportDataSetType: [0, 13, 10, 11, 14, 15, 16, 20, 21, 22],
        appSupportEntityType: 19,
        appSupportWaterType: 23,
        appSupportExtrudeType: 24,
        launchOnce: JSON.parse(uni.getStorageSync('RE_launchOnce') || "false") || false, // 首次启动标记，避免多次创建store
        agreePolicy: JSON.parse(uni.getStorageSync('RE_agreePolicy') || "false") || false,
        extrudeTexList: JSON.parse(uni.getStorageSync('RE_ExtrudeTexList') || '[]') || [],//全局开挖纹理信息
    }),
    actions: {
        appLaunchOnceUpdate() {
            this.launchOnce = true;
            uni.setStorageSync('RE_launchOnce', JSON.stringify(true));
        },

        agreePolicyUpdate(agree: boolean) {
            this.agreePolicy = agree;
            uni.setStorageSync('RE_agreePolicy', JSON.stringify(agree));
        },
        clearAgree() {
            this.agreePolicy = false;
            uni.setStorageSync('RE_agreePolicy', JSON.stringify(false));
        },

        updateExtrudeTexList() {
            if (this.extrudeTexList.length > 0) {
                return;
            }
            getSharedExtrudeTexturesList()
                .then((res) => {
                    const intrinsicTextures = res?.data.intrinsicTextures;
                    let textureList: any[] = [];
                    if (intrinsicTextures && intrinsicTextures.length) {
                        textureList = intrinsicTextures.map((item: any) => {
                            const tokenId = uni.$server.getCurToken();
                            const picPath = `${uni.$server.getCurDownloadUrl()}/${item.fileDataId}?token=${tokenId}`;
                            const size = [5.0, 5.0];
                            return {
                                picPath: picPath,
                                picSize: size,
                                textureGuid: item.TextureImageId,
                            };
                        });
                    }
                    this.extrudeTexList = [];
                    uni.setStorageSync('RE_ExtrudeTexList', JSON.stringify(this.extrudeTexList));
                    const extrudeTexList_jsonp = JSON.parse(JSON.stringify(textureList));
                    this.extrudeTexList = extrudeTexList_jsonp;
                    uni.setStorageSync('RE_ExtrudeTexList', JSON.stringify(this.extrudeTexList));
                })
                .catch((err) => {
                    this.extrudeTexList = [];
                    uni.setStorageSync('RE_ExtrudeTexList', JSON.stringify(this.extrudeTexList));
                });
        },
    }
});
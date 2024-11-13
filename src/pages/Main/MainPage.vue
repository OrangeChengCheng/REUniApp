<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-11-13 10:13:26
-->
<template>
    <base-view :nav_bar="false" :nav_bar_color="`--color-main-bg`">
        <view class="sup-main-page">
            <scroll-view
                class="contain-scroll-view"
                scroll-y
                :show-scrollbar="false"
                :scroll-top="sw_contain_scrollTop"
                @scroll="listen_contain_scroll">
                <banner-comp
                    :style="`height: ${TopBar_fixedSpace}px`"
                    :banner_re_callback="banner_re_callback"
                    :banner_re_longpress_callback="banner_re_longpress_callback"></banner-comp>
                <view class="content">
                    <top-bar
                        :topbar_type="0"
                        :topbar_tab_index="tb_tab_index"
                        :topbar_houerArea_callback="topbar_houerArea_callback"
                        :topbar_scan_callback="topbar_scan_callback"
                        :topbar_search_callback="topbar_search_callback"
                        :topbar_tab_callback="topbar_tab_callback"></top-bar>
                    <top-bar
                        v-if="tb_isFixed"
                        :topbar_type="1"
                        :topbar_isFixed="tb_isFixed"
                        :topbar_tab_index="tb_tab_index"
                        :topbar_houerArea_callback="topbar_houerArea_callback"
                        :topbar_scan_callback="topbar_scan_callback"
                        :topbar_search_callback="topbar_search_callback"
                        :topbar_tab_callback="topbar_tab_callback"></top-bar>
                    <view class="grid-container" :style="style_grid_computed" v-if="list_show.length > 0">
                        <view class="grid-item" v-for="(item, index) in list_show" :key="index">
                            <card
                                :card_type="tb_tab_index"
                                :card_min="grid_isMin"
                                :card_proj="item"
                                :card_callback="card_callback"
                                :card_title_longpress_callback="card_title_longpress_callback"
                                :card_img_longpress_callback="card_img_longpress_callback"
                                :card_collect_callback="card_collect_callback"></card>
                        </view>
                    </view>
                    <view class="empty-area" v-else>
                        <image class="empty-image" src="../../static/Empty/empty_bg.png" mode="scaleToFill" />
                        <text class="empty-text">这里空空如也</text>
                    </view>
                </view>
            </scroll-view>
        </view>
    </base-view>
    <url-input-dialog
        ref="ref_urlInput_dialog"
        :dialog_projName="dialog_projName"
        :dialog_shareUrl="dialog_shareUrl"
        :dialog_revise="dialog_revise"
        :dialog_shareUrl_disabled="dialog_shareUrl_disabled"
        :dialog_UrlInputCallBack="dialog_UrlInputCallBack"></url-input-dialog>
    <custom-input-dialog ref="ref_customInput_dialog" :dialog_CustomInputCallBack="showResourceAddressRes"></custom-input-dialog>
    <sample-input-dialog ref="ref_sampleInput_dialog" :dialog_SampleInputCallBack="dialog_SampleInputCallBack"></sample-input-dialog>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import BannerComp from '@/components/Banner/BannerComp.vue';
import TopBar from '@/components/TopBar/TopBar.vue';
import Card from '@/components/Card/Card.vue';
import UrlInputDialog from '@/components/Dialog/UrlInputDialog.vue';
import CustomInputDialog from '@/components/Dialog/CustomInputDialog.vue';
import SampleInputDialog from '@/components/Dialog/SampleInputDialog.vue';
import { getSceneById, getSingleSceneTreeById, getProjectModel, getCadDatasetFiles, getProjectTree } from '@/service/interface';
import { newShare, type Share } from '@/types/class';
import { useCardStore } from '@/stores/card';
import { useDeviceStore } from '@/stores/device';
import { useMessageStore } from '@/stores/message';
import { useStateStore } from '@/stores/state';

const SETCRS_DATA_TYPE = [0, 11, 15]; // 需要设置坐标系和基点的数据类型
const device_store = useDeviceStore();
const card_store = useCardStore();
const message_store = useMessageStore();
const state_store = useStateStore();
const TopBar_fixedSpace = ref(230);
const list_show = ref<Share[]>([]); // 当前内容展示列表
const list_recently_viewed = ref<Share[]>([]); // 最近浏览列表
const list_collect = ref<Share[]>([]); // 收藏列表
const list_saple = ref<Share[]>([]); // 模板示例列表
const tb_isFixed = ref(false); // 顶部模块是否固定显示
const tb_tab_index = ref(0); // 顶部模块是否固定显示
const sw_contain_scrollTop = ref(0); // 设置滚动
const sw_contain_scrollTop_curr = ref(0); // 记录当前滚动
const uniapi_windowWidth = ref(0); // 屏幕宽度
const uniapi_windowHeight = ref(0); // 屏幕高度
const grid_columns = ref(2);
const grid_columnWidth = ref(180 + 20);
const grid_isMin = ref(false);

const ref_urlInput_dialog = ref<InstanceType<typeof UrlInputDialog> | null>(null);
const dialog_projName = ref(''); // 分享项目名称
const dialog_shareUrl = ref(''); // 分享链接
const dialog_revise = ref(false); // 是否是修改
const dialog_shareUrl_disabled = ref(true); // 分享链接无法输入

const ref_customInput_dialog = ref<InstanceType<typeof CustomInputDialog> | null>(null);
const ref_sampleInput_dialog = ref<InstanceType<typeof CustomInputDialog> | null>(null);

const style_grid_computed = computed(() => {
    return {
        gridTemplateColumns: `repeat(${grid_columns.value}, 1fr)`,
    };
});

onMounted(() => {
    update_cardList();
    TopBar_fixedSpace.value = device_store.deviceInfo.deviceModel === 'iPad' || device_store.deviceInfo.deviceModel === 'pad' ? 300 : 230;
    // 获取屏幕信息
    uni.getSystemInfo({
        success: function (res) {
            uniapi_windowWidth.value = res.windowWidth; // 窗口宽度
            uniapi_windowHeight.value = res.windowHeight; // 窗口高度
            update_gridColumns();
        },
    });
    // 获取应用到前台状态
    uni.onAppShow((e: any) => {
        uni.$re.unipluginLog('uni.onAppShow ' + JSON.stringify(e));
        uniapp_getClipboard();
    });
    uniapp_getClipboard();
    uni.onWindowResize(listen_windoeResize); // 监听屏幕变化
    message_store.addMessageHandler(message_store.M_AppToUni, appToUni);
});

onUnmounted(() => {
    uni.offWindowResize(listen_windoeResize); // 监听屏幕变化
    message_store.removeMessageHandler(message_store.M_AppToUni, appToUni);
});

const appToUni = (e: any) => {
    uni.$re.unipluginLog('---===--- : ' + JSON.stringify(e));
    setTimeout(() => {
        let postData = { data: { key: '666', value: [1, 2, 3, 4, 5] }, msg: '---', item: e };
        uni.$re.unipluginLog('reUniPostData: ' + JSON.stringify(postData));
        uni.$re.reUniPostData(postData);
    }, 2000);
};

// MARK 更新数据
const update_cardList = () => {
    list_recently_viewed.value = card_store.getCardList();
    list_collect.value = card_store.getCollectCardList();
    if (card_store.getSampleCardList().length <= 0) {
        card_store.updateSample().then((res) => {
            nextTick(() => {
                list_saple.value = card_store.getSampleCardList();
            });
        });
    } else {
        list_saple.value = card_store.getSampleCardList();
    }

    if (tb_tab_index.value == 1) {
        list_show.value = list_collect.value;
    } else if (tb_tab_index.value == 2) {
        list_show.value = list_saple.value;
    } else {
        list_show.value = list_recently_viewed.value;
    }
};

// MARK Listen  屏幕变化
const listen_windoeResize = (e: any) => {
    uniapi_windowWidth.value = e.size.windowWidth; // 窗口宽度
    uniapi_windowHeight.value = e.size.windowHeight; // 窗口高度
    console.log('uniapi_windowWidth: ' + e.size.windowWidth + '     uniapi_windowHeight: ' + e.size.windowHeight);
    uni.$re.unipluginLog('uniapi_windowWidth: ' + e.size.windowWidth + '     uniapi_windowHeight: ' + e.size.windowHeight);
    update_gridColumns();
};

// MARK Listen  内容滚动监听
const listen_contain_scroll = (e: any) => {
    tb_isFixed.value = e.detail.scrollTop >= TopBar_fixedSpace.value;
    sw_contain_scrollTop_curr.value = e.detail.scrollTop;
};

// MARK Listen 更新 Grid 比例
const update_gridColumns = () => {
    if (uniapi_windowWidth.value / 2 < grid_columnWidth.value) {
        grid_isMin.value = true;
        grid_columns.value = 2;
    } else {
        grid_isMin.value = false;
        grid_columns.value = Math.floor(uniapi_windowWidth.value / grid_columnWidth.value);
    }
};

// MARK uniapp 获取粘贴板内容
const uniapp_getClipboard = () => {
    uni.show_loading();
    uni.getClipboardData({
        success: function (res) {
            uni.$re.unipluginLog('uni.getClipboardData: ' + JSON.stringify(res));
            tool_handleUrl(res.data)
                .then((result) => {
                    uni.hide_loading();
                    dialog_shareUrl.value = result.url;
                    dialog_projName.value = result.projName;
                    dialog_shareUrl_disabled.value = true;
                    ref_urlInput_dialog.value?.show_dialog();
                })
                .catch((errMsg) => {
                    uni.hide_loading();
                });
        },
        fail: (err) => {
            uni.hide_loading();
            console.log(err);
        },
    });
};

// MARK uniapp 处理url内容
const tool_handleUrl = (e: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        let urlData = uni.$tool.url_handle(e);
        if (urlData) {
            uni.setStorageSync('RE_Token', urlData.token);
            // 获取项目名称
            getProjName(urlData)
                .then((res) => {
                    urlData.projName = res || '';
                    resolve(urlData);
                })
                .catch((err) => {
                    resolve(urlData);
                });
        } else {
            reject(null);
        }
    });
};

// MARK Topbar banner区域连续点击
const banner_re_callback = () => {
    ref_customInput_dialog.value?.show_dialog();
};

// MARK Topbar banner区域长按
const banner_re_longpress_callback = () => {
    // ref_sampleInput_dialog.value?.show_dialog();
};

// MARK Topbar banner区域长按 回调
const dialog_SampleInputCallBack = (e: any) => {
    card_store.removeCard(e.dataSetId);
};

// MARK Topbar 占位区域点击
const topbar_houerArea_callback = () => {
    dialog_shareUrl_disabled.value = false;
    dialog_shareUrl.value = '';
    dialog_projName.value = '';
    ref_urlInput_dialog.value?.show_dialog();
};

// MARK Topbar 扫码
const topbar_scan_callback = () => {
    uni.scan_code()
        .then((res: any) => {
            tool_handleUrl(res)
                .then((result) => {
                    uni.hide_loading();
                    dialog_shareUrl.value = result.url;
                    dialog_projName.value = result.projName;
                    dialog_shareUrl_disabled.value = true;
                    ref_urlInput_dialog.value?.show_dialog();
                })
                .catch((error) => {
                    uni.hide_loading();
                    uni.showToast({ title: '无效二维码', icon: 'none' });
                });
        })
        .catch((err: any) => {});
};

// MARK Topbar 搜索
const topbar_search_callback = () => {
    uni.navigateTo({
        url: '/pages/Search/SearchPage',
        success: (res) => {
            uni.$re.unipluginLog('uni.navigateTo: ' + JSON.stringify(res));
        },
        fail: (err) => {
            uni.$re.unipluginLog('uni.navigateTo:' + JSON.stringify(err));
        },
    });
};

// MARK Click  卡片点击
const card_callback = (e: Share) => {
    console.log('卡片点击', JSON.stringify(e));
    uni.$re.unipluginLog('card_callback: ' + JSON.stringify(e.dataSetList));

    // 不知道什么原因导致ts的数组到安卓中变成JSONObject导致解析崩溃，这样操作可以重置属性，避免ts的属性带入
    let dataSetListJson = JSON.stringify(e.dataSetList);
    let dataSetList = JSON.parse(dataSetListJson);
    // 默认相机信息
    let defaultCamLoc = null;
    if (e.defaultCamLoc) {
        let defaultCamLocJson = JSON.stringify(e.defaultCamLoc);
        defaultCamLoc = JSON.parse(defaultCamLocJson);
    }
    uni.$re
        .realEngineRender({
            name: 'uni-app',
            shareUrl: e.url,
            projName: e.projName,
            worldCRS: e.worldCRS,
            dataSetList: dataSetList,
            collect: e.collect,
            shareType: e.shareType,
            camDefaultDataSetId: e.camDefaultDataSetId,
            shareViewMode: e.shareViewMode,
            shareDataType: e.shareDataType,
            defaultCamLoc: defaultCamLoc,
        })
        .then((result) => {
            console.log(result);
            uni.$re.unipluginLog(JSON.stringify(result));
        });
};

// MARK Click  卡片名称长按
const card_title_longpress_callback = (e: Share) => {
    console.log('卡片名称长按', JSON.stringify(e));
    uni.$re.unipluginLog('card_title_longpress_callback: ' + JSON.stringify(e));

    if (tb_tab_index.value === 2) {
        uni.showToast({ title: '模板示例无法修改名称', icon: 'none' });
        return;
    }

    dialog_shareUrl.value = e.url;
    dialog_projName.value = e.projName;
    dialog_revise.value = true;
    dialog_shareUrl_disabled.value = true;
    ref_urlInput_dialog.value?.show_dialog();
};

// MARK Click  卡片图片长按
const card_img_longpress_callback = (e: Share) => {
    console.log('卡片图片长按', JSON.stringify(e));
    uni.$re.unipluginLog('card_title_longpress_callback: ' + JSON.stringify(e));

    if (tb_tab_index.value !== 0) {
        return;
    }
    uni.showModal({
        title: '提示',
        content: '是否删除卡片',
        success: function (res) {
            if (res.confirm) {
                card_store.removeCard(e.id);
            }
        },
    });
};

// MARK Click  收藏
const card_collect_callback = (e: Share) => {
    card_store.addCollect(e, !e.collect);
    update_cardList();
};

// MARK Topbar tab切换
const topbar_tab_callback = (index: number) => {
    tb_tab_index.value = index;
    update_cardList();
    // 解决view层不同步的问题
    sw_contain_scrollTop.value = sw_contain_scrollTop_curr.value;
    nextTick(() => {
        sw_contain_scrollTop.value = TopBar_fixedSpace.value;
    });
};

// MARK Dialog  查看模型/确认修改
const dialog_UrlInputCallBack = (e: any) => {
    console.log(e);
    let shareParams: any = uni.$tool.url_handle(e.shareUrl);
    if (dialog_revise.value) {
        card_store.reviseProjName(shareParams, e.projName);
        dialog_revise.value = false;
    } else {
        shareParams.projName = e.projName;
        if (shareParams) showShareUrlRes(shareParams);
    }
};

// MARK 查看分享链接资源
const showShareUrlRes = (params: any) => {
    uni.setStorageSync('RE_Token', params.token);
    if (params.shareType === 2) {
        showSceneRes(params);
    } else {
        showModelRes(params);
    }
};

// MARK re-api 查看分享链接资源 -- 场景资源
const showSceneRes = (params: any) => {
    uni.show_loading();
    getSceneInfo(params.id)
        .then((res_1) => {
            getSceneTree({ sceneId: params.id, isPublished: true })
                .then((res_2) => {
                    const dataSetIdList = getDataSetIds(res_2);
                    const terrainList = getTerrainDataSetList(res_2, 2);
                    getDataSetList({ dataSetIds: dataSetIdList })
                        .then((res_3) => {
                            const dataSetList_temp1: any[] = handleDataSetTrans(res_3, res_1.dataSetPosition);
                            const dataSetList = handleTerrainLayerLev(dataSetList_temp1, terrainList);

                            let cam_dataSetId = uni.$tool.cam_defauleDataSet(dataSetList);
                            let shareData: Share = newShare({
                                url: params.url,
                                projName: params.projName,
                                id: params.id,
                                lastTime: new Date(),
                                dataSetList: dataSetList,
                                worldCRS: res_1.coordinates,
                                shareType: 2,
                                camDefaultDataSetId: cam_dataSetId,
                                shareViewMode: params.shareViewMode,
                            });
                            card_store.addCard(shareData);

                            uni.hide_loading();
                            uni.$re
                                .realEngineRender({
                                    name: 'uni-app',
                                    shareUrl: params.url,
                                    projName: params.projName,
                                    collect: shareData.collect,
                                    worldCRS: res_1.coordinates,
                                    dataSetList: dataSetList,
                                    shareType: 2,
                                    camDefaultDataSetId: cam_dataSetId,
                                    shareViewMode: params.shareViewMode,
                                    defaultCamLoc: shareData.defaultCamLoc,
                                })
                                .then((result) => {
                                    console.log(result);
                                    uni.$re.unipluginLog(JSON.stringify(result));
                                });
                        })
                        .catch((err_3) => {
                            uni.hide_loading();
                            uni.showToast({ title: err_3, icon: 'none' });
                        });
                })
                .catch((err_2) => {
                    uni.hide_loading();
                    uni.showToast({ title: err_2, icon: 'none' });
                });
        })
        .catch((err_1) => {
            uni.hide_loading();
            uni.showToast({ title: err_1, icon: 'none' });
        });
};

// MARK re-api 查看分享链接资源 -- 模型资源
const showModelRes = (params: any) => {
    switch (params.shareDataType) {
        case 'Bim':
        case 'Rs':
        case 'Wmts':
        case 'Osgb':
        case 'PointCloud':
            showModelTypeRes(params);
            break;
        case 'Cad':
            showCadTypeRes(params);
            break;
        default:
            // 使用延时解决弹窗关闭后的提示显示异常的问题，因为弹窗关闭有200的延迟
            setTimeout(() => {
                uni.showToast({ title: '暂不支持该数据类型', icon: 'none' });
            }, 210);
            break;
    }
};

// MARK re-api 查看模型类型数据
const showModelTypeRes = (params: any) => {
    uni.show_loading();
    getDataSetList({ dataSetIds: [params.id] })
        .then((res) => {
            uni.hide_loading();
            let shareData: Share = newShare({
                url: params.url,
                projName: params.projName,
                id: params.id,
                lastTime: new Date(),
                dataSetList: res,
                shareType: 1,
                shareDataType: params.shareDataType,
            });
            card_store.addCard(shareData);

            uni.$re
                .realEngineRender({
                    name: 'uni-app',
                    shareUrl: params.url,
                    projName: params.projName,
                    dataSetList: res,
                    collect: shareData.collect,
                    shareType: 1,
                    shareDataType: params.shareDataType,
                    defaultCamLoc: shareData.defaultCamLoc,
                })
                .then((result) => {
                    uni.$re.unipluginLog(JSON.stringify(result));
                });
        })
        .catch((err) => {
            uni.hide_loading();
            uni.showToast({ title: err, icon: 'none' });
        });
};

// MARK re-api 查看CAD类型数据
const showCadTypeRes = (params: any) => {
    uni.show_loading();
    getCadDataSetList({ dataSetId: params.id })
        .then((res) => {
            uni.hide_loading();
            let shareData: Share = newShare({
                url: params.url,
                projName: params.projName,
                id: params.id,
                lastTime: new Date(),
                dataSetList: res,
                shareType: 1,
                shareDataType: params.shareDataType,
            });
            card_store.addCard(shareData);

            uni.$re
                .realEngineRender({
                    name: 'uni-app',
                    shareUrl: params.url,
                    projName: params.projName,
                    dataSetList: res,
                    collect: shareData.collect,
                    shareType: 1,
                    shareDataType: params.shareDataType,
                })
                .then((result) => {
                    uni.$re.unipluginLog(JSON.stringify(result));
                });
        })
        .catch((err) => {
            uni.hide_loading();
            uni.showToast({ title: err, icon: 'none' });
        });
};

// MARK re-api 查看模型资源链接
const showResourceAddressRes = (e: any) => {
    let dataSetList = [
        {
            dataSetId: e.dataSetId,
            resourcesAddress: e.resourcesAddress,
            useTransInfo: true,
            rotate: [0, 0, 0, 1],
            scale: [1, 1, 1],
            offset: [0.0, 0.0, 0.0],
            dataSetCRS: '',
            dataSetCRSNorth: 0.0,
        },
    ];
    uni.$re
        .realEngineRender({
            name: 'uni-app',
            dataSetList: dataSetList,
            maxInstDrawFaceNum: e.faceNum,
        })
        .then((result) => {
            uni.$re.unipluginLog(JSON.stringify(result));
        });
};

// MARK Service 获取场景信息
const getSceneInfo = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getSceneById(paran).then((res) => {
            if (res.data) {
                let info = { coordinates: res.data.coordinates, dataSetPosition: res.data.dataSetPosition, sceneName: res.data.sceneName };
                resolve(info);
            } else {
                reject('位置偏移信息获取失败！');
            }
        });
    });
};

// MARK Service 获取场景目录树
const getSceneTree = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getSingleSceneTreeById(paran).then((res) => {
            if (res.data) {
                resolve(res.data);
            } else {
                reject('场景目录树获取失败！');
            }
        });
    });
};

// MARK Service 获取模型目录树
const getModelTree = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getProjectTree(paran).then((res) => {
            if (res.data) {
                resolve(res.data);
            } else {
                reject('模型目录树获取失败！');
            }
        });
    });
};

// MARK Service 获取数据集资源地址
const getDataSetList = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getProjectModel(params).then((res) => {
            let dataSetList: any[] = [];
            res.data.forEach((item: any) => {
                let dataSetCRS = handleDataSetCRS(item);
                let dataSetCRSNorth = handleDataSetCRSNorth(item);
                let engineOrigin = handleEngineOrigin(item);
                let dataSetSGContent = item.context ? item.context : '';
                dataSetList.push({
                    dataSetId: item.dataSetId,
                    resourcesAddress: item.resourcesAddress,
                    rotate: item.rotate?.split(' ').map(Number),
                    scale: item.scale?.split(' ').map(Number),
                    offset: item.translation?.split(' ').map(Number),
                    dataSetCRS: dataSetCRS,
                    dataSetCRSNorth: dataSetCRSNorth,
                    engineOrigin: engineOrigin,
                    dataSetSGContent: dataSetSGContent,
                    dataSetType: item.dataSetType,
                });
            });
            if (dataSetList.length > 0) {
                resolve(dataSetList);
            } else {
                reject('资源地址获取失败！');
            }
        });
    });
};

// MARK Service 获取项目名称
const getProjName = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        if (params.shareType === 2) {
            getSceneInfo(params.id)
                .then((res) => {
                    resolve(res?.sceneName);
                })
                .catch((err) => {
                    reject(err);
                });
        } else {
            getModelTree({ dataSetId: params.id })
                .then((res) => {
                    let find_obj = res?.find((item: any) => item.dataSetId === params.id);
                    if (find_obj) {
                        resolve(find_obj.dataSetName);
                    } else {
                        reject('项目查询失败');
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        }
    });
};

// MARK Service 获取数据集下CAD资源地址
const getCadDataSetList = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getCadDatasetFiles(params).then((res) => {
            let dataSetList: any[] = [];
            if (res.data.items && res.data.items.length > 0) {
                let cad_file = res.data.items[0];
                const cadUnitMap: any = {
                    Meter: 'CAD_UNIT_Meter',
                    Centimeter: 'CAD_UNIT_Centimeter',
                    Millimeter: 'CAD_UNIT_Millimeter',
                    Kilometer: 'CAD_UNIT_Kilometer',
                    Inch: 'CAD_UNIT_Inch',
                    Foot: 'CAD_UNIT_Foot',
                    Mile: 'CAD_UNIT_Mile',
                };
                dataSetList.push({
                    dataSetId: 're_cad',
                    resourcesAddress: cad_file.resourcesAddress,
                    unit: cadUnitMap[cad_file.unit || 'Meter'],
                });
            }
            if (dataSetList.length > 0) {
                resolve(dataSetList);
            } else {
                reject('资源地址获取失败！');
            }
        });
    });
};

// MARK Service 处理数据集偏移信息
const handleDataSetTrans = (dataSetList: any, dataSetTrans: any): any => {
    dataSetList.forEach((dataSet: any) => {
        let dataSetTranData = dataSetTrans.find((obj: any) => obj.dataSetId == dataSet.dataSetId);
        if (dataSetTranData) {
            dataSet.rotate = dataSetTranData.rotate?.split(' ').map(Number);
            dataSet.scale = dataSetTranData.scale?.split(' ').map(Number);
            dataSet.offset = dataSetTranData.translation?.split(' ').map(Number);
        }
    });
    return dataSetList;
};

// MARK Service 处理数据集--坐标系标识符
const handleDataSetCRS = (dataSetInfo: any) => {
    if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return '';

    let crsConfig = dataSetInfo.coordinatesConfig;
    if (crsConfig.coordinatesType === 'None') return '';

    if (crsConfig.coordinatesType === 'CalibrationPoint') {
        let crsPoint = crsConfig.coordinatesPoint;
        let crs = `ENU:${crsPoint.latitude},${crsPoint.longitude}`;
        return crs;
    } else {
        return crsConfig.coordinates;
    }
};

// MARK Service 处理数据集--基点坐标
const handleEngineOrigin = (dataSetInfo: any) => {
    if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return [0, 0, 0];

    let engineOrigin = [];
    let crsConfig = dataSetInfo.coordinatesConfig;

    let origin = crsConfig.basePoint;
    let originArray = [];
    if (origin) {
        originArray = origin.split(',').map(Number);
    }

    if (crsConfig.coordinatesType === 'CalibrationPoint') {
        let crsPoint = crsConfig.coordinatesPoint;
        let point = crsPoint.coordinates;
        let pointArray = [];
        if (point) {
            pointArray = point.split(',').map(Number);
        } else {
            pointArray = [0, 0, 0];
        }

        if (originArray.length) {
            originArray.forEach((item: any, index: any) => {
                let result = item - pointArray[index];
                engineOrigin.push(result);
            });
        } else {
            engineOrigin = pointArray;
        }
    } else {
        engineOrigin = originArray;
    }

    if (engineOrigin.length) {
        return engineOrigin;
    } else {
        return [0, 0, 0];
    }
};

// MARK Service 处理数据集--正北夹角
const handleDataSetCRSNorth = (dataSetInfo: any) => {
    if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return 0;
    let crsConfig = dataSetInfo.coordinatesConfig;
    if (crsConfig.northAngle) {
        return Number(crsConfig.northAngle);
    } else {
        return 0;
    }
};

// MARK Service 处理数据集--地形层级
const handleTerrainLayerLev = (dataSetList: any, dataSetTerrain: any) => {
    dataSetList.forEach((dataSet: any) => {
        let dataSetTranData = dataSetTerrain.find((obj: any) => obj.dataSetId == dataSet.dataSetId);
        if (dataSetTranData) {
            dataSet.terrainLayerLev = dataSetTranData.sortNum;
        } else {
            dataSet.terrainLayerLev = 0;
        }
    });
    return dataSetList;
};

// MARK Service 递归获取数据集标识集合
const getDataSetIds = (sceneTree: any) => {
    let dataSetIdList: string[] = [];
    if (sceneTree && sceneTree.length > 0) {
        sceneTree.forEach((item: any) => {
            if (
                item.nodeType == 2 &&
                item.viewStatus !== 2 &&
                state_store.sceneDataSetType.includes(item.dataSetType) &&
                state_store.appSupportDataSetType.includes(item.dataSetType)
            ) {
                dataSetIdList.push(item.dataSetId);
            }
            if (item.subNodes && item.subNodes.length > 0) {
                let childrenDataSetList = getDataSetIds(item.subNodes);
                dataSetIdList = dataSetIdList.concat(childrenDataSetList);
            }
        });
    }
    return dataSetIdList;
};

// MARK Service 递归获取地形数据集合
const getTerrainDataSetList = (sceneTree: any, nodeType: Number) => {
    const array: any[] = [];
    const traverse = (item: any) => {
        if (item.nodeType === nodeType) {
            array.push(item);
        }
        if (item.subNodes && item.subNodes.length) {
            item.subNodes.forEach((subNode: any) => {
                traverse(subNode);
            });
        }
    };

    sceneTree.forEach((item: any) => {
        traverse(item);
    });

    var allDataSets = array.filter((el) => el.viewStatus !== 2);
    const terrainType = [10, 13, 21, 22];
    let terrainDataSets = allDataSets.filter((el) => terrainType.includes(el.dataSetType));
    return terrainDataSets;
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-main-page {
    position: relative;
    width: 100%;
    display: flex;
    flex: 1;
    background-color: var(--color-main-bg);
}

.contain-scroll-view {
    position: relative;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.content {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;

    .grid-container {
        position: relative;
        width: 100%;
        display: grid;
        gap: 10px;
        padding: 10px 12px;
        box-sizing: border-box;

        .grid-item {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .empty-area {
        position: relative;
        width: 100%;
        height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .empty-image {
            position: relative;
            width: 265px;
            height: 220px;
            margin-top: 50px;
            margin-right: 10px;
        }
        .empty-text {
            font-size: 16px;
            color: #86909c;
            line-height: 20px;
            margin-right: 10px;
        }
    }
}
</style>

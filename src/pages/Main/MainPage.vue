<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-09-24 11:09:55
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
                <view class="banner">
                    <view class="banner-box" @click="banner_click"> </view>
                </view>
                <view class="content">
                    <top-bar
                        :topbar_tab_index="tb_tab_index"
                        :topbar_houerArea_callback="topbar_houerArea_callback"
                        :topbar_scan_callback="topbar_scan_callback"
                        :topbar_tab_callback="topbar_tab_callback"></top-bar>
                    <top-bar
                        v-if="tb_isFixed"
                        :topbar_has_search="tb_isFixed"
                        :topbar_tab_index="tb_tab_index"
                        :topbar_scan_callback="topbar_scan_callback"
                        :topbar_search_callback="topbar_search_callback"
                        :topbar_tab_callback="topbar_tab_callback"></top-bar>
                    <view class="grid-container" :style="style_grid_computed">
                        <view class="grid-item" v-for="(item, index) in list_show" :key="index">
                            <card
                                :card_proj="item"
                                :card_callback="card_callback"
                                :card_longpress_callback="card_longpress_callback"
                                :card_collect_callback="card_collect_callback"></card>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </base-view>
    <url-input-dialog
        ref="ref_urlInput_dialog"
        :dialog_projName="dialog_projName"
        :dialog_shareUrl="dialog_shareUrl"
        :dialog_shareUrl_disabled="dialog_shareUrl_disabled"
        :dialog_UrlInputCallBack="dialog_UrlInputCallBack"></url-input-dialog>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import TopBar from '@/components/TopBar/TopBar.vue';
import Card from '@/components/Card/Card.vue';
import UrlInputDialog from '@/components/Dialog/UrlInputDialog.vue';
import {
    getSceneById,
    getSingleSceneTreeById,
    getProjectModel,
    getSceneById_old,
    getSingleSceneTreeById_old,
    getProjectModel_old,
} from '@/service/interface';
import { newShare, type Share } from '@/types/class';
import { useCardStore } from '@/stores/card';

const card_store = useCardStore();
const list_show = ref<Share[]>([]); // 当前内容展示列表
// const list_recently_viewed = ref(Array.from({ length: 100 }, (_, i) => `最近浏览 ->   ${i + 1}`)); // 最近浏览列表
// const list_collect = ref(Array.from({ length: 100 }, (_, i) => `收藏 ->   ${i + 1}`)); // 收藏列表
const list_recently_viewed = ref<Share[]>([]); // 最近浏览列表
const list_collect = ref<Share[]>([]); // 收藏列表
const tb_isFixed = ref(false); // 顶部模块是否固定显示
const tb_tab_index = ref(0); // 顶部模块是否固定显示
const sw_contain_scrollTop = ref(0); // 设置滚动
const sw_contain_scrollTop_curr = ref(0); // 记录当前滚动
const uniapi_windowWidth = ref(0); // 屏幕宽度
const uniapi_windowHeight = ref(0); // 屏幕高度
const grid_columns = ref(2);

const ref_urlInput_dialog = ref<InstanceType<typeof UrlInputDialog> | null>(null);
const dialog_projName = ref(''); // 分享项目名称
const dialog_shareUrl = ref(''); // 分享链接
const dialog_shareUrl_disabled = ref(true); // 分享链接无法输入

const style_grid_computed = computed(() => {
    return {
        gridTemplateColumns: `repeat(${grid_columns.value}, 1fr)`,
    };
});

onMounted(() => {
    update_cardList();

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
        uni.$re.unipluginLog('应用到前台 ' + JSON.stringify(e));
        uniapp_getClipboard();
    });
    uniapp_getClipboard();
    uni.onWindowResize(listen_windoeResize); // 监听屏幕变化
});

onUnmounted(() => {
    uni.offWindowResize(listen_windoeResize); // 监听屏幕变化
});

// MARK 更新数据
const update_cardList = () => {
    list_recently_viewed.value = card_store.getCardList();
    list_collect.value = card_store.getCollectCardList();
    if (tb_tab_index.value == 1) {
        list_show.value = list_collect.value;
    } else {
        list_show.value = list_recently_viewed.value;
    }
};

// MARK Listen  屏幕变化
const listen_windoeResize = (e: any) => {
    uniapi_windowWidth.value = e.size.windowWidth; // 窗口宽度
    uniapi_windowHeight.value = e.size.windowHeight; // 窗口高度
    console.log('uniapi_windowWidth: ' + e.size.windowWidth + '     uniapi_windowHeight: ' + e.size.windowHeight);

    update_gridColumns();
};

// MARK Listen  内容滚动监听
const listen_contain_scroll = (e: any) => {
    tb_isFixed.value = e.detail.scrollTop >= 200;
    sw_contain_scrollTop_curr.value = e.detail.scrollTop;
    console.log('外 scrollTop：', e.detail.scrollTop);
};

// MARK Listen 更新 Grid 比例
const update_gridColumns = () => {
    const columnWidth = 180 + 20; // item 宽度 + 间距
    grid_columns.value = Math.floor(uniapi_windowWidth.value / columnWidth);
};

// MARK uniapp 获取粘贴板内容
const uniapp_getClipboard = () => {
    uni.getClipboardData({
        success: function (res) {
            const urlData = uni.$tool.url_handle(res.data);
            if (urlData) {
                uni.show_loading();
                setTimeout(() => {
                    uni.hide_loading();
                    uni.$re.unipluginLog('粘贴板内容 ' + JSON.stringify(res));
                    dialog_shareUrl.value = urlData.url;
                    dialog_projName.value = urlData.projName;
                    dialog_shareUrl_disabled.value = true;
                    ref_urlInput_dialog.value?.show_dialog();
                }, 500);
            }
        },
    });
};

// MARK Topbar banner区域点击
const banner_click = () => {
    card_store.clearCardList();
    update_cardList();
};

// MARK Topbar 占位区域点击
const topbar_houerArea_callback = () => {
    dialog_shareUrl_disabled.value = false;
    ref_urlInput_dialog.value?.show_dialog();
};

// MARK Topbar 扫码
const topbar_scan_callback = () => {
    uni.scan_code()
        .then((res: any) => {
            const urlData = uni.$tool.url_handle(res);
            if (urlData) {
                dialog_shareUrl.value = urlData.url;
                dialog_projName.value = urlData.projName;
                dialog_shareUrl_disabled.value = true;
                ref_urlInput_dialog.value?.show_dialog();
            } else {
                uni.showToast({ title: '无效二维码', icon: 'none' });
            }
        })
        .catch((err: any) => {});
};

// MARK Topbar 搜索
const topbar_search_callback = (e: any) => {
    console.log('搜索内容: ' + JSON.stringify(e));
    uni.$re.unipluginLog('搜索内容: ' + JSON.stringify(e));
};

// MARK Click  卡片点击
const card_callback = (e: Share) => {
    console.log('卡片点击', JSON.stringify(e));
    uni.$re.unipluginLog('卡片点击' + JSON.stringify(e.dataSetList));

    // 不知道什么原因导致ts的数组到安卓中变成JSONObject导致解析崩溃，这样操作可以重置属性，避免ts的属性带入
    let dataSetListJson = JSON.stringify(e.dataSetList);
    let dataSetList = JSON.parse(dataSetListJson);
    uni.$re
        .realEngineRender({
            name: 'uni-app',
            worldCRS: e.worldCRS,
            dataSetList: dataSetList,
        })
        .then((result) => {
            console.log(result);
            uni.$re.unipluginLog(JSON.stringify(result));
        });
};

// MARK Click  卡片长按
const card_longpress_callback = (e: Share) => {
    console.log('卡片长按', e);
    uni.$re.unipluginLog('卡片长按' + JSON.stringify(e));
};

// MARK Click  收藏
const card_collect_callback = (e: Share) => {
    card_store.addCollect(e, !e.collect);
    update_cardList();
};

// MARK Topbar tab切换
const topbar_tab_callback = (index: number) => {
    if (index == 1) {
        list_show.value = list_collect.value;
    } else {
        list_show.value = list_recently_viewed.value;
    }
    tb_tab_index.value = index;
    // 解决view层不同步的问题
    sw_contain_scrollTop.value = sw_contain_scrollTop_curr.value;
    nextTick(() => {
        sw_contain_scrollTop.value = 200;
    });
};

// MARK Dialog  查看模型
const dialog_UrlInputCallBack = (e: any) => {
    console.log(e);
    let shareParams: any = uni.$tool.url_handle(e.shareUrl);
    if (shareParams) showShareUrlRes(shareParams);
};

// MARK 查看分享链接资源
const showShareUrlRes = (params: any) => {
    uni.setStorageSync('RE_Token', params.token);
    if (params.shareType === 2) {
        showSceneRes(params.id);
    } else {
        showModelRes(params.id);
    }
};

// MARK re-api 查看分享链接资源 -- 场景资源
const showSceneRes = (sceneId: string) => {
    uni.show_loading();
    getSceneInfo_old(sceneId).then((res_1) => {
        getSceneTree_old(sceneId).then((res_2) => {
            let dataSetIdList = getDataSetIds_old(res_2);
            getDataSetList_old({ dataSetIds: dataSetIdList, resourceId: sceneId }).then((res_3) => {
                const dataSetList = handleDataSetTrans(res_3, res_1.dataSetPosition);
                console.log('数据集：', dataSetList);

                let shareData: Share = newShare({
                    url: dialog_shareUrl.value,
                    projName: dialog_projName.value,
                    id: sceneId,
                    lastTime: new Date(),
                    dataSetList: dataSetList,
                    worldCRS: res_1.coordinates,
                });
                card_store.addCard(shareData);

                uni.hide_loading();
                uni.$re
                    .realEngineRender({
                        name: 'uni-app',
                        worldCRS: res_1.coordinates,
                        dataSetList: dataSetList,
                    })
                    .then((result) => {
                        console.log(result);
                        uni.$re.unipluginLog(JSON.stringify(result));
                    });
            });
        });
    });
};

// MARK re-api 查看分享链接资源 -- 模型资源
const showModelRes = (dataSetId: string) => {
    getDataSetList({ dataSetIds: [dataSetId] }).then((res) => {
        console.log('数据集：', res);
        let shareData: Share = newShare({
            url: dialog_shareUrl.value,
            projName: dialog_projName.value,
            id: dataSetId,
            lastTime: new Date(),
            dataSetList: res,
        });
        card_store.addCard(shareData);

        uni.$re
            .realEngineRender({
                name: 'uni-app',
                dataSetList: res,
            })
            .then((result) => {
                uni.$re.unipluginLog(JSON.stringify(result));
            });
    });
};

// MARK Service 获取场景信息
const getSceneInfo = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getSceneById(paran).then((res) => {
            if (res.data) {
                let info = { coordinates: res.data.coordinates, dataSetPosition: res.data.dataSetPosition };
                resolve(info);
            } else {
                reject(new Error('位置偏移信息获取失败！'));
            }
        });
    });
};

// MARK Service 获取场景信息（old）
const getSceneInfo_old = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getSceneById_old(paran).then((res) => {
            if (res.data) {
                let info = { coordinates: res.data.coordinates, dataSetPosition: res.data.dataSetPosition };
                resolve(info);
            } else {
                reject(new Error('位置偏移信息获取失败！'));
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
                reject(new Error('场景目录树获取失败！'));
            }
        });
    });
};

// MARK Service 获取场景目录树（old）
const getSceneTree_old = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getSingleSceneTreeById_old(paran).then((res) => {
            if (res.data) {
                resolve(res.data);
            } else {
                reject(new Error('场景目录树获取失败！'));
            }
        });
    });
};

// MARK Service 获取数据集资源地址
const getDataSetList = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getProjectModel(params).then((res) => {
            console.log(res);
            let dataSetList: any[] = [];
            res.data.forEach((item: any) => {
                dataSetList.push({
                    dataSetId: item.dataSetId,
                    resourcesAddress: item.resourcesAddress,
                    rotate: item.rotate?.split(' ').map(Number),
                    scale: item.scale?.split(' ').map(Number),
                    offset: item.translation?.split(' ').map(Number),
                });
            });
            if (dataSetList.length > 0) {
                resolve(dataSetList);
            } else {
                reject(new Error('资源地址获取失败！'));
            }
        });
    });
};

// MARK Service 获取数据集资源地址（old）
const getDataSetList_old = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getProjectModel_old(params).then((res) => {
            console.log(res);
            let dataSetList: any[] = [];
            res.data.forEach((item: any) => {
                dataSetList.push({
                    dataSetId: item.dataSetId,
                    resourcesAddress: item.resourcesAddress,
                    rotate: item.rotate?.split(' ').map(Number),
                    scale: item.scale?.split(' ').map(Number),
                    offset: item.translation?.split(' ').map(Number),
                });
            });
            if (dataSetList.length > 0) {
                resolve(dataSetList);
            } else {
                reject(new Error('资源地址获取失败！'));
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

// MARK Service 递归获取数据集标识集合
const getDataSetIds = (sceneTree: any) => {
    let dataSetIdList: string[] = [];
    if (sceneTree && sceneTree.length > 0) {
        sceneTree.forEach((item: any) => {
            if (item.nodeType && item.nodeType == 2 && item.viewStatus !== 2) {
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
// MARK Service 递归获取数据集标识集合（old）
const getDataSetIds_old = (sceneTree: any) => {
    let dataSetIdList: string[] = [];
    if (sceneTree.subNodes && sceneTree.subNodes.length > 0) {
        sceneTree.subNodes.forEach((item: any) => {
            if (item.nodeType && item.nodeType == 2 && item.viewStatus !== 2) {
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
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-main-page {
    position: relative;
    display: flex;
    flex: 1;
    background-color: var(--color-main-bg);
}

.contain-scroll-view {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.banner {
    position: relative;
    display: flex;
    width: 100%;
    height: 200px;
    justify-content: center;
    align-items: center;
    padding: 20px 12px 30px 12px;
    box-sizing: border-box;
    flex-shrink: 0;

    .banner-box {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 16px;
        // background-color: var(--color-main-bg);
        background-color: beige;
    }
}

.content {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;

    .grid-container {
        position: relative;
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
}
</style>

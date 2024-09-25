<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-09-25 19:59:45
-->
<template>
    <base-view :nav_bar="false" :nav_bar_color="`--color-main-bg`">
        <view class="sup-main-page">
            <search-bar
                :topbar_tab_index="tb_tab_index"
                :topbar_tab_callback="topbar_tab_callback"
                :topbar_search_callback="topbar_search_callback"
                :topbar_back_callback="topbar_back_callback"></search-bar>
            <scroll-view class="contain-scroll-view" scroll-y :show-scrollbar="false">
                <view class="content">
                    <view class="grid-container" :style="style_grid_computed" v-if="list_show.length > 0">
                        <view class="grid-item" v-for="(item, index) in list_show" :key="index">
                            <card
                                :card_type="tb_tab_index"
                                :card_min="grid_isMin"
                                :card_proj="item"
                                :card_callback="card_callback"
                                :card_longpress_callback="card_longpress_callback"
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
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import SearchBar from '@/components/TopBar/SearchBar.vue';
import Card from '@/components/Card/Card.vue';
import UrlInputDialog from '@/components/Dialog/UrlInputDialog.vue';

import { type Share } from '@/types/class';
import { useCardStore } from '@/stores/card';

const card_store = useCardStore();
const list_show = ref<Share[]>([]); // 当前内容展示列表
const list_recently_viewed = ref<Share[]>([]); // 最近浏览列表
const list_collect = ref<Share[]>([]); // 收藏列表
const list_saple = ref<Share[]>([]); // 模板示例列表
const tb_tab_index = ref(0); // 顶部模块是否固定显示
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
    uni.onWindowResize(listen_windoeResize); // 监听屏幕变化
});

onUnmounted(() => {
    uni.offWindowResize(listen_windoeResize); // 监听屏幕变化
});

// MARK 更新数据
const update_cardList = (search?: string) => {
    list_recently_viewed.value = card_store.getCardList(search);
    list_collect.value = card_store.getCollectCardList(search);
    list_saple.value = card_store.getSampleCardList(search);
    if (tb_tab_index.value == 1) {
        list_show.value = list_collect.value;
    } else if (tb_tab_index.value == 2) {
        list_show.value = list_saple.value;
    } else {
        list_show.value = list_recently_viewed.value;
    }
    console.log('当前显示列表 = ', list_show.value);
};

// MARK Listen  屏幕变化
const listen_windoeResize = (e: any) => {
    uniapi_windowWidth.value = e.size.windowWidth; // 窗口宽度
    uniapi_windowHeight.value = e.size.windowHeight; // 窗口高度
    console.log('uniapi_windowWidth: ' + e.size.windowWidth + '     uniapi_windowHeight: ' + e.size.windowHeight);
    uni.$re.unipluginLog('uniapi_windowWidth: ' + e.size.windowWidth + '     uniapi_windowHeight: ' + e.size.windowHeight);
    update_gridColumns();
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

// MARK Topbar 搜索
const topbar_search_callback = (e: any) => {
    update_cardList(e);
};

// MARK Topbar 返回
const topbar_back_callback = () => {
    uni.navigateBack();
};

// MARK Topbar tab切换
const topbar_tab_callback = (index: number) => {
    tb_tab_index.value = index;
    update_cardList();
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

// MARK Click  收藏
const card_collect_callback = (e: Share) => {
    card_store.addCollect(e, !e.collect);
    update_cardList();
};

// MARK Dialog  查看模型/确认修改
const dialog_UrlInputCallBack = (e: any) => {
    console.log(e);
    let shareParams: any = uni.$tool.url_handle(e.shareUrl);
    if (dialog_revise.value) {
        card_store.reviseProjName(shareParams, e.projName);
        dialog_revise.value = false;
    }
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
    flex-direction: column;
    overflow: hidden;
}

.contain-scroll-view {
    position: relative;
    width: 100%;
    height: calc(100% - 130px);
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
        }
        .empty-text {
            font-size: 16px;
            color: #86909c;
            line-height: 20px;
        }
    }
}
</style>

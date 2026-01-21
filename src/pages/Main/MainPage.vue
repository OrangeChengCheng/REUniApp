<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2026-01-21 11:10:33
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
                            <card-comp
                                :card_type="tb_tab_index"
                                :card_width="grid_columnWidth"
                                :card_proj="item"
                                :card_callback="card_callback"
                                :card_title_longpress_callback="card_title_longpress_callback"
                                :card_img_longpress_callback="card_img_longpress_callback"
                                :card_collect_callback="card_collect_callback"
                                :card_delete_callback="card_delete_callback"></card-comp>
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
import { onShow } from '@dcloudio/uni-app';
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import BannerComp from '@/components/Banner/BannerComp.vue';
import TopBar from '@/components/TopBar/TopBar.vue';
import CardComp from '@/components/Card/CardComp.vue';
import UrlInputDialog from '@/components/Dialog/UrlInputDialog.vue';
import CustomInputDialog from '@/components/Dialog/CustomInputDialog.vue';
import SampleInputDialog from '@/components/Dialog/SampleInputDialog.vue';
import { type Card } from '@/types/class';
import { useCardStore } from '@/stores/card';
import { useDeviceStore } from '@/stores/device';
import { useMessageStore } from '@/stores/message';
import { useStateStore } from '@/stores/state';

const device_store = useDeviceStore();
const card_store = useCardStore();
const message_store = useMessageStore();
const state_store = useStateStore();
const TopBar_fixedSpace = ref(230);
const list_show = ref<Card[]>([]); // 当前内容展示列表
const list_recently_viewed = ref<Card[]>([]); // 最近浏览列表
const list_collect = ref<Card[]>([]); // 收藏列表
const list_saple = ref<Card[]>([]); // 模板示例列表
const tb_isFixed = ref(false); // 顶部模块是否固定显示
const tb_tab_index = ref(0); // 顶部模块是否固定显示 0：最近打开 1：收藏 2：示例
const sw_contain_scrollTop = ref(0); // 设置滚动
const sw_contain_scrollTop_curr = ref(0); // 记录当前滚动
const uniapi_windowWidth = ref(0); // 屏幕宽度
const uniapi_windowHeight = ref(0); // 屏幕高度
const grid_columns = ref(2);
const grid_MaxWidth = 180 + 20;
const grid_columnWidth = ref(0);

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

onShow(() => {
    update_cardList();
});

onMounted(() => {
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

    if (e.code == 'error') {
        uni.showToast({ title: e.msg, icon: 'none' });
    }
    // setTimeout(() => {
    //     let postData = { data: { key: '666', value: [1, 2, 3, 4, 5] }, msg: '---', item: e };
    //     uni.$re.unipluginLog('reUniPostData: ' + JSON.stringify(postData));
    //     uni.$re.reUniPostData(postData);
    // }, 2000);
};

// MARK 更新数据
const update_cardList = () => {
    list_recently_viewed.value = card_store.getCardList();
    list_collect.value = card_store.getCollectCardList();
    list_saple.value = card_store.getSampleCardList();

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
    const containerWidth = uniapi_windowWidth.value - 24;
    const minItemWidth = grid_MaxWidth;
    let columns = 2; // 默认最少2个
    let itemWidth = 0;

    for (let n = 2; ; n++) {
        const totalGap = 8 * (n - 1);
        const availableWidth = containerWidth - totalGap;
        const calculatedWidth = availableWidth / n;

        if (calculatedWidth < minItemWidth && n > 2) break;

        columns = n;
        itemWidth = calculatedWidth;

        if (calculatedWidth >= minItemWidth) continue;
        else break;
    }

    grid_columns.value = Math.max(columns, 2);
    grid_columnWidth.value = itemWidth;
};

// MARK uniapp 获取粘贴板内容
const uniapp_getClipboard = () => {
    uni.getClipboardData({
        success: function (res) {
            uni.$re.unipluginLog('uni.getClipboardData: ' + JSON.stringify(res));
            if (!res.data || !res.data.length) return;
            tool_handleUrl(res.data);
        },
        fail: (err) => {
            console.log(err);
        },
    });
};

// MARK Topbar 扫码
const topbar_scan_callback = () => {
    uni.scan_code()
        .then((res: any) => {
            uni.$re.unipluginLog('uni.scan_code: ' + JSON.stringify(res.data));
            tool_handleUrl(res.data);
        })
        .catch((err: any) => {
            console.log(err);
        });
};

// MARK Url 处理url内容
const tool_handleUrl = async (e: any) => {
    const urlData = await uni.$tool.url_handle(e);
    if (!urlData) return null;
    console.log(urlData);
    //处理白名单配置
    const whiteList = uni.$service.getServerWhiteList();
    const hasWhiteList = whiteList.some((item: any) => e.includes(item.url));
    if (!hasWhiteList) {
        uni.showToast({ title: '数据不在白名单范围, 请前往服务配置中设置', icon: 'none' });
        return;
    }

    //打开弹窗
    dialog_shareUrl.value = urlData.url;
    dialog_projName.value = urlData.projName;
    dialog_shareUrl_disabled.value = true;
    ref_urlInput_dialog.value?.show_dialog();
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

// MARK Click  卡片名称长按
const card_title_longpress_callback = (e: Card) => {
    console.log('卡片名称长按', JSON.stringify(e));
    uni.$re.unipluginLog('card_title_longpress_callback: ' + JSON.stringify(e));

    if (tb_tab_index.value === 2) {
        uni.showToast({ title: '模板示例无法修改名称', icon: 'none' });
        return;
    }

    dialog_shareUrl.value = e.shareUrl;
    dialog_projName.value = e.projName;
    dialog_revise.value = true;
    dialog_shareUrl_disabled.value = true;
    ref_urlInput_dialog.value?.show_dialog();
};

// MARK Click  卡片图片长按
const card_img_longpress_callback = (e: Card) => {
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
                card_store.removeCard(e.shareId);
            }
        },
    });
};

// MARK Click  收藏
const card_collect_callback = (e: Card) => {
    card_store.addCollect(e, !e.collect);
    update_cardList();
};

// MARK Click  删除卡片
const card_delete_callback = (e: Card) => {
    if (tb_tab_index.value == 2) {
        return; //模板不能删除
    }
    uni.showModal({
        title: '提示',
        content: '是否删除卡片',
        success: function (res) {
            if (res.confirm) {
                card_store.removeCard(e.shareId);
                if (tb_tab_index.value == 1) {
                    update_cardList();
                }
            }
        },
    });
};

// MARK Topbar tab切换
const topbar_tab_callback = (index: number) => {
    tb_tab_index.value = index;
    update_cardList();
    // // 点击切换保持置顶操作
    // // 解决view层不同步的问题
    // sw_contain_scrollTop.value = sw_contain_scrollTop_curr.value;
    // nextTick(() => {
    //     sw_contain_scrollTop.value = TopBar_fixedSpace.value;
    // });
};

// MARK Click  卡片点击
const card_callback = async (e: Card) => {
    console.log('卡片信息: ', JSON.stringify(e));
    const urlData: any = await uni.$tool.url_handle(e.shareUrl);
    if (!urlData) {
        uni.showToast({ title: '分享信息获取失败', icon: 'none' });
        return;
    }
    state_store.updateCurrToken(urlData.token);
    state_store.updateCurrBaseUrl(urlData.baseUrl);
    uni.$re.showShareRes(urlData, () => {});
};

// MARK Dialog  查看模型/确认修改
const dialog_UrlInputCallBack = async (e: any) => {
    console.log(e);
    let urlData: any = await uni.$tool.url_handle(e.shareUrl);
    if (dialog_revise.value) {
        card_store.reviseProjName(urlData, e.projName);
        dialog_revise.value = false;
    } else {
        urlData.projName = e.projName;
        if (urlData) {
            uni.$re.showShareRes(urlData, update_cardList);
        }
    }
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
            token: e.token,
            baseUrl: e.baseUrl,
            source: e.source,
            dataSetList: dataSetList,
            maxInstDrawFaceNum: e.faceNum,
        })
        .then((result) => {
            uni.$re.unipluginLog(JSON.stringify(result));
        });
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
    margin-bottom: 60px;

    .grid-container {
        position: relative;
        width: 100%;
        padding: 10px 12px;
        box-sizing: border-box;
        display: grid;
        column-gap: 8px;
        row-gap: 8px;

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

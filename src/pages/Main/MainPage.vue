<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-09-22 16:38:38
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
                    <view class="banner-box"> </view>
                </view>
                <view class="content">
                    <top-bar></top-bar>
                    <top-bar v-if="tb_isFixed" :topbar_has_search="tb_isFixed"></top-bar>
                    <view class="grid-container" :style="style_grid_computed">
                        <view class="grid-item" v-for="(item, index) in list_show" :key="index">
                            <card></card>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import TopBar from '@/components/TopBar/TopBar.vue';
import Card from '@/components/Card/Card.vue';

const list_show = ref<string[]>([]); // 当前内容展示列表
const list_recently_viewed = ref(Array.from({ length: 100 }, (_, i) => `最近浏览 ->   ${i + 1}`)); // 最近浏览列表
const list_collect = ref(Array.from({ length: 100 }, (_, i) => `收藏 ->   ${i + 1}`)); // 收藏列表
const tb_isFixed = ref(false); // 顶部模块是否固定显示
const sw_contain_scrollTop = ref(0); // 设置滚动
const sw_contain_scrollTop_curr = ref(0); // 记录当前滚动
const uniapi_windowWidth = ref(0); // 屏幕宽度
const uniapi_windowHeight = ref(0); // 屏幕高度
const grid_columns = ref(2);

const style_grid_computed = computed(() => {
    return {
        gridTemplateColumns: `repeat(${grid_columns.value}, 1fr)`,
    };
});

onMounted(() => {
    list_show.value = list_recently_viewed.value;

    // 获取屏幕信息
    uni.getSystemInfo({
        success: function (res) {
            uniapi_windowWidth.value = res.windowWidth; // 窗口宽度
            uniapi_windowHeight.value = res.windowHeight; // 窗口高度
            update_gridColumns();
        },
    });
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
            uni.$re.unipluginLog('粘贴板内容 ' + JSON.stringify(res));
        },
    });
};

const aaa = () => {
    list_show.value = list_recently_viewed.value;
    // 解决view层不同步的问题
    sw_contain_scrollTop.value = sw_contain_scrollTop_curr.value;
    nextTick(() => {
        sw_contain_scrollTop.value = 200;
    });
};
const bbb = () => {
    list_show.value = list_collect.value;
    // 解决view层不同步的问题
    sw_contain_scrollTop.value = sw_contain_scrollTop_curr.value;
    nextTick(() => {
        sw_contain_scrollTop.value = 200;
    });
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-main-page {
    position: relative;
    display: flex;
    flex: 1;
    background-color: aquamarine;
    // background-color: var(--color-main-bg);
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
    padding: 20px 10px 30px 10px;
    box-sizing: border-box;
    flex-shrink: 0;

    .banner-box {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 10px;
        background-color: var(--color-main-bg);
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
        padding: 10px;
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

<template>
    <view :class="`${topbar_has_search ? 'sup-top-bar-fixed' : 'sup-top-bar'}`">
        <view class="search-area">
            <view class="border-view">
                <view class="search-area">
                    <icon-font name="searchbox_icon_search_default" size="24px" color="--color-main-black"></icon-font>
                </view>
                <input
                    class="uni-input"
                    confirm-type="search"
                    :placeholder="`${topbar_has_search ? '请输入搜索标题' : '请输入分享链接'}`"
                    @confirm="input_confirm" />
                <view class="scan-area" @click.stop="scan_area_click">
                    <icon-font name="searchbox_icon_scan_default" size="24px" color="--color-main-black"></icon-font>
                </view>
                <view class="houer-area" v-if="!topbar_has_search" @click.stop="houer_area_click"></view>
            </view>
        </view>
        <view class="tab-area">
            <view :class="tab_index_computed(0)" @click.stop="tab_click(0)">
                最近打开
                <icon-font v-if="tab_index == 0" class="icon_tabSel" name="tab_bg_selected" size="10px" color="--color-main-blue"></icon-font>
            </view>
            <view :class="`tab-bar-collect ${tab_index_computed(1)}`" @click.stop="tab_click(1)">
                收藏
                <icon-font v-if="tab_index == 1" class="icon_tabSel" name="tab_bg_selected" size="10px" color="--color-main-blue"></icon-font>
            </view>
        </view>
    </view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

const props = defineProps({
    topbar_has_search: {
        type: Boolean,
        default: false,
    },
    topbar_tab_index: {
        type: Number,
        default: 0,
    },
    topbar_houerArea_callback: {
        type: Function,
        default: () => {},
    },
    topbar_tab_callback: {
        type: Function,
        default: () => {},
    },
    topbar_scan_callback: {
        type: Function,
        default: () => {},
    },
    topbar_search_callback: {
        type: Function,
        default: () => {},
    },
});

const tab_index = ref(0); // 0：最近打开  1：收藏

watch([() => props.topbar_tab_index], () => {
    tab_index.value = props.topbar_tab_index;
});

const tab_index_computed = computed(() => (index: number) => {
    return `tab-bar ${index == tab_index.value ? 'active' : ''}`;
});

onMounted(() => {
    tab_index.value = props.topbar_tab_index;
});

// MARK Click  占位区域点击
const houer_area_click = () => {
    props.topbar_houerArea_callback();
};

// MARK Click  tab切换
const tab_click = (index: number) => {
    tab_index.value = index;
    props.topbar_tab_callback(index);
};

// MARK Click 扫码点击
const scan_area_click = () => {
    props.topbar_scan_callback();
};

// MARK Input 输入完成
const input_confirm = (e: any) => {
    props.topbar_search_callback(e.detail.value);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-top-bar {
    position: relative;
    width: 100%;
    height: 130px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    background-color: var(--color-main-bg);
}

.sup-top-bar-fixed {
    position: fixed;
    top: 40px;
    width: 100%;
    height: 130px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: 1;
    background-color: var(--color-main-bg);
}

.search-area {
    position: relative;
    width: 100%;
    display: flex;
    padding: 10px 12px;
    box-sizing: border-box;

    .border-view {
        position: relative;
        width: 100%;
        height: 56px;
        border-radius: 15px;
        border: 2px solid var(--color-main-black);
        display: flex;
        align-items: center;

        .search-area {
            position: relative;
            width: 56px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
        }

        .uni-input {
            position: relative;
            display: flex;
            flex: 1;
        }
        .scan-area {
            position: relative;
            width: 56px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
        }
        .houer-area {
            position: absolute;
            top: 0;
            left: 10px;
            right: 50px;
            bottom: 0;
            background-color: transparent;
        }
    }
}

.tab-area {
    position: relative;
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    box-sizing: border-box;

    .tab-bar {
        position: relative;
        width: 90px;
        height: 100%;
        margin-right: 20px;
        font-weight: normal;
        font-size: 20px;
        color: var(--color-main-gray);
        line-height: 24px;
        display: flex;
        align-items: center;

        &.active {
            font-weight: bold;
            font-size: 20px;
            color: var(--color-main-black);
            line-height: 24px;
        }

        .icon_tabSel {
            position: absolute;
            right: 5px;
            bottom: 0;
            width: 20px;
            height: 10px;
        }
    }
    .tab-bar-collect {
        width: 52px;
    }
}
</style>

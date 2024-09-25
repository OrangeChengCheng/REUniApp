<template>
    <view class="sup-search-bar">
        <view class="search-area">
            <view class="back-area" @click.stop="back_area_click">
                <icon-font name="nav_icon_back_default" size="40px" color="--color-main-black"></icon-font>
            </view>
            <view class="border-view">
                <input class="uni-input" v-model="search" confirm-type="done" placeholder="请输入搜索标题" />
                <view class="search-area" @click.stop="search_area_click">
                    <icon-font name="searchbox_icon_search_default" size="24px" color="--color-main-black"></icon-font>
                </view>
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
            <view :class="`${tab_index_computed(2)}`" @click.stop="tab_click(2)">
                模板示例
                <icon-font v-if="tab_index == 2" class="icon_tabSel" name="tab_bg_selected" size="10px" color="--color-main-blue"></icon-font>
            </view>
        </view>
    </view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

const props = defineProps({
    topbar_tab_index: {
        type: Number,
        default: 0,
    },
    topbar_tab_callback: {
        type: Function,
        default: () => {},
    },
    topbar_search_callback: {
        type: Function,
        default: () => {},
    },
    topbar_back_callback: {
        type: Function,
        default: () => {},
    },
});

const tab_index = ref(0); // 0：最近打开  1：收藏  2: 模板示例
const search = ref('');

watch([() => props.topbar_tab_index], () => {
    tab_index.value = props.topbar_tab_index;
});

const tab_index_computed = computed(() => (index: number) => {
    return `tab-bar ${index == tab_index.value ? 'active' : ''}`;
});

onMounted(() => {
    tab_index.value = props.topbar_tab_index;
});

// MARK Click  返回点击
const back_area_click = () => {
    props.topbar_back_callback();
};

// MARK Click  tab切换
const tab_click = (index: number) => {
    tab_index.value = index;
    props.topbar_tab_callback(index);
};

// MARK Click  搜索
const search_area_click = () => {
    props.topbar_search_callback(search.value);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-search-bar {
    position: relative;
    width: 100%;
    height: 130px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    background-color: var(--color-main-bg);
}

.search-area {
    position: relative;
    width: 100%;
    display: flex;
    padding: 10px 12px;
    box-sizing: border-box;

    .back-area {
        position: relative;
        width: 56px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .border-view {
        position: relative;
        margin-left: 15px;
        flex: 1;
        height: 56px;
        border-radius: 15px;
        border: 2px solid var(--color-main-black);
        display: flex;
        align-items: center;
        padding-left: 16px;
        box-sizing: border-box;

        .uni-input {
            position: relative;
            display: flex;
            flex: 1;
        }

        .search-area {
            position: relative;
            width: 56px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
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

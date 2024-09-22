<template>
    <view :class="`${topbar_has_search ? 'sup-top-bar-fixed' : 'sup-top-bar'}`">
        <view class="search-area">
            <view class="border-view">
                <icon-font class="icon-search" name="ic-moxingguanli" size="24px"></icon-font>
                <input class="uni-input" confirm-type="search" :placeholder="`${topbar_has_search ? '请输入搜索标题' : '请输入分享链接'}`" />
                <view class="scan-area">
                    <icon-font name="ic-moxingzuguanli" size="24px"></icon-font>
                </view>
                <view class="houer-area" v-if="!topbar_has_search" @click.stop="houer_area_click"></view>
            </view>
        </view>
        <view class="tab-area">
            <view :class="tab_index_computed(0)" @click.stop="tab_click(0)">最近打开</view>
            <view :class="tab_index_computed(1)" @click.stop="tab_click(1)">收藏</view>
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

const houer_area_click = () => {
    props.topbar_houerArea_callback();
};

const tab_click = (index: number) => {
    tab_index.value = index;
    props.topbar_tab_callback(index);
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
    background-color: red;
    flex-shrink: 0;
}

.sup-top-bar-fixed {
    position: fixed;
    top: 40px;
    width: 100%;
    height: 130px;
    display: flex;
    flex-direction: column;
    background-color: greenyellow;
    flex-shrink: 0;
    z-index: 1;
}

.search-area {
    position: relative;
    width: 100%;
    display: flex;
    background-color: aqua;
    padding: 10px;
    box-sizing: border-box;

    .border-view {
        position: relative;
        width: 100%;
        height: 55px;
        border-radius: 10px;
        border: 1px solid black;
        display: flex;
        align-items: center;

        .icon-search {
            position: relative;
            margin-left: 10px;
        }
        .uni-input {
            position: relative;
            margin-left: 10px;
            display: flex;
            flex: 1;
        }
        .scan-area {
            position: relative;
            width: 50px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .houer-area {
            position: absolute;
            top: 0;
            left: 10px;
            right: 50px;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
        }
    }
}

.tab-area {
    position: relative;
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
    background-color: bisque;

    .tab-bar {
        position: relative;
        margin-right: 30px;
        font-weight: normal;
        font-size: 18px;

        &.active {
            font-weight: bold;
            font-size: 20px;
        }
    }
}
</style>

<!--
 * @Author: Lemon C
 * @Date: 2024-08-22 11:05:25
 * @LastEditTime: 2024-08-26 15:57:22
-->
<template>
    <view class="sup-nav-bar">
        <!-- 顶部状态栏 -->
        <view class="status-bar"></view>
        <!-- 导航栏 -->
        <view class="nav-bar">
            <view class="nav-bar-item" v-if="nav_bar_item_back">
                <text class="nav-bar-item-btn-text">返回</text>
                <button class="nav-bar-item-btn" @click="navBarItemAction('nav-bar-item-back')"></button>
            </view>
            <view class="nav-bar-item" v-if="nav_bar_item_setting">
                <text class="nav-bar-item-btn-text">输入</text>
                <button class="nav-bar-item-btn" @click="navBarItemAction('nav-bar-item-info')"></button>
            </view>
            <text class="nar-bar-title">{{ nav_bar_title }}</text>
            <view class="nav-bar-item" v-if="nav_bar_item_scan">
                <text class="nav-bar-item-btn-text">扫码</text>
                <button class="nav-bar-item-btn" @click="navBarItemAction('nav-bar-item-scan')"></button>
            </view>
            <view class="nav-bar-item" v-else>
                <text class="nav-bar-item-btn-text"></text>
                <button class="nav-bar-item-btn" @click="navBarItemAction('')"></button>
            </view>
        </view>
    </view>
</template>

// MOD-- JavaScript
<script setup>
import { ref } from 'vue';

const props = defineProps({
    nav_bar_title: {
        type: String,
        default: '',
    },
    nav_bar_item_back: {
        type: Boolean,
        default: true,
    },
    nav_bar_item_setting: {
        type: Boolean,
        default: false,
    },
    nav_bar_item_scan: {
        type: Boolean,
        default: false,
    },
    nav_bar_item_callback: Function,
});

const navBarItemAction = (type) => {
    if (type == '') return;
    props.nav_bar_item_callback(type);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-nav-bar {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-main-blue);
}

.status-bar {
    position: relative;
    width: 100%;
    height: calc(80rpx);
    height: calc(80rpx + constant(safe-area-inset-top));
    height: calc(80rpx + env(safe-area-inset-top));
    background-color: var(--color-main-blue);
}
.nav-bar {
    position: relative;
    width: 100%;
    height: 88rpx;
    background-color: var(--color-main-blue);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
    box-sizing: border-box;
}

.nar-bar-title {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
}
.nav-bar-item {
    position: relative;
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-bar-item-btn-text {
    color: var(--color-white);
}
.nav-bar-item-btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 88rpx;
    height: 88rpx;
    background-color: transparent;
    &:after {
        border: unset;
    }
}
</style>

<!--
 * @Author: Lemon C
 * @Date: 2024-08-22 10:11:39
 * @LastEditTime: 2024-09-13 16:46:53
-->
<template>
    <view class="sup-base-view">
        <nav-bar
            :nav_bar_title="nav_bar_title"
            :nav_bar_item_back="nav_bar_item_back"
            :nav_bar_item_setting="nav_bar_item_setting"
            :nav_bar_item_scan="nav_bar_item_scan"
            :nav_bar_color="nav_bar_color"
            :nav_bar_item_callback="nav_bar_item_callback"></nav-bar>
        <view class="base-solt">
            <slot></slot>
        </view>
    </view>
</template>

// MOD-- JavaScript
<script setup>
import { ref } from 'vue';
import NavBar from '../Nav/NavBar.vue';

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
    nav_bar_color: {
        type: String,
        default: '--color-main-blue',
    },
    nav_bar_item_callback: Function,
});

const nav_bar_item_callback = (type) => {
    props.nav_bar_item_callback(type);
    if (type == 'nav-bar-item-back') {
        uni.navigateBack();
    }
};

</script>



// MOD-- CSS
<style lang="scss" scoped>
.sup-base-view {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    overflow:hidden;
}

.base-solt {
    position: relative;
    display: flex;
    width: 100%;
    height: calc(100% - 128rpx);
    height: calc(100% - calc(128rpx + constant(safe-area-inset-top)));
    height: calc(100% - calc(128rpx + env(safe-area-inset-top)));
    overflow: hidden;
}
</style>

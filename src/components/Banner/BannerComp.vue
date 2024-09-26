<!--
 * @Author: Lemon C
 * @Date: 2024-09-24 17:34:32
 * @LastEditTime: 2024-09-26 16:11:05
-->
<template>
    <div class="sup-banner-comp">
        <view class="banner-box" @click="banner_click">
            <image
                class="banner-image"
                :src="`${
                    device_store.deviceInfo.deviceModel === 'iPad' || device_store.deviceInfo.deviceModel === 'pad'
                        ? 'https://demo.bjblackhole.com/BlackHole3.0/app/img/app_banner_1_pad.png'
                        : 'https://demo.bjblackhole.com/BlackHole3.0/app/img/app_banner_1.png'
                }`"
                mode="scaleToFill"
                @touchstart="bottom_area_touchstart"
                @touchend="bottom_area_touchend" />
        </view>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

import { useDeviceStore } from '@/stores/device';
const device_store = useDeviceStore();

const props = defineProps({
    banner_re_callback: {
        type: Function,
        default: () => {},
    },
    banner_re_longpress_callback: {
        type: Function,
        default: () => {},
    },
});

const clickCount = ref(0);
const timer = ref<number | null>(null);

const touch_timer = ref<number | null>(null);
const touch_longpress = 3000; // 长按时间阈值

onUnmounted(() => {
    clickCount.value = 0;
    timer.value = null;
});

const banner_click = () => {
    clickCount.value++;

    // 如果计时器不存在，说明是第一次点击，开始计时
    if (!timer.value) {
        timer.value = setTimeout(() => {
            if (clickCount.value >= 5) {
                props.banner_re_callback();
            }
            clickCount.value = 0;
            timer.value = null;
        }, 1000);
    }
};

// MARK Click  开始点击
const bottom_area_touchstart = () => {
    // 设置定时器，如果触摸时间超过阈值，则认为是长按
    touch_timer.value = setTimeout(() => {
        props.banner_re_longpress_callback();
    }, touch_longpress);
};

// MARK Click  结束点击
const bottom_area_touchend = () => {
    // 如果触摸结束，且定时器存在，则清除定时器
    if (touch_timer.value !== null) {
        clearTimeout(touch_timer.value);
        touch_timer.value = null;
    }
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-banner-comp {
    position: relative;
    display: flex;
    width: 100%;
    height: 230px;
    justify-content: center;
    align-items: center;
    padding: 20px 12px 10px 12px;
    box-sizing: border-box;
    flex-shrink: 0;

    .banner-box {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 16px;

        .banner-image {
            width: 100%;
            height: 100%;
        }
    }
}
</style>

<!--
 * @Author: Lemon C
 * @Date: 2024-09-22 11:31:42
 * @LastEditTime: 2024-09-23 19:20:10
-->
<template>
    <view class="sup-card" @click="card_click">
        <view class="top-area"></view>
        <view class="bottom-area" @touchstart="bottom_area_touchstart" @touchend="bottom_area_touchend">
            <text class="bottom-title">{{ card_proj.projName }}</text>
            <text class="bottom-time"> {{ `${lastTime_computed}前 查看` }}</text>
        </view>
        <view
            class="collect-area"
            :style="`${card_proj.collect ? 'background-color: red' : 'background-color: green'}`"
            @click.stop="collect_area_click"></view>
    </view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import { type Share } from '@/types/class';

const props = defineProps({
    card_proj: {
        type: Object as PropType<Share>,
        default: () => ({} as Share),
    },
    card_callback: {
        type: Function,
        default: () => {},
    },
    card_longpress_callback: {
        type: Function,
        default: () => {},
    },
    card_collect_callback: {
        type: Function,
        default: () => {},
    },
});

const touch_timer = ref<number | null>(null);
const touch_longpress = 500; // 长按时间阈值

// MARK Computed  最近查看
const lastTime_computed = computed(() => {
    let currTime = new Date();
    let lastTime = new Date(props.card_proj.lastTime);
    let diff = uni.$tool.time_compare(lastTime, currTime);
    return diff;
});

// MARK Click  收藏点击
const collect_area_click = () => {
    props.card_collect_callback(props.card_proj);
};

// MARK Click  卡片点击
const card_click = () => {
    props.card_callback(props.card_proj);
};

// MARK Click  开始点击
const bottom_area_touchstart = () => {
    // 设置定时器，如果触摸时间超过阈值，则认为是长按
    touch_timer.value = setTimeout(() => {
        props.card_longpress_callback(props.card_proj);
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
.sup-card {
    position: relative;
    width: 180px;
    height: 240px;
    display: flex;
    flex-direction: column;
}

.top-area {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background-color: azure;
    border-radius: 8px;
    display: flex;
    flex-shrink: 0;
}

.bottom-area {
    position: relative;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 8px 10px;
    box-sizing: border-box;
    overflow: hidden;
    justify-content: space-between;

    .bottom-title {
        position: relative;
        font-size: 15px;
        font-weight: bold;
        color: var(--color-main-black);
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .bottom-time {
        position: relative;
        font-size: 13px;
        color: var(--color-main-gray);
        font-weight: lighter;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.collect-area {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
}
</style>

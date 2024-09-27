<!--
 * @Author: Lemon C
 * @Date: 2024-09-22 11:31:42
 * @LastEditTime: 2024-09-27 11:33:29
-->
<template>
    <view class="sup-card" :style="`${card_min ? 'width: 150px;' : 'width: 180px'}`" @click="card_click">
        <view class="top-area" @touchstart="top_area_touchstart" @touchend="top_area_touchend">
            <image src="../../static/Main/card_bg.png" class="top-area-bg" />
        </view>
        <view class="bottom-area">
            <text class="bottom-title" @touchstart="bottom_title_area_touchstart" @touchend="bottom_title_area_touchend">{{
                card_proj.projName
            }}</text>
            <text class="bottom-time"> {{ `${lastTime_computed}前 查看` }}</text>
        </view>
        <view v-if="card_type !== 2" class="collect-area" @click.stop="collect_area_click">
            <icon-font v-if="card_proj.collect" name="card_icon_like_pressed" size="24px" color="--color-main-blue"></icon-font>
            <icon-font v-else name="card_icon_like_default" size="24px" color="--color-white"></icon-font>
        </view>
    </view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import { type Share } from '@/types/class';

const props = defineProps({
    card_type: {
        type: Number,
        default: 0,
    },
    card_min: {
        type: Boolean,
        default: false,
    },
    card_proj: {
        type: Object as PropType<Share>,
        default: () => ({} as Share),
    },
    card_callback: {
        type: Function,
        default: () => {},
    },
    card_title_longpress_callback: {
        type: Function,
        default: () => {},
    },
    card_img_longpress_callback: {
        type: Function,
        default: () => {},
    },
    card_collect_callback: {
        type: Function,
        default: () => {},
    },
});

const touch_timer_bottom_title = ref<number | null>(null);
const touch_longpress_bottom_title = 500; // 长按时间阈值

const touch_timer_top_img = ref<number | null>(null);
const touch_longpress_top_img = 4000; // 长按时间阈值

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
const bottom_title_area_touchstart = () => {
    // 设置定时器，如果触摸时间超过阈值，则认为是长按
    touch_timer_bottom_title.value = setTimeout(() => {
        props.card_title_longpress_callback(props.card_proj);
    }, touch_longpress_bottom_title);
};

// MARK Click  结束点击
const bottom_title_area_touchend = () => {
    // 如果触摸结束，且定时器存在，则清除定时器
    if (touch_timer_bottom_title.value !== null) {
        clearTimeout(touch_timer_bottom_title.value);
        touch_timer_bottom_title.value = null;
    }
};

// MARK Click  开始点击
const top_area_touchstart = () => {
    // 设置定时器，如果触摸时间超过阈值，则认为是长按
    touch_timer_top_img.value = setTimeout(() => {
        props.card_img_longpress_callback(props.card_proj);
    }, touch_longpress_top_img);
};

// MARK Click  结束点击
const top_area_touchend = () => {
    // 如果触摸结束，且定时器存在，则清除定时器
    if (touch_timer_top_img.value !== null) {
        clearTimeout(touch_timer_top_img.value);
        touch_timer_top_img.value = null;
    }
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-card {
    position: relative;
    // width: 180px;
    height: 240px;
    display: flex;
    flex-direction: column;
}

.top-area {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    display: flex;
    flex-shrink: 0;
    overflow: hidden;

    .top-area-bg {
        width: 100%;
        height: 100%;
    }
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
        width: 100%;
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

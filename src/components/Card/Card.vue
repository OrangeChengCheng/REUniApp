<!--
 * @Author: Lemon C
 * @Date: 2024-09-22 11:31:42
 * @LastEditTime: 2025-12-08 14:29:04
-->
<template>
    <view class="sup-card" :style="`width: ${card_width}px;`" @click="card_click">
        <view class="top-area" @touchstart="top_area_touchstart" @touchend="top_area_touchend">
            <image src="../../static/Main/card_bg.png" class="top-area-bg" />
            <view class="source-area" :style="source_style_computed">
                <text class="source-text">{{ source_computed }}</text>
            </view>
        </view>
        <view class="bottom-area">
            <text class="bottom-title" @touchstart="bottom_title_area_touchstart" @touchend="bottom_title_area_touchend">{{
                card_proj.projName
            }}</text>
            <text class="bottom-time"> {{ `${overdueTime_computed}&nbsp;&nbsp;到期` }}</text>
        </view>
        <view v-if="card_type !== 2" class="collect-area" @click.stop="collect_area_click">
            <icon-font v-if="card_proj.collect" name="card_icon_like_pressed1" size="20px" color="--color-main-blue"></icon-font>
            <icon-font v-else name="card_icon_like_default1" size="20px" color="--color-white"></icon-font>
        </view>
        <view class="overdue-area" v-if="overdue_computed" @click.stop="delete_click">
            <text class="overdue-text">已过期</text>
            <view class="aux-area">
                <view class="icon-area">
                    <icon-font class="delete-icon" name="shanchu" size="26px" color="#ffffff"></icon-font>
                </view>
            </view>
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
    card_width: {
        type: Number,
        default: 0,
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
    card_delete_callback: {
        type: Function,
        default: () => {},
    },
});

const touch_timer_bottom_title = ref<number | null>(null);
const touch_longpress_bottom_title = 500; // 长按时间阈值

const touch_timer_top_img = ref<number | null>(null);
const touch_longpress_top_img = 4000; // 长按时间阈值

// MARK Computed  过期
const overdue_computed = computed(() => {
    if (!props.card_proj.endTime) {
        return false;
    }

    const endTime = new Date(props.card_proj.endTime);
    const userEndTime = new Date(props.card_proj.shareFormUserExpirationTime);
    const currTime = new Date();
    if (endTime.getTime() - userEndTime.getTime() > 0) {
        return currTime.getTime() - userEndTime.getTime() > 0;
    } else {
        return currTime.getTime() - endTime.getTime() > 0;
    }
});

// MARK Computed  最近查看
const lastTime_computed = computed(() => {
    let currTime = new Date();
    let lastTime = new Date(props.card_proj.lastTime);
    let diff = uni.$tool.time_compare(lastTime, currTime);
    return diff;
});

// MARK Computed  过期时间
const overdueTime_computed = computed(() => {
    // 空值兜底
    if (!props.card_proj?.endTime) return `未正确获取时间`;

    let endTime = new Date(props.card_proj.endTime);
    const formatted = uni.$tool.time_format(endTime);
    return formatted;
});

// MARK Computed  来源名称
const source_computed = computed(() => {
    const source = props.card_proj.source;
    if (source == 1) {
        return '黑洞';
    } else if (source == 2) {
        return '星河';
    } else if (source == 3) {
        return '星云';
    } else {
        return '私有化';
    }
});

// MARK Computed  来源样式
const source_style_computed = computed(() => {
    const source = props.card_proj.source;
    if (source == 1) {
        return 'background-color: rgba(1,21,50,0.5);';
    } else if (source == 2) {
        return 'background-color: rgba(10,96,218,0.5);';
    } else if (source == 3) {
        return 'background-color: rgba(0,0,0,0.5);';
    } else {
        return 'background-color: rgba(0,0,0,0.5);';
    }
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

// MARK Click  删除
const delete_click = () => {
    props.card_delete_callback(props.card_proj);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background-color: var(--color-white);
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

    .source-area {
        position: absolute;
        left: 8px;
        bottom: 9px;
        width: 40px;
        height: 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        .source-text {
            position: relative;
            margin-top: -2px;
            color: white;
            font-size: 10px;
        }
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
        margin-top: 4px;
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
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.32);
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.overdue-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.4);
    overflow: hidden;
    display: flex;

    .overdue-text {
        position: absolute;
        top: 10px;
        left: -30px;
        width: 100px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        background-color: #86909c;
        transform: rotate(-45deg);
    }

    .aux-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        aspect-ratio: 1;
        border-radius: 8px;
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon-area {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.36);
            border-radius: 8px;
        }
    }
}
</style>

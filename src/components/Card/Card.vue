<!--
 * @Author: Lemon C
 * @Date: 2024-09-22 11:31:42
 * @LastEditTime: 2024-09-22 16:14:59
-->
<template>
    <view class="sup-card">
        <view class="top-area"></view>
        <view class="bottom-area">
            <text class="bottom-title">进了房间四点零分里的飞机螺丝钉看见发</text>
            <text class="bottom-time">1分钟前 查看</text>
        </view>
        <view class="collect-area"></view>
    </view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref } from 'vue';
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
    border-radius: 5px;
    display: flex;
    flex-shrink: 0;
}

.bottom-area {
    position: relative;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
    overflow: hidden;

    .bottom-title {
        position: relative;
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .bottom-time {
        position: relative;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.collect-area {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 24px;
    height: 24px;
    background-color: hotpink;
}
</style>

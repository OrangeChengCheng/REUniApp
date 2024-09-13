<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-09-13 17:14:32
-->
<template>
    <base-view :nav_bar_item_back="false" :nav_bar_color="`--color-main-bg`">
        <view class="sup-card-page">
            <view class="input-box">
                <view class="input-card" @click="input_click">输入</view>
                <view class="scan-card" @click="scan_click">扫码</view>
            </view>
        </view>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import { getEngineFunctionList } from '@/service/interface';
import { useCardStore } from '@/stores/card';

const card_store = useCardStore();

const input_click = () => {
    getEngineFunctionList();
};

const scan_click = () => {
    if (Object.prototype.hasOwnProperty.call(uni, 'getAppAuthorizeSetting')) {
        const appAuthorizeSetting = uni.getAppAuthorizeSetting();
        if (appAuthorizeSetting.cameraAuthorized && appAuthorizeSetting.cameraAuthorized.length) {
            // 相机权限
            if (appAuthorizeSetting.cameraAuthorized == 'denied') {
                // 用户拒绝了相机的使用权限，需要自行打开
                uni.showToast({ title: '您已拒绝了授权，请前往设置进行打开', icon: 'none' });
            } else if (appAuthorizeSetting.cameraAuthorized == 'not determined') {
                // 用户未授权相机的使用权限
                uniapp_getScanAuthorize();
            } else if (appAuthorizeSetting.cameraAuthorized == 'authorized') {
                // 用户已授权相机的使用权限
                uniapp_scanQRCode();
            }
        }
    }
};

// MARK uni-app 获取相机授权信息
const uniapp_getScanAuthorize = () => {
    if (!Object.prototype.hasOwnProperty.call(uni, 'authorize')) {
        uni.showToast({ title: '授权获取失败', icon: 'none' });
        return;
    }
    // 获取相机授权
    uni.authorize({
        scope: 'scope.camera',
        success() {
            // 用户同意授权
            console.log('相机授权成功');
            scanQRCode();
        },
        fail() {
            // 用户拒绝授权
            console.log('相机授权失败');
            uni.showToast({ title: '您拒绝了授权', icon: 'none' });
        },
    });
};

// MARK uni-app 相机扫码
const uniapp_scanQRCode = () => {
    if (!Object.prototype.hasOwnProperty.call(uni, 'scanCode')) {
        uni.showToast({ title: '扫码失败', icon: 'none' });
        return;
    }
    // 扫二维码
    uni.scanCode({
        success: (res) => {
            console.log('扫码内容：' + res.result);
        },
        fail: (err) => {
            console.log('扫码失败', err);
            uni.showToast({ title: err.errMsg, icon: 'none' });
        },
    });
};

</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-card-page {
    position: relative;
    display: flex;
    flex: 1;
    background-color: var(--color-main-bg);
    flex-direction: column;
    overflow-y: auto;

    .input-box {
        position: relative;
        width: 100%;
        height: 150rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .input-card,
        .scan-card {
            position: relative;
            height: calc(100% - 40rpx);
            aspect-ratio: 1;
            background-color: var(--color-white);
            box-shadow: 0rpx 6rpx 12rpx rgba(174, 209, 235, 0.16);
            border-radius: 8rpx;
            margin: 10rpx 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>

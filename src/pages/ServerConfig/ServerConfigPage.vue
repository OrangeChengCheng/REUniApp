<!--
 * @Author: Lemon C
 * @Date: 2025-05-21 16:18:51
 * @LastEditTime: 2025-05-21 16:43:03
-->
<template>
    <base-view :nav_bar="true" :nav_bar_title="title" :nav_bar_color="`--color-white`">
        <view class="config-container">
            <view class="modules-item">
                <text class="modules-title">当前配置</text>
                <textarea class="modules-textarea modules-textarea-min" :value="curr_serverUrl" disabled :maxlength="-1" auto-height />
            </view>
            <view class="modules-item">
                <text class="modules-title">项目名称</text>
                <textarea
                    class="modules-textarea modules-textarea-min"
                    :value="private_serverUrl"
                    placeholder="请输入服务配置地址"
                    @blur="serverUrl_textarea_blur"
                    :maxlength="-1"
                    auto-height />
            </view>
            <view class="btn-group">
                <el-button class="cancel" @click="reset_serverUrl">重置配置</el-button>
                <el-button class="confirm" type="primary" @click="change_serverUrl">切换配置</el-button>
            </view>
        </view>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BaseView from '@/components/Base/BaseView.vue';

const url = ref('');
const title = ref('');
const private_serverUrl = ref('');
const curr_serverUrl = ref('');

// 获取页面跳转时传递的url参数
onLoad((options) => {
    if (options && options.title) {
        title.value = options.title;
    }
});

onMounted(() => {
    curr_serverUrl.value = uni.$window.serverUrl;
});

// MARK Textarea 失去焦点 服务配置地址
const serverUrl_textarea_blur = (e: any) => {
    private_serverUrl.value = e.detail.value;
};

// MARK Click 重置服务配置地址
const reset_serverUrl = (e: any) => {};

// MARK Click 切换服务配置地址
const change_serverUrl = (e: any) => {};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.config-container {
    position: relative;
    width: 100%;
    display: flex;
    padding: 0px 12px;
    box-sizing: border-box;
    background-color: var(--color-white);

    display: flex;
    flex-direction: column;

    .modules-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 10px;
        width: 100%;
        overflow: hidden;
        background-color: var(--color-white);

        .modules-title {
            position: relative;
            width: 100%;
            height: 24px;
            display: flex;
            align-items: center;
            font-size: 12px;
            line-height: 20px;
            color: var(--color-main-black);
        }

        .modules-textarea {
            position: relative;
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            min-height: 50px;
            margin-top: 5px;
            font-size: 14px;
            color: var(--color-main-black);
            line-height: 20px;
            border-radius: 4px;
            border: 1px solid var(--color-main-black);
        }
        .modules-textarea-min {
            min-height: 20px;
        }
    }

    .btn-group {
        position: relative;
        display: flex;
        margin-top: 100px;
        width: 100%;
        height: 36px;
        justify-content: flex-end;
        align-items: center;

        .cancel {
            position: relative;
            width: 100px;
            height: 100%;
            font-size: 14px;
            color: #86909c;
            line-height: 27px;
        }

        .confirm {
            position: relative;
            width: 100px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(270deg, #0085ff 0%, #325ef6 100%);
            border-radius: 32px 32px 32px 32px;
            font-size: 14px;
            color: #ffffff;
            line-height: 27px;
        }
    }
}
</style>

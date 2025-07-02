<!--
 * @Author: Lemon C
 * @Date: 2025-05-21 16:18:51
 * @LastEditTime: 2025-07-02 11:15:42
-->
<template>
    <base-view
        :nav_bar="true"
        :nav_bar_title="title"
        :nav_bar_item_right_text="'恢复默认'"
        :nav_bar_color="`--color-white`"
        :nav_bar_item_callback="nav_bar_item_callback">
        <view class="config-container">
            <view class="text-area">
                <view class="text-1">服务地址</view>
                <view class="text-2">（服务配置完成后需要重启应用）</view>
            </view>
            <view class="input-area">
                <textarea
                    class="input-textarea"
                    :value="private_serverUrl"
                    placeholder="请输入服务配置地址"
                    @focus="textarea_focus"
                    @blur="serverUrl_textarea_blur"
                    @input="textarea_input"
                    :maxlength="-1"
                    auto-height />
                <view class="clear-area" v-if="textarea_clear_btn && private_serverUrl.length > 0" @click="clear_inputText">X</view>
            </view>
            <view class="btn-area">
                <el-button
                    :class="`saveAction ${!private_serverUrl.length ? 'saveAction-display' : ''}`"
                    type="primary"
                    :disabled="!private_serverUrl.length"
                    @click="change_serverUrl"
                    >保存并重启应用</el-button
                >
            </view>
        </view>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BaseView from '@/components/Base/BaseView.vue';

const title = ref('');
const private_serverUrl = ref('');
const textarea_clear_btn = ref(false);

// 获取页面跳转时传递的url参数
onLoad((options) => {
    if (options && options.title) {
        title.value = options.title;
    }
});

onMounted(() => {
    private_serverUrl.value = uni.get_serverUrl();
});

// MARK NavItemClick 导航栏点击
const nav_bar_item_callback = (type: any) => {
    if (type == 'nav-bar-item-right-text') {
        uni.update_serverUrl('');
        private_serverUrl.value = uni.get_serverUrl();
        textarea_clear_btn.value = false;
    }
};

// MARK Textarea 输入框聚焦
const textarea_focus = (e: any) => {
    textarea_clear_btn.value = true;
};

// MARK Textarea 输入框输入
const textarea_input = (e: any) => {
    textarea_clear_btn.value = true;
};

// MARK Textarea 失去焦点 服务配置地址
const serverUrl_textarea_blur = (e: any) => {
    private_serverUrl.value = e.detail.value;
};

// MARK Click 切换服务配置地址
const change_serverUrl = (e: any) => {
    if (!private_serverUrl.value.length) {
        uni.showToast({ title: '请输入服务配置地址', icon: 'none' });
        return;
    }
    uni.update_serverUrl(private_serverUrl.value);
    textarea_clear_btn.value = false;
};

// MARK Click 切换服务配置地址
const clear_inputText = () => {
    private_serverUrl.value = '';
};
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

    .text-area {
        position: relative;
        margin-top: 20px;
        display: flex;
        align-items: flex-end;

        .text-1 {
            position: relative;
            margin-left: 10px;
            font-size: 18px;
            color: var(--color-main-black);
        }

        .text-2 {
            position: relative;
            margin-left: 5px;
            margin-bottom: 1px;
            font-size: 14px;
            color: var(--color-main-gray);
        }
    }

    .input-area {
        position: relative;
        margin-top: 20px;
        height: 120px;
        border-radius: 10px;
        background-color: #f7f7f7;

        .input-textarea {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 10px;
            box-sizing: border-box;
            font-size: 18px;
            color: var(--color-main-black);
        }

        .clear-area {
            position: absolute;
            right: 10px;
            bottom: 8px;
            width: 20px;
            height: 20px;
            background-color: red;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: white;
            font-size: 12px;
            background-color: #cdcdcd;
            padding-bottom: 2px;
            box-sizing: border-box;
        }
    }

    .btn-area {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 50px;
        height: 50px;
        padding: 0 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;

        .saveAction {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #005ee5;
        }
        .saveAction-display {
            background-color: #7babef;
        }
    }
}
</style>

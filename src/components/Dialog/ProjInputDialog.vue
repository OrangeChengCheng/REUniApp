<!--
 * @Author: Lemon C
 * @Date: 2024-08-27 17:04:55
 * @LastEditTime: 2024-09-19 18:23:03
-->
<template>
    <div class="sup-proj-input-dialog" v-if="dialog_visible">
        <transition name="content_box_fade">
            <div class="content-box" v-if="content_box_visible">
                <view class="modules-item">
                    <text class="modules-title">分享链接</text>
                    <textarea
                        class="modules-textarea"
                        :value="shareUrl"
                        placeholder="请输入分享链接"
                        @blur="shareUrl_textarea_blur"
                        :maxlength="-1"
                        auto-height />
                </view>
                <view class="btn-group">
                    <el-button type="primary" @click="confirm_click">查看模型</el-button>
                    <el-button @click="bg_click">取消</el-button>
                </view>
            </div>
        </transition>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
    dialog_shareUrl: {
        type: String,
        default: '',
    },
    dialog_ProjInputCallBack: {
        type: Function,
        default: () => {},
    },
});

const dialog_visible = ref(false);
const content_box_visible = ref(false);
const shareUrl = ref('');

watch([() => props.dialog_shareUrl], (val) => {
    shareUrl.value = props.dialog_shareUrl;
});

onMounted(() => {
    shareUrl.value = props.dialog_shareUrl;
});

// MARK Expose 隐藏
const show_dialog = () => {
    dialog_visible.value = true;
    nextTick(() => {
        content_box_visible.value = true;
    });
};

// MARK Expose 隐藏
const hide_dialog = () => {
    content_box_visible.value = false;
    setTimeout(() => {
        dialog_visible.value = false;
    }, 200);
};

// MARK Click 底部点击
const bg_click = () => {
    hide_dialog();
};

// MARK Textarea 失去焦点 resourcesAddress
const shareUrl_textarea_blur = (e: any) => {
    shareUrl.value = e.detail.value;
};

// MARK Click 确定
const confirm_click = () => {
    if (!shareUrl.value || !shareUrl.value.length) {
        uni.showToast({ title: '请填写分享链接', icon: 'none' });
        return;
    }
    hide_dialog();
    props.dialog_ProjInputCallBack({ shareUrl: shareUrl.value });    
};

// MARK Expose 导出方法
defineExpose({
    show_dialog,
    hide_dialog,
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-proj-input-dialog {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
    display: flex;
    justify-content: center;
    align-items: center;

    .content-box {
        position: relative;
        width: 90%;
        height: 70%;
        overflow-y: auto;
        border-radius: 10rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 40rpx 20rpx;
        box-sizing: border-box;
        transition: opacity 0.5s ease-in-out;
        z-index: 99;
        background-color: var(--color-white);

        .modules-item {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 30rpx;
            padding: 20rpx 20rpx;
            box-sizing: border-box;
            width: 100%;
            min-height: 100rpx;
            overflow: hidden;
            box-shadow: 0rpx 6rpx 12rpx rgba(93, 146, 219, 0.16);
            border-radius: 8rpx;
            background-color: var(--color-white);

            .modules-title {
                position: relative;
                width: 100%;
                height: 50rpx;
                display: flex;
                align-items: center;
            }

            .modules-textarea {
                position: relative;
                width: 100%;
                // min-height: 80rpx !important;
                padding: 5px;
                box-sizing: border-box;
                min-height: 40rpx;
                margin-top: 20rpx;
                border: 1px solid var(--color-main-bg);
                border-radius: 8rpx;
                font-size: 28rpx;
                color: var(--color-main-black);
                line-height: 30rpx;
            }
        }
    }

    .btn-group {
        position: relative;
        display: flex;
        margin-top: auto;
        margin-bottom: 0;
        width: 100%;
        height: 80rpx;
        padding: 0 20rpx;
        box-sizing: border-box;
        justify-content: flex-end;
        align-items: center;
    }

    .content_box_fade-enter-active,
    .content_box_fade-leave-active {
        transition: opacity 0.5s;
    }

    .content_box_fade-enter-from,
    .content_box_fade-leave-to {
        opacity: 0;
    }
}
</style>

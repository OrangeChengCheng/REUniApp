<!--
 * @Author: Lemon C
 * @Date: 2024-08-27 17:04:55
 * @LastEditTime: 2024-09-25 17:13:41
-->
<template>
    <div class="sup-url-input-dialog" v-if="dialog_visible">
        <transition name="content_box_fade">
            <div class="content-box" v-if="content_box_visible">
                <view class="icon-area">
                    <icon-font name="pop_icon_link_default" size="20px" color="--color-main-blue"></icon-font>
                </view>
                <view class="modules-item">
                    <text class="modules-title">项目名称</text>
                    <textarea
                        class="modules-textarea modules-textarea-min"
                        :value="projName"
                        placeholder="请输入项目名称"
                        @blur="projName_textarea_blur"
                        :maxlength="-1"
                        auto-height />
                </view>
                <view class="modules-item">
                    <text class="modules-title">分享链接</text>
                    <textarea
                        class="modules-textarea"
                        :disabled="dialog_shareUrl_disabled"
                        :value="shareUrl"
                        placeholder="请输入分享链接"
                        @blur="shareUrl_textarea_blur"
                        :maxlength="-1"
                        auto-height />
                </view>
                <view class="btn-group">
                    <el-button class="cancel" @click="bg_click">取消</el-button>
                    <el-button class="confirm" type="primary" @click="confirm_click">{{ `${dialog_revise ? '确认修改' : '查看模型'}` }}</el-button>
                </view>
            </div>
        </transition>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
    dialog_projName: {
        type: String,
        default: '',
    },
    dialog_shareUrl: {
        type: String,
        default: '',
    },
    dialog_shareUrl_disabled: {
        type: Boolean,
        default: true,
    },
    dialog_revise: {
        type: Boolean,
        default: false,
    },
    dialog_UrlInputCallBack: {
        type: Function,
        default: () => {},
    },
});

const dialog_visible = ref(false);
const content_box_visible = ref(false);
const projName = ref('');
const shareUrl = ref('');

watch([() => props.dialog_projName, () => props.dialog_shareUrl], () => {
    projName.value = props.dialog_projName;
    shareUrl.value = props.dialog_shareUrl;
});

onMounted(() => {
    projName.value = props.dialog_projName;
    shareUrl.value = props.dialog_shareUrl;
});

// MARK uni-app  清空粘贴板
const uniapp_clearClipboard = () => {
    uni.setClipboardData({
        data: '',
        success: () => {},
    });
};

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
        uniapp_clearClipboard();
    }, 200);
};

// MARK Click 底部点击
const bg_click = () => {
    hide_dialog();
};

// MARK Textarea 失去焦点 分享地址
const shareUrl_textarea_blur = (e: any) => {
    shareUrl.value = e.detail.value;
    if (shareUrl.value.length > 0 && !props.dialog_shareUrl_disabled && projName.value.length <= 0) {
        const urlData = uni.$tool.url_handle(shareUrl.value);
        if (urlData) {
            projName.value = urlData.projName;
        }
    }
};

// MARK Textarea 失去焦点 项目名称
const projName_textarea_blur = (e: any) => {
    projName.value = e.detail.value;
};

// MARK Click 确定
const confirm_click = () => {
    if (projName.value.length <= 0) {
        uni.showToast({ title: '请填写项目名称', icon: 'none' });
        return;
    }
    if (shareUrl.value.length <= 0) {
        uni.showToast({ title: '请填写分享链接', icon: 'none' });
        return;
    }
    hide_dialog();
    props.dialog_UrlInputCallBack({ shareUrl: shareUrl.value, projName: projName.value });
};

// MARK Expose 导出方法
defineExpose({
    show_dialog,
    hide_dialog,
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-url-input-dialog {
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
    overflow-y: auto;

    .content-box {
        position: relative;
        width: 320px;
        height: 430px;
        overflow-y: auto;
        border-radius: 24px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 15px 24px;
        box-sizing: border-box;
        transition: opacity 0.5s ease-in-out;
        z-index: 99;
        background-color: var(--color-white);

        .icon-area {
            position: relative;
            width: 20px;
            height: 20px;
        }

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
    }

    .btn-group {
        position: relative;
        display: flex;
        margin-top: auto;
        margin-bottom: 0;
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

    .content_box_fade-enter-active,
    .content_box_fade-leave-active {
        transition: opacity 0.5s;
    }

    .content_box_fade-enter-from,
    .content_box_fade-leave-to {
        opacity: 0;
    }

    .el-button {
        border-color: transparent;
    }
}
</style>

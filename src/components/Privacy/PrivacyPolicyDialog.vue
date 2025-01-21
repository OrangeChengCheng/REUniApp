<template>
    <div class="sup-privacy-policy-dialog" v-if="dialog_visible">
        <transition name="content_box_fade">
            <div class="content-box" v-if="content_box_visible">
                <view class="title">
                    <text>用户协议与隐私政策</text>
                </view>
                <view class="policy-box">
                    <iframe src="https://demo.bjblackhole.com/privateInfo.html" frameborder="0"></iframe>
                </view>
                <view class="btn-group">
                    <el-button class="cancel" type="danger" @click="cancel_click">不同意</el-button>
                    <el-button class="confirm" type="success" @click="confirm_click">同意并继续</el-button>
                </view>
            </div>
        </transition>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useStateStore } from '@/stores/state';

const state_store = useStateStore();

const dialog_visible = ref(false);
const content_box_visible = ref(false);

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
    }, 0);
};

// MARK Click 取消
const cancel_click = () => {
    state_store.agreePolicyUpdate(false);
    hide_dialog();
};

// MARK Click 确认
const confirm_click = () => {
    state_store.agreePolicyUpdate(true);
    state_store.appLaunchOnceUpdate();
    hide_dialog();
};

// MARK Expose 导出方法
defineExpose({
    show_dialog,
    hide_dialog,
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-privacy-policy-dialog {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
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
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 15px 20px;
        box-sizing: border-box;
        transition: opacity 0.5s ease-in-out;
        z-index: 99;
        background-color: var(--color-white);

        .title {
            position: relative;
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .policy-box {
            position: relative;
            display: flex;
            flex: 1;
            padding-bottom: 20px;
            box-sizing: border-box;

            iframe {
                position: relative;
                width: 100%;
                height: 100%;
            }
        }

        .btn-group {
            position: relative;
            display: flex;
            margin-top: auto;
            margin-bottom: 0;
            width: 100%;
            height: 36px;
            justify-content: center;
            align-items: center;

            .cancel {
                position: relative;
                margin-right: 40px;
                width: 100px;
                height: 100%;
                font-size: 14px;
                color: #ffffff;
            }

            .confirm {
                position: relative;
                width: 100px;
                height: 100%;
                font-size: 14px;
                color: #ffffff;
            }
        }
    }

    .el-button {
        border-color: transparent;
    }
}
</style>

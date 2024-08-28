<!--
 * @Author: Lemon C
 * @Date: 2024-08-27 15:28:47
 * @LastEditTime: 2024-08-27 17:03:57
-->
<template>
    <div class="sup-sel-face-num-dialog" v-if="dialog_visible" @click.self="bg_click">
        <transition name="content_box_fade">
            <div class="content-box" v-if="content_box_visible">
                <text>渲染最大面数</text>
                <radio-group @change="radioChange" class="radio-group">
                    <view class="radio-box">
                        <label><radio value="1000000">100 万</radio></label>
                        <label><radio value="1500000" :checked="true">150 万</radio></label>
                    </view>
                    <view class="radio-box">
                        <label><radio value="2000000">200 万</radio></label>
                        <label><radio value="5000000">500 万</radio></label>
                    </view>
                </radio-group>
                <view>
                    <el-button type="primary" @click="confirm_click">确认</el-button>
                    <el-button @click="bg_click">取消</el-button>
                </view>
            </div>
        </transition>
    </div>
</template>

// MOD-- JavaScript
<script setup>
import { ref, nextTick } from 'vue';

const props = defineProps({
    dialog_SelFaceNumCallBack: Function,
});

const dialog_visible = ref(false);
const content_box_visible = ref(false);
const faceNum = ref(1500000);

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

// MARK Click 确定
const confirm_click = () => {
    props.dialog_SelFaceNumCallBack(faceNum.value);
    hide_dialog();
};

// MARK uni-app 点击
const radioChange = (e) => {
    faceNum.value = e.detail.value;
};

// MARK Expose 导出方法
defineExpose({
    show_dialog,
    hide_dialog,
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-sel-face-num-dialog {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;

    .content-box {
        position: relative;
        width: 80%;
        height: 350rpx;
        border-radius: 10rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30rpx;
        box-sizing: border-box;
        background-color: var(--color-white);
        transition: opacity 0.5s ease-in-out;
        z-index: 9999;

        .uni-list,
        .radio-group {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20rpx;
            width: 60%;
            flex: 1;
        }
        .radio-box {
            position: relative;
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 50%;

            .el-radio {
                position: relative;
                width: 40%;
                height: 40%;
            }
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
}
</style>

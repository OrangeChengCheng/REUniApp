<!--
 * @Author: Lemon C
 * @Date: 2024-08-27 17:04:55
 * @LastEditTime: 2024-08-27 19:15:24
-->
<template>
    <div class="sup-custom-input-dialog" v-if="dialog_visible">
        <transition name="content_box_fade">
            <div class="content-box" v-if="content_box_visible">
                <view class="modules-item">
                    <text class="modules-title">数据集标识</text>
                    <textarea
                        class="modules-textarea"
                        :value="dataSetId"
                        placeholder="请输入数据集标识（唯一）"
                        @blur="dataSetId_textarea_blur"
                        auto-height />
                </view>
                <view class="modules-item">
                    <text class="modules-title">资源地址</text>
                    <textarea
                        class="modules-textarea"
                        :value="resourcesAddress"
                        placeholder="请输入资源地址"
                        @blur="resourcesAddress_textarea_blur"
                        auto-height />
                </view>
                <view class="modules-item">
                    <text class="modules-title">渲染最大面数</text>
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
<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
    dialog_dataSetId: String,
    dialog_resourcesAddress: String,
    dialog_CustomInputCallBack: Function,
});

const dialog_visible = ref(false);
const content_box_visible = ref(false);
const dataSetId = ref('');
const resourcesAddress = ref('');
const faceNum = ref(1500000);

watch([() => props.dialog_dataSetId, () => props.dialog_resourcesAddress], (val) => {
    dataSetId.value = props.dialog_dataSetId;
    resourcesAddress.value = props.dialog_resourcesAddress;
});

onMounted(() => {
    dataSetId.value = props.dialog_dataSetId;
    resourcesAddress.value = props.dialog_resourcesAddress;
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

// MARK Textarea 失去焦点 dataSetId
const dataSetId_textarea_blur = (e) => {
    dataSetId.value = e.detail.value;
};

// MARK Textarea 失去焦点 resourcesAddress
const resourcesAddress_textarea_blur = (e) => {
    resourcesAddress.value = e.detail.value;
};

// MARK Click 确定
const confirm_click = () => {
    if (!dataSetId.value || !dataSetId.value.length) {
        uni.showToast({ title: '请填写数据集标识', icon: 'none' });
        return;
    }
    if (!resourcesAddress.value || !resourcesAddress.value.length) {
        uni.showToast({ title: '请填写资源地址', icon: 'none' });
        return;
    }
    props.dialog_CustomInputCallBack({ dataSetId: dataSetId.value, resourcesAddress: resourcesAddress.value, faceNum: faceNum.value });
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
.sup-custom-input-dialog {
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
                margin-top: 20rpx;

                .el-radio {
                    position: relative;
                    width: 40%;
                    height: 40%;
                }
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

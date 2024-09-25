<!--
 * @Author: Lemon C
 * @Date: 2024-08-27 17:04:55
 * @LastEditTime: 2024-09-25 19:32:17
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
                <view class="btn-group">
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
    dialog_SampleInputCallBack: Function,
});

const dialog_visible = ref(false);
const content_box_visible = ref(false);
const dataSetId = ref('');

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

// MARK Click 确定
const confirm_click = () => {
    if (!dataSetId.value || !dataSetId.value.length) {
        uni.showToast({ title: '请填写数据集标识', icon: 'none' });
        return;
    }
    props.dialog_SampleInputCallBack({ dataSetId: dataSetId.value });
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
        height: 200px;
        overflow-y: auto;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 20px 10px;
        box-sizing: border-box;
        transition: opacity 0.5s ease-in-out;
        z-index: 99;
        background-color: var(--color-white);

        .modules-item {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px 10px;
            box-sizing: border-box;
            width: 100%;
            min-height: 50px;
            overflow: hidden;
            box-shadow: 0px 3px 6px rgba(93, 146, 219, 0.16);
            border-radius: 10px;
            background-color: var(--color-white);

            .modules-title {
                position: relative;
                width: 100%;
                height: 25px;
                display: flex;
                align-items: center;
            }

            .modules-textarea {
                position: relative;
                width: 100%;
                padding: 5px;
                box-sizing: border-box;
                min-height: 20px;
                margin-top: 10px;
                border: 1px solid var(--color-main-bg);
                border-radius: 8px;
                font-size: 14px;
                color: var(--color-main-black);
                line-height: 15px;
            }
        }
    }

    .btn-group {
        position: relative;
        display: flex;
        margin-top: auto;
        margin-bottom: 0;
        width: 100%;
        height: 40px;
        padding: 0 10px;
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

<template>
    <div class="sup-proj-input-dialog" v-if="dialog_visible">
        <transition name="content_box_fade">
            <div class="content-box" v-if="content_box_visible">
                <text class="title-area">{{ `${dialog_configUrl.length > 0 ? '修改配置' : '添加配置'}` }}</text>
                <view class="input-area">
                    <text class="text">{{ `${dialog_configUrl.length > 0 ? '修改配置地址' : '添加配置地址'}` }}</text>
                    <textarea
                        class="textarea-box"
                        :value="serverConfigUrl"
                        placeholder="请输入配置地址"
                        @blur="eltextarea_blur"
                        :maxlength="-1"
                        auto-height />
                </view>
                <view class="btn-group">
                    <el-button class="cancel" @click="bg_click">取消</el-button>
                    <el-button class="confirm" type="primary" @click="confirm_click">保存</el-button>
                </view>
            </div>
        </transition>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
    dialog_configUrl: {
        type: String,
        default: '',
    },
    dialog_confirmCallBack: {
        type: Function,
        default: () => {},
    },
});

const dialog_visible = ref(false);
const content_box_visible = ref(false);
const serverConfigUrl = ref('');

watch([() => props.dialog_configUrl], () => {
    serverConfigUrl.value = props.dialog_configUrl;
});

onMounted(() => {
    serverConfigUrl.value = props.dialog_configUrl;
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

// MARK Textarea 失去焦点
const eltextarea_blur = (e: any) => {
    serverConfigUrl.value = e.detail.value;
};

// MARK Click 确定
const confirm_click = () => {
    if (!serverConfigUrl.value.length) {
        uni.showToast({ title: '请填写配置地址', icon: 'none' });
        return;
    }
    hide_dialog();
    props.dialog_confirmCallBack(serverConfigUrl.value);
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
        height: 300px;
        overflow-y: auto;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 20px 24px;
        box-sizing: border-box;
        transition: opacity 0.5s ease-in-out;
        z-index: 99;
        background-color: var(--color-white);

        .title-area {
            position: relative;
            width: 100%;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .input-area {
            position: relative;
            margin-top: 20px;
            display: flex;
            width: 100%;
            flex: 1;
            flex-direction: column;

            .text {
                position: relative;
                width: 100%;
                height: 20px;
                font-size: 12px;
                color: #1d2129;
                flex-shrink: 0;
            }

            .textarea-box {
                position: relative;
                display: flex;
                margin-top: 5px;
                width: 100%;
                flex: 1;
                border-radius: 2px;
                border: 1px dashed #0e6bfe;
                padding: 10px;
                box-sizing: border-box;
            }
        }
    }

    .btn-group {
        position: relative;
        display: flex;
        flex-shrink: 0;
        margin-top: 30px;
        width: 100%;
        height: 36px;
        justify-content: flex-end;
        align-items: center;

        .confirm,
        .cancel {
            position: relative;
            width: 100px;
            margin-right: 5px;
            border-radius: 32px;
        }
        .confirm {
            background: linear-gradient(270deg, #0085ff 0%, #325ef6 100%);
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

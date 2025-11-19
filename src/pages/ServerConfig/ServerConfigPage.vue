<!--
 * @Author: Lemon C
 * @Date: 2025-05-21 16:18:51
 * @LastEditTime: 2025-08-04 15:34:47
-->
<template>
    <base-view :nav_bar="true" :nav_bar_title="title" :nav_bar_color="`--color-white`">
        <view class="config-container">
            <view class="text-area">
                <view class="text-1">服务地址</view>
                <view class="text-2">（分享数据来源白名单）</view>
            </view>
            <view class="list-area" @scroll="scroll_listen" @click.stop="click_list">
                <view
                    class="swipe-container"
                    v-for="(item, index) in serverWhiteList"
                    :key="index"
                    @touchstart="(e) => touch_start(e, index)"
                    @touchmove="(e) => touch_move(e, index)"
                    @touchend="touch_end(index)">
                    <view
                        class="card-area"
                        :style="{
                            transform: `translateX(${swipe_offset[index]}px)`,
                        }"
                        @click.stop="click_card(item)"
                        >{{ item.url }}
                    </view>
                    <view
                        class="delete-area"
                        :style="{
                            background: `${swipe_offset[index] < 0 ? '#d54941' : 'transparent'}`,
                        }"
                        @click.stop="click_delete(index)">
                        <icon-font class="delete-icon" name="shanchu" size="18px" color="#ffffff"></icon-font>
                    </view>
                </view>
            </view>
            <view class="btn-area">
                <el-button class="saveAction" type="primary" @click="click_addServerConfig">添加配置</el-button>
            </view>
        </view>
    </base-view>
    <server-config-input-dialog
        ref="ref_serverConfig_dialog"
        :dialog_configUrl="editConfigUrl"
        :dialog_confirmCallBack="dialog_confirmCallBack"></server-config-input-dialog>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BaseView from '@/components/Base/BaseView.vue';
import ServerConfigInputDialog from '@/components/ServerConfig/ServerConfigInputDialog.vue';

const ref_serverConfig_dialog = ref<InstanceType<typeof ServerConfigInputDialog> | null>(null);
const title = ref('');

const editConfigUrl = ref('');
const serverWhiteList = ref<any[]>([]);

const swipe_offset = reactive<number[]>(new Array(serverWhiteList.value.length).fill(0)); // 滑动相关状态：记录每个 card 的位移
const startX = ref(0); // 记录触摸起始位置
const isAnimating = reactive<boolean[]>(new Array(serverWhiteList.value.length).fill(false)); // 用于标记是否正在动画过程中
const isScrolling = ref(false);

// 获取页面跳转时传递的url参数
onLoad((options) => {
    if (options && options.title) {
        title.value = options.title;
    }
    const whiteList = uni.$service.getServerWhiteList();
    serverWhiteList.value = whiteList;
});

// MARK Click 添加服务配置白名单地址
const click_card = (e: any) => {
    editConfigUrl.value = e.url;
    ref_serverConfig_dialog.value?.show_dialog();
};

// MARK Click 添加服务配置白名单地址
const click_addServerConfig = (e: any) => {
    editConfigUrl.value = '';
    ref_serverConfig_dialog.value?.show_dialog();
};

// MARK Click 输入保存
const dialog_confirmCallBack = (e: any) => {
    editConfigUrl.value = '';
    if (e.length > 0) {
        const find: any = serverWhiteList.value.find((item: any) => item.url === e);
        if (find) {
            uni.showToast({ title: '配置已存在', icon: 'none' });
            return;
        }
        serverWhiteList.value.push({ url: e, type: 3 });
        uni.$service.updateServerWhiteList(serverWhiteList.value);
    }
};

// MARK Click 列表点击
const click_list = () => {
    // 重置所有卡片位移
    swipe_offset.forEach((_, i) => (swipe_offset[i] = 0));
    // 重置所有动画标记
    isAnimating.forEach((_, i) => (isAnimating[i] = false));
};

// MARK Click 删除
const click_delete = (index: any) => {
    uni.showModal({
        title: '提示',
        content: '是否删除配置',
        success: function (res) {
            if (res.confirm) {
                serverWhiteList.value.splice(index, 1);
                swipe_offset.splice(index, 1);
                isAnimating.splice(index, 1);
                uni.$service.updateServerWhiteList(serverWhiteList.value);
            }
        },
    });
};

// MARK Scroll 滚动监听
const scroll_listen = () => {
    isScrolling.value = true;
    // 重置所有卡片位移
    swipe_offset.forEach((_, i) => (swipe_offset[i] = 0));
    // 重置所有动画标记
    isAnimating.forEach((_, i) => (isAnimating[i] = false));
    // 延迟标记为“未滚动”（避免快速滚动+触摸冲突）
    setTimeout(() => {
        isScrolling.value = false;
    }, 100);
};

// MARK Touch 触摸开始
const touch_start = (e: any, index: any) => {
    if (isScrolling.value) return;
    if (swipe_offset[index] === -50 || isAnimating[index]) return;
    startX.value = e.touches[0].clientX;
    // 重置其他 card 的位移（确保同一时间只有一个 card 滑动）
    swipe_offset.forEach((_, i) => i !== index && (swipe_offset[i] = 0));
    isAnimating.forEach((_, i) => i !== index && (isAnimating[i] = false));
};

// MARK Touch 触摸移动
const touch_move = (e: any, index: any) => {
    if (isScrolling.value) return;
    if (swipe_offset[index] === -50 || isAnimating[index]) return;
    const moveX = e.touches[0].clientX - startX.value;
    if (moveX < 0) {
        isAnimating[index] = true;
    }
};

// MARK Touch 触摸结束
const touch_end = (index: any) => {
    if (isScrolling.value) return;
    if (swipe_offset[index] === -50 || !isAnimating[index]) return;
    swipe_offset[index] = -50;
    setTimeout(() => {
        isAnimating[index] = false;
    }, 300);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.config-container {
    position: relative;
    width: 100%;
    display: flex;
    background-color: var(--color-white);

    display: flex;
    flex-direction: column;

    .text-area {
        position: relative;
        margin-top: 20px;
        width: 100%;
        height: 30px;
        display: flex;
        align-items: flex-end;
        flex-shrink: 0;
        padding: 0px 12px;
        box-sizing: border-box;

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

    .list-area {
        position: relative;
        margin-top: 20px;
        margin-bottom: 20px;
        display: flex;
        width: 100%;
        flex: 1;
        flex-direction: column;
        overflow-y: auto;
        padding: 0px 12px;
        box-sizing: border-box;

        .swipe-container {
            position: relative;
            margin-top: 20px;
            width: 100%;
            height: 80px;
            display: flex;
            flex-shrink: 0;
            border-radius: 8px;
            overflow: hidden;

            &:first-child {
                margin-top: 0px;
            }

            &:hover {
                border: 1px solid #005fe5;
            }

            // Card 内容区：需要位移，用 transition 做动画
            .card-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                border-radius: 8px;
                padding: 16px;
                box-sizing: border-box;
                background-color: #f0f1f2;
                border: 1px solid transparent;
                transition: transform 0.3s ease; /* 滑动动画 */
                z-index: 2; /* 确保内容区在删除区上层 */
                overflow: hidden;
            }

            // 删除区：固定在右侧，宽度 80px（与位移对应）
            .delete-area {
                position: absolute;
                right: 0;
                top: 0;
                width: 80px;
                height: 100%;
                background: #d54941; /* 红色删除区 */
                display: flex;
                align-items: center;
                justify-content: flex-end;
                color: #fff;
                font-size: 14px;
                z-index: 1; /* 低于内容区，确保滑动时先露出 */
                transition: background 0.2s ease;

                .delete-icon {
                    position: relative;
                    margin-right: 15px;
                }
            }
        }
    }

    .btn-area {
        position: relative;
        width: 100%;
        height: 50px;
        margin-bottom: 50px;
        padding: 0 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0px 12px;
        box-sizing: border-box;

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

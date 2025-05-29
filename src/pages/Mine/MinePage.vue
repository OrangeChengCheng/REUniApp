<!--
 * @Author: Lemon C
 * @Date: 2025-02-13 10:55:26
 * @LastEditTime: 2025-05-21 16:22:02
-->
<template>
    <base-view :nav_bar="true" :nav_bar_item_back="false" :nav_bar_title="`我的`" :nav_bar_color="`--color-white`">
        <view class="sup-mine-page">
            <view class="list-container">
                <view class="list-item" v-for="(item, index) in type_list" :key="index" @click="handleItemClick(item)">
                    <icon-font :name="item.icon" size="24px" color="--color-main-blue"></icon-font>
                    <text class="item-name">{{ item.name }}</text>
                    <text class="item-detail" v-if="item.detailText && item.detail.length > 0">{{ item.detail }}</text>
                    <icon-font class="item-jump-icon" v-if="item.detailJump" name="nav_icon_back_default" size="24px" color="#86909C"></icon-font>
                </view>
            </view>
        </view>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';

const type_list = ref([
    {
        name: '用户协议',
        icon: 'a-personalpage_icon_useragreement',
        detailJump: true,
        jumpType: 1,
        detailJumpUrl: 'https://demo.bjblackhole.com/ServiceAgreement.html',
    },
    {
        name: '隐私政策',
        icon: 'a-privacypolicy',
        detailJump: true,
        jumpType: 1,
        detailJumpUrl: 'https://demo.bjblackhole.com/PrivacyPolicy.html',
    },
    {
        name: '服务配置',
        icon: 'a-personalpage_icon_updateinformation',
        detailJump: true,
        jumpType: 2,
    },
    { name: '应用版本', icon: 'a-personalpage_icon_updateinformation', detail: '1.0.6', detailJump: false, detailJumpUrl: '', detailText: true },
]);

const handleItemClick = (item: any) => {
    if (item.detailJump) {
        switch (item.jumpType) {
            case 1:
                {
                    uni.navigateTo({
                        url: `/pages/WebView/WebViewPage?title=${item.name}&url=${encodeURIComponent(item.detailJumpUrl)}`,
                    });
                }
                break;
            case 2:
                {
                    uni.navigateTo({
                        url: `/pages/ServerConfig/ServerConfigPage?title=${item.name}`,
                    });
                }
                break;
            default:
                break;
        }
    }
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-mine-page {
    position: relative;
    width: 100%;
    display: flex;
    padding: 0px 12px;
    box-sizing: border-box;
    background-color: var(--color-main-bg);

    .list-container {
        position: relative;
        margin-top: 16px;
        width: 100%;
        height: fit-content;
        padding: 0px 16px;
        box-sizing: border-box;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        background-color: var(--color-white);

        .list-item {
            position: relative;
            width: 100%;
            height: 56px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #e7e7e7;
            box-sizing: border-box;

            .item-name {
                position: relative;
                margin-left: 12px;
                margin-right: 16px;
                flex: 1;
            }

            .item-detail {
                position: relative;
                color: #86909c;
            }

            .item-jump-icon {
                position: relative;
                margin-left: 5px;
                transform: rotate(180deg);
            }

            &:last-child {
                border-bottom: 1px solid transparent;
            }
        }
    }
}
</style>

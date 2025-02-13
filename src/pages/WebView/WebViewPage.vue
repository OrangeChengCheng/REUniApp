<!--
 * @Author: Lemon C
 * @Date: 2025-02-13 17:07:32
 * @LastEditTime: 2025-02-13 17:41:44
-->
<template>
    <base-view :nav_bar="true" :nav_bar_title="title" :nav_bar_color="`--color-white`">
        <view class="webview-container">
            <iframe
                :src="url"
                frameborder="0"
                style="width: 100%; height: 100%"
                allow="fullscreen; autoplay; encrypted-media"
                scrolling="auto"
                class="web-iframe"></iframe>
        </view>
    </base-view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BaseView from '@/components/Base/BaseView.vue';

const url = ref('');
const title = ref('');

// 获取页面跳转时传递的url参数
onLoad((options) => {
    if (options && options.url) {
        url.value = decodeURIComponent(options.url);
    }
    if (options && options.title) {
        title.value = options.title;
    }
});
</script>

<style lang="scss" scoped>
.webview-container {
    position: relative;
    width: 100%;
    display: flex;
    padding: 0px 12px;
    box-sizing: border-box;
    background-color: var(--color-white);

    .webview-content {
        position: relative;
        flex: 1;
        width: 100%;
    }
}
</style>

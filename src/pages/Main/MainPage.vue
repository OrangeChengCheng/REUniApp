<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-09-21 21:28:47
-->
<template>
    <base-view :nav_bar="false" :nav_bar_color="`--color-main-bg`">
        <view class="sup-main-page">
            <scroll-view
                class="cont-scroll-view"
                :scroll-y="scroll_outer_can"
                :show-scrollbar="false"
                :scroll-top="scroll_outer_scrollTop"
                @scroll="handleScroll">
                <view class="banner">
                    <view class="banner-box"> </view>
                </view>
                <view class="content">
                    <view class="search"> </view>
                    <view class="search-fixed" v-if="isSearchFixed">
                        <button @click="aaa">aaa</button>
                        <button @click="bbb">bbb</button>
                    </view>
                    <!-- <scroll-view class="list" :scroll-y="scroll_inner_can" :show-scrollbar="false" :scroll-top="scroll_inner_scrollTop" @scroll="handleScroll_222">
                        <view v-for="(item, index) in items" :key="index" class="list-item">
                            {{ index }}
                        </view>
                    </scroll-view> -->
                    <view class="list">
                        <view v-for="(item, index) in items" :key="index" class="list-item">
                            {{ item }}
                        </view>
                    </view>
                </view>
            </scroll-view>
            <!-- <view class="banner">banner（100px）</view>
            <view class="content">
                <view class="search">search（40px）</view>
                <view class="search-fixed" v-if="isSearchFixed">search（40px）</view>
                <view class="list">
                    <view v-for="(item, index) in items" :key="index" class="list-item">
                        {{ index }}
                    </view>
                </view>
            </view> -->
        </view>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, nextTick } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';

const instance = getCurrentInstance()!;
const query = uni.createSelectorQuery().in(instance.proxy);
const isSearchFixed = ref(false);
const items = ref<string[]>([]);
const items_1 = ref(Array.from({ length: 100 }, (_, i) => `列表 <1>   ${i + 1}`));
const items_2 = ref(Array.from({ length: 100 }, (_, i) => `列表 <2>   ${i + 1}`));

const scroll_outer_scrollTop = ref(0);
const scroll_outer_scrollTop_curr = ref(0);
const scroll_inner_scrollTop = ref(0);
const scroll_outer_can = ref(true);
const scroll_inner_can = ref(true);
const scroll_inner_curr = ref(false);

onMounted(() => {
    items.value = items_1.value;
});

const handleScroll = (e: any) => {
    isSearchFixed.value = e.detail.scrollTop >= 200;
    scroll_outer_scrollTop_curr.value = e.detail.scrollTop;
    console.log('外 scrollTop：', e.detail.scrollTop);
    // if (e.detail.scrollTop >= 199) {
    //     scroll_outer_can.value = false;
    //     scroll_inner_can.value = true;
    // }
};
const handleScroll_222 = (e: any) => {
    console.log('内 scrollTop：', e.detail.scrollTop);
    // scroll_inner_curr.value = true;
    // if (e.detail.scrollTop <= 1) {
    //     scroll_outer_can.value = true;
    //     scroll_inner_can.value = false;
    // }
    // scrollTop.value = e.detail.scrollTop;
    if (scroll_outer_scrollTop.value < 200) {
        let outer_scrollTop = scroll_outer_scrollTop.value;
        outer_scrollTop += e.detail.scrollTop;
        if (outer_scrollTop > 200) {
            outer_scrollTop = 200;
        }
        scroll_outer_scrollTop.value = outer_scrollTop;

        scroll_inner_scrollTop.value = 0;
    } else {
        // if (scroll_inner_scrollTop.value <= 0) {
        // }
    }
};

const aaa = () => {
    items.value = items_1.value;
    // 解决view层不同步的问题
    scroll_outer_scrollTop.value = scroll_outer_scrollTop_curr.value;
    nextTick(() => {
        scroll_outer_scrollTop.value = 200;
    });
};
const bbb = () => {
    items.value = items_2.value;
    // 解决view层不同步的问题
    scroll_outer_scrollTop.value = scroll_outer_scrollTop_curr.value;
    nextTick(() => {
        scroll_outer_scrollTop.value = 200;
    });
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-main-page {
    position: relative;
    display: flex;
    flex: 1;
    background-color: aquamarine;
    // background-color: var(--color-main-bg);
}

.cont-scroll-view {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.banner {
    position: relative;
    display: flex;
    width: 100%;
    height: 200px;
    justify-content: center;
    align-items: center;
    padding: 20px 10px 30px 10px;
    box-sizing: border-box;
    flex-shrink: 0;

    .banner-box {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 10px;
        background-color: var(--color-main-bg);
    }
}

.content {
    position: relative;
    width: 100%;
    // height: 100%;
    // overflow: hidden;
}

.search {
    position: relative;
    height: 40px;
    background-color: blue;
    flex-shrink: 0;
}
.search-fixed {
    position: fixed;
    top: 40px;
    height: 40px;
    width: 100%;
    z-index: 1;
    background-color: red;
    flex-shrink: 0;
    display: flex;
}

// .list {
//     position: relative;
//     width: 100%;
//     height: calc(100% - 40px);
// }

.list-item {
    position: relative;
    height: 50px; /* 或者其他高度 */
    border-bottom: 1px solid #ddd;
}
</style>

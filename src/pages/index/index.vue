<!--
 * @Author: Lemon C
 * @Date: 2024-08-14 10:24:21
 * @LastEditTime: 2024-08-22 10:41:32
-->
<template>
    <view class="content">
        <text>djslkfjsdlj</text>
        <image class="logo" src="/static/logo.png" />
        <view class="text-area">
            <text class="title">{{ title }}</text>
        </view>
        <button @click="btnAction">点我</button>
        <text>{{ btnText }}</text>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import {onNavigationBarButtonTap} from '@dcloudio/uni-app'
const title = ref('Hello');
const btnText = ref('');
// const reModule = uni.requireNativePlugin("REUniPlugin-REModule");

const onNavigationBarButtonTap = () => {
    btnText.value = '66666';
};

// onMounted(() => {
//     uni.$on('onNavigationBarButtonTap', onNavigationBarButtonTap);
// });

// onUnmounted(() => {
//     uni.$off('onNavigationBarButtonTap', onNavigationBarButtonTap);
// });

const btnAction = () => {
    // reModule.testAsyncFunc({
    // 	'name': 'uni-app',
    // 	'age': 12
    // }, (ret) => {
    // 	uni.showToast({
    // 		title: '调用异步方法' + ret.code,
    // 		icon: 'none'
    // 	})
    // })

    btnText.value = '88888';
    // setTimeout(() => {
    //     //在起始页面跳转到test.vue页面并传递参数
    //     uni.navigateTo({
    //         url: 'pages/Home/HomePage',
    //     });
    // }, 500);
	uni.navigateTo({
	    url: '/pages/Home/HomePage',
	});
};

// onNavigationBarButtonTap({ index }) {

// };

// const onNavigationBarButtonTap = () => {
//     btnText.value = "66666";
// };
</script>

<style>
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
}

.text-area {
    display: flex;
    justify-content: center;
}

.title {
    font-size: 36rpx;
    color: #8f8f94;
}
</style>

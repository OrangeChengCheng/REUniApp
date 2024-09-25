<!--
 * @Author: Lemon C
 * @Date: 2024-09-24 17:34:32
 * @LastEditTime: 2024-09-25 17:37:15
-->
<template>
    <div class="sup-banner-comp">
        <view class="banner-box" @click="banner_click">
            <image class="banner-image" src="https://demo.bjblackhole.com/BlackHole3.0/app/img/app_banner_1.png" mode="scaleToFill" />
        </view>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const props = defineProps({
    banner_re_callback: {
        type: Function,
        default: () => {},
    },
});

const clickCount = ref(0);
const timer = ref<number | null>(null);

onUnmounted(() => {
    clickCount.value = 0;
    timer.value = null;
});

const banner_click = () => {
    clickCount.value++;

    // 如果计时器不存在，说明是第一次点击，开始计时
    if (!timer.value) {
        timer.value = setTimeout(() => {
            if (clickCount.value >= 5) {
                props.banner_re_callback();
            }
            clickCount.value = 0;
            timer.value = null;
        }, 1000);
    }
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-banner-comp {
    position: relative;
    display: flex;
    width: 100%;
    height: 230px;
    justify-content: center;
    align-items: center;
    padding: 20px 12px 10px 12px;
    box-sizing: border-box;
    flex-shrink: 0;

    .banner-box {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 16px;

        .banner-image {
            width: 100%;
            height: 100%;
        }
    }
}
</style>

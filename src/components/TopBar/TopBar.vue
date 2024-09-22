<template>
    <view :class="`${topbar_has_search ? 'sup-top-bar-fixed' : 'sup-top-bar'}`">
        <view class="search-area">
            
        </view>
        <view class="tab-area"></view>
    </view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    topbar_has_search: {
        type: Boolean,
        default: false,
    },
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-top-bar {
    position: relative;
    width: 100%;
    height: 90px;
    display: flex;
    flex-direction: column;
    background-color: red;
    flex-shrink: 0;
}

.sup-top-bar-fixed {
    position: fixed;
    top: 40px;
    width: 100%;
    height: 90px;
    display: flex;
    flex-direction: column;
    background-color: greenyellow;
    flex-shrink: 0;
    z-index: 1;
}

.search-area {
    position: relative;
    width: 100%;
    height: 60px;
    display: flex;
    background-color: aqua;
}

.tab-area {
    position: relative;
    width: 100%;
    height: 30px;
    display: flex;
    background-color: bisque;
}
</style>

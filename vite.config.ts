/*
 * @Author: Lemon C
 * @Date: 2024-08-14 10:24:21
 * @LastEditTime: 2024-08-26 18:14:10
 */
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uni()
    ],
    resolve: {
        alias: {
            "@": "/src",
        },
    },
});

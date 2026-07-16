/*
 * @Author: Lemon C
 * @Date: 2024-08-14 10:24:21
 * @LastEditTime: 2026-03-30 11:55:12
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
    server: {
        port: 5174, // 改成你想要的端口，比如 3000、8080、8081
        strictPort: true, // 端口被占用时直接报错，不自动换端口
        host: true // 允许局域网访问（可选）
    }
});

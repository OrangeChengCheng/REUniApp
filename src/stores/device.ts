import { defineStore } from 'pinia'


interface Device {
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    osName: string;
    osVersion: string;
    browserName: string;
    romName: string;
    romVersion: string;
}


export const useDeviceStore = defineStore('device', {
    state: (): { deviceInfo: Device } => ({
        deviceInfo: JSON.parse(uni.getStorageSync('RE_device') || '{}') || {} as Device,
    }),
    actions: {
        // MARK uni-app  获取设备信息
        get_deviceInfo: () => {
            uni.getSystemInfo({
                success: (res) => {
                    let device_tamp: Device = {} as Device;
                    device_tamp.deviceType = res.deviceType || "";
                    device_tamp.deviceBrand = res.deviceBrand || "";
                    device_tamp.deviceModel = res.deviceModel || "";
                    device_tamp.osName = res.osName || "";
                    device_tamp.osVersion = res.osVersion || "";
                    device_tamp.browserName = res.browserName || "";
                    device_tamp.romName = res.romName || "";
                    device_tamp.romVersion = res.romVersion || "";

                    uni.setStorageSync('RE_device', JSON.stringify(device_tamp));
                },
                fail: (err) => {
                    console.log(err);
                },
            });
        },
    },
});
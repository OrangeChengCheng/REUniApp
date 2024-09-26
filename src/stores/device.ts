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
        // MARK uni-app  更新设备信息
        update_deviceInfo: (e: any) => {
            let device_tamp: Device = {} as Device;
            device_tamp.deviceType = e.deviceType || "";
            device_tamp.deviceBrand = e.deviceBrand || "";
            device_tamp.deviceModel = e.deviceModel || "";
            device_tamp.osName = e.osName || "";
            device_tamp.osVersion = e.osVersion || "";
            device_tamp.browserName = e.browserName || "";
            device_tamp.romName = e.romName || "";
            device_tamp.romVersion = e.romVersion || "";

            uni.setStorageSync('RE_device', JSON.stringify(device_tamp));
        },
    },
});
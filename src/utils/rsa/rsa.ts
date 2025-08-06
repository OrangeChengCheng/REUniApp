import JSEncrypt from 'jsencrypt';
import { parseRsaXml } from './rsa-parser';
import { rsaXmlToPem } from './rsa-converter';

let cachedPublicKey: string | null = null;

/**
 * 初始化RSA公钥（从XML转换为PEM并格式化）
 * @param xmlPublicKey 后端返回的XML格式公钥
 */
export const initRsaPublicKey = (xmlPublicKey: string): void => {
    try {
        // 1. 解析XML获取modulus和exponent
        const { modulus, exponent } = parseRsaXml(xmlPublicKey);
        console.log('解析得到的modulus:', modulus);
        console.log('解析得到的exponent:', exponent);

        // 2. 转换为PEM格式（确保rsaXmlToPem返回正确格式）
        const pemPublicKey = rsaXmlToPem(modulus, exponent);
        console.log('转换后的原始PEM:', pemPublicKey);

        // 3. 最终格式化（仅执行一次，避免重复处理）
        cachedPublicKey = formatPemPublicKey(pemPublicKey);
        console.log('最终格式化后的PEM公钥:\n', cachedPublicKey);

    } catch (err) {
        console.error('RSA公钥初始化失败:', err);
        throw new Error('公钥格式错误，无法初始化加密工具');
    }
};

/**
 * 格式化PEM公钥（确保严格符合标准）
 * @param rawPem 原始PEM字符串
 * @returns 标准格式的PEM公钥
 */
const formatPemPublicKey = (rawPem: string): string => {
    // 1. 移除所有非Base64字符
    const clean = rawPem
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/[^a-zA-Z0-9+/=]/g, ''); // 只保留Base64字符

    // 2. 按64字符拆分（必须严格）
    const lines = [];
    for (let i = 0; i < clean.length; i += 64) {
        lines.push(clean.slice(i, i + 64));
    }

    // 3. 重建标准PEM
    return [
        '-----BEGIN PUBLIC KEY-----',
        ...lines,
        '-----END PUBLIC KEY-----'
    ].join('\n');
};

/**
 * 加密函数
 */
export const rsaEncrypt = (data: string): string => {
    if (!cachedPublicKey) {
        throw new Error('请先初始化公钥');
    }

    // 验证数据长度（1024位密钥最多86字节，2048位最多245字节）
    const byteLength = new TextEncoder().encode(data).length;
    const keySize = cachedPublicKey.length > 300 ? 2048 : 1024;
    const maxLength = keySize / 8 - 42;

    console.log(`加密数据: ${data}（长度: ${byteLength}字节，最大支持: ${maxLength}字节）`);
    if (byteLength > maxLength) {
        throw new Error(`数据过长（${byteLength}字节），最大支持${maxLength}字节`);
    }

    try {
        const encryptor = new JSEncrypt();

        // 验证公钥设置结果
        const isSet = encryptor.setPublicKey(cachedPublicKey);
        if (!isSet) {
            // 公钥设置失败时，打印公钥供手动验证
            console.error('公钥设置失败，当前公钥:\n', cachedPublicKey);
            throw new Error('公钥设置失败，格式可能错误（详见控制台输出）');
        }

        const encrypted = encryptor.encrypt(data);
        if (!encrypted) {
            throw new Error('加密失败，可能公钥不匹配或数据异常');
        }

        return encrypted;
    } catch (err) {
        console.error('加密过程出错:', err);
        throw err;
    }
};

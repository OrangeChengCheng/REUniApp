/**
 * 将Base64字符串转换为Uint8Array（浏览器兼容版）
 * @param base64 待转换的Base64字符串
 * @returns 转换后的Uint8Array
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
    // 处理Base64中的URL安全字符和填充
    const cleaned = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (cleaned.length % 4)) % 4;
    const padded = cleaned + '='.repeat(padLength);

    // 解码Base64为二进制字符串
    const binaryString = atob(padded);

    // 转换为Uint8Array
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
};

/**
 * 将Uint8Array转换为Base64字符串（浏览器兼容版）
 * @param array 待转换的Uint8Array
 * @returns 转换后的Base64字符串
 */
const uint8ArrayToBase64 = (array: Uint8Array): string => {
    let binary = '';
    const len = array.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(array[i]);
    }
    return btoa(binary);
};

/**
 * 将RSA的Modulus和Exponent转换为PEM格式公钥（浏览器兼容版）
 * @param modulus Base64编码的模数
 * @param exponent Base64编码的指数
 * @returns PEM格式公钥字符串
 */
export const rsaXmlToPem = (modulus: string, exponent: string): string => {
    try {
        const modulusArray = base64ToUint8Array(modulus);
        const exponentArray = base64ToUint8Array(exponent);

        const modLen = modulusArray.length;
        const expLen = exponentArray.length;

        // 正确计算总长度：序列头(2) + 模数部分(2 + modLen) + 指数部分(2 + expLen)
        // 原代码中 totalLength 计算错误，应直接累加各部分长度
        const totalLength = 2 + (2 + modLen) + (2 + expLen);
        const derArray = new Uint8Array(totalLength);
        let offset = 0;

        // 序列标识（0x30 表示序列类型）
        derArray[offset++] = 0x30;
        derArray[offset++] = totalLength - 2; // 序列内容长度（总长度 - 序列头长度）

        // 模数部分（0x02 表示整数类型）
        derArray[offset++] = 0x02;
        derArray[offset++] = modLen;
        derArray.set(modulusArray, offset);
        offset += modLen;

        // 指数部分（0x02 表示整数类型）
        derArray[offset++] = 0x02;
        derArray[offset++] = expLen;
        derArray.set(exponentArray, offset);
        offset += expLen;

        const base64 = uint8ArrayToBase64(derArray);
        const pem = [
            '-----BEGIN PUBLIC KEY-----',
            ...splitIntoLines(base64, 64),
            '-----END PUBLIC KEY-----'
        ].join('\n');

        // 打印最终 PEM 公钥
        console.log('生成的 PEM 公钥:\n');
        console.log(pem);
        return pem;
    } catch (err) {
        console.error('转换失败:', err);
        throw err;
    }
};

/**
 * 将长字符串按指定长度拆分换行
 */
const splitIntoLines = (str: string, lineLength: number): string[] => {
    const lines: string[] = [];
    for (let i = 0; i < str.length; i += lineLength) {
        lines.push(str.slice(i, i + lineLength));
    }
    return lines;
};

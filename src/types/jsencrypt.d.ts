declare module 'jsencrypt' {
    /**
     * JSEncrypt 类用于RSA加密解密
     */
    export default class JSEncrypt {
        /**
         * 构造函数
         * @param options 配置项（可选）
         */
        constructor(options?: { default_key_size?: number; default_public_exponent?: string });

        /**
         * 设置公钥
         * @param publicKey PEM格式的公钥字符串
         */
        setPublicKey(publicKey: string): void;

        /**
         * 设置私钥
         * @param privateKey PEM格式的私钥字符串
         */
        setPrivateKey(privateKey: string): void;

        /**
         * 加密数据
         * @param data 要加密的字符串
         * @returns 加密后的Base64字符串，失败返回false
         */
        encrypt(data: string): string | false;

        /**
         * 解密数据
         * @param encrypted 加密后的Base64字符串
         * @returns 解密后的原始字符串，失败返回false
         */
        decrypt(encrypted: string): string | false;

        /**
         * 生成密钥对（前端一般不使用）
         * @param keySize 密钥长度
         * @param publicExponent 公钥指数
         */
        generateKeyPair(keySize?: number, publicExponent?: string): void;

        /**
         * 获取公钥
         * @param type 类型（'pkcs8' 或 'pkcs1'）
         * @returns PEM格式公钥
         */
        getPublicKey(type?: 'pkcs8' | 'pkcs1'): string;

        /**
         * 获取私钥
         * @param type 类型（'pkcs8' 或 'pkcs1'）
         * @returns PEM格式私钥
         */
        getPrivateKey(type?: 'pkcs8' | 'pkcs1'): string;
    }
}

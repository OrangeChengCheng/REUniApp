export const parseRsaXml = (xmlString: string): { modulus: string; exponent: string } => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const modulusNode = xmlDoc.getElementsByTagName('Modulus')[0];
    const exponentNode = xmlDoc.getElementsByTagName('Exponent')[0];

    if (!modulusNode || !exponentNode) {
        throw new Error('XML 格式错误');
    }

    // 关键：打印提取的内容
    console.log('提取的 modulus:', modulusNode.textContent);
    console.log('提取的 exponent:', exponentNode.textContent);

    return {
        modulus: modulusNode.textContent || '',
        exponent: exponentNode.textContent || ''
    };
};
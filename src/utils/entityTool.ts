/*
 * @Author: Lemon C
 * @Date: 2026-10-08 14:15:52
 * @LastEditTime: 2026-10-08 14:24:17
 */
import dataTool from '@/utils/dataTool';









interface ApiMethods {
    getEntitySetNodes(treeData: any): any;
    getEntityNodes(treeData: any): any;
}


const api: ApiMethods = {

    getEntitySetNodes: (treeData: any): any => {
        const folderNodes = dataTool.handle_findAllNodeByLevel(treeData, 1)
        const entitySetNodes = folderNodes.filter((el: any) => el.dataSetType === 19 && el.componentSetInfo)
        return entitySetNodes
    },

    getEntityNodes: (treeData: any): any => {
        const entitySetNodes = api.getEntitySetNodes(treeData)
        const leafNodes = dataTool.handle_findAllNodeByLevel(treeData, 2)
        const entityNodes: any = []
        entitySetNodes.forEach((item: any) => {
            entityNodes.push(...item.subEntities)
        })
        leafNodes.forEach((item: any) => {
            if (item.dataSetType === 19) {
                entityNodes.push(item)
            }
        })
        return entityNodes
    }
}



export default api;
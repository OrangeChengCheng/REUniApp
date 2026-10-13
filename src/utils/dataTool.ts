import { useStateStore } from '@/stores/state';
import entityTool from '@/utils/entityTool';
import serviceApi from '@/utils/serviceApi';
import dataTool from '@/utils/dataTool';
import { newShare, type Share } from '@/types/class';


const SETCRS_DATA_TYPE = [0, 11, 15]; // 需要设置坐标系和基点的数据类型

interface ApiMethods {
    handle_dataSetResHeader(dataSetList: any, urlInfo: any): any;
    handle_dataSetResAuthorInfo(urlInfo: any): any;
    handle_formatSceneTree(sceneTree: any, sceneInfo: any): any;
    handle_findAllDataSet(sceneTree: any): any;
    handle_dataSetIdList(sceneTree: any, sceneInfo: any): any;
    handle_dataSetId(dataSetList: any): any;
    handle_dataSetCRS(dataSetInfo: any): any;
    handle_dataSetCRSNorth(dataSetInfo: any): any;
    handle_engineOrigin(dataSetInfo: any): any;
    handle_dataSetTrans(dataSetList: any, dataSetTrans: any): any;
    handle_terrainLayerLev(dataSetList: any, dataSetTerrain: any): any;
    handle_findAllNodeByLevel(nodeData: any, level: number): any;
    handle_formatMonomerInfo(monomerInfo: any): any;
    handle_terrainDataSetList(sceneTree: any, nodeType: number): any;
    handle_entityData(sceneTree: any, entityEditTranList: any): any;
    handle_waterData(sceneTree: any): any;
    handle_extrudeData(sceneTree: any, extrudeTexList: any): any;
    handle_monomerData(sceneTree: any): any;
    handle_monomerByNodes(nodeData: any): any;
    handle_projectionData(sceneTree: any): any;

    cam_defauleDataSet(dataSetList: any): string;
    card_getProjName(urlInfo: any): Promise<any>;
    card_getSceneData(urlInfo: any): Promise<any>;
    card_getBimData(urlInfo: any): Promise<any>;
    card_getCadData(urlInfo: any): Promise<any>;
}

const api: ApiMethods = {
    // MARK data 处理数据集--获取资源授权请求头
    handle_dataSetResHeader: (dataSetList: any, urlInfo: any) => {
        let urlHeaderList: any = [];
        dataSetList.forEach((dataSet: any) => {
            const baseUrl = uni.$tool.url_base(dataSet.resourcesAddress);
            const find_obj = urlHeaderList.find((item: any) => item.urlWildcard == baseUrl);
            if (!find_obj) {
                const headerParam: any = { urlWildcard: `${baseUrl}/*`, headerStr: `Auth:${urlInfo.token}` };
                urlHeaderList.push(headerParam);
            }
        });
        return urlHeaderList;
    },

    // MARK data 处理数据集--获取资源授权地址信息
    handle_dataSetResAuthorInfo: (urlInfo: any) => {
        const state_store = useStateStore();
        if (!urlInfo.isMinio) return {};
        const authorTxt = urlInfo.resourcesAddress.replace('res/', state_store.authorTxt);
        const authorRes = urlInfo.resourcesAddress;
        const authorIndex = urlInfo.resourcesAddress.replace('res/', state_store.authorIndex);

        let authorData: any = {
            isMinio: urlInfo.isMinio,
            resMode: urlInfo.resMode,
            commonUrl: urlInfo.commonUrl,
            resourcesAddress: urlInfo.resourcesAddress,
            authorTxt: authorTxt,
            authorRes: authorRes,
            authorIndex: authorIndex,
            authorTxtId: state_store.authorTxtId,
            authorIndexId: state_store.authorIndexId,
        };
        return authorData;
    },

    // MARK data 格式化-场景树
    handle_formatSceneTree: (sceneTree: any, sceneInfo: any) => {
        if (!sceneTree) return [];
        let sceneData = sceneTree;
        let rootFolders = api.handle_findAllNodeByLevel(sceneData, 3);

        rootFolders.forEach((item: any) => {
            if (item.dataSetType === 0) {
                item['sceneNodeName'] = 'BIM'
                item['nodeName'] = 'BIM'
                item['levelPathName'] = 'BIM'
            }
            if (item.dataSetType === 10) {
                item['sceneNodeName'] = 'WMTS'
                item['nodeName'] = 'WMTS'
                item['levelPathName'] = 'WMTS'
            }
        })


        let allDatasets = api.handle_findAllNodeByLevel(sceneData, 2);
        let { componentPosition } = sceneInfo;
        allDatasets.forEach((item: any) => {
            if (item.dataSetType === 0) {
                item['levelPathName'] = item.levelPathName.replace('模型/', 'BIM/')
                item['levelPathName'] = item.levelPathName.replace('模型/', 'BIM/')
            }
            if (item.dataSetType === 10) {
                item['levelPathName'] = item.levelPathName.replace('wmts/', 'WMTS/')
            }

            if (item.dataSetType === 0 && item.formatType === 1) {
                const findLastIndex = item.sceneNodeName.lastIndexOf('.')
                if (findLastIndex !== -1) {
                    item['nodeName'] = item.sceneNodeName.substring(0, findLastIndex)
                    item['sceneNodeName'] = item.nodeName
                } else {
                    item['nodeName'] = item.sceneNodeName
                }
            } else {
                item['nodeName'] = item.sceneNodeName
            }

            item['customNodeType'] = 'dataSet'
            item['nodeId'] = item.sceneNodeId


            if (item.viewStatus === 2) {
                item['disabled'] = true;
            }

            if (item.dataSetType === 0 && item.viewStatus !== 2) {
                item.subNodes.push({
                    nodeName: '',
                    nodeId: `emptyNode-${item.nodeId}`
                });
            }

            if (item.dataSetType === 19) {
                let componentInfo = item.componentInfo;
                componentInfo.id = componentInfo.treeNodeId;
                let find = componentPosition.find((el: any) => el.id === componentInfo.id);
                if (find) {
                    componentInfo.location = {
                        rotate: find.rotate,
                        scale: find.scale,
                        translation: find.translation,
                    };
                }
                let { hostFileId, instanceIndex, isPublished } = componentInfo;
                if (isPublished) {
                    componentInfo.dataSetId = sceneInfo.componentTreeId;
                    componentInfo.elemId = Number(`${hostFileId}${instanceIndex}`);
                    item.elemId = componentInfo.elemId
                }
            }

            // 水面类型，将waterId提升一级，方便调用
            if (item.dataSetType === 23) {
                let waterInfo = item.waterInfo;
                item.waterId = waterInfo.id;
            }

            // 开挖类型，将extrudeId提升一级，方便调用
            if (item.dataSetType === 24) {
                let extrudeInfo = item.excavateInfo;
                item.extrudeId = extrudeInfo.id;
            }

            if (item.dataSetType === 25) {
                item.customNodeType = 'monomer';
                item.monomerId = item.nodeId;
                item.monomerRegNodeId = item.nodeId;
                item.monomerName = item.nodeName;
                item.monomerizationInfo = api.handle_formatMonomerInfo(item.monomerizationInfo);
                const monomerInfo = item.monomerizationInfo;
                if (monomerInfo.monomerizationType === 2) {
                    // 构建伪节点，用于展开单体化子节点
                    item.subNodes = [{ nodeId: `tempNode-${item.nodeId}`, nodeName: '', viewStatus: item.viewStatus }];
                }
            }

            // 视频投射类型
            if (item.dataSetType === 29 && item.projectionConfig) {
                item.customNodeType = 'projection'
                item.projectionId = item.dataSetId
                item.projectionName = item.nodeName
                item.projectionConfig.projectionId = item.dataSetId
                item.projectionConfig.projectionName = item.nodeName
            }
        });

        let folders = api.handle_findAllNodeByLevel(sceneData, 1);
        let allFolders = [...rootFolders, ...folders];
        allFolders.forEach((item) => {
            let rootNodeId = item.levelCode.split('/')[0]
            let find = rootFolders.find((el: any) => el.sceneNodeId === rootNodeId)
            item.dataSetType = find.dataSetType
            item.srcDataSetType = find.srcDataSetType
            item['nodeName'] = item.sceneNodeName
            item['nodeId'] = item.sceneNodeId
            if (item.componentSetInfo) {
                item.subEntities = item.subNodes
                item.subNodes = []
            }
        });

        // 隐藏没有数据的根节点
        sceneData = sceneData.filter((el: any) => el.subNodes.length);
        return sceneData;
    },

    // MARK data 查找--获取所有的数据集
    handle_findAllDataSet: (sceneTree: any) => {
        const state_store = useStateStore();
        // 在场景中需要依赖资源包才能展示的数据类型
        const dependentResourceTypes = state_store.sceneDataSetType;
        const entityNodes = entityTool.getEntityNodes(sceneTree);
        const dataSets: any = [];
        entityNodes.forEach((item: any) => { dataSets.push(item) });
        let leafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        leafNodes = leafNodes.filter((el: any) => el.viewStatus !== 2 && dependentResourceTypes.includes(el.dataSetType));
        leafNodes.forEach((item: any) => {
            const find = dataSets.find((el: any) => el.nodeId === item.nodeId)
            if (!find) {
                dataSets.push(item)
            }
        })
        return dataSets
    },

    // MARK data 递归获取数据集标识集合
    handle_dataSetIdList: (sceneTree: any, sceneInfo: any) => {
        let allDataSets = api.handle_findAllDataSet(sceneTree);
        let dataSets = allDataSets.filter((el: any) => el.viewStatus !== 2)
        let dataSetList = dataSets.filter((el: any) => el.dataSetType !== 19)
        const dataSetIdList: string[] = dataSetList.map((el: any) => el.dataSetId)
        let entityElems = dataSets.filter((item: any) => {
            let componentInfo = item.componentInfo
            if (componentInfo && componentInfo.isPublished) {
                return true
            } else {
                return false
            }
        })
        if (entityElems.length) {
            dataSetIdList.push(sceneInfo.componentTreeId);//单构件需要单独添加，不在模型数据中获取
        }

        return dataSetIdList;
    },

    // MARK data 处理数据集--数据集标识横杠
    handle_dataSetId: (dataSetList: any) => {
        return dataSetList; // 不处理横杠了，不然业务太多使用横杠的接口，去除会导致数据不对
        dataSetList.forEach((dataSet: any) => {
            if (dataSet.dataSetId && dataSet.dataSetId.length) {
                dataSet.dataSetId = dataSet.dataSetId.replace(/-/g, ''); //不能使用replaceAll,app端异常
            }
        });
        return dataSetList;
    },

    // MARK data 处理数据集--坐标系标识符
    handle_dataSetCRS: (dataSetInfo: any) => {
        if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return '';

        let crsConfig = dataSetInfo.coordinatesConfig;
        if (crsConfig.coordinatesType === 'None') return '';

        if (crsConfig.coordinatesType === 'CalibrationPoint') {
            let crsPoint = crsConfig.coordinatesPoint;
            let crs = `ENU:${crsPoint.latitude},${crsPoint.longitude}`;
            return crs;
        } else {
            return crsConfig.coordinates;
        }
    },

    // MARK data 处理数据集--正北夹角
    handle_dataSetCRSNorth: (dataSetInfo: any) => {
        if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return 0;
        let crsConfig = dataSetInfo.coordinatesConfig;
        if (crsConfig.northAngle) {
            return Number(crsConfig.northAngle);
        } else {
            return 0;
        }
    },

    // MARK data 处理数据集--基点坐标
    handle_engineOrigin: (dataSetInfo: any) => {
        if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return [0, 0, 0];

        let engineOrigin = [];
        let crsConfig = dataSetInfo.coordinatesConfig;

        let origin = crsConfig.basePoint;
        let originArray = [];
        if (origin) {
            originArray = origin.split(',').map(Number);
        }

        if (crsConfig.coordinatesType === 'CalibrationPoint') {
            let crsPoint = crsConfig.coordinatesPoint;
            let point = crsPoint.coordinates;
            let pointArray = [];
            if (point) {
                pointArray = point.split(',').map(Number);
            } else {
                pointArray = [0, 0, 0];
            }

            if (originArray.length) {
                originArray.forEach((item: any, index: any) => {
                    let result = item - pointArray[index];
                    engineOrigin.push(result);
                });
            } else {
                engineOrigin = pointArray;
            }
        } else {
            engineOrigin = originArray;
        }

        if (engineOrigin.length) {
            return engineOrigin;
        } else {
            return [0, 0, 0];
        }
    },

    // MARK data 处理数据集偏移信息
    handle_dataSetTrans: (dataSetList: any, dataSetTrans: any): any => {
        dataSetList.forEach((dataSet: any) => {
            let dataSetTranData = dataSetTrans.find((obj: any) => obj.dataSetId == dataSet.dataSetId);
            if (dataSetTranData) {
                dataSet.rotate = dataSetTranData.rotate?.split(' ').map(Number);
                dataSet.scale = dataSetTranData.scale?.split(' ').map(Number);
                dataSet.offset = dataSetTranData.translation?.split(' ').map(Number);
            }
        });
        return dataSetList;
    },

    // MARK data 处理数据集--地形层级
    handle_terrainLayerLev: (dataSetList: any, dataSetTerrain: any) => {
        dataSetList.forEach((dataSet: any) => {
            let dataSetTranData = dataSetTerrain.find((obj: any) => obj.dataSetId == dataSet.dataSetId);
            if (dataSetTranData) {
                dataSet.terrainLayerLev = dataSetTranData.sortNum;
            } else {
                dataSet.terrainLayerLev = 0;
            }
        });
        return dataSetList;
    },

    // MARK data 查找-节点级别数据
    handle_findAllNodeByLevel: (nodeData: any, level: number) => {
        const array: any = [];

        const traverse = (item: any) => {
            if (item.nodeType && item.nodeType === level) {
                array.push(item);
            }
            if (item.subNodes && item.subNodes.length) {
                item.subNodes.forEach((subNode: any) => {
                    traverse(subNode);
                });
            }
        };

        nodeData.forEach((item: any) => {
            traverse(item);
        });

        return array;
    },

    // MARK data 格式化-单体化信息对象
    handle_formatMonomerInfo: (monomerInfo: any) => {
        const units = monomerInfo.levelJson;
        const firstRoom = units[0].floors[0].rooms[0];
        const firstRoomGeoJson = JSON.parse(firstRoom.geoJson);
        if (firstRoomGeoJson.rgnList) return monomerInfo;

        const dataSetId = monomerInfo.dataSetId;
        const rooms = units.flatMap((unit: any) => unit.floors.flatMap((floor: any) => floor.rooms));
        rooms.forEach((room: any) => {
            const roomGeoJson = JSON.parse(room.geoJson);
            const fenceClr = roomGeoJson.fenceClr;
            const { red, green, blue, alpha } = fenceClr;
            const monomerClr = { red, green, blue, alpha: 128 };
            const heightMin = roomGeoJson.potList[0][2];
            const heightMax = roomGeoJson.potList[0][2] + roomGeoJson.potList[0][3];
            const pointList = roomGeoJson.potList.map((el: any) => el.slice(0, 3));

            const groJson = {
                dataSetId,
                rgnList: [pointList],
                heightMin,
                heightMax,
                monomerClr,
            };
            room.geoJson = JSON.stringify(groJson);
        });

        return monomerInfo;
    },

    // MARK data 递归获取地形数据集合
    handle_terrainDataSetList: async (sceneTree: any, nodeType: number) => {
        const array: any[] = [];
        const traverse = (item: any) => {
            if (item.nodeType === nodeType) {
                array.push(item);
            }
            if (item.subNodes && item.subNodes.length) {
                item.subNodes.forEach((subNode: any) => {
                    traverse(subNode);
                });
            }
        };

        sceneTree.forEach((item: any) => {
            traverse(item);
        });

        var allDataSets = array.filter((el) => el.viewStatus !== 2);
        const terrainType = [10, 13, 21, 22];
        let terrainDataSets = allDataSets.filter((el) => terrainType.includes(el.dataSetType));
        return terrainDataSets;
    },

    // MARK data 处理数据集--单构件信息
    handle_entityData: async (sceneTree: any, entityEditTranList: any = []) => {
        const state_store = useStateStore();
        let entityList: any[] = [];

        const entityNodes = entityTool.getEntityNodes(sceneTree);

        entityNodes.forEach((item: any) => {
            let { hostFileId, location, treeNodeId, dataSetId, elemId } = item.componentInfo;
            let scale = JSON.parse(location.scale);
            let rotate = JSON.parse(location.rotate);
            let offset = JSON.parse(location.translation);
            // const editTran_obj = entityEditTranList.find((edit_item: any) => item.dataSetId === edit_item.id);
            // if (editTran_obj) {
            //     scale = JSON.parse(editTran_obj.scale);
            //     rotate = JSON.parse(editTran_obj.rotate);
            //     offset = JSON.parse(editTran_obj.translation);
            // }
            let entity_obj: any = {};
            entity_obj.dataSetId = dataSetId; // 不处理横杠了，不然业务太多使用横杠的接口，去除会导致数据不对
            entity_obj.entityType = String(hostFileId);
            entity_obj.elemId = Number(elemId);
            entity_obj.scale = scale;
            entity_obj.rotate = rotate;
            entity_obj.offset = offset;
            entity_obj.dataSetCRS = location.DataSetCRS;
            entity_obj.entityId = treeNodeId; // 单构件id保存，后期服务接口需要调用
            entityList.push(entity_obj);
        });

        return entityList;
    },

    // MARK data 处理数据集--水面信息
    handle_waterData: async (sceneTree: any) => {
        const state_store = useStateStore();
        const allLeafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        const allWaters = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportWaterType);

        let waterList: any[] = [];
        allWaters.forEach((item: any) => {
            const waterGeoJson: any = JSON.parse(item.waterInfo.geoJson);
            const rgnList = waterGeoJson.rgnList;
            const rgnInfo = rgnList[0];
            let cornerRgnInfo: any = {};
            cornerRgnInfo.pointList = rgnInfo.pointList;
            cornerRgnInfo.indexList = rgnInfo.indexList;

            const waterRgnList = [cornerRgnInfo];
            const { red, green, blue, alpha } = waterGeoJson.waterClr;
            const waterClr = [red, green, blue, alpha];

            let waterInfo: any = {};
            waterInfo.waterName = item.waterInfo.id;
            waterInfo.waterClr = waterClr;
            waterInfo.blendDist = waterGeoJson.blendDist;
            waterInfo.visible = waterGeoJson.visible;
            waterInfo.expandDist = waterGeoJson.expandDist;
            waterInfo.depthBias = waterGeoJson.depthBias;
            waterInfo.visDist = waterGeoJson.visDist;
            waterInfo.rgnList = waterRgnList;
            waterList.push(waterInfo);
        });
        return waterList;
    },

    // MARK data 处理数据集--挤出信息
    handle_extrudeData: async (sceneTree: any, extrudeTexList: any) => {
        const state_store = useStateStore();
        const allLeafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        const allExtrudes = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportExtrudeType);

        let extrudeList: any[] = [];
        allExtrudes.forEach((item: any) => {
            const extrudeGeoJson = JSON.parse(item.excavateInfo.geoJson);
            const rgnList = extrudeGeoJson.rgnList;
            let extrudeInfo: any = {};
            extrudeInfo.extrudeId = item.excavateInfo.id;
            extrudeInfo.dataSetIdList = extrudeGeoJson.dataSetIdList;
            extrudeInfo.rgnList = rgnList;
            extrudeInfo.depthLimitRange = extrudeGeoJson.depthLimitRange;
            extrudeInfo.type = extrudeGeoJson.type;
            if (extrudeGeoJson.type === 2) {
                const find = extrudeTexList.find((el: any) => el.textureGuid === item.excavateInfo.textureFileDataId);
                extrudeInfo.texSize = JSON.parse(JSON.stringify(find.picSize));
                extrudeInfo.texPath = find.picPath;
            }
            extrudeList.push(extrudeInfo);
        });
        return extrudeList;
    },

    // MARK data 处理数据集--单体化信息
    handle_monomerData: async (sceneTree: any) => {
        const state_store = useStateStore();
        const allLeafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        const allMonomers = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportMonomerType);
        if (!allMonomers.length) return [];

        const monomerList: any[] = api.handle_monomerByNodes(allMonomers);

        let roomMonomerList: any[] = [];
        monomerList.forEach((item: any) => {
            const roomShp = JSON.parse(item.geoJson);
            const { red, green, blue, alpha } = roomShp.monomerClr;
            let monomerClr = [red, green, blue, alpha];
            if (item.displayMode === 3) {
                monomerClr = [255, 255, 255, 10];
            } else {
                monomerClr = [red, green, blue, 128];
            }

            let roomMonomerInfo: any = {};
            roomMonomerInfo.monomerId = item.monomerId;
            roomMonomerInfo.dataSetId = roomShp.dataSetId;
            roomMonomerInfo.rgnList = roomShp.rgnList;
            roomMonomerInfo.heightMin = roomShp.heightMin;
            roomMonomerInfo.heightMax = roomShp.heightMax;
            roomMonomerInfo.faceClr = monomerClr;
            roomMonomerInfo.lineClr = monomerClr;
            roomMonomerInfo.showState = item.displayMode === 1 ? 2 : 1;

            roomMonomerList.push(roomMonomerInfo);
        });
        return roomMonomerList;
    },

    // MARK data 根据节点列表获取单体化对象列表
    handle_monomerByNodes: (nodeData: any) => {
        let monomerList: any[] = [];

        const flattenRooms = (rooms: any, source: any) => rooms.map((room: any) => createMonomerObj(source, room));
        const flattenFloors = (floors: any, source: any) => floors.flatMap((floor: any) => flattenRooms(floor.rooms, source));
        const flattenUnits = (units: any, source: any) => units.flatMap((unit: any) => flattenFloors(unit.floors, source));

        const createMonomerObj = (source: any, room: any) => ({
            displayMode: source.displayMode,
            dataSetId: source.dataSetId,
            monomerId: room.id,
            geoJson: room.geoJson,
        });

        // 主处理逻辑
        nodeData.forEach((item: any) => {
            switch (item.customNodeType) {
                case 'monomer': {
                    const monomers = flattenUnits(item.monomerizationInfo.levelJson, item.monomerizationInfo);
                    monomerList.push(...monomers);
                    break;
                }
                case 'monomerUnit': {
                    const unitMonomers = flattenFloors(item.floors, item);
                    monomerList.push(...unitMonomers);
                    break;
                }
                case 'monomerFloor': {
                    const floorMonomers = flattenRooms(item.rooms, item);
                    monomerList.push(...floorMonomers);
                    break;
                }
                case 'monomerRoom': {
                    monomerList.push(createMonomerObj(item, item));
                    break;
                }
            }
        });

        return monomerList;
    },

    // MARK data 处理数据集--视频投射信息
    handle_projectionData: async (sceneTree: any) => {
        const state_store = useStateStore();
        const allLeafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        const allProjections = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportProjectionType);
        if (!allProjections.length) return [];

        const aspectRatioList = [
            { id: 1, name: '原始尺寸', value: 0 },
            { id: 2, name: '16:9', value: 16 / 9 },
            { id: 3, name: '4:3', value: 4 / 3 },
            { id: 4, name: '1:1', value: 1 }
        ]
        const getSourceUrlByProjectionInfo = (mediaType: any, projectionInfo: any) => {
            if (mediaType === 2) return projectionInfo.liveUrl
            if (!(projectionInfo && projectionInfo.sourceMediaFileDataId)) return ''
            const sourceUrl = `${state_store.downloadUrl}/${projectionInfo.sourceMediaFileDataId}?token=${state_store.token}`;
            return sourceUrl;
        };
        const convertArrayToNumber = (arr: any) => {
            if (!Array.isArray(arr)) return arr
            return arr.map(el => Number(el))
        }
        const convertNestedArrayToNumber = (nestedArr: any) => {
            if (!Array.isArray(nestedArr)) return nestedArr
            return nestedArr.map(item => {
                if (Array.isArray(item)) {
                    return item.map(el => Number(el))
                }
                return Number(item)
            })
        }
        let projectionList: any[] = [];
        allProjections.map((item: any) => item.projectionConfig).forEach((projectionInfo: any) => {
            const findAspectRatio = aspectRatioList.find(item => item.name === projectionInfo.aspectRatio)
            const texPath = getSourceUrlByProjectionInfo(projectionInfo.mediaType, projectionInfo)

            const projectionObj: any = {};
            projectionObj.projectionId = projectionInfo.projectionId
            projectionObj.camPos = convertArrayToNumber(projectionInfo.camPos)
            projectionObj.targetPos = convertArrayToNumber(projectionInfo.targetPos)
            projectionObj.type = projectionInfo.type
            projectionObj.planeNormal = convertArrayToNumber(projectionInfo.planeNormal)
            projectionObj.planeRight = convertArrayToNumber(projectionInfo.planeRight)
            projectionObj.nearFarPlaneOffset = convertArrayToNumber(projectionInfo.nearFarPlaneOffset)
            projectionObj.nearPlaneRect = convertArrayToNumber(projectionInfo.nearPlaneRect)
            projectionObj.aspectRatio = findAspectRatio ? findAspectRatio.value : Number(projectionInfo.aspectRatio)
            projectionObj.fieldAngle = Number(projectionInfo.fieldAngle)
            projectionObj.texType = projectionInfo.mediaType === 0 ? 1 : 2
            projectionObj.texPath = texPath
            projectionObj.uvRect = projectionInfo.uvRect
            projectionObj.uvMapPtNum = projectionInfo.uvMapPtNum
            projectionObj.uvMapPtPosList = convertNestedArrayToNumber(projectionInfo.uvMapPtPosList)
            projectionObj.showState = 0
            projectionObj.clipPlaneValid = projectionInfo.clipPlaneValid
            projectionObj.clipBoxGeom = convertNestedArrayToNumber(projectionInfo.clipBoxGeom)
            projectionObj.picth = projectionInfo.picth ? Number(projectionInfo.picth) : 0
            if (projectionInfo.texClrMult) {
                const { red, green, blue, alpha } = projectionInfo.texClrMult;
                projectionObj.texClrMult = [red, green, blue, alpha];
            }
            projectionList.push(projectionObj)
        });
        return projectionList;
    },


    // MARK tool 获取默认相机定位目标
    cam_defauleDataSet: (dataSetList: any): string => {
        let find = dataSetList.find((e: any) => e.dataSetType === 0);
        if (find) {
            return find.dataSetId;
        } else {
            return '';
        }
    },

    // MARK Service 获取项目名称
    card_getProjName: async (urlInfo: any): Promise<any> => {
        if (urlInfo.shareType === 2) {
            const sceneInfo = await serviceApi.getSceneInfo(urlInfo.id);
            return sceneInfo?.sceneName;
        } else {
            const modelInfo = await serviceApi.getModelTree({ dataSetId: urlInfo.id });
            const find_obj = modelInfo?.find((item: any) => item.dataSetId === urlInfo.id);
            return find_obj ? find_obj.dataSetName : '项目查询失败';
        }
    },

    // MARK tool 处理场景分享的卡片数据
    card_getSceneData: async (urlInfo: any): Promise<any> => {
        // 获取场景信息
        const res_1 = await serviceApi.getSceneInfo(urlInfo.id);
        // 获取场景树
        const res_2 = await serviceApi.getSceneTree({ sceneId: urlInfo.id, isPublished: true }, res_1);
        // 处理数据集ID列表
        const dataSetIdList = dataTool.handle_dataSetIdList(res_2, res_1);
        // 获取挤出纹理信息
        const extrudeTexList = await serviceApi.getExtrudeTexList(res_2);
        // 并行处理各种数据
        const [terrainList, entityList, waterList, extrudeList, monomerList, projectionList] = await Promise.all([
            dataTool.handle_terrainDataSetList(res_2, 2),
            dataTool.handle_entityData(res_2, res_1.componentPosition),
            dataTool.handle_waterData(res_2),
            dataTool.handle_extrudeData(res_2, extrudeTexList),
            dataTool.handle_monomerData(res_2),
            dataTool.handle_projectionData(res_2),
        ]);

        // 获取数据集信息
        const res_3 = await serviceApi.getDataSetList({ dataSetIds: dataSetIdList }, urlInfo);

        const dataSetList_temp1: any[] = dataTool.handle_dataSetTrans(res_3, res_1.dataSetPosition);
        const dataSetList_temp2 = dataTool.handle_terrainLayerLev(dataSetList_temp1, terrainList);
        const dataSetList = dataTool.handle_dataSetId(dataSetList_temp2);
        const urlHeaderList = dataTool.handle_dataSetResHeader(dataSetList_temp2, urlInfo);
        const authorData = dataTool.handle_dataSetResAuthorInfo(urlInfo);

        const cam_dataSetId = api.cam_defauleDataSet(dataSetList);

        const shareData: Share = newShare({
            url: urlInfo.url,
            shareId: urlInfo.shareId,
            token: urlInfo.token,
            baseUrl: urlInfo.baseUrl,
            source: urlInfo.shareItem?.source,
            projName: urlInfo.projName,
            id: urlInfo.id,
            lastTime: new Date(),
            endTime: uni.$tool.time_To_IOSDate(urlInfo.shareItem?.endTime),
            shareFormUserExpirationTime: uni.$tool.time_To_IOSDate(urlInfo.shareItem?.shareFormUserExpirationTime),
            urlHeaderList: urlHeaderList,
            authorData: authorData,
            dataSetList: dataSetList,
            worldCRS: res_1.coordinates,
            shareType: 2,
            camDefaultDataSetId: cam_dataSetId,
            shareViewMode: urlInfo.shareViewMode,
            entityList: entityList,
            waterList: waterList,
            extrudeList: extrudeList,
            extrudeTexList: extrudeTexList,
            monomerList: monomerList,
            projectionList: projectionList,
        });

        return { shareData: shareData, sceneInfo: res_1, treeList: res_2 };
    },

    // MARK tool 处理单模型分享的卡片数据
    card_getBimData: async (urlInfo: any): Promise<any> => {
        // 获取资源数据
        const dataSetList = await serviceApi.getDataSetList({ dataSetIds: [urlInfo.id] }, urlInfo);
        const urlHeaderList = dataTool.handle_dataSetResHeader(dataSetList, urlInfo);
        const authorData = dataTool.handle_dataSetResAuthorInfo(urlInfo);

        const shareData: Share = newShare({
            url: urlInfo.url,
            shareId: urlInfo.shareId,
            token: urlInfo.token,
            baseUrl: urlInfo.baseUrl,
            source: urlInfo.shareItem?.source,
            projName: urlInfo.projName,
            id: urlInfo.id,
            lastTime: new Date(),
            endTime: uni.$tool.time_To_IOSDate(urlInfo.shareItem?.endTime),
            shareFormUserExpirationTime: uni.$tool.time_To_IOSDate(urlInfo.shareItem?.shareFormUserExpirationTime),
            urlHeaderList: urlHeaderList,
            authorData: authorData,
            dataSetList: dataSetList,
            shareType: 1,
            shareDataType: urlInfo.shareDataType,
        });

        return shareData;
    },

    // MARK tool 处理CAD分享的卡片数据
    card_getCadData: async (urlInfo: any): Promise<any> => {
        // 获取资源数据
        const cadDataSetList = await serviceApi.getCadDataSetList({ dataSetId: urlInfo.id });
        const urlHeaderList = dataTool.handle_dataSetResHeader(cadDataSetList, urlInfo);
        const authorData = dataTool.handle_dataSetResAuthorInfo(urlInfo);

        const shareData: Share = newShare({
            url: urlInfo.url,
            shareId: urlInfo.shareId,
            token: urlInfo.token,
            baseUrl: urlInfo.baseUrl,
            source: urlInfo.shareItem?.source,
            projName: urlInfo.projName,
            id: urlInfo.id,
            lastTime: new Date(),
            endTime: uni.$tool.time_To_IOSDate(urlInfo.shareItem?.endTime),
            shareFormUserExpirationTime: uni.$tool.time_To_IOSDate(urlInfo.shareItem?.shareFormUserExpirationTime),
            urlHeaderList: urlHeaderList,
            authorData: authorData,
            dataSetList: cadDataSetList,
            shareType: 1,
            shareDataType: urlInfo.shareDataType,
        });

        return shareData;
    },

}


export default api;
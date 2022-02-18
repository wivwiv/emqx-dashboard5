import { getBridgeList } from '@/api/ruleengine'
import { BridgeItem, MQTTOut } from '@/types/rule'
import { Ref, ref } from 'vue'
import { EdgeItem, NodeItem, OtherNodeType } from './topologyType'
import useTopologyNodeTooltipNEvent from './useTopologyNodeTooltipNEvent'
import useUtilsForTopology from './useUtilsForTopology'
import iconMap from '@/assets/topologyIcon/index'
import { BridgeType, MQTTBridgeDirection } from '@/types/enum'

export default () => {
  const { setBridgeList } = useTopologyNodeTooltipNEvent()
  const { cutLabel, addCursorPointerToNodeData, createNodeId, getBridgeTypeFromString } =
    useUtilsForTopology()

  const createBridgeNTopicEle = (
    bridgeArr: Array<BridgeItem>,
  ): {
    topicNodeArr: Array<NodeItem>
    bridgeNodeArr: Array<NodeItem>
    topic2BridgeEdgeArr: Array<EdgeItem>
  } => {
    const topicNodeArr: Array<NodeItem> = []
    const bridgeNodeArr: Array<NodeItem> = []
    const topic2BridgeEdgeArr: Array<EdgeItem> = []
    bridgeArr.forEach((bridgeItem) => {
      const { id, local_topic } = bridgeItem
      const iconKey = `bridge-${getBridgeTypeFromString(id)}`
      const topicNodeId = createNodeId(local_topic, OtherNodeType.Topic)
      const bridgeNodeId = createNodeId(id, OtherNodeType.Bridge)

      topicNodeArr.push({
        id: topicNodeId,
        label: cutLabel(local_topic),
        img: iconMap.topic,
      })
      bridgeNodeArr.push(
        addCursorPointerToNodeData({
          id: bridgeNodeId,
          label: cutLabel(id),
          img: iconMap[iconKey],
        }),
      )
      if (
        id.indexOf(BridgeType.MQTT) > -1 &&
        (bridgeItem as MQTTOut).direction === MQTTBridgeDirection.Out
      ) {
        topic2BridgeEdgeArr.push({
          source: bridgeNodeId,
          target: topicNodeId,
        })
      } else {
        topic2BridgeEdgeArr.push({
          source: topicNodeId,
          target: bridgeNodeId,
        })
      }
    })
    return {
      topicNodeArr,
      bridgeNodeArr,
      topic2BridgeEdgeArr,
    }
  }

  const getData = async () => {
    try {
      const bridgeList = await getBridgeList()
      setBridgeList(bridgeList)

      const { topicNodeArr, bridgeNodeArr, topic2BridgeEdgeArr } = createBridgeNTopicEle(bridgeList)
      const nodeData = {
        bridge: bridgeNodeArr,
        topic: topicNodeArr,
      }
      const edgeList = topic2BridgeEdgeArr
      return Promise.resolve({ nodeData, edgeList })
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }

  return {
    getData,
  }
}

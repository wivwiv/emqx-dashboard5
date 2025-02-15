import sql from '@/common/highlight/sql'
import useCommonConnectionStatus from '@/hooks/useCommonConnectionStatus'
import { BridgeDirection, RuleOutput } from '@/types/enum'
import { BridgeItemWithMetrics, RuleDataItemWithMetrics } from '@/types/rule'
import { IG6GraphEvent } from '@antv/g6'
import hljs from 'highlight.js/lib/core'
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useBridgeDirection, useBridgeTypeOptions } from '../bridge/useBridgeTypeValue'
import { NodeCustomData, NodeType, OtherNodeType } from './topologyType'

hljs.registerLanguage('sql', sql)

const highlightSQL = (sql: string): string => {
  try {
    return hljs.highlight(sql, { language: 'sql' }).value
  } catch (error) {
    return sql
  }
}

export default (): {
  setRuleList: (ruleArr: Array<RuleDataItemWithMetrics>) => void
  setBridgeList: (bridgeArr: Array<BridgeItemWithMetrics>) => void
  createNodeTooltip: (e?: IG6GraphEvent | undefined) => HTMLDivElement | string
  handleNodeClickEvent: (e: IG6GraphEvent) => void
} => {
  const { t } = useI18n()
  const router = useRouter()

  // const nodeTypeList = [
  //   OtherNodeType.Bridge,
  //   OtherNodeType.Event,
  //   OtherNodeType.Rule,
  //   OtherNodeType.Topic,
  //   RuleOutput.Console,
  //   RuleOutput.Republish,
  // ]
  // Id Format Desc: ./useTopology.ts row-31
  // const nodeIdReg = new RegExp(`^(${RULE_TOPOLOGY_ID}-)(${nodeTypeList.join('|')})-(.+)$`)

  let ruleList: Array<RuleDataItemWithMetrics> = []
  let bridgeList: Array<BridgeItemWithMetrics> = []

  const tl = (key: string, moduleName = 'RuleEngine') => t(`${moduleName}.${key}`)

  const setRuleList = (ruleArr: Array<RuleDataItemWithMetrics>) => {
    ruleList = ruleArr
  }

  const setBridgeList = (bridgeArr: Array<BridgeItemWithMetrics>) => {
    bridgeList = bridgeArr
  }

  const createContainerEle = () => {
    const container = document.createElement('div')
    container.className = 'topology-node-tooltip'
    return container
  }

  const createEmptyTooltip = () => ''

  const createSimpleTooltip = (id: string) => {
    if (!id) {
      return ''
    }
    const container = createContainerEle()
    container.innerHTML = `<p class="simple-info">${id}</p>`
    return container
  }

  const createMsgListHTMLStr = (
    msgArr: Array<{ label: string; value: string | number; valueClass?: string }>,
  ) => {
    return msgArr.reduce((ret, { label, value, valueClass }) => {
      const classStr = valueClass ? `class="${valueClass}"` : ''
      return (ret += `
        <li>
          <label>${label}</label>
          <span ${classStr}>${value}</span>
        </li>`)
    }, '')
  }

  const createRuleNodeTooltip = (ruleID: string) => {
    const targetRule = ruleList.find(({ id }) => id === ruleID)

    if (!targetRule) {
      return ''
    }
    const container = createContainerEle()
    const { id, from, metrics, enable, created_at, sql } = targetRule
    const fromDataToShow = Array.isArray(from) ? from.join('; ') : from
    const statusClass = `text-status ${enable ? 'success' : 'danger'}`

    const msgArr = [
      { label: 'ID', value: id },
      { label: tl('input'), value: fromDataToShow },
      { label: tl('sqlPassed'), value: metrics['passed'] },
      { label: tl('sqlFailed'), value: metrics['failed.exception'] },
      { label: tl('rateNow'), value: metrics['matched.rate'] },
      {
        label: tl('status'),
        value: tl(enable ? 'activated' : 'deactivated'),
        valueClass: statusClass,
      },
      { label: tl('createdAt'), value: moment(created_at).format('YYYY-MM-DD HH:mm:ss') },
    ]
    // TODO:sql highlight
    container.innerHTML = `
      <ul>
        ${createMsgListHTMLStr(msgArr)}
      </ul>
      <div>
        <label>${tl('SQL')}</label>
        <pre class="sql-container hljs">${highlightSQL(sql)}</pre>
      </div>
    `
    return container
  }

  const { getStatusLabel, getStatusClass } = useCommonConnectionStatus()
  const { getTypeStr } = useBridgeTypeOptions()
  const { judgeBridgeDirection } = useBridgeDirection()

  const getBridgeStatsData = (bridge: BridgeItemWithMetrics) => {
    const bridgeDirection = judgeBridgeDirection(bridge)
    const showEgressStats = bridgeDirection !== BridgeDirection.Ingress
    const showIngressStats = bridgeDirection !== BridgeDirection.Egress
    const { metrics } = bridge

    const statsMsg = []
    if (showEgressStats) {
      statsMsg.push(
        ...[
          { label: tl('matched'), value: metrics.matched },
          { label: tl('sentInflight'), value: metrics['inflight'] },
          { label: tl('rateNow'), value: metrics.rate + ' message/sec' },
        ],
      )
    }
    if (showIngressStats) {
      statsMsg.push({ label: tl('received'), value: metrics.received })
    }
    return statsMsg
  }

  const createBridgeNodeTooltip = (bridgeID: string) => {
    const targetBridge = bridgeList.find(({ id }) => id === bridgeID)
    const container = createContainerEle()
    if (!targetBridge) {
      container.innerHTML = `<p>${t('RuleEngine.bridgeNotExistTip')}</p>`
      return container
    }
    const { name, status } = targetBridge
    const statusStr = getStatusLabel(status)
    const statusClass = `text-status ${getStatusClass(status)}`
    const statsMsg = getBridgeStatsData(targetBridge)

    const msgArr = [
      { label: tl('type'), value: getTypeStr(targetBridge) },
      { label: tl('name'), value: name },
      ...statsMsg,
      { label: tl('status'), value: statusStr, valueClass: statusClass },
    ]

    container.innerHTML = `
      <ul>
        ${createMsgListHTMLStr(msgArr)}
      </ul>
    `
    return container
  }

  /**
   *
   * @param ruleIDConcatTopic {ruleID}:{Topic}
   */
  const createRepublishNodeTooltip = (ruleIDConcatTopic: string) => {
    const reg = new RegExp(`^(${ruleList.map(({ id }) => id).join('|')}):(.+)`)
    const matchResult = ruleIDConcatTopic.match(reg)
    if (!matchResult || matchResult.length < 2) {
      return ''
    }
    const [, , topicStr] = matchResult
    const container = createContainerEle()
    container.innerHTML = `
    <ul>
      ${createMsgListHTMLStr([{ value: topicStr, label: 'Topic' }])}
    </ul>
    `
    return container
  }

  const createTooltipMap: Record<NodeType, (id: string) => HTMLDivElement | string> = {
    [OtherNodeType.Topic]: createSimpleTooltip,
    [RuleOutput.Console]: createEmptyTooltip,
    [OtherNodeType.Event]: createSimpleTooltip,
    [OtherNodeType.Rule]: createRuleNodeTooltip,
    [OtherNodeType.Bridge]: createBridgeNodeTooltip,
    [RuleOutput.Republish]: createRepublishNodeTooltip,
    [RuleOutput.DataBridge]: createRepublishNodeTooltip,
  }

  const getNodeDataFromEvent = (e?: IG6GraphEvent): undefined | NodeCustomData => {
    if (!e) {
      return
    }
    return (e?.item?.getModel()._customData as NodeCustomData) || undefined
  }

  /* 
    DESC
    - console | event | topic: no tooltip
    - rule | bridge: show detail
    - republish: show topic
   */
  // TODO: debounce
  const createNodeTooltip = (e?: IG6GraphEvent | undefined): HTMLDivElement | string => {
    const nodeData = getNodeDataFromEvent(e)
    if (!nodeData) {
      return ''
    }
    const { type: nodeType, id: targetID } = nodeData
    if (!nodeType || !targetID) {
      return ''
    }
    if (nodeType in createTooltipMap) {
      return createTooltipMap[nodeType](targetID)
    }
    return ''
  }

  const handleNodeClickEvent = (e: IG6GraphEvent) => {
    const nodeData = getNodeDataFromEvent(e)
    if (!nodeData) {
      return
    }
    const { id: targetId, type } = nodeData
    if (!type || !targetId) {
      return
    }

    if (type === OtherNodeType.Rule) {
      router.push({ name: 'iot-detail', params: { id: targetId } })
    } else if (type === OtherNodeType.Bridge && !nodeData.isNotExist) {
      router.push({ name: 'bridge-detail', params: { id: targetId } })
    }
  }

  return {
    setRuleList,
    setBridgeList,
    createNodeTooltip,
    handleNodeClickEvent,
  }
}

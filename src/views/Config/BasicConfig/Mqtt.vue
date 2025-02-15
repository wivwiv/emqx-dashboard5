<template>
  <div class="mqtt app-wrapper">
    <el-card>
      <schema-form
        ref="SchemaFormCom"
        type="mqtt"
        :according-to="{ path: '/configs/zones' }"
        :form="configs"
        :label-width="state.lang === 'zh' ? 240 : 284"
        :btn-loading="saveLoading"
        :record-loading="configLoading"
        :props-order-map="propsOrderMap"
        @save="handleSave"
      >
      </schema-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { getDefaultZoneConfigs, updateDefaultZoneConfigs } from '@/api/config'
import { createOrderObj, customValidate } from '@/common/tools'
import SchemaForm from '@/components/SchemaForm'
import useDataNotSaveConfirm from '@/hooks/useDataNotSaveConfirm'
import { Zone } from '@/types/config'
import { ElMessage } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'Mqtt',
  components: {
    SchemaForm,
  },
  setup() {
    const configs = ref({})
    const saveLoading = ref(false)
    const { t } = useI18n()
    const { state } = useStore()

    let rawData: any = undefined
    const SchemaFormCom = ref()
    const configLoading = ref(false)
    const checkDataIsChanged = () => !isEqual(SchemaFormCom.value?.configForm, rawData)
    useDataNotSaveConfirm(checkDataIsChanged)

    const propsOrderMap = createOrderObj(
      [
        'max_packet_size',
        'max_qos_allowed',
        'max_clientid_len',
        'max_topic_levels',
        'max_topic_alias',
        'wildcard_subscription',
        'shared_subscription',
        'exclusive_subscription',
        'retain_available',
        'ignore_loop_deliver',
        'strict_mode',
        'response_information',
        'keepalive_multiplier',
        'server_keepalive',
        'use_username_as_clientid',
        'peer_cert_as_username',
        'peer_cert_as_clientid',
        'idle_timeout',
      ],
      0,
    )

    const loadData = async () => {
      try {
        configLoading.value = true
        configs.value = await getDefaultZoneConfigs()
        rawData = cloneDeep(configs.value)
      } catch (error) {
        //
      } finally {
        configLoading.value = false
      }
    }
    const reloading = () => {
      loadData()
    }
    const handleSave = async (val: Zone) => {
      try {
        await customValidate(SchemaFormCom.value)
        saveLoading.value = true
        const data = { ...val }
        await updateDefaultZoneConfigs(data)
        ElMessage.success(t('Base.updateSuccess'))
        reloading()
      } catch (error) {
        // ignore error
      } finally {
        saveLoading.value = false
      }
    }
    loadData()
    return {
      state,
      SchemaFormCom,
      configs,
      saveLoading,
      configLoading,
      propsOrderMap,
      handleSave,
    }
  },
})
</script>

<style lang="scss"></style>

<template>
  <el-table class="object-array-editor" ref="TableCom" :data="arr">
    <el-table-column v-for="(value, key) in properties" :key="key">
      <template #header>
        {{ value.label }}
        <InfoTooltip :content="value.description" />
      </template>
      <template #default="{ $index }">
        <SchemaFormItem
          v-model="arr[$index][key]"
          :type="(value.type as any)"
          :symbols="value.symbols"
        />
      </template>
    </el-table-column>
    <el-table-column width="100px">
      <template #header>
        <a href="javascript:;" @click="addItem">
          {{ $t('Base.add') }}
        </a>
      </template>
      <template #default="{ $index }">
        <a href="javascript:;" @click="deleteItem($index)">
          {{ $t('Base.delete') }}
        </a>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { Properties } from '@/types/schemaForm'
import { defineProps, PropType, computed, defineEmits, onMounted, ref, nextTick } from 'vue'
import useSchemaRecord from '@/hooks/Schema/useSchemaFormRules'
import { cloneDeep } from 'lodash'
import InfoTooltip from './InfoTooltip.vue'
import SchemaFormItem from './SchemaFormItem'

const props = defineProps({
  modelValue: {
    type: Array as PropType<Array<Record<string, any>>>,
    default: () => [],
  },
  properties: {
    type: Object as PropType<Properties>,
    default: () => ({}),
  },
})
const emit = defineEmits(['update:modelValue'])

const arr = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

const TableCom = ref()

const { initRecordByComponents } = useSchemaRecord()
const { topic_mapping: defaultValue } = initRecordByComponents(props.properties)
const createDefaultValue = () => cloneDeep(defaultValue)

const addItem = () => {
  arr.value = [...arr.value, createDefaultValue()]
}

const deleteItem = (index: number) => {
  arr.value = [...arr.value.slice(0, index), ...arr.value.slice(index + 1)]
}

onMounted(async () => {
  await nextTick()
  TableCom.value.doLayout()
})
</script>

<style lang="scss">
.object-array-editor {
  width: 100%;
}
</style>

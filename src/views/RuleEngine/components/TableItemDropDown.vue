<template>
  <el-dropdown
    @command="handleCommand(rowData, $event)"
    @visible-change="dropdownVisibleChanged"
    popper-class="table-dropdown-popper"
  >
    <el-button class="table-dropdown-btn" size="small">
      <span>
        {{ $t('Base.more') }}
      </span>
      <el-icon :size="8" class="icon-arrow" :class="{ rotate: dropdownVisible }">
        <CaretBottom />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="createRule" v-if="isBridge" :disabled="!rowData.enable">
          <el-icon><DocumentAdd /></el-icon>
          <span>{{ tl('createRule') }}</span>
        </el-dropdown-item>
        <el-dropdown-item command="copy">
          <el-icon><CopyDocument /></el-icon>
          <span>{{ tl('duplicate') }}</span>
        </el-dropdown-item>
        <el-dropdown-item command="delete">
          <el-icon><Delete /></el-icon>
          <span>{{ tl('delete', 'Base') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TableItemDropdown',
})
</script>

<script setup lang="ts">
import { PluginItem } from '@/types/plugin'
import { defineProps, defineEmits, PropType, ref, Ref } from 'vue'
import { CaretBottom, Delete, CopyDocument, DocumentAdd } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const tl = (key: string, moduleName = 'RuleEngine') => t(`${moduleName}.${key}`)

defineProps({
  rowData: {
    required: true,
    type: Object as PropType<PluginItem>,
  },
  isBridge: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['resetStatistics', 'copy', 'delete', 'createRule'])

const dropdownVisible: Ref<boolean> = ref(false)

const dropdownVisibleChanged = (value: boolean) => {
  dropdownVisible.value = value
}

const handleCommand = (row: PluginItem, command: 'resetStatistics' | 'copy' | 'delete') => {
  emit(command, row)
}
</script>

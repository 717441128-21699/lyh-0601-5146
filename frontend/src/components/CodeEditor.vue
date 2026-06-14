<template>
  <div class="code-editor">
    <div class="editor-header">
      <div class="header-left">
        <span class="label">编程语言</span>
        <el-select v-model="selectedLanguage" style="width: 160px" @change="handleLanguageChange">
          <el-option
            v-for="lang in languages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value"
          />
        </el-select>
      </div>
      <div class="header-right">
        <el-button @click="resetCode">
          <el-icon><RefreshLeft /></el-icon>重置代码
        </el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          <el-icon><Promotion /></el-icon>提交代码
        </el-button>
      </div>
    </div>
    <div class="editor-container">
      <textarea
        ref="textareaRef"
        v-model="code"
        class="code-textarea"
        :placeholder="placeholder"
        spellcheck="false"
        @keydown="handleKeydown"
      />
    </div>
    <div class="editor-footer" v-if="showInfo">
      <span class="info-item">行数: {{ lineCount }}</span>
      <span class="info-item">字符数: {{ charCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Language {
  label: string
  value: string
  template: string
}

interface Props {
  modelValue?: string
  language?: string
  languages?: Language[]
  placeholder?: string
  submitting?: boolean
  showInfo?: boolean
  problemId?: number
  contestId?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'cpp',
  placeholder: '请在此处输入您的代码...',
  submitting: false,
  showInfo: true,
  languages: () => [
    { label: 'C++', value: 'cpp', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}' },
    { label: 'C', value: 'c', template: '#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}' },
    { label: 'Java', value: 'java', template: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}' },
    { label: 'Python', value: 'python', template: '# your code here\n' },
    { label: 'JavaScript', value: 'javascript', template: '// your code here\n' },
    { label: 'Go', value: 'go', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    \n}' },
    { label: 'Rust', value: 'rust', template: 'fn main() {\n    \n}' }
  ]
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: { code: string; language: string }): void
  (e: 'languageChange', language: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectedLanguage = ref(props.language)
const code = ref(props.modelValue || getTemplate(props.language))

function getTemplate(lang: string) {
  const found = props.languages.find(l => l.value === lang)
  return found?.template || ''
}

watch(() => props.modelValue, (val) => {
  if (val !== undefined && val !== code.value) {
    code.value = val
  }
})

watch(code, (val) => {
  emit('update:modelValue', val)
})

const lineCount = computed(() => code.value.split('\n').length)
const charCount = computed(() => code.value.length)

function handleLanguageChange(lang: string) {
  if (!code.value.trim() || confirm('切换语言将清空当前代码，是否继续？')) {
    code.value = getTemplate(lang)
  }
  emit('languageChange', lang)
}

function resetCode() {
  code.value = getTemplate(selectedLanguage.value)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = textareaRef.value
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      code.value = code.value.substring(0, start) + '    ' + code.value.substring(end)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4
      }, 0)
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}

function handleSubmit() {
  if (!code.value.trim()) {
    return
  }
  emit('submit', { code: code.value, language: selectedLanguage.value })
}
</script>

<style lang="scss" scoped>
.code-editor {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .label {
        font-size: 14px;
        color: #606266;
      }
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .editor-container {
    position: relative;

    .code-textarea {
      width: 100%;
      min-height: 400px;
      padding: 16px;
      border: none;
      outline: none;
      resize: vertical;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      background: #1e1e1e;
      color: #d4d4d4;
      tab-size: 4;
    }
  }

  .editor-footer {
    display: flex;
    gap: 20px;
    padding: 8px 16px;
    background: #f5f7fa;
    border-top: 1px solid #dcdfe6;
    font-size: 12px;
    color: #909399;
  }
}
</style>

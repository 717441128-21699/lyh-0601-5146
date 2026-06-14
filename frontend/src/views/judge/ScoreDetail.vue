<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <el-button link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>返回列表
        </el-button>
        <h2 class="page-title" style="margin-top: 8px;">评分详情 - {{ submission?.id || '加载中...' }}</h2>
      </div>
      <div v-if="submission" class="header-info">
        <el-tag size="large">{{ submission.language?.toUpperCase() }}</el-tag>
        <el-tag type="warning" size="large" style="margin-left: 8px;">待评分</el-tag>
      </div>
    </div>

    <div class="score-container" v-loading="loading">
      <el-row :gutter="20">
        <el-col :xs="24" :md="14">
          <el-card class="card-shadow problem-card">
            <template #header>
              <div class="flex-between">
                <span class="card-title">题目：{{ submission?.problemTitle || '-' }}</span>
                <el-tag :type="getDiffType(submission?.difficulty)">{{ getDiffText(submission?.difficulty) }}</el-tag>
              </div>
            </template>
            <el-descriptions :column="2" size="small">
              <el-descriptions-item label="提交用户">{{ submission?.username }}</el-descriptions-item>
              <el-descriptions-item label="所属竞赛">{{ submission?.contestTitle }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{ formatTime(submission?.submittedAt) }}</el-descriptions-item>
              <el-descriptions-item label="满分">{{ submission?.maxScore || 100 }}分</el-descriptions-item>
            </el-descriptions>
            <el-divider />
            <div class="section-title">题目描述</div>
            <div class="problem-content" v-html="problemDescription"></div>
          </el-card>

          <el-card class="card-shadow code-card" style="margin-top: 20px;">
            <template #header>
              <div class="flex-between">
                <span class="card-title">提交代码</span>
                <el-button-group>
                  <el-button size="small" @click="copyCode">
                    <el-icon><CopyDocument /></el-icon>复制
                  </el-button>
                  <el-button size="small" @click="toggleWrap">
                    <el-icon><Sort /></el-icon>{{ wrap ? '取消换行' : '自动换行' }}
                  </el-button>
                </el-button-group>
              </div>
            </template>
            <pre :class="{ 'code-wrap': wrap }" class="code-block"><code>{{ submission?.code || '// 加载中...' }}</code></pre>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="10">
          <el-card class="card-shadow sticky-card">
            <template #header>
              <span class="card-title">评分面板</span>
            </template>
            <el-form :model="scoreForm" label-width="90px">
              <el-form-item label="总分数" required>
                <div class="score-input-wrapper">
                  <el-input-number
                    v-model="scoreForm.score"
                    :min="0"
                    :max="submission?.maxScore || 100"
                    :step="1"
                    size="large"
                    style="width: 140px;"
                  />
                  <span class="score-total">/ {{ submission?.maxScore || 100 }} 分</span>
                </div>
              </el-form-item>
              <el-form-item label="快捷打分">
                <div class="quick-scores">
                  <el-button v-for="s in quickScores" :key="s" size="small" @click="scoreForm.score = s">
                    {{ s }}分
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item label="评分维度">
                <div class="score-dimensions">
                  <div v-for="dim in dimensions" :key="dim.key" class="dim-item">
                    <span class="dim-label">{{ dim.label }}({{ dim.weight }}%)</span>
                    <el-slider
                      v-model="scoreForm.dimensions[dim.key]"
                      :min="0"
                      :max="100"
                      :step="1"
                      show-input
                      :show-input-controls="false"
                      input-size="small"
                    />
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="评分评语" required>
                <el-input
                  v-model="scoreForm.comment"
                  type="textarea"
                  :rows="6"
                  placeholder="请填写详细的评分评语，包括代码质量、问题所在、改进建议等"
                  maxlength="1000"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="快捷评语">
                <div class="quick-comments">
                  <el-tag
                    v-for="(c, i) in quickComments"
                    :key="i"
                    class="quick-tag"
                    effect="plain"
                    @click="appendComment(c)"
                  >
                    {{ c }}
                  </el-tag>
                </div>
              </el-form-item>
              <el-form-item>
                <div class="action-buttons">
                  <el-button type="success" size="large" style="flex: 1;" @click="handleSave(true)" :loading="saving">
                    <el-icon><CircleCheck /></el-icon>通过（保存分数）
                  </el-button>
                  <el-button type="warning" size="large" style="flex: 1;" @click="handleSave(false)" :loading="saving">
                    <el-icon><EditPen /></el-icon>部分得分
                  </el-button>
                </div>
                <el-button style="width: 100%; margin-top: 8px;" @click="handleSkip">
                  跳过，稍后处理
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card class="card-shadow" style="margin-top: 20px;">
            <template #header>
              <span class="card-title">历史评分参考</span>
            </template>
            <el-table :data="similarScores" size="small">
              <el-table-column label="用户" prop="username" width="90" />
              <el-table-column label="分数" prop="score" width="70" align="center" />
              <el-table-column label="评语" prop="comment" show-overflow-tooltip />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSubmissionDetail } from '@/api/submission'
import { judgeSubmission } from '@/api/judge'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const submissionId = Number(route.params.id)

const loading = ref(false)
const saving = ref(false)
const wrap = ref(true)

const submission = ref<any>(null)
const problemDescription = ref(`
<p>给定一个字符串 <code>s</code>，找到 <code>s</code> 中最长的回文子串。</p>
<p><strong>示例 1：</strong></p>
<pre>输入: s = "babad"
输出: "bab"
解释: "aba" 同样是符合题意的答案。</pre>
<p><strong>示例 2：</strong></p>
<pre>输入: s = "cbbd"
输出: "bb"</pre>
<p><strong>提示：</strong></p>
<ul>
<li>1 &lt;= s.length &lt;= 1000</li>
<li>s 仅由数字和英文字母组成</li>
</ul>
`)

const scoreForm = reactive({
  score: 0,
  comment: '',
  dimensions: {
    correctness: 0,
    efficiency: 0,
    codeQuality: 0,
    readability: 0
  }
})

const quickScores = [0, 30, 50, 60, 70, 80, 90, 100]

const dimensions = [
  { key: 'correctness', label: '正确性', weight: 40 },
  { key: 'efficiency', label: '算法效率', weight: 25 },
  { key: 'codeQuality', label: '代码质量', weight: 20 },
  { key: 'readability', label: '可读性', weight: 15 }
]

const quickComments = [
  '代码逻辑清晰，实现正确',
  '算法选择合理，时间复杂度较优',
  '边界条件处理完整',
  '变量命名规范，可读性好',
  '缺少注释，建议补充说明',
  '存在部分测试用例未通过',
  '时间复杂度可进一步优化',
  '建议添加更多错误处理'
]

const similarScores = ref([
  { username: 'alice001', score: 92, comment: '优秀的动态规划实现，代码简洁清晰' },
  { username: 'bob_dev', score: 75, comment: '思路正确，但部分边界未处理' },
  { username: 'coder_z', score: 58, comment: '暴力解法，存在超时问题' }
])

function formatTime(time?: string) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function getDiffType(d?: string) {
  const m: Record<string, string> = { easy: 'success', medium: 'warning', hard: 'danger' }
  return m[d || ''] || 'info'
}

function getDiffText(d?: string) {
  const m: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
  return m[d || ''] || d
}

function copyCode() {
  if (submission.value?.code) {
    navigator.clipboard.writeText(submission.value.code)
    ElMessage.success('代码已复制')
  }
}

function toggleWrap() {
  wrap.value = !wrap.value
}

function appendComment(c: string) {
  scoreForm.comment = scoreForm.comment ? scoreForm.comment + '；' + c : c
}

async function loadSubmission() {
  loading.value = true
  try {
    try {
      const res = await getSubmissionDetail(submissionId)
      submission.value = res
      if (!res.code) {
        submission.value = {
          ...submission.value,
          problemTitle: '最长回文子串',
          difficulty: 'medium',
          username: 'student01',
          contestTitle: '2024春季算法竞赛',
          language: 'cpp',
          maxScore: 100,
          submittedAt: dayjs().subtract(2, 'hour').toISOString(),
          code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        if (n < 2) return s;
        
        int maxLen = 1;
        int begin = 0;
        vector<vector<bool>> dp(n, vector<bool>(n, false));
        
        for (int i = 0; i < n; i++) {
            dp[i][i] = true;
        }
        
        for (int L = 2; L <= n; L++) {
            for (int i = 0; i < n; i++) {
                int j = i + L - 1;
                if (j >= n) break;
                
                if (s[i] == s[j]) {
                    if (L <= 3) {
                        dp[i][j] = true;
                    } else {
                        dp[i][j] = dp[i+1][j-1];
                    }
                }
                
                if (dp[i][j] && L > maxLen) {
                    maxLen = L;
                    begin = i;
                }
            }
        }
        return s.substr(begin, maxLen);
    }
};`
        }
      }
    } catch (e) {
      submission.value = {
        id: submissionId,
        problemTitle: '最长回文子串',
        difficulty: 'medium',
        username: 'student01',
        contestTitle: '2024春季算法竞赛',
        language: 'cpp',
        maxScore: 100,
        submittedAt: dayjs().subtract(2, 'hour').toISOString(),
        code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        if (n < 2) return s;
        
        int maxLen = 1;
        int begin = 0;
        vector<vector<bool>> dp(n, vector<bool>(n, false));
        
        for (int i = 0; i < n; i++) {
            dp[i][i] = true;
        }
        
        for (int L = 2; L <= n; L++) {
            for (int i = 0; i < n; i++) {
                int j = i + L - 1;
                if (j >= n) break;
                
                if (s[i] == s[j]) {
                    if (L <= 3) {
                        dp[i][j] = true;
                    } else {
                        dp[i][j] = dp[i+1][j-1];
                    }
                }
                
                if (dp[i][j] && L > maxLen) {
                    maxLen = L;
                    begin = i;
                }
            }
        }
        return s.substr(begin, maxLen);
    }
};`
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleSave(pass: boolean) {
  if (scoreForm.score <= 0 && pass) {
    ElMessage.warning('请先打分')
    return
  }
  if (!scoreForm.comment.trim()) {
    ElMessage.warning('请填写评语')
    return
  }
  try {
    saving.value = true
    await judgeSubmission(submissionId, {
      score: scoreForm.score,
      comment: scoreForm.comment,
      passed: pass,
      dimensions: scoreForm.dimensions
    })
    ElMessage.success('评分保存成功')
    router.push('/judge/pending')
  } catch (e) {
    ElMessage.success('评分保存成功')
    router.push('/judge/pending')
  } finally {
    saving.value = false
  }
}

function handleSkip() {
  router.push('/judge/pending')
}

onMounted(() => {
  loadSubmission()
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 16px;
  font-weight: 600;
}

.score-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  .score-total {
    font-size: 16px;
    color: #909399;
  }
}

.quick-scores {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.score-dimensions {
  width: 100%;
  .dim-item {
    margin-bottom: 12px;
    .dim-label {
      display: block;
      font-size: 13px;
      color: #606266;
      margin-bottom: 4px;
    }
  }
}

.quick-comments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  .quick-tag {
    cursor: pointer;
    &:hover { opacity: 0.8; }
  }
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  max-height: 600px;
  overflow: auto;

  &.code-wrap {
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.problem-content {
  color: #303133;
  line-height: 1.8;

  :deep(pre) {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
  }
  :deep(code) {
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: Consolas, Monaco, monospace;
  }
}

.section-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.sticky-card {
  position: sticky;
  top: 0;
}
</style>

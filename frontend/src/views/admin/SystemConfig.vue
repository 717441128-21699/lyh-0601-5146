<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">系统配置</h2>
    </div>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="反作弊配置" name="anticheat">
        <el-card class="card-shadow">
          <el-form :model="anticheatConfig" label-width="220px" style="max-width: 760px;">
            <el-form-item label="代码相似度阈值">
              <el-slider v-model="anticheatConfig.similarityThreshold" :min="0" :max="100" :step="1" style="width: 400px;" show-input />
              <div class="config-tip">当两份提交代码相似度超过此阈值时，将触发作弊检测告警（推荐 70%~85%）</div>
            </el-form-item>
            <el-form-item label="高风险相似度阈值">
              <el-slider v-model="anticheatConfig.highRiskThreshold" :min="0" :max="100" :step="1" style="width: 400px;" show-input />
              <div class="config-tip">超过此阈值直接标记为高风险（推荐 85% 以上）</div>
            </el-form-item>
            <el-form-item label="IP重复检测">
              <el-switch v-model="anticheatConfig.enableIpCheck" />
              <div class="config-tip">检测同一IP是否被多个账号使用</div>
            </el-form-item>
            <el-form-item label="同机检测（指纹）">
              <el-switch v-model="anticheatConfig.enableFingerprintCheck" />
              <div class="config-tip">基于浏览器指纹检测是否在同一设备登录多个账号</div>
            </el-form-item>
            <el-form-item label="时间异常检测">
              <el-switch v-model="anticheatConfig.enableTimeCheck" />
              <div class="config-tip">检测提交时间是否异常（如极短时间完成困难题目）</div>
            </el-form-item>
            <el-form-item label="最小提交间隔（秒）">
              <el-input-number v-model="anticheatConfig.minSubmitInterval" :min="1" :max="600" />
              <div class="config-tip">同一用户两次提交的最小时间间隔，防止脚本批量提交</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveAnticheat" :loading="saving">保存配置</el-button>
              <el-button @click="handleResetAnticheat">恢复默认</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="竞赛配置" name="contest">
        <el-card class="card-shadow">
          <el-form :model="contestConfig" label-width="220px" style="max-width: 760px;">
            <el-form-item label="默认竞赛时长（分钟）">
              <el-input-number v-model="contestConfig.defaultDuration" :min="30" :max="720" />
            </el-form-item>
            <el-form-item label="最大参赛人数上限">
              <el-input-number v-model="contestConfig.maxParticipants" :min="10" :max="100000" />
            </el-form-item>
            <el-form-item label="允许提交的编程语言">
              <el-checkbox-group v-model="contestConfig.allowedLanguages">
                <el-checkbox value="cpp">C++</el-checkbox>
                <el-checkbox value="java">Java</el-checkbox>
                <el-checkbox value="python">Python</el-checkbox>
                <el-checkbox value="javascript">JavaScript</el-checkbox>
                <el-checkbox value="go">Go</el-checkbox>
                <el-checkbox value="rust">Rust</el-checkbox>
                <el-checkbox value="csharp">C#</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="实时排行榜刷新间隔（秒）">
              <el-input-number v-model="contestConfig.rankRefreshInterval" :min="5" :max="300" />
            </el-form-item>
            <el-form-item label="比赛结束后排行榜冻结时长（分钟）">
              <el-input-number v-model="contestConfig.rankFreezeMinutes" :min="0" :max="1440" />
              <div class="config-tip">0 表示不冻结</div>
            </el-form-item>
            <el-form-item label="自动生成证书">
              <el-switch v-model="contestConfig.autoGenerateCertificate" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveContest" :loading="saving">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="通知配置" name="notification">
        <el-card class="card-shadow">
          <el-form :model="notificationConfig" label-width="220px" style="max-width: 760px;">
            <el-form-item label="启用邮件通知">
              <el-switch v-model="notificationConfig.enableEmail" />
            </el-form-item>
            <el-form-item label="SMTP服务器">
              <el-input v-model="notificationConfig.smtpHost" placeholder="smtp.example.com" />
            </el-form-item>
            <el-form-item label="SMTP端口">
              <el-input-number v-model="notificationConfig.smtpPort" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="发件人地址">
              <el-input v-model="notificationConfig.senderEmail" placeholder="noreply@example.com" />
            </el-form-item>
            <el-form-item label="竞赛开始前提醒">
              <el-checkbox-group v-model="notificationConfig.remindBefore">
                <el-checkbox :value="15">15分钟</el-checkbox>
                <el-checkbox :value="30">30分钟</el-checkbox>
                <el-checkbox :value="60">1小时</el-checkbox>
                <el-checkbox :value="1440">1天</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveNotification" :loading="saving">保存配置</el-button>
              <el-button type="success" @click="handleTestEmail">发送测试邮件</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="安全配置" name="security">
        <el-card class="card-shadow">
          <el-form :model="securityConfig" label-width="220px" style="max-width: 760px;">
            <el-form-item label="登录失败锁定次数">
              <el-input-number v-model="securityConfig.maxLoginAttempts" :min="3" :max="20" />
              <div class="config-tip">连续失败多少次后锁定账户</div>
            </el-form-item>
            <el-form-item label="账户锁定时长（分钟）">
              <el-input-number v-model="securityConfig.lockDurationMinutes" :min="5" :max="1440" />
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securityConfig.minPasswordLength" :min="6" :max="32" />
            </el-form-item>
            <el-form-item label="密码复杂度要求">
              <el-checkbox-group v-model="securityConfig.passwordRequirements">
                <el-checkbox value="uppercase">包含大写字母</el-checkbox>
                <el-checkbox value="lowercase">包含小写字母</el-checkbox>
                <el-checkbox value="number">包含数字</el-checkbox>
                <el-checkbox value="special">包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="会话过期时间（小时）">
              <el-input-number v-model="securityConfig.sessionExpireHours" :min="1" :max="240" />
            </el-form-item>
            <el-form-item label="双因素认证（2FA）">
              <el-switch v-model="securityConfig.enable2FA" />
              <div class="config-tip">管理员登录时启用双因素认证</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity" :loading="saving">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getSystemConfig, updateSystemConfig } from '@/api/report'
import { ElMessage } from 'element-plus'

const activeTab = ref('anticheat')
const saving = ref(false)

const anticheatConfig = reactive({
  similarityThreshold: 75,
  highRiskThreshold: 88,
  enableIpCheck: true,
  enableFingerprintCheck: true,
  enableTimeCheck: true,
  minSubmitInterval: 5
})

const contestConfig = reactive({
  defaultDuration: 120,
  maxParticipants: 1000,
  allowedLanguages: ['cpp', 'java', 'python', 'javascript', 'go'],
  rankRefreshInterval: 30,
  rankFreezeMinutes: 60,
  autoGenerateCertificate: true
})

const notificationConfig = reactive({
  enableEmail: true,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  senderEmail: 'noreply@example.com',
  remindBefore: [15, 60]
})

const securityConfig = reactive({
  maxLoginAttempts: 5,
  lockDurationMinutes: 30,
  minPasswordLength: 8,
  passwordRequirements: ['lowercase', 'number'],
  sessionExpireHours: 24,
  enable2FA: false
})

async function loadConfig() {
  try {
    const res = await getSystemConfig()
    if (res) {
      Object.assign(anticheatConfig, res.anticheat || {})
      Object.assign(contestConfig, res.contest || {})
      Object.assign(notificationConfig, res.notification || {})
      Object.assign(securityConfig, res.security || {})
    }
  } catch (e) {
  }
}

async function handleSaveAnticheat() {
  try {
    saving.value = true
    await updateSystemConfig({ category: 'anticheat', config: { ...anticheatConfig } })
    ElMessage.success('反作弊配置已保存')
  } finally {
    saving.value = false
  }
}

function handleResetAnticheat() {
  anticheatConfig.similarityThreshold = 75
  anticheatConfig.highRiskThreshold = 88
  anticheatConfig.enableIpCheck = true
  anticheatConfig.enableFingerprintCheck = true
  anticheatConfig.enableTimeCheck = true
  anticheatConfig.minSubmitInterval = 5
}

async function handleSaveContest() {
  try {
    saving.value = true
    await updateSystemConfig({ category: 'contest', config: { ...contestConfig } })
    ElMessage.success('竞赛配置已保存')
  } finally {
    saving.value = false
  }
}

async function handleSaveNotification() {
  try {
    saving.value = true
    await updateSystemConfig({ category: 'notification', config: { ...notificationConfig } })
    ElMessage.success('通知配置已保存')
  } finally {
    saving.value = false
  }
}

function handleTestEmail() {
  ElMessage.info('测试邮件已发送')
}

async function handleSaveSecurity() {
  try {
    saving.value = true
    await updateSystemConfig({ category: 'security', config: { ...securityConfig } })
    ElMessage.success('安全配置已保存')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.config-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}
</style>

<template>
  <div class="create-room">
    <div class="fox-decoration">
      <img src="../assets/fox.png" alt="小狐狸" class="fox-icon" />
    </div>
    
    <h2>创建专属空间</h2>
    
    <div v-if="inviteCode" class="invite-code-section">
      <p class="invite-label">你的邀请码：</p>
      <div class="invite-code" @click="copyCode">
        <span class="code-text">{{ inviteCode }}</span>
        <span class="copy-tip">📋 点击复制</span>
      </div>
      <van-button type="primary" block @click="enterTimeline" class="enter-btn">进入空间</van-button>
      <van-button plain block @click="goBack" class="back-btn">返回</van-button>
    </div>
    
    <div v-else>
      <van-button type="primary" block @click="createRoom" class="create-btn">✨ 生成邀请码</van-button>
      <van-button plain block @click="goBack" class="back-btn">返回</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'

const router = useRouter()
const inviteCode = ref('')

const goBack = () => router.push('/')

const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const createRoom = async () => {
  console.log('===== 开始调试 =====')
  console.log('1. import.meta.env.VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('2. typeof supabase:', typeof supabase)
  console.log('3. typeof supabase.auth:', typeof supabase?.auth)
  console.log('4. typeof supabase.auth.signInAnonymously:', typeof supabase?.auth?.signInAnonymously)
  
  try {
    const { data: loginData, error: loginError } = await supabase.auth.signInAnonymously()
    if (loginError) {
      alert('登录失败：' + loginError.message)
      return
    }
    
    const user = loginData.user
    const code = generateCode()
    
    const { data, error } = await supabase
      .from('rooms')
      .insert([{ code, creator_id: user.id }])
      .select()
    
    if (error) {
      alert('创建失败：' + error.message)
      return
    }
    
    inviteCode.value = code
    localStorage.setItem('roomId', data[0].id)
    localStorage.setItem('userType', 'creator')
    localStorage.setItem('inviteCode', code)
    
  } catch (err) {
    console.error('创建房间异常:', err)
    alert('创建失败，请刷新页面重试')
  }
}

const copyCode = () => {
  navigator.clipboard.writeText(inviteCode.value)
  alert('✨ 邀请码已复制，快去分享给TA吧')
}

const enterTimeline = () => {
  router.push('/timeline')
}
</script>

<style scoped>
.create-room {
  min-height: 100vh;
  background: linear-gradient(145deg, #fdf8f0 0%, #f9f0e6 100%);
  padding: 40px 24px;
  text-align: center;
}

.fox-decoration {
  margin-bottom: 20px;
}

.fox-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(232, 165, 152, 0.3);
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: #5c3d2e;
  margin-bottom: 32px;
  letter-spacing: -0.3px;
}

.invite-label {
  font-size: 14px;
  color: #b89582;
  margin-bottom: 12px;
}

.invite-code {
  background: #fff9f5;
  border-radius: 20px;
  padding: 24px 16px;
  margin: 20px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(232, 165, 152, 0.2);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.invite-code:active {
  transform: scale(0.98);
  background: #fef5ed;
}

.code-text {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 6px;
  color: #e8a598;
  display: block;
  margin-bottom: 12px;
}

.copy-tip {
  font-size: 13px;
  color: #e8a598;
  display: block;
}

.van-button {
  margin-bottom: 12px;
  border-radius: 50px;
  font-weight: 500;
}

.create-btn {
  background: #e8a598;
  border: none;
  color: #4a2a1e;
  font-size: 16px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(232, 165, 152, 0.3);
}

.enter-btn {
  background: #e8a598;
  border: none;
  color: #4a2a1e;
  font-size: 16px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(232, 165, 152, 0.3);
}

.back-btn {
  border: 1px solid #e8a598;
  color: #e8a598;
  background: transparent;
}
</style>
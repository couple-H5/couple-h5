<template>
  <div class="join-room">
    <div class="fox-decoration">
      <img src="../assets/fox.png" alt="小狐狸" class="fox-icon" />
    </div>
    
    <h2>加入空间</h2>
    
    <van-field 
      v-model="inputCode" 
      label="邀请码" 
      placeholder="请输入6位邀请码" 
      maxlength="6"
      class="code-input"
    />
    
    <van-button type="primary" block @click="joinRoom" class="join-btn">加入</van-button>
    <van-button plain block @click="goBack" class="back-btn">返回</van-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'

const router = useRouter()
const inputCode = ref('')
const goBack = () => router.push('/')

const joinRoom = async () => {
  console.log('====== 开始加入房间 ======')
  console.log('输入的邀请码:', inputCode.value)
  
  if (inputCode.value.length !== 6) {
    alert('请输入6位邀请码')
    return
  }
  
  try {
    // 1. 匿名登录
    console.log('步骤1: 开始匿名登录...')
    const { data: loginData, error: loginError } = await supabase.auth.signInAnonymously()
    
    if (loginError) {
      console.error('匿名登录失败:', loginError)
      alert('登录失败：' + loginError.message)
      return
    }
    
    console.log('匿名登录成功，用户ID:', loginData.user.id)
    const user = loginData.user
    
    // 2. 查询房间
    console.log('步骤2: 查询房间，邀请码:', inputCode.value.toUpperCase())
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', inputCode.value.toUpperCase())
    
    console.log('查询结果:', data, error)
    
    if (error) {
      console.error('查询房间出错:', error)
      alert('查询房间失败：' + error.message)
      return
    }
    
    if (!data || data.length === 0) {
      alert('邀请码无效')
      return
    }
    
    const room = data[0]
    console.log('找到房间:', room)
    
    // 3. 检查房间是否已被加入
    if (room.partner_id) {
      console.log('房间已有 partner_id:', room.partner_id)
      alert('房间已被加入过了')
      return
    }
    
    // 4. 更新 partner_id
    console.log('步骤3: 更新房间 partner_id 为:', user.id)
    const { error: updateError } = await supabase
      .from('rooms')
      .update({ partner_id: user.id })
      .eq('id', room.id)
    
    if (updateError) {
      console.error('更新房间失败:', updateError)
      alert('加入失败：' + updateError.message)
      return
    }
    
    console.log('更新成功')
    
    // 5. 保存到本地
    localStorage.setItem('roomId', room.id)
    localStorage.setItem('userType', 'partner')
    localStorage.setItem('inviteCode', room.code)
    
    console.log('保存成功，准备跳转')
    
    // 6. 跳转
    router.push('/timeline')
    
  } catch (err) {
    console.error('加入房间异常:', err)
    alert('加入失败，请刷新页面重试')
  }
}
</script>

<style scoped>
.join-room {
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

.code-input {
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;
}

.van-button {
  margin-bottom: 12px;
  border-radius: 50px;
  font-weight: 500;
}

.join-btn {
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
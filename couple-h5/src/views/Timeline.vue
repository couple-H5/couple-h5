<template>
  <div class="timeline-page">
    <!-- 顶部栏 -->
    <div class="header">
      <div class="fox-avatar" @click="showFoxProfile">
        <img src="../assets/fox.png" alt="小狐狸" />
      </div>
      <div class="room-title">你们的空间</div>
      <div class="exit-btn" @click="exitRoom">🚪 退出</div>
    </div>

    <!-- 房间信息条 -->
    <div class="room-info">
      <div class="room-code">房间号：{{ roomCode }}</div>
      <div class="member-info">👫 两人世界</div>
    </div>

    <!-- 时间线 -->
    <div class="timeline" ref="timelineRef">
      <div 
        v-for="item in emotions" 
        :key="item.id"
        :class="['message-row', item.user_type === userType ? 'self' : 'other']"
      >
        <div class="emotion-card">
        <div class="mood" v-if="item.mood">{{ item.mood }}</div>
          <div class="text" v-if="item.text">{{ item.text }}</div>
          <div class="time">{{ formatTime(item.created_at) }}</div>
        </div>
      </div>
      
      <div v-if="emotions.length === 0" class="empty">
        <div class="fox-hint">🦊 还没有记录，发送第一条吧</div>
      </div>
    </div>

    <!-- 底部输入区 -->
    <div class="input-area">
      <div class="mood-picker">
        <span 
          v-for="m in moods" 
          :key="m"
          :class="['mood-btn', selectedMood === m ? 'active' : '']"
          @click="selectedMood = m"
        >
          {{ m }}
        </span>
      </div>
      <div class="text-input">
        <input 
          v-model="inputText" 
          placeholder="写点什么..." 
          @keyup.enter="sendEmotion"
        />
        <button @click="sendEmotion" :disabled="(!selectedMood && !inputText.trim()) || sending">发送</button>
      </div>
    </div>

    <!-- 小狐狸弹窗 -->
    <div v-if="foxQuote" class="fox-popup" @click="foxQuote = null">
      <div class="fox-bubble">
        <div class="fox-icon">🦊</div>
        <div class="quote-text">{{ foxQuote }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'

const router = useRouter()
const timelineRef = ref(null)
const emotions = ref([])
const roomId = localStorage.getItem('roomId')
const userType = localStorage.getItem('userType') || 'creator'
const roomCode = ref('')

const moods = ['😊', '😢', '😤', '🥺', '😴', '❤️']
const selectedMood = ref('')
const inputText = ref('')
const sending = ref(false)
const foxQuote = ref(null)

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (timelineRef.value) {
      timelineRef.value.scrollTop = timelineRef.value.scrollHeight
    }
  }, 100)
}

const loadEmotions = async () => {
  if (!roomId) return
  const { data, error } = await supabase
    .from('emotions')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('加载失败:', error)
    return
  }
  emotions.value = data || []
  scrollToBottom()
}

const loadRoomInfo = async () => {
  if (!roomId) return
  const { data } = await supabase.from('rooms').select('code').eq('id', roomId).single()
  if (data) roomCode.value = data.code
}

const showFoxQuote = async () => {
  const { data } = await supabase.from('fox_quotes').select('content')
  if (data && data.length > 0) {
    const random = data[Math.floor(Math.random() * data.length)]
    foxQuote.value = random.content
    setTimeout(() => { foxQuote.value = null }, 3000)
  }
}

const sendEmotion = async () => {
  if ((!selectedMood.value && !inputText.value.trim()) || sending.value) return
  sending.value = true
 const { error } = await supabase.from('emotions').insert([{
    room_id: roomId,
    user_type: userType,
    mood: selectedMood.value || null,
    text: inputText.value.trim() || null
  }])
  sending.value = false
  if (error) {
    alert('发送失败：' + error.message)
    return
  }
  inputText.value = ''
  selectedMood.value = ''
  await loadEmotions()
  showFoxQuote()
}

import { signOut } from '../utils/auth'

const exitRoom = async () => {
  if (confirm('确定要退出这个房间吗？\n退出后将无法查看聊天记录。')) {
    await signOut()
    // signOut 内部已经做了 localStorage.clear() 和页面跳转
  }
}

const showFoxProfile = () => {
  // 预留：点击小狐狸头像可以打开换装或设置页面
  console.log('点击小狐狸')
}

let subscription = null

onMounted(() => {
  if (!roomId) {
    alert('房间信息丢失，请重新加入')
    router.push('/')
    return
  }
  loadRoomInfo()
  loadEmotions()

  subscription = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'emotions', filter: `room_id=eq.${roomId}` },
      (payload) => {
        const exists = emotions.value.some(e => e.id === payload.new.id)
        if (!exists) {
          emotions.value.push(payload.new)
          scrollToBottom()
        }
      }
    )
    .subscribe()
})

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription)
})
</script>

<style scoped>
.timeline-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(145deg, #fdf8f0 0%, #f9f0e6 100%);
  font-family: 'PingFang SC', 'Noto Sans CJK SC', system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', sans-serif;
}

/* 顶部栏 */
.header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 249, 245, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(232, 165, 152, 0.2);
  gap: 12px;
}

.fox-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 14px rgba(232, 165, 152, 0.25);
  border: 2px solid #fff;
  cursor: pointer;
}

.room-title {
  font-size: 18px;
  font-weight: 600;
  color: #5c3d2e;
  flex: 1;
  letter-spacing: -0.3px;
}

.exit-btn {
  font-size: 14px;
  color: #e8a598;
  cursor: pointer;
  padding: 6px 12px;
  background: rgba(232, 165, 152, 0.15);
  border-radius: 30px;
  transition: all 0.2s;
}

.exit-btn:active {
  background: rgba(232, 165, 152, 0.3);
}

/* 房间信息条 */
.room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: rgba(255, 249, 245, 0.6);
  border-bottom: 1px solid rgba(232, 165, 152, 0.15);
  font-size: 12px;
}

.room-code {
  color: #e8a598;
  font-weight: 500;
}

.member-info {
  color: #b89582;
}

/* 时间线区域 */
.timeline {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  width: 100%;
}
.message-row.other {
  justify-content: flex-start;
}
.message-row.self {
  justify-content: flex-end;
}

.emotion-card {
  max-width: 76%;
  padding: 14px 18px;
  border-radius: 28px;
  background: #ffffffea;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
  border: 0.5px solid rgba(232, 165, 152, 0.2);
}

.message-row.self .emotion-card {
  background: #f0dbcf;
  color: #4a2a1e;
  border-bottom-right-radius: 8px;
}

.message-row.other .emotion-card {
  border-bottom-left-radius: 8px;
}

.mood {
  font-size: 32px;
  margin-bottom: 6px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
}

.text {
  font-size: 16px;
  font-weight: 450;
  line-height: 1.45;
  word-break: break-word;
  margin-bottom: 6px;
}

.time {
  font-size: 10px;
  opacity: 0.55;
  text-align: right;
  letter-spacing: 0.2px;
}

.empty {
  text-align: center;
  padding: 48px 20px;
  color: #d2b7a8;
  font-size: 15px;
}

.fox-hint {
  background: rgba(255,245,235,0.7);
  display: inline-block;
  padding: 10px 20px;
  border-radius: 60px;
  font-size: 14px;
}

/* 底部输入区 */
.input-area {
  padding: 12px 18px 26px;
  background: rgba(255, 249, 245, 0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(232, 165, 152, 0.25);
  border-radius: 24px 24px 0 0;
}

.mood-picker {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  justify-content: center;
}

.mood-btn {
  font-size: 32px;
  padding: 8px;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.5;
  background: rgba(255,250,240,0.6);
}

.mood-btn.active {
  opacity: 1;
  background: #f0dbcf;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(232,165,152,0.3);
}

.text-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.text-input input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #f0dfd3;
  border-radius: 50px;
  background: white;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
  font-weight: 450;
}
.text-input input:focus {
  border-color: #e8a598;
  box-shadow: 0 0 0 3px rgba(232,165,152,0.2);
}

.text-input button {
  padding: 12px 28px;
  background: #e8a598;
  color: #3f2a1f;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.text-input button:disabled {
  opacity: 0.5;
  transform: none;
}
.text-input button:active {
  transform: scale(0.96);
}

/* 小狐狸弹窗 */
.fox-popup {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  animation: popUp 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}
.fox-bubble {
  background: #fffcf8;
  padding: 14px 24px;
  border-radius: 60px;
  box-shadow: 0 12px 28px rgba(90, 50, 35, 0.12);
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0.5px solid #f3e2d6;
}
.fox-icon {
  font-size: 38px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
.quote-text {
  font-size: 15px;
  font-weight: 500;
  color: #5c3d2e;
  max-width: 220px;
}

@keyframes popUp {
  from { transform: translateX(-50%) translateY(20px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}
</style>
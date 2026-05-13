import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CreateRoom from '../views/CreateRoom.vue'
import JoinRoom from '../views/JoinRoom.vue'
import Timeline from '../views/Timeline.vue'
import { supabase } from '../utils/supabase'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/create', name: 'CreateRoom', component: CreateRoom },
  { path: '/join', name: 'JoinRoom', component: JoinRoom },
  { path: '/timeline', name: 'Timeline', component: Timeline }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查 Supabase 会话和房间状态
router.beforeEach(async (to, from, next) => {
  // 获取当前会话
  const { data } = await supabase.auth.getSession()
  const hasSession = !!data.session
  const hasRoomId = localStorage.getItem('roomId')
  
  // 需要登录才能访问的页面（/create 和 /join 是用于登录的，不需要验证）
  const needAuth = ['/timeline'].includes(to.path)
  
  // 如果需要登录但没有会话，跳回首页
  if (needAuth && !hasSession) {
    next('/')
  } 
  // 如果有会话且有房间，访问首页时自动跳转到时间线
  else if (to.path === '/' && hasSession && hasRoomId) {
    next('/timeline')
  }
  // 其他情况正常放行
  else {
    next()
  }
})

export default router
import { supabase } from './supabase'

// 匿名登录（无感）
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.error('匿名登录失败:', error)
    throw new Error(error.message)
  }
  return data.user
}

// 获取当前用户
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

// 获取当前会话
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

// 退出登录（清空本地存储和 Supabase 会话）
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('退出失败:', error)
  
  // 同时清除 localStorage 中的业务数据（房间信息等）
  localStorage.clear()
  window.location.href = '/'
}

// 可选：绑定手机号/邮箱（后续做）
export async function linkIdentity(phoneOrEmail, password) {
  // 预留接口，后续实现
}
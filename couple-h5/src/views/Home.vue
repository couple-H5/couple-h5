<template>
  <div class="home-page">
    <div class="content">
      <!-- 小狐狸插画 -->
      <div class="fox-illustration">
        <img src="../assets/fox.png" alt="小狐狸" />
      </div>

      <!-- 标题 -->
      <div class="tagline">送TA一个专属空间</div>

      <!-- 功能关键词 -->
      <div class="features">
        <span>记录心情</span>
        <span class="dot">·</span>
        <span>装饰小屋</span>
        <span class="dot">·</span>
        <span>一起养只小狐狸</span>
      </div>

      <!-- 主按钮 -->
      <button class="create-btn" @click="goCreate">✨ 创建我们的空间</button>

      <!-- 次要入口 -->
      <div class="join-link" @click="goJoin">已有邀请码？加入</div>

      <!-- 信任背书 -->
      <div class="trust">
        <span>免费使用</span>
        <span class="dot">·</span>
        <span>无需注册</span>
        <span class="dot">·</span>
        <span>数据安全加密</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goCreate = () => {
  router.push('/create')
}

const goJoin = () => {
  router.push('/join')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #fdf8f0 0%, #f9f0e6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.content {
  text-align: center;
  max-width: 320px;
  width: 100%;
}

.fox-illustration img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 12px 28px rgba(232, 165, 152, 0.3);
  margin-bottom: 24px;
}

.tagline {
  font-size: 22px;
  font-weight: 600;
  color: #5c3d2e;
  margin-bottom: 16px;
  letter-spacing: -0.3px;
}

.features {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 40px;
  color: #b89582;
  font-size: 14px;
}

.features span {
  color: #b89582;
}

.dot {
  font-size: 10px;
}

.create-btn {
  width: 100%;
  padding: 16px 0;
  background: #e8a598;
  color: #4a2a1e;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(232, 165, 152, 0.35);
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.create-btn:active {
  transform: scale(0.97);
}

.join-link {
  font-size: 14px;
  color: #e8a598;
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 48px;
}

.trust {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #c9b2a2;
}

.trust .dot {
  font-size: 8px;
}
</style>
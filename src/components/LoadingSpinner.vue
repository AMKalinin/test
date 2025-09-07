<template>
  <div class="loading-spinner" :class="{ overlay: overlay }">
    <div class="spinner">
      <i class="ri-loader-4-line"></i>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  overlay?: boolean
  message?: string
}

defineProps<Props>()
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
}

.loading-spinner.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

[data-theme="dark"] .loading-spinner.overlay {
  background-color: rgba(15, 23, 42, 0.9);
}

.spinner {
  font-size: 32px;
  color: var(--color-primary);
  animation: rotate 1s linear infinite;
}

.loading-message {
  margin-top: var(--spacing-lg);
  color: var(--color-text-secondary);
  font-size: 14px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
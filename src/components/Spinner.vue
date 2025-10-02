<style scoped>
.dots {
  width: var(--size);
  height: var(--size);
  position: relative;
}

.dot {
  width: var(--size);
  height: var(--size);
  animation: dwl-dot-spin calc(var(--speed) * 5) infinite linear both;
  animation-delay: calc(var(--i) * var(--speed) / (var(--dot-count) + 2) * -1);
  rotate: calc(var(--i) * var(--spread) / (var(--dot-count) - 1));
  position: absolute;
}

.dot::before {
  content: "";
  display: block;
  width: var(--dot-size);
  height: var(--dot-size);
  background-color: var(--ring);
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  bottom: 0;
  left: 50%;
}

@keyframes dwl-dot-spin {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0.39, 0.575, 0.565, 1);
    opacity: 1;
  }

  2% {
    transform: rotate(20deg);
    animation-timing-function: linear;
    opacity: 1;
  }

  30% {
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);
    opacity: 1;
  }

  41% {
    transform: rotate(380deg);
    animation-timing-function: linear;
    opacity: 1;
  }

  69% {
    transform: rotate(520deg);
    animation-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);
    opacity: 1;
  }

  76% {
    opacity: 1;
  }

  76.1% {
    opacity: 0;
  }

  80% {
    transform: rotate(720deg);
  }

  100% {
    opacity: 0;
  }
}
</style>

<template>
  <div
    style="
      --size: 64px;
      --dot-size: 6px;
      --dot-count: 6;
      --speed: 1s;
      --spread: 60deg;
    "
    class="dots"
  >
    <div style="--i: 0" class="dot"></div>
    <div style="--i: 1" class="dot"></div>
    <div style="--i: 2" class="dot"></div>
    <div style="--i: 3" class="dot"></div>
    <div style="--i: 4" class="dot"></div>
    <div style="--i: 5" class="dot"></div>
  </div>
</template>

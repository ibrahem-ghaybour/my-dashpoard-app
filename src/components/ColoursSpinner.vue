<style scoped>
  .spinner {
    background-image: linear-gradient(rgb(186, 66, 255) 35%,rgb(0, 225, 255));
    width: 200px;
    height: 200px;
    animation: spinning82341 1.7s linear infinite, hue 1s ease-in-out infinite;
    text-align: center;
    filter: blur(1px);
    box-shadow: 0px -5px 20px 0px rgb(186, 66, 255), 0px 5px 20px 0px rgb(0, 225, 255);
  }

  .spinner1 {
    background-color: rgb(36, 36, 36);
    width: 200px;
    height: 200px;
    filter: blur(10px);
  }

  @keyframes spinning82341 {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes hue {
    0% {
      filter: hue-rotate(0deg);
    }

    100% {
      filter: hue-rotate(360deg);
    }
  }
</style>

<template>
  <div class="spinner rounded-full">
      <div class="spinner1 rounded-full"></div>
  </div>
</template>

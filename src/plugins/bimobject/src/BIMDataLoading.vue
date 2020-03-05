<template>
  <div class="bimdata-loading">
    <span class="bimdata-loading--square"></span>
    <p class="bimdata-loading--text">
      <span>loading...</span>
    </p>
  </div>
</template>

<style lang="scss" scoped>
/* base COLORS --------------------------------------------- */
$color-primary: rgba(47, 55, 74, 1);
$color-white: rgba(255, 255, 255, 1);

.bimdata-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: rgba($color-primary, 0.9);
  color: $color-white;
  z-index: 2;
  &--square {
    width: 20px;
    height: 20px;
    position: relative;
    border: 2px $color-white solid;
    animation: bimdataloading 1.4s linear infinite;
  }
  &--text {
    margin-top: 12px;
    display: block;
  }
}



@keyframes bimdataloading {
  0% {
    box-shadow: inset 0px 0px 0px 0px rgba($color-white, 0.1);
    transform: rotate(-0deg);
  }
  20% {
    transform: rotate(180deg);
  }
  40% {
    transform: rotate(-0deg);
  }
  60% {
    transform: rotate(-0deg);
    box-shadow: inset 0px 0px 0px 0px rgba($color-white, 0.1);
  }
  80% {
    box-shadow: inset 0px -20px 0px 0px rgba($color-white, 1);
  }
  100% {
    box-shadow: inset 0px 0px 0px 0px rgba($color-white, 0.1);
  }
}
</style>

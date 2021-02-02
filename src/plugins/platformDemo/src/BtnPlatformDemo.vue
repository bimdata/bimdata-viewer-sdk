<template>
  <div></div>
</template>

<script>
import PlatformDemo from "./PlatformDemo.vue";

export default {
  name: "BtnPlatformDemo",
  onOpen() {
    this.$viewer.globalContext.modals.pushModal(PlatformDemo);
  },
};
</script>

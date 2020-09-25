<template>
  <div></div>
</template>

<script>
import PlatformDemo from "./PlatformDemo.vue";

export default {
  name: "BtnPlatformDemo",
  props: {
    active: Boolean,
  },
  data() {
    return {};
  },
  watch: {
    active: {
      handler(active) {
        if (active) {
          this.$plugins.modalManager.pushModal(PlatformDemo);
        }
      },
    },
  },
  created() {},
  methods: {},
};
</script>

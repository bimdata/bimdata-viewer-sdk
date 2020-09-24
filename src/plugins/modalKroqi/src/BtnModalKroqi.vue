<template>
  <div></div>
</template>

<script>
import modalKroqi from "./ModalKroqi.vue";

export default {
  name: "BtnModalKroqi",
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
          this.$plugins.modalManager.pushModal(modalKroqi);
        }
      },
    },
  },
  created() {},
  methods: {},
};
</script>

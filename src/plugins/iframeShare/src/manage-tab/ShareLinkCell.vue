<template>
  <div class="share-link-cell">
    <span @click="openShareLink">{{ share.name }}</span>
  </div>
</template>

<script>
export default {
  props: {
    shareBackendUrl: {
      type: String,
      required: true,
    },
    share: {
      type: Object,
      required: true,
    },
  },
  methods: {
    openShareLink() {
      window.open(`${this.shareBackendUrl}/${this.share.id}`);
    },
  },
};
</script>

<style scoped lang="scss"></style>

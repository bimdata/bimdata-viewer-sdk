<template>
  <div class="share-link-cell">
    <span class="share-link-cell__name">
      {{ share.name || "(None)" }}
    </span>
    <BIMDataButton ghost rounded icon @click="$emit('open', share)">
      <BIMDataIcon name="share" size="xs" />
    </BIMDataButton>
    <BIMDataButton
      :disabled="!share.camera_settings"
      ghost
      rounded
      icon
      @click="showViewpoint"
    >
      <BIMDataIcon name="show" size="xs" />
    </BIMDataButton>
  </div>
</template>

<script>
import {
  BIMDataButton,
  BIMDataIcon,
} from "@bimdata/design-system/components.js";

export default {
  components: {
    BIMDataButton,
    BIMDataIcon,
  },
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
  emits: ["open"],
  methods: {
    showViewpoint() {
      const viewer3d = this.$viewer.localContext.getPlugin("viewer3d");
      viewer3d.setViewpoint(this.share.camera_settings);
    },
  },
};
</script>

<style scoped lang="scss">
.share-link-cell {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) / 2);

  &__name {
    flex-grow: 1;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

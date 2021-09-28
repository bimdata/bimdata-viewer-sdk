<template>
  <div class="share-action-menu">
    <BIMDataButton ghost rounded icon @click="showMenu = !showMenu">
      <BIMDataIcon name="ellipsis" size="l" fill color="tertiary-dark" />
    </BIMDataButton>

    <div class="share-action-menu__container" v-show="showMenu">
      <BIMDataButton ghost square @click="$emit('rename')">
        {{ $t("IframeSharePlugin.ShareActionMenu.renameButtonText") }}
      </BIMDataButton>
      <BIMDataButton ghost square @click="$emit('delete')">
        {{ $t("IframeSharePlugin.ShareActionMenu.deleteButtonText") }}
      </BIMDataButton>
    </div>
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
  emits: ["delete", "rename"],
  data() {
    return {
      showMenu: false,
    };
  },
};
</script>

<style scoped lang="scss">
.share-action-menu {
  position: relative;

  &__container {
    position: absolute;
    z-index: 1;
    top: calc(100% + var(--spacing-unit) / 2);
    right: 0;
    min-width: 120px;
    display: flex;
    flex-direction: column;
    padding: calc(var(--spacing-unit) / 2) 0;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    background-color: var(--color-white);
  }
}
</style>

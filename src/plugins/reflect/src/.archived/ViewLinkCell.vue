<template>
  <div class="rule-link-cell">
    <span class="rule-link-cell__name">
      {{ rule.GlobalId || "(None)" }}
    </span>
    <BIMDataButton ghost rounded icon @click="showObjectUuid(rule.GlobalId)">
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
    rule: {
      type: Object,
      required: true,
    },
  },
  methods: {
    showObjectUuid(uuid) {
      this.$viewer.state.selectObjectsByUuids([uuid]);
    },
  },
};
</script>

<style scoped lang="scss">
.rule-link-cell {
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

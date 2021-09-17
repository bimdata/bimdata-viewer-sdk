<template>
  <div class="token-duration-input">
    <div class="token-duration-input__label">
      {{ $t("IframeSharePlugin.TokenDurationInput.label") }}
    </div>
    <div class="token-duration-input__input">
      <BIMDataButton
        :disabled="n === 0"
        width="26px"
        height="26px"
        color="primary"
        fill
        square
        icon
        @click="decrement"
      >
        <BIMDataIcon name="minus" size="xxxs" />
      </BIMDataButton>
      <span class="token-duration-input__input__value">
        {{ n }}
      </span>
      <BIMDataButton
        width="26px"
        height="26px"
        color="primary"
        fill
        square
        icon
        @click="increment"
      >
        <BIMDataIcon name="plus" size="xxxs" />
      </BIMDataButton>
    </div>
    <div v-if="n === 0">
      {{ $t("IframeSharePlugin.TokenDurationInput.info") }}
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
  model: {
    prop: "modelValue",
    event: "update:modelValue",
  },
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      n: 0,
    };
  },
  methods: {
    decrement() {
      this.n--;
      this.$emit("update:modelValue", this.n);
    },
    increment() {
      this.n++;
      this.$emit("update:modelValue", this.n);
    },
  },
};
</script>

<style scoped lang="scss">
.token-duration-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-unit);

  &__label {
    position: relative;
    color: var(--color-tertiary-dark);
    &::after {
      content: ":";
    }
  }

  &__input {
    display: flex;

    &__value {
      width: 52px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid var(--color-tertiary);
      font-weight: bold;
    }
  }
}
</style>

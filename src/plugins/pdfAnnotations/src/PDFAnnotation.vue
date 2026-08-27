<template>
  <div
    ref="pin"
    class="pdf-annotation"
    v-show="isVisible"
    :style="{
      cursor: isActive ? (grabbing ? 'grabbing' : 'grab') : 'default',
    }"
  >
    <div class="pdf-annotation__cursor">
      <BIMDataIcon name="location" size="l" :fillColor="color" />
      <span class="pdf-annotation__cursor__title">{{ noteId }}</span>
    </div>

    <template v-if="isActive">
      <BIMDataButton
        class="pdf-annotation__btn-delete"
        color="primary"
        width="20px"
        height="20px"
        fill
        rounded
        icon
        @click="isOpenDelete = true"
      >
        <BIMDataIcon name="close" size="xxxs" />
      </BIMDataButton>
    </template>

    <Transition name="fade">
      <template v-if="isOpenDelete">
        <BIMDataSafeZoneInline
          class="pdf-annotation__safe-zone"
          @confirm-delete="remove(), (isOpenDelete = false)"
          @cancel-delete="isOpenDelete = false"
        >
          <template #content>
            {{ $t("pdfAnnotations.delete") }}
          </template>
        </BIMDataSafeZoneInline>
      </template>
    </Transition>
  </div>
</template>

<script>
import { ref } from "vue";
import useGrabbing from "./grabbing.js";

export default {
  props: {
    noteId: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    isVisible: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Object,
      required: true,
    },
    remove: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const isOpenDelete = ref(false);

    const { templateRef: pin, grabbing } = useGrabbing(event => {
      if (!props.isActive) return;

      const { movementX, movementY } = event;
      const { x, y, height, width } = pin.value.getBoundingClientRect();

      const dx = x + width / 2;
      const dy = y + height;

      emit("grab", {
        clientX: dx + movementX,
        clientY: dy + movementY,
      });
    });

    return {
      // References
      grabbing,
      isOpenDelete,
      pin,
    };
  },
};
</script>

<style lang="scss" scoped>
.pdf-annotation {
  height: 28px;
  transform: translate(-50%, -100%);

  &__cursor {
    position: relative;

    &__title {
      position: absolute;
      top: -14px;
      left: 18px;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      border: 1px solid var(--color-primary);
      background-color: var(--color-white);

      font-size: 12px;
      padding: 1px 3px;
      text-align: center;
    }
  }

  &__btn-delete {
    position: absolute;
    top: -14px;
    left: -8px;
  }

  &__safe-zone {
    position: absolute;
    top: -25px;
    left: -113px;
  }
}
</style>

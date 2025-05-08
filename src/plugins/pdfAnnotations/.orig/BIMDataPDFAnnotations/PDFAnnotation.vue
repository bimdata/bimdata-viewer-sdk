<template>
  <div
    v-show="isVisible"
    ref="pin"
    class="pdf-annotation"
    :style="{
      cursor: isActive ? (grabbing ? 'grabbing' : 'grab') : 'default',
    }"
  >
    <div class="pdf-annotation__cursor">
      <BIMDataIconLocation :custom-size="28 * resolution" :fill-color="color" />
      <span class="pdf-annotation__cursor__title">{{ noteId }}</span>
    </div>

    <template v-if="isActive">
      <BIMDataButton
        class="pdf-annotation__btn-delete"
        color="primary"
        :width="`${20 * resolution}px`"
        :height="`${20 * resolution}px`"
        fill
        rounded
        icon
        @click="isOpenDelete = true"
      >
        <BIMDataIconClose :custom-size="10 * resolution" />
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
import { ref, inject } from "vue";
import useGrabbing from "../../composables/grabbing.js";

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
  emits: ["grab"],
  setup(props, { emit }) {
    const isOpenDelete = ref(false);

    const $viewer = inject("$viewer");

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
      resolution: $viewer.localContext.resolution,
    };
  },
};
</script>

<style lang="scss" scoped>
.pdf-annotation {
  height: calc(28px * var(--bimdata-local-context-resolution));
  transform: translate(-50%, -100%);

  &__cursor {
    position: relative;

    &__title {
      position: absolute;
      top: calc(-14px * var(--bimdata-local-context-resolution));
      left: calc(18px * var(--bimdata-local-context-resolution));
      min-width: calc(20px * var(--bimdata-local-context-resolution));
      height: calc(20px * var(--bimdata-local-context-resolution));
      border-radius: calc(10px * var(--bimdata-local-context-resolution));
      border: calc(1px * var(--bimdata-local-context-resolution)) solid
        var(--color-primary);
      background-color: var(--color-white);

      font-size: calc(12px * var(--bimdata-local-context-resolution));
      padding: 1px 3px;
      text-align: center;
    }
  }

  &__btn-delete {
    position: absolute;
    top: calc(-14px * var(--bimdata-local-context-resolution));
    left: calc(-8px * var(--bimdata-local-context-resolution));
  }

  &__safe-zone {
    position: absolute;
    top: calc(-25px * var(--bimdata-local-context-resolution));
    left: calc(-113px * var(--bimdata-local-context-resolution));
  }
}
</style>

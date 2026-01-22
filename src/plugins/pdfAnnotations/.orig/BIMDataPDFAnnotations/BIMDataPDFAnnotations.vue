<template>
  <div class="bimdata-pdf-annotations">
    <div class="bimdata-pdf-annotations__note-params">
      <BIMDataInput v-model="currentNoteId" type="number" min="1" />
      <div
        class="color-input"
        :style="{ 'background-color': currentColor }"
        @click="isOpenColorSelector = !isOpenColorSelector"
      >
        <Transition name="fade">
          <BIMDataColorSelector
            v-show="isOpenColorSelector"
            class="color-selector"
            :model-value="currentColor.slice(1)"
            @update:model-value="currentColor = `#${$event}`"
          />
        </Transition>
      </div>
    </div>
    <BIMDataButton color="primary" fill radius icon @click="addAnnotation">
      <BIMDataIconPlus size="xs" />
    </BIMDataButton>
  </div>
</template>

<script>
import { computed, inject, ref } from "vue";
import PDFAnnotation from "./PDFAnnotation.vue";

export default {
  setup() {
    const $viewer = inject("$viewer");
    const viewer = $viewer.localContext.pluginComponentInstances.get("plan");

    const model = computed(() => viewer.model);
    const isFirstOpening = ref(true);
    const isOpenColorSelector = ref(false);

    const currentNoteId = ref(1);
    const currentPage = computed(() => (viewer.pdfPageIndex ?? 0) + 1);
    const currentColor = ref("#008000");

    const addAnnotation = () => {
      viewer.startAnnotationMode(({ x, y }) => {
        createAnnotation({
          id: currentNoteId.value,
          page: currentPage.value,
          color: currentColor.value,
          x,
          y,
        });
        viewer.stopAnnotationMode();
      });
    };

    const createAnnotation = ({ id, page, color, x, y }) => {
      const noteId = +id;
      const isVisible = computed(() => currentPage.value === page);
      const isActive = computed(() => +currentNoteId.value === noteId);

      const annotation = $viewer.state.addAnnotation({
        component: PDFAnnotation,
        props: {
          noteId,
          color,
          isVisible,
          isActive,
          remove: () => deleteAnnotation(annotation),
        },
        x,
        y,
        z: 0,
      });
    };

    const deleteAnnotation = annotation => {
      $viewer.state.removeAnnotation(annotation);
    };

    return {
      // References
      currentColor,
      currentNoteId,
      isFirstOpening,
      isOpenColorSelector,
      model,
      // Methods
      addAnnotation,
    };
  },
  onOpen() {
    this.currentNoteId = 1;
    this.currentColor = "#008000";
  },
  onClose() {
    this.currentNoteId = -1;
  },
};
</script>

<style lang="scss" scoped>
.bimdata-pdf-annotations {
  &__note-params {
    display: flex;
    align-items: center;
    gap: 6px;

    .color-input {
      position: relative;
      z-index: 1;
      min-width: 28px;
      height: 28px;
      border-radius: 4px;

      .color-selector {
        position: absolute;
        top: 36px;
        right: 0;
      }
    }
  }
}
</style>

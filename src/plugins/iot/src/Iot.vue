<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <BIMDataButton class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius" @click="highlightObject">
      highlight
    </BIMDataButton>
    <BIMDataButton class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius" @click="unisolate">
      unisolate
    </BIMDataButton>
    <BIMDataButton class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius" @click="colorizeRedObject">
      colorize red
    </BIMDataButton>
    <BIMDataButton class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius" @click="colorizeGreenObject">
      colorize green
    </BIMDataButton>
  </div>
</template>

<script>
import BIMDataComponents from '@bimdata/design-system';

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "iot",
  components: {
    BIMDataButton : BIMDataComponents.BIMDataButton,
  },
  data() {
    return {
    }
  },
  methods: {
    highlightObject() {
      const selectedObjectIds = this.$utils.getSelectedObjectIds();
      if(selectedObjectIds && selectedObjectIds.length){
        this.$hub.emit("highlight-objects", { ids: selectedObjectIds });
        this.$hub.emit("isolate-objects", { ids: selectedObjectIds });
        this.$hub.emit("fit-view-objects", { ids: selectedObjectIds });
      }
    },
    unisolate() {
      this.$hub.emit("unisolate-all-objects");
    },
    colorizeRedObject() {
      const selectedObjectIds = this.$utils.getSelectedObjectIds();
      this.$hub.emit("colorize-objects", { ids: selectedObjectIds, color: [1, 0, 0] });
    },
    colorizeGreenObject() {
      const selectedObjectIds = this.$utils.getSelectedObjectIds();
      this.$hub.emit("colorize-objects", { ids: selectedObjectIds, color: [0, 1, 0] });
    }
  }
};
</script>

<style type="scss" scoped>
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
@import "~@bimdata/design-system/dist/styles/component.css";
</style>

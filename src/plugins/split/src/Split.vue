<template>
  <div>
    <BIMDataInput
      v-model="fileName"
      placeholder="Add your fill name"
      :loading="false"
    />
    <BIMDataCheckbox
      text="Include structure hierarchy"
      v-model="exportStructure"
    >
    </BIMDataCheckbox>
    <BIMDataButton
      width="100%"
      @click="exportSplit"
      class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius m-t-12"
    >
      Generate new model with selected elements
    </BIMDataButton>
  </div>
</template>
<script>
import {
  BIMDataButton,
  BIMDataCheckbox,
  BIMDataInput,
} from "@bimdata/design-system/components.js";
export default {
  name: "split-component",
  components: {
    BIMDataButton,
    BIMDataCheckbox,
    BIMDataInput,
  },
  props: {
    active: Boolean, // Listen to activation state
  },
  data() {
    return {
      fileName: "",
      loadedIfc: null,
      exportStructure: true,
    };
  },
  onOpen() {
    const loadedIfcs = this.$viewer.state.ifcs;
    if (loadedIfcs.length > 1) {
      this.$viewer.localContext.hub.emit("alert", {
        type: "error",
        message:
          "You can't split more than one model at once. Please load only one model",
      });
      this.$emit("set-inactive");
    } else if (loadedIfcs.length === 1) {
      this.loadedIfc = loadedIfcs[0];
      const fileName = this.loadedIfc.document.file_name;
      const parts = fileName.split(".");
      parts.pop(); // Remove extension
      const name = parts.join("."); // rebuild name without extension
      this.fileName =
        name +
        "-split-" +
        new Date().toLocaleDateString(this.$i18n.locale).replace(/\//g, "-") +
        ".ifc";
    } else {
      this.$viewer.localContext.hub.emit("alert", {
        type: "error",
        message: "You must load a model to do a split",
      });
      this.$emit("set-inactive");
    }
  },
  methods: {
    async exportSplit() {
      const selectObjectsIds = this.$viewer.state.selectedObjects.map(
        obj => obj.uuid
      );
      if (selectObjectsIds.length === 0) {
        this.$viewer.localContext.hub.emit("alert", {
          type: "error",
          message: "You must select at least one element",
        });
        return;
      }
      await new this.$viewer.api.apiClient.IfcApi().exportIfc(
        this.$viewer.api.cloudId,
        this.loadedIfc.id,
        this.$viewer.api.projectId,
        {
          structure: this.exportStructure ? "UPDATED" : "NONE",
          file_name: this.fileName,
          uuids: selectObjectsIds,
        }
      );
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message:
          "A new IFC model with only selected elements will soon be uploaded next to the original IFC file",
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>

<template>
  <div>
    <input class="bimdata_input" type="text" v-model="fileName">
    <input type="checkbox" id="checkbox" v-model="exportStructure">
    <label for="checkbox">Include structure hierarchy</label>
    <button @click="exportSplit">Generate new model with selected elements</button>
  </div>
</template>
<script>

export default {
  name: 'split-component',
  data() {
    return {
      fileName: '',
      loadedIfc: null,
      exportStructure: true,
    }
  },
  props: {
    active: Boolean // Listen to activation state
  },
  watch: {
    active: {
      handler(active) {
        if (active) { // Is plugin activated
          const loadedIfcs = this.$utils.getSelectedIfcs();
          if (loadedIfcs.length > 1) {
            this.$hub.emit('alert', {
              type: 'error',
              message: "You can't split more than one model at once. Please load only one model"
            });
            this.$emit("set-inactive");
          } else if (loadedIfcs.length === 1) {
            this.loadedIfc = loadedIfcs[0];
            const fileName = this.loadedIfc.document.file_name;
            const parts = fileName.split('.');
            parts.pop(); // Remove extension
            const name = parts.join('.'); // rebuild name without extension

            const date = new Date();
            const stringDate = `${date.getYear()}-${date.getMonth() + 1}-${date.getDay()}-${date.getHours()}-${date.getMinutes()}`
            this.fileName = name + '-split-' + stringDate + '.ifc'

          } else {
            this.$hub.emit('alert', {
              type: 'error',
              message: "You must load a model to do a split"
            });
            this.$emit("set-inactive");
          }
        }
      },
    }
  },
  methods: {
    async exportSplit() {
      const selectObjectsIds = this.$utils.getSelectedObjectIds();
      if (selectObjectsIds.length === 0) {
        this.$hub.emit('alert', {
          type: 'error',
          message: 'You must select at least one element'
        });
        return;
      }
      await new this.$bimdataApiClient.IfcApi().exportIfc(
        this.$utils.getCloudId(),
        this.loadedIfc.id,
        this.$utils.getProjectId(),
        {
          structure: this.exportStructure ? "UPDATED": "NONE",
          file_name: this.fileName,
          uuids: selectObjectsIds
        }
      );
      this.$hub.emit('alert', {
        type: 'success',
        message: 'A new IFC model with only selected elements will soon be uploaded next to the original IFC file'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>

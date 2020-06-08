<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <button @click="downloadGltf">Download GLTF</button>
  </div>
</template>

<script>
export default {
  // https://vuejs.org/v2/guide/components.html
  name: "gltfExtractor",
  data() {
    return {
    }
  },
  methods: {
    downloadGltf() {
      const ifc = this.$utils.getSelectedIfcs()[0]
      window.location.href = ifc.gltf_file;
    }
  }
};
</script>

<style type="scss" scoped>
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
</style>

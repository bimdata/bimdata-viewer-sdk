<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="viewer-plugin-boom">
    <div class="viewer-plugin-boom__control">
      <label for="vertical-explode" class="viewer-plugin-boom__label">
        {{ $t("BoomPlugin.verticalExplodeLabel") }}:
        {{ verticalExplode }}
      </label>
      <input
        id="vertical-explode"
        class="viewer-plugin-boom__slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="verticalExplode"
        @input="explode"
      />
    </div>
    <div class="viewer-plugin-boom__control">
      <label for="horizontal-explode" class="viewer-plugin-boom__label">
        {{ $t("BoomPlugin.horizontalExplodeLabel") }}:
        {{ horizontalExplode }}
      </label>
      <input
        id="horizontal-explode"
        class="viewer-plugin-boom__slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="horizontalExplode"
        @input="explode"
      />
    </div>
  </div>
</template>

<script>
export default {
  // https://vuejs.org/v2/guide/components.html
  name: "boom",
  data() {
    return {
      verticalExplode: 0,
      horizontalExplode: 0,
    };
  },
  created() {
    this.$viewer.localContext.hub.on("3d-model-loaded", () => {
      this.xeokit = this.$viewer.localContext.getPlugin("viewer3d").xeokit;
      this.storeys = this.$viewer.state.getObjectsOfType("storey").map(s => {
        const children = s.children.map(c => {
          const aabb = this.xeokit.scene.getAABB([c.uuid]);
          return {
            id: c.uuid,
            center: [
              (aabb[0] + aabb[3]) / 2,
              (aabb[1] + aabb[4]) / 2,
              (aabb[2] + aabb[5]) / 2,
            ],
          };
        });
        const aabb = this.xeokit.scene.getAABB(children);
        const center = [
          (aabb[0] + aabb[3]) / 2,
          (aabb[1] + aabb[4]) / 2,
          (aabb[2] + aabb[5]) / 2,
        ];
        return {
          storey: s,
          children,
          center,
        };
      });
    });
  },
  methods: {
    explode() {
      const vCoef = 5 * this.verticalExplode;
      const hCoef = 4 * this.horizontalExplode;
      this.storeys.forEach(s => {
        s.children.forEach(c => {
          const translation = [
            (c.center[0] - s.center[0]) * hCoef,
            (c.center[1] - s.center[1]) * vCoef,
            (c.center[2] - s.center[2]) * hCoef,
          ];
          this.xeokit.scene.setObjectsOffset([c.id], translation);
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
.viewer-plugin-boom {
  &__control {
    margin: 24px 0;
  }

  &__label {
    // ?
  }

  &__slider {
    display: block;
  }
}
</style>

<template>
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
      this.storeys = this.$viewer.state
        .getObjectsOfType("storey")
        .map(storey => {
          const children = storey.children.map(object => {
            const aabb = this.xeokit.scene.getAABB([object.uuid]);
            return {
              id: object.uuid,
              center: [
                (aabb[0] + aabb[3]) / 2,
                (aabb[1] + aabb[4]) / 2,
                (aabb[2] + aabb[5]) / 2,
              ],
            };
          });
          const aabb = this.xeokit.scene.getAABB();
          const center = [
            (aabb[0] + aabb[3]) / 2,
            (aabb[1] + aabb[4]) / 2,
            (aabb[2] + aabb[5]) / 2,
          ];
          return {
            storey,
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
      this.storeys.forEach(storey => {
        storey.children.forEach(object => {
          const translation = [
            (object.center[0] - storey.center[0]) * hCoef,
            (object.center[1] - storey.center[1]) * vCoef,
            (object.center[2] - storey.center[2]) * hCoef,
          ];
          this.xeokit.scene.setObjectsOffset([object.id], translation);
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.viewer-plugin-boom {
  &__control {
    margin: 24px 0;
  }

  &__slider {
    display: block;
  }
}
</style>

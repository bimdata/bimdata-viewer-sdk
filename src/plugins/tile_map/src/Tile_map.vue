<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div></div>
</template>

<script>
export default {
  // https://vuejs.org/v2/guide/components.html
  name: "tile_map",

  async onOpen() {
    const xeokit = this.$viewer.localContext.getPlugin("viewer3d");
    const site = this.$viewer.state.getObjectsOfType("site")[0];
    const loadedIfc = this.$viewer.state.ifcs[0];
    const model_aabb = xeokit.xeokit.scene.aabb;
    const min_height = model_aabb[1];
    const model_center = xeokit.xeokit.scene.center;

    const apiClient = new this.$viewer.api.apiClient.IfcApi();
    const props = await apiClient.getElement(
      this.$viewer.api.cloudId,
      loadedIfc.id,
      this.$viewer.api.projectId,
      site.uuid
    );

    const rel_lat = props.attributes.properties.find(
      prop => prop.definition.name === "RefLatitude"
    ).value;
    const ref_long = props.attributes.properties.find(
      prop => prop.definition.name === "RefLongitude"
    ).value;

    const WGS84_lat = this.DMStoDD(rel_lat[0], rel_lat[1], rel_lat[2]);
    const WGS84_long = this.DMStoDD(ref_long[0], ref_long[1], ref_long[2]);
    const scale = 16;
    console.log(WGS84_lat, WGS84_long);

    const tile_lat = this.lat2tile(WGS84_lat, scale);
    const tile_long = this.lon2tile(WGS84_long, scale);

    const tile_raster =
      "https://a.tile.openstreetmap.org/" +
      scale +
      "/" +
      tile_long +
      "/" +
      tile_lat +
      ".png";
    console.log(tile_raster);

    const next_tile = tile_lat + 1;
    const reverse_lat_next = this.tile2lat(next_tile, scale);
    const reverse_lat = this.tile2lat(tile_lat, scale);
    const reverse_lon = this.tile2long(tile_long, scale);
    console.log(reverse_lon, reverse_lat);
    console.log(reverse_lon, reverse_lat_next);

    new xeokit.ImagePlane(xeokit.xeokit.scene, {
      src: tile_raster,
      visible: true, // Show the ImagePlane
      gridVisible: true, // Show the grid - grid is only visible when ImagePlane is also visible
      size: 250, // Size of ImagePlane's longest edge
      position: [model_center[0], min_height, model_center[2]], // World-space position of ImagePlane's center
      rotation: [0, 0, 0], // Euler angles for X, Y and Z
      opacity: 1.0, // Fully opaque
      collidable: false, // ImagePlane does not contribute to Scene boundary
      clippable: true, // ImagePlane can be clipped by SectionPlanes
      pickable: true, // Allow the ground plane to be picked
    });
  },
  methods: {
    DMStoDD(degrees, minutes, seconds) {
      var dd = degrees + minutes / 60 + seconds / (60 * 60);
      return dd;
    },

    lon2tile(lon, zoom) {
      return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
    },
    lat2tile(lat, zoom) {
      return Math.floor(
        ((1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) +
              1 / Math.cos((lat * Math.PI) / 180)
          ) /
            Math.PI) /
          2) *
          Math.pow(2, zoom)
      );
    },

    tile2long(x, z) {
      return (x / Math.pow(2, z)) * 360 - 180;
    },
    tile2lat(y, z) {
      var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
      return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    },
  },
};
</script>

<style lang="scss" scoped>
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
</style>

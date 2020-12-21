<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div></div>
</template>

<script>
import snowflakeGltf from "../assets/snowflake.gltf";

export default {
  name: "SnowflakesComponent",
  props: {
    active: Boolean, // Listen to activation state
  },
  data() {
    return {
      maxFlakes: 100, // Number of loaded snowflakes
      models: [], // References to all snowflakes to unload them
      events: [], // References to all event to disable them
      maxId: 0, // Used to generate unique IDs
      canvas: null, // Reference to the Canvas to change the background color
    };
  },
  async onOpen() {
    this.canvas.style.setProperty("background-color", "lightgrey"); // Change background color
    return Promise.all(
      Array.from({ length: this.maxFlakes }).map(this.letItSnow)
    ); // Call the snowflakes generation
  },
  onClose() {
    this.events.forEach(event => this.xeokit.scene.off(event)); // remove all events
    this.events = [];
    this.models.forEach(model => model.destroy()); // remove all snowflakes
    this.models = [];
    this.canvas.style.removeProperty("background-color"); // reset the background
  },
  mounted() {
    const viewer3D = this.$viewer.globalContext.getPlugins("viewer3d")[0]; // Get the first Viewer3D plugin
    this.loader = viewer3D.gltfLoader;
    this.xeokit = viewer3D.xeokit;
    this.canvas = viewer3D.xeokit.scene.canvas.canvas;
  },
  methods: {
    randomFromInterval(min, max) {
      return Math.random() * (max - min + 1) + min;
    },
    letItSnow() {
      const aabb = this.xeokit.scene.aabb; // Get scene area

      // Get edges of the area
      const yMax = Math.max(aabb[1], aabb[4]);
      const xMax = Math.max(aabb[0], aabb[3]);
      const zMax = Math.max(aabb[2], aabb[5]);
      const xMin = Math.min(aabb[0], aabb[3]);
      const zMin = Math.min(aabb[2], aabb[5]);

      // Increasing area size
      const spwanXOffset = (xMax - xMin) / 2;
      const spwanZOffset = (zMax - zMin) / 2;
      const randomXSnowflake = this.randomFromInterval(
        xMin - spwanXOffset,
        xMax + spwanXOffset
      );
      const randomZSnowflake = this.randomFromInterval(
        zMin - spwanZOffset,
        zMax + spwanZOffset
      );

      const speed = this.randomFromInterval(0.08, 0.12);
      const size = this.randomFromInterval(0.2, 0.25);
      const startPosition = yMax * 2;

      const snowflakeModel = this.loader.load({
        id: "snowflake" + this.maxId++, // Unique ID
        src: snowflakeGltf, // Model URI
        position: [randomXSnowflake, startPosition, randomZSnowflake], // Randomize snowflakes
        rotation: [90, 0, Math.random() * 90],
        scale: [size, size, size],
        performance: false, // Allow geometry position/rotation dynamic updates
      });

      this.models.push(snowflakeModel); // Save mode; reference for ufrther deletion

      return new Promise(res => {
        snowflakeModel.on("loaded", () => {
          const snowflakeObject = snowflakeModel.children[0]; // Get the snowflake object (instead of whole model)
          const eventId = this.xeokit.scene.on("tick", function () {
            snowflakeObject.translateZ(speed); // The snowflake falls
            if (snowflakeObject.position[2] > startPosition + 5) {
              // If snowflake is low enough, but it on the top
              snowflakeObject.translateZ(-startPosition - 5);
            }
          });
          this.events.push(eventId); // Save the event for further deletion
          res();
        });
      });
    },
  },
};
</script>

<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div></div>
</template>

<script>
// import christmasSleighGltf from "../assets/christmasSleigh.gltf";
import giftGltf from "../assets/christmasSleigh.gltf";

export default {
  name: "ChristmasSleighComponent",
  props: {
    active: Boolean, // Listen to activation state
  },
  data() {
    return {
      giftDensity: 1, // Number of gift in one round (Have I been good this year?)
      models: [], // References to all snowflakes to unload them
      events: [], // References to all event to disable them
      maxId: 0, // Used to generate unique IDs
      canvas: null, // Reference to the Canvas to change the background color
      ellipse: {},
    };
  },
  async onOpen() {
    console.log("onOpen");
    this.setEllipse(this.xeokit.scene);
    this.canvas.style.setProperty("background-color", "lightgrey"); // Change background color
    return Promise.all(
      Array.from({ length: this.giftDensity }).map(this.distributeGift)
    ); // Call the gift generation
  },
  onClose() {
    console.log("onClose");
    this.events.forEach(event => this.xeokit.scene.off(event)); // remove all events
    this.events = [];
    this.models.forEach(model => model.destroy()); // remove all snowflakes
    this.models = [];
    this.canvas.style.removeProperty("background-color"); // reset the background
  },
  mounted() {
    console.log("mounted");
    const viewer3D = this.$viewer.globalContext.getPlugins("viewer3d")[0]; // Get the first Viewer3D plugin
    this.loader = viewer3D.gltfLoader;
    this.xeokit = viewer3D.xeokit;
    this.canvas = viewer3D.xeokit.scene.canvas.canvas;
  },
  methods: {
    randomFromInterval(min, max) {
      return Math.random() * (max - min + 1) + min;
    },

    setEllipse(scene) {
      this.ellipse = {
        xCenter: scene.center[0],
        yCenter: scene.center[1],
        zCenter: scene.center[2],
        xRadius: Math.abs(scene.aabb[0] - scene.aabb[3]),
        yRadius: Math.abs(scene.aabb[1] - scene.aabb[4]),
        zRadius: Math.abs(scene.aabb[2] - scene.aabb[5]),
      };
    },

    calculPosition(radian) {
      // x = xCenter + xRadius * cos(radian)
      // y = yCenter + yRadius * sin(radian)
      const x = this.ellipse.xCenter + this.ellipse.xRadius * Math.cos(radian);
      const y = this.ellipse.yCenter + this.ellipse.yRadius * Math.sin(radian);
      return [x, y];
    },

    calculRotation(x, y) {
      // P (X0, Y0)
      // α = − b².x0 / a².y0

      //xx0/a2±yy0/b2=1
      // const degree =
      //   (this.ellipse.yRadius ** 2 * -x) / (this.ellipse.xRadius ** 2 * y);
      // const radian = this.to_radian(degree);
      // const pente = -1 / radian;
      // console.log({ degree, radian, pente });
      const radian =
        Math.atan2(this.ellipse.xRadius * y, this.ellipse.yRadius * x) * 100;
      return radian;
    },

    to_radian(degree) {
      return degree * (Math.PI / 180);
    },

    distributeGift() {
      const radian = Math.random() * Math.PI;
      const [x, y] = this.calculPosition(radian);
      const zRadian = this.calculRotation(x, y);
      const giftModel = this.loader.load({
        id: "gift" + this.maxId++, // Unique ID
        src: giftGltf, // Model URI
        position: [x, y, this.ellipse.zCenter],
        rotation: [0, 0, zRadian],
        scale: [10, 10, 10],
        performance: false, // Allow geometry position/rotation dynamic updates
      });
      console.log("gtlfModel", giftModel.position);
      console.log("gtlfChildren", giftModel.children);
      console.log("ellipse", this.ellipse);
      console.log("aabb", this.xeokit.scene.aabb);

      this.models.push(giftModel); // Save mode; reference for further deletion

      return new Promise(res => {
        giftModel.on("loaded", () => {
          const giftObject = giftModel; // Get the gift object (instead of whole model)
          const calculPosition = this.calculPosition;
          const calculRotation = this.calculRotation;
          const eventId = this.xeokit.scene.on(
            "tick",
            function ({ time, startTime, deltaTime }) {
              console.log(
                // "position",
                // giftObject.position,
                // "rotation",
                // giftObject.rotation,

                { deltaTime }
              );
              const xPrev = giftObject.position[0];
              const yPrev = giftObject.position[1];
              const zRadianPrev = giftObject.rotation[2];
              const [x, y] = calculPosition((time - startTime) / 5000);
              const zRadian = calculRotation(x, y);
              console.log({ zRadian });
              giftObject.translateX(x - xPrev);
              giftObject.translateY(y - yPrev);
              giftObject.rotateZ(zRadian - zRadianPrev);
            }
          );
          this.events.push(eventId); // Save the event for further deletion
          res();
        });
      });
    },
  },
};
</script>

<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div></div>
</template>

<script>
import christmasSleighGltf from "../assets/christmasSleigh.gltf";
import gift1Gltf from "../assets/gift1.gltf";
import gift2Gltf from "../assets/gift2.gltf";
import gift3Gltf from "../assets/gift3.gltf";

export default {
  name: "ChristmasSleighComponent",
  props: {
    active: Boolean, // Listen to activation state
  },
  data() {
    return {
      giftDensity: 20, // Number of gift in one round (Have I been good this year?)
      giftmodels: [], // References to all gifts to unload them
      christmasSleightModel: null,
      events: [], // References to all event to disable them
      maxId: 0, // Used to generate unique IDs
      canvas: null, // Reference to the Canvas to change the background color
      scene: {},
    };
  },
  async onOpen() {
    console.log("onOpen");
    this.setScene(this.xeokit.scene);
    this.canvas.style.setProperty("background-color", "lightgrey"); // Change background color

    return Promise.all(
      [this.flightSleight()].concat(
        Array.from({ length: this.giftDensity }).map(this.distributeGift)
      )
    ); // Call the gift generation
  },
  onClose() {
    console.log("onClose");
    this.events.forEach(event => this.xeokit.scene.off(event)); // remove all events
    this.events = [];
    this.giftmodels.forEach(model => model.destroy()); // remove all snowflakes
    this.giftmodels = [];
    this.christmasSleightModel.destroy();
    this.christmasSleightModel = null;
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

    setScene(scene) {
      this.scene = {
        xCenter: scene.center[0],
        yCenter: scene.center[1],
        zCenter: scene.center[2],
        xHalfWidth: Math.abs(scene.aabb[0] - scene.aabb[3]),
        yHalfWidth: Math.abs(scene.aabb[1] - scene.aabb[4]),
        zHalfWidth: Math.abs(scene.aabb[2] - scene.aabb[5]),
      };
    },

    ellipsePosition(radian) {
      // x = xCenter + xHalfWidth * cos(radian)
      // y = yCenter + yHalfWidth * sin(radian)
      const x = this.scene.xCenter + this.scene.xHalfWidth * Math.cos(radian);
      const z = this.scene.zCenter + this.scene.zHalfWidth * Math.sin(radian);
      return [x, z];
    },

    lemniscatePosition(radian) {
      const x =
        this.scene.xCenter +
        (this.scene.xHalfWidth * Math.cos(radian)) /
          (1 + Math.sin(radian) ** 2);
      const z =
        this.scene.zCenter +
        (this.scene.xHalfWidth * Math.sin(radian) * Math.cos(radian)) /
          (1 + Math.sin(radian) ** 2);
      return [x, z];
    },

    calculPosition(radian) {
      // return this.ellipsePosition(radian);
      return this.lemniscatePosition(radian);
    },

    calculRotation(prev, position) {
      const vector_to_radian = (x, y) => {
        if (x < 0 && y == 0) {
          return 0;
        }
        return 2 * Math.atan(y / (x + Math.sqrt(x ** 2 + y ** 2)));
      };

      const x = position[0] - prev[0];
      const y = position[1] - prev[1];
      const z = position[2] - prev[2];
      const xRadian = vector_to_radian(z, y);
      const yRadian = vector_to_radian(z, x) + Math.PI / 2;
      const zRadian = vector_to_radian(x, y);
      return [
        this.to_degree(xRadian),
        this.to_degree(yRadian),
        this.to_degree(zRadian),
      ];
    },

    to_degree(radian) {
      return (radian * 180) / Math.PI;
    },

    to_radian(degree) {
      return degree * (Math.PI / 180);
    },

    distributeGift() {
      const giftsGltf = [gift1Gltf, gift2Gltf, gift3Gltf];
      const size = this.randomFromInterval(1, 3);
      const giftModel = this.loader.load({
        id: "gift" + this.maxId++, // Unique ID
        src: giftsGltf[Math.floor(Math.random() * giftsGltf.length)], // Model URI
        position: [this.scene.xCenter, this.scene.yCenter, this.scene.zCenter],
        rotation: [0, this.randomFromInterval(0, 360), 0],
        scale: [size, size, size],
        visible: false,
        performance: false, // Allow geometry position/rotation dynamic updates
      });

      this.giftmodels.push(giftModel);

      return new Promise(res => {
        giftModel.on("loaded", () => {
          const giftObject = giftModel;
          const scene = this.scene;
          const eventId = this.xeokit.scene.on(
            "tick",
            function ({ deltaTime }) {
              const speed = deltaTime / 300;
              giftObject.translateY(-speed);
              if (
                giftObject.position[1] <
                scene.yCenter - scene.yHalfWidth / 2
              ) {
                giftObject.visible = false;
              }
            }
          );
          this.events.push(eventId); // Save the event for further deletion
          res();
        });
      });
    },

    flightSleight() {
      const christmasSleightModel = this.loader.load({
        id: "christmasSleight", // Unique ID
        src: christmasSleighGltf, // Model URI
        position: [
          this.scene.xCenter,
          this.scene.yCenter + this.scene.yHalfWidth / 2,
          this.scene.zCenter,
        ],
        // scale: [50, 50, 50],
        performance: false, // Allow geometry position/rotation dynamic updates
      });

      this.christmasSleightModel = christmasSleightModel; // Save mode; reference for further deletion

      return new Promise(res => {
        christmasSleightModel.on("loaded", () => {
          const christmasSleightObject = christmasSleightModel;
          const calculPosition = this.calculPosition;
          const calculRotation = this.calculRotation;
          const giftmodels = this.giftmodels;
          const giftDensity = this.giftDensity;
          const eventId = this.xeokit.scene.on(
            "tick",
            function ({ time, startTime }) {
              const radian = ((time - startTime) / 2000) % (Math.PI * 2);
              const interval = (Math.PI * 2) / giftDensity;
              const giftindex = Math.trunc(radian / interval);
              const [x, z] = calculPosition(radian);
              const positionPrev = [...christmasSleightObject.position];
              christmasSleightObject.position = [
                x,
                christmasSleightObject.position[1],
                z,
              ];
              if (giftmodels[giftindex].visible === false) {
                giftmodels[giftindex].visible = true;
                giftmodels[giftindex].position =
                  christmasSleightObject.position;
              }

              christmasSleightObject.rotation = calculRotation(
                positionPrev,
                christmasSleightObject.position
              );
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

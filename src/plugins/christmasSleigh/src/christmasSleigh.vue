<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div></div>
</template>

<script>
import christmasSleighGltf from "../assets/christmasSleigh.gltf";
import gift1Gltf from "../assets/gift1.gltf";
import gift2Gltf from "../assets/gift2.gltf";
import gift3Gltf from "../assets/gift3.gltf";

let giftDensity = 30; // Number of gift in one round (Have I been good this year?)
let heightGifts = 13; // Which median height gifts are launch ?
let size = 2; // Base size of sleigh and gifts. Size of gifts is randomize from this base
let waveFrequency = 2; // Wave frequency of christmasSleigh. Must be an integer
let pathLenght = 0.8; // Path lenght compared to model. 0.5 is tight, 2 is very large
let offsetGift = 1.5; // Offset between sleight and gifts axis

const moves = {
  ellipse: (radian, scene) => {
    // x = xCenter + xHalfWidth * cos(radian)
    // y = yCenter + yHalfWidth * sin(radian)
    const x =
      scene.xCenter + pathLenght * (scene.xHalfWidth * Math.cos(radian));
    const z =
      scene.zCenter + pathLenght * (scene.zHalfWidth * Math.sin(radian));
    const y =
      scene.yCenter +
      scene.yHalfWidth / 2 +
      (scene.yHalfWidth / 6) * (Math.sin(radian * waveFrequency) + 1);
    return [x, y, z];
  },
  lemniscate: (radian, scene) => {
    const x =
      scene.xCenter +
      (pathLenght * scene.xHalfWidth * Math.cos(radian)) /
        (1 + Math.sin(radian) ** 2);
    const z =
      scene.zCenter +
      (pathLenght * scene.xHalfWidth * Math.sin(radian) * Math.cos(radian)) /
        (1 + Math.sin(radian) ** 2);
    const y =
      scene.yCenter +
      scene.yHalfWidth / 2 +
      (scene.yHalfWidth / 6) * (Math.sin(radian * waveFrequency) + 1);
    return [x, y, z];
  },
};

function calculPosition(radian, move, scene) {
  return moves[move](radian, scene);
}

function vector_to_radian(x, y) {
  return Math.atan2(y, x);
}

function randomFromInterval(min, max) {
  return Math.random() * (max - min) + min;
}

function to_degree(radian) {
  return (radian * 180) / Math.PI;
}

function calculRotation(prev, position) {
  const x = position[0] - prev[0];
  const y = position[1] - prev[1];
  const z = position[2] - prev[2];
  const yRadian = vector_to_radian(z, x) + Math.PI / 2;
  const zRadian = -vector_to_radian(Math.sqrt(x ** 2 + z ** 2), y);
  return [0, to_degree(yRadian), to_degree(zRadian)];
}

export default {
  name: "ChristmasSleighComponent",
  props: {
    active: Boolean, // Listen to activation state
  },
  data() {
    return {
      speed: 0,
      randomMove: true,
      move: null, // Choice in ['ellipse', 'lemniscate'] if randomMove is false
      giftmodels: [], // References to all gifts to unload them
      christmasSleightModel: null,
      events: [], // References to all event to disable them
      maxId: 0, // Used to generate unique IDs
      canvas: null, // Reference to the Canvas to change the background color
      scene: {},
    };
  },
  async onOpen() {
    this.setScene(this.xeokit.scene);
    const diagonal = Math.sqrt(
      this.scene.xHalfWidth ** 2 + this.scene.zHalfWidth ** 2
    );
    this.speed = 1 / ((diagonal / 2000) ** 2 + 1);
    if (this.randomMove === true) {
      this.move = ["ellipse", "lemniscate"][Math.floor(Math.random() * 2)];
    }
    if (this.christmasSleightModel === null) {
      return Promise.all(
        [this.flightSleight()].concat(
          Array.from({ length: giftDensity }).map(this.distributeGift)
        )
      ); // Call the gift generation
    } else {
      this.christmasSleightModel.visible = true;
    }
  },
  onClose() {
    this.giftmodels.forEach(model => (model.visible = false)); // remove all snowflakes
    this.christmasSleightModel.visible = false;
  },
  mounted() {
    const viewer3D = this.$viewer.globalContext.getPlugins("viewer3d")[0]; // Get the first Viewer3D plugin
    this.loader = viewer3D.gltfLoader;
    this.xeokit = viewer3D.xeokit;
    this.canvas = viewer3D.xeokit.scene.canvas.canvas;
  },
  methods: {
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
    distributeGift() {
      const giftsGltf = [gift1Gltf, gift2Gltf, gift3Gltf];
      const giftModel = this.loader.load({
        id: "gift" + this.maxId++, // Unique ID
        src: giftsGltf[Math.floor(Math.random() * giftsGltf.length)], // Model URI
        rotation: [0, randomFromInterval(0, 360), 0],
        scale: Array.from({ length: 3 }, () => randomFromInterval(1, 2) * size),
        visible: false,
        performance: false, // Allow geometry position/rotation dynamic updates
      });

      this.giftmodels.push(giftModel);

      return new Promise(res => {
        giftModel.on("loaded", () => {
          const giftObject = giftModel;
          const scene = this.scene;
          giftModel.rtcCenter = [this.scene.xCenter, this.scene.yCenter, this.scene.zCenter]; // Initial init
          const eventId = this.xeokit.scene.on("tick", ({ deltaTime }) => {
            if (!giftObject.visible) {
              return;
            }
            const speed = deltaTime / 30;
            giftObject.height -= speed;
            const isGoesDown = giftObject.height > 0 ? 1 : -1;
            giftObject.rtcCenter = [
              giftObject.rtcCenter[0]-0,
              giftObject.rtcCenter[1] + giftObject.height ** 2 * isGoesDown * 0.001 * size,
              giftObject.rtcCenter[2]-0,
            ];

            giftObject.visible = !(
              giftObject.rtcCenter[1] <
              scene.yCenter - scene.yHalfWidth / 2 - 50
            );
            giftObject.rotateZ(speed * 2);
            giftObject.rotateX(speed * 2);
            giftObject.rotateY(speed * 2);
          });
          this.events.push(eventId); // Save the event for further deletion
          res();
        });
      });
    },

    flightSleight() {
      const christmasSleightModel = this.loader.load({
        id: "christmasSleight", // Unique ID
        src: christmasSleighGltf, // Model URI
        //position: [this.scene.xCenter, this.scene.yCenter, this.scene.zCenter],
        scale: Array(3).fill(size),
        performance: false, // Allow geometry position/rotation dynamic updates
      });

      this.christmasSleightModel = christmasSleightModel; // Save mode; reference for further deletion

      return new Promise(res => {
        christmasSleightModel.on("loaded", () => {
          const christmasSleightObject = christmasSleightModel;
          christmasSleightObject.rtcCenter = [this.scene.xCenter, this.scene.yCenter, this.scene.zCenter];
          const scene = this.scene;
          const globalSpeed = this.speed;

          let randomizeTimeInterval = Array.from({ length: giftDensity }, () =>
            Math.random()
          ); // Gifts are launched within a define range of 2*PI / giftDensity. In this way, the launch is random within this range
          const eventId = this.xeokit.scene.on(
            "tick",
            ({ time, startTime }) => {
              if (!christmasSleightObject.visible) {
                return;
              }
              const radian =
                (((time - startTime) * globalSpeed) / 2000) % (Math.PI * 2);
              const interval = (Math.PI * 2) / giftDensity;
              const giftIndex = Math.trunc(radian / interval);
              const [x, y, z] = calculPosition(radian, this.move, scene);
              const positionPrev = [...christmasSleightObject.rtcCenter];
              christmasSleightObject.rtcCenter = [x, y, z];
              if (
                this.giftmodels[giftIndex].visible === false &&
                radian % interval > interval * randomizeTimeInterval[giftIndex]
              ) {
                randomizeTimeInterval[giftIndex] = Math.random(); // reinitialize random interval
                this.giftmodels[giftIndex].height =
                  heightGifts * randomFromInterval(1, 1.6);
                this.giftmodels[giftIndex].visible = true;
                this.giftmodels[giftIndex].rtcCenter = [
                  christmasSleightObject.rtcCenter[0],
                  christmasSleightObject.rtcCenter[1] + offsetGift * size,
                  christmasSleightObject.rtcCenter[2],
                ];
              }
              christmasSleightObject.rotation = calculRotation(
                positionPrev,
                christmasSleightObject.rtcCenter
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

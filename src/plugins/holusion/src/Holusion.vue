<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @click="tooglePivot">
      <BIMDataIcon name="chevron" size="xxxs" />
      Toogle Pivot
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @click="fitView">
      <BIMDataIcon name="chevron" size="xxxs" />
      Fit View
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @click="isolate">
      <BIMDataIcon name="chevron" size="xxxs" />
      Isolate
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @click="reset">
      <BIMDataIcon name="chevron" size="xxxs" />
      Reset
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @mousedown.native="startOrbitButton('up')" @mouseleave.native="stopOrbitButton('up')" @mouseup.native="stopOrbitButton('up')" @touchstart.native="startOrbitButton('up')" @touchend.native="stopOrbitButton('up')" @touchcancel.native="stopOrbitButton('up')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Up
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @mousedown.native="startOrbitButton('down')" @mouseleave.native="stopOrbitButton('down')" @mouseup.native="stopOrbitButton('down')" @touchstart.native="startOrbitButton('down')" @touchend.native="stopOrbitButton('down')" @touchcancel.native="stopOrbitButton('down')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Down
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @mousedown.native="startOrbitButton('right')" @mouseleave.native="stopOrbitButton('right')" @mouseup.native="stopOrbitButton('right')" @touchstart.native="startOrbitButton('right')" @touchend.native="stopOrbitButton('right')" @touchcancel.native="stopOrbitButton('right')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Right
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @mousedown.native="startOrbitButton('left')" @mouseleave.native="stopOrbitButton('left')" @mouseup.native="stopOrbitButton('left')" @touchstart.native="startOrbitButton('left')" @touchend.native="stopOrbitButton('left')" @touchcancel.native="stopOrbitButton('left')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Left
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @click="undo">
      <BIMDataIcon name="chevron" size="xxxs" />
      Undo
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @click="redo">
      <BIMDataIcon name="chevron" size="xxxs" />
      Redo
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @click="toogleSpaces">
      <BIMDataIcon name="chevron" size="xxxs" />
      Hide/show Spaces
    </BIMDataButton>


  </div>
</template>

<script>
import {
  BIMDataButton,
  BIMDataIcon,
} from "@bimdata/design-system/components.js";

const PIVOT_SPEED = 30 * 1000 // one rotation in 10 second

export default {
  name: "command",
  components: {
    BIMDataButton,
    BIMDataIcon,
  },
  data() {
    return {
      isOrbiting: false,
      spacesShown: true,
      orbitEventInterval: null,
      viewer3dPlugin: null,
      xeokit: null,
      pivotEvents: {
        up: null,
        down: null,
        left: null,
        right: null
      }
    };
  },
  mounted() {
    this.viewer3dPlugin = this.$viewer.globalContext.getPlugins('viewer3d')[0];
    this.xeokit = this.viewer3dPlugin.xeokit;
    window.xeokit = this.xeokit
    const canvas = document.getElementById(this.viewer3dPlugin.engine3dCanvasId);
    canvas.style.setProperty("background-color", "rgb(0, 0, 0)");
  },
  methods: {
    tooglePivot() {
      if (!this.isOrbiting) {
        this.isOrbiting = true;
        this.startOrbit();
      } else {
        this.isOrbiting = false;
        this.stopOrbit();
      }
    },
    startOrbit() {
      this.orbitEventInterval = this.xeokit.scene.on("tick", ({deltaTime}) => {
        const pivotAngle = (deltaTime * 360) / PIVOT_SPEED;
        this.xeokit.scene.camera.orbitYaw(pivotAngle);
      });
    },
    stopOrbit() {
      this.xeokit.scene.off(this.orbitEventInterval);
    },
    fitView() {
      if(this.xeokit.scene.selectedObjectIds.length > 0) {
        this.viewer3dPlugin.fitViewObjects(this.$viewer.state.selectedObjects.map(object => object.uuid));
      } else {
        this.viewer3dPlugin.fitViewObjects(this.$viewer.state.visibleObjects.map(object => object.uuid));
      }
    },
    isolate() {
      if(this.$viewer.state.selectedObjects.length > 0) {
        this.$viewer.state.hideObjects(this.$viewer.state.deselectedObjects.map(object => object.id))
      }
    },
    reset() {
      document.location.reload();
    },
    getPivotMethod(direction) {
      switch(direction) {
        case "up":
          return () => this.xeokit.scene.camera.orbitPitch(2);
        case "down":
          return () => this.xeokit.scene.camera.orbitPitch(-2);
        case "right":
          return () => this.xeokit.scene.camera.orbitYaw(2);
        case "left":
          return () => this.xeokit.scene.camera.orbitYaw(-2);
      };
    },
    undo() {
      this.$viewer.commandManager.undo();
    },
    redo() {
      this.$viewer.commandManager.redo();
    },
    startOrbitButton(direction) {
      if(!this.pivotEvents[direction]) {
        this.pivotEvents[direction] = setInterval(this.getPivotMethod(direction), 1000/60);
      }
    },
    stopOrbitButton(direction) {
      if(this.pivotEvents[direction]) {
        clearInterval(this.pivotEvents[direction]);
        this.pivotEvents[direction] = null;
      }
    },
    toogleSpaces() {
      const spaces = this.$viewer.state.objects
        .filter(object => object.type === "space")
        .map(object => object.id);
      if (this.spacesShown) {
        this.$viewer.state.hideObjects(spaces);
        this.spacesShown = false;
      } else {
        this.$viewer.state.showObjects(spaces);
        this.spacesShown = true;
      }
    },
  },
  destroy() {
    if (this.orbitEventInterval) {
      clearInterval(this.orbitEventInterval);
    }
  },
};
</script>

<style lang="scss" scoped>
</style>

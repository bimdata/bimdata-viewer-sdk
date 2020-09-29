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
      @mousedown="startOrbitButton('up')" @mouseleave="stopOrbitButton('up')" @mouseup="stopOrbitButton('up')" @touchstart="startOrbitButton('up')" @touchend="stopOrbitButton('up')" @touchcancel="stopOrbitButton('up')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Up
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @mousedown="startOrbitButton('down')" @mouseleave="stopOrbitButton('down')" @mouseup="stopOrbitButton('down')" @touchstart="startOrbitButton('down')" @touchend="stopOrbitButton('down')" @touchcancel="stopOrbitButton('down')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Down
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @mousedown="startOrbitButton('right')" @mouseleave="stopOrbitButton('right')" @mouseup="stopOrbitButton('right')" @touchstart="startOrbitButton('right')" @touchend="stopOrbitButton('right')" @touchcancel="stopOrbitButton('right')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Right
    </BIMDataButton>

    <BIMDataButton
      width="32px"
      height="32px"
      color="primary"
      fill
      radius
      @mousedown="startOrbitButton('left')" @mouseleave="stopOrbitButton('left')" @mouseup="stopOrbitButton('left')" @touchstart="startOrbitButton('left')" @touchend="stopOrbitButton('left')" @touchcancel="stopOrbitButton('left')">
      <BIMDataIcon name="chevron" size="xxxs" />
      Left
    </BIMDataButton>

    <button @mousedown="startOrbitButton('left')" @mouseleave="stopOrbitButton('left')" @mouseup="stopOrbitButton('left')" @touchstart="startOrbitButton('left')" @touchend="stopOrbitButton('left')" @touchcancel="stopOrbitButton('left')">TOURNE</button>

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


  </div>
</template>

<script>
import {
  BIMDataButton,
  BIMDataIcon,
} from "@bimdata/design-system/components.js";

export default {
  name: "command",
  components: {
    BIMDataButton,
    BIMDataIcon,
  },
  data() {
    return {
      isOrbiting: false,
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
    const canvas = document.getElementById(this.viewer3dPlugin.engine3dCanvasId);
    canvas.style.setProperty("background-color", "rgb(0, 0, 0)");
  },
  methods: {
    tooglePivot() {
      if (!this.pivoting) {
        this.pivoting = true;
        this.startOrbit();
      } else {
        this.pivoting = false;
        this.stopOrbit();
      }
    },
    startOrbit() {
      this.isOrbiting = true;
      this.fitView();
      this.orbitEventInterval = setInterval(() => {
        this.xeokit.scene.camera.orbitYaw(2);
      }, 1000 / 60);
    },
    stopOrbit() {
      if (this.isOrbiting) {
        this.isOrbiting = false;
        clearInterval(this.orbitEventInterval);
      }
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
          return () => this.xeokit.scene.camera.orbitPitch(4);
        case "down":
          return () => this.xeokit.scene.camera.orbitPitch(-4);
        case "right":
          return () => this.xeokit.scene.camera.orbitYaw(4);
        case "left":
          return () => this.xeokit.scene.camera.orbitYaw(-4);
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
    }
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

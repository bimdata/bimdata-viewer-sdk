export default {
  name: "bimworld",
  data() {
    return {
      hidden: false,
    };
  },
  mounted() {
    this.$viewer.globalContext.registerShortcut({
      name: "hideUI",
      key: " ",
      execute: () => {
        if (this.hidden) {
          this.showUI();
          this.stopPivot();
          this.hidden = false;
        } else {
          this.hideUI();
          this.startPivot();
          this.hidden = true;
        }
      },
    });
  },
  methods: {
    hideUI() {
      this.$viewer.localContext.plugins.get('viewer3d').hideUI();
    },
    showUI() {
      this.$viewer.localContext.plugins.get('viewer3d').showUI();
    },
    startPivot() {
      const xeokit = this.$viewer.localContext.plugins.get('viewer3d').xeokit;
      this.pivotEvent = xeokit.scene.on('tick', ({deltaTime}) => {
        xeokit.scene.camera.orbitYaw(0.01 * deltaTime);
      });
    },
    stopPivot() {
      const xeokit = this.$viewer.localContext.plugins.get('viewer3d').xeokit;
      if(this.pivotEvent) {
        xeokit.scene.off(this.pivotEvent);
      }
    }
  },
  render: () => null,
};

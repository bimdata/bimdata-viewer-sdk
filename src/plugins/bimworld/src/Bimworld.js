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
    getUIElements() {
      const uiElements = [];

      const headerPlugin = this.$viewer.localContext.plugins.get("header");
      if (headerPlugin) {
        uiElements.push(headerPlugin.$el);
      }
      Array.from(this.$viewer.localContext.plugins.values())
        .filter(plugin => plugin.$plugin.button)
        .forEach(plugin => {
          const parent = plugin.$parent.$el.classList.contains("panel")
            ? plugin.$parent.$parent.$parent // button plugin in panel
            : plugin.$parent;
          uiElements.push(parent.$el);
        });

      return uiElements;
    },
    hideUI() {
      this.getUIElements().forEach(uiElement => {
        uiElement.style.visibility = "hidden";
      });
    },
    showUI() {
      this.getUIElements().forEach(uiElement => {
        uiElement.style.visibility = "";
      });
    },
    startPivot() {
      const xeokit = this.$viewer.localContext.getPlugin('viewer3d').xeokit;
      this.pivotEvent = xeokit.scene.on('tick', ({deltaTime}) => {
        xeokit.scene.camera.orbitYaw(0.01 * deltaTime);
      });
    },
    stopPivot() {
      const xeokit = this.$viewer.localContext.getPlugin('viewer3d').xeokit;
      if(this.pivotEvent) {
        xeokit.scene.off(this.pivotEvent);
      }
    }
  },
  render: () => null,
};

<template>
  <div class="color-picker-modal p-12">
    <colorPicker
      display="widget"
      v-model="choosedColor"
      model="rgb"
      :pickerEdge="155"
      :enableAlpha="false"
    />
    <div class="dflex">
      <BIMDataButton
        @click="validateColorPicker"
        class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
        >{{ $t("BackgroundColorPlugin.apply") }}</BIMDataButton
      >
      <BIMDataButton
        @click="cancelColorPicker"
        class="bimdata-btn__ghost bimdata-btn__radius"
        >{{ $t("BackgroundColorPlugin.close") }}</BIMDataButton
      >
    </div>
  </div>
</template>
<script>
import colorPicker from "@bimdata/color-picker";
import { BIMDataButton } from "@bimdata/design-system/components.js";

export default {
  name: "colorPickerModal",
  components: {
    colorPicker,
    BIMDataButton,
  },
  data() {
    return {
      choosedColor: "rgb(0, 0, 0)",
    };
  },
  methods: {
    cancelColorPicker() {
      this.$emit("close");
    },
    validateColorPicker() {
      const viewers = this.$viewer.globalContext.getPlugins("viewer3d");
      viewers.forEach(viewer => {
        const canvas = document.getElementById(viewer.engine3dCanvasId);
        canvas.style.setProperty("background-color", this.choosedColor);
      });
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
@import "../node_modules/@bimdata/design-system/dist/scss/BIMData.scss";

.color-picker-modal {
  width: 500px;
  height: 450px;
  padding: 20px;
  .dflex {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  // custom VERTE COLOR PICKER
  .verte {
    height: 375px;
    &__menu-origin {
      width: 100%;
      .verte__menu {
        width: 100%;
        height: 80%;
        box-shadow: none;
        .verte-picker {
          margin: 0;
          &__origin {
            width: 100%;
            height: 250px;
            .verte-picker__canvas {
              width: 100%;
              height: 100%;
              display: block;
            }
            .verte-picker__cursor {
              width: 17px;
              height: 17px;
              border: 2px solid #ffffff;
              box-shadow: none;
            }
          }
          &__slider {
            margin: 12px 0;
          }
        }
        .verte__controller {
          padding: 0;
          .verte__inputs {
            .verte__model {
              font-size: 11px;
              font-weight: normal;
            }
            .verte__input {
              font-size: 11px;
              font-weight: normal;
            }
          }
          .verte__recent {
            justify-content: space-between;
            &-color {
              margin: 3px;
              width: 20px;
              height: 20px;
              border-radius: 5px;
              &:first-child {
                margin-left: 0;
              }
              &:last-child {
                margin-right: 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>

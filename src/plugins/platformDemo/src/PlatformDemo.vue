<template>
  <div class="platform-demo">
    <div class="platform-demo__header flex items-center justify-center">
      <img src="../assets/img-square-blur.svg" alt="" class="square-blur" />
      <img src="../assets/logo-bimdata.svg" alt="" />
      <img src="../assets/img-square-3d.svg" alt="" class="square-3d" />
    </div>
    <div class="platform-demo__content">
      <div class="flex">
        <div
          class="platform-demo__content__card flex flex-col items-center justify-center m-x-24"
        >
          <img src="../assets/img-bcf-manager.png" alt="" />
          <h5>{{ $t("PlatformDemo.titleBcf") }}</h5>
        </div>
        <div
          class="platform-demo__content__card flex flex-col items-center justify-center m-x-24"
        >
          <img src="../assets/img-edit-ifc.png" alt="" />
          <h5>{{ $t("PlatformDemo.titleEditIfc") }}</h5>
        </div>
        <div
          class="platform-demo__content__card flex flex-col items-center justify-center m-x-24"
        >
          <img src="../assets/img-viewer.png" alt="" />
          <h5>{{ $t("PlatformDemo.titleViewer") }}</h5>
        </div>
      </div>
      <div class="flex items-center justify-center">
        <a
          :href="bimdata_url()"
          target="_blank"
          rel="noopener noreferrer"
          class="bimdata-btn bimdata-btn__fill bimdata-btn__fill--secondary bimdata-btn__radius"
          >{{ $t("PlatformDemo.btnSpace") }}</a
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlatformDemo",
  methods: {
    bimdata_url() {
      const apiUrl = this.$viewer.api.apiUrl;
      if (apiUrl.includes("staging")) {
        return "https://platform-staging.bimdata.io/";
      } else if (apiUrl.includes("next")) {
        return "https://platform-next.bimdata.io/";
      }
      return "https://platform.bimdata.io/";
    },
  },
};
</script>

<style lang="scss" scoped>
.platform-demo {
  &__header {
    padding: 40px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      background-color: var(--color-primary);
      clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%);
    }
    img {
      position: relative;
    }
    .square-blur {
      position: absolute;
      left: 15%;
      bottom: 10%;
    }
    .square-3d {
      position: absolute;
      right: 15%;
      top: 20%;
    }
  }
  &__content {
    padding: 40px;
    &__card {
      max-width: 210px;
      h5 {
        min-height: 46px;
        font-size: 18px;
        position: relative;
        line-height: 23px;
        text-align: center;
        &::before {
          width: 20px;
          height: 3px;
          content: "";
          position: absolute;
          background-color: var(--color-secondary);
          top: -20px;
          left: calc(50% - 10px);
        }
      }
    }
    .bimdata-btn {
      padding: 0 12px;
      height: 32px;
      text-decoration: none;
    }
  }
}
</style>

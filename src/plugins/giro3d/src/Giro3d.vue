<template>
  <div class="bimdata-giro3d">
    <NoModelWindowPlaceHolder v-if="loadedModelIds.length === 0 && !loading" />
    <ModelsLoader :types="['POINT_CLOUD']" @load-models="loadModels" @unload-models="unloadModels" preview />
    <div :id="giro3dDivId" class="bimdata-giro3d__viewer"></div>
  </div>
</template>

<script>
import { Vector3 } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Instance from '@giro3d/giro3d/Core/Instance.js';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D.js';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource.js';

export default {
  name: "giro3d",
  data() {
    return {
      loadedModelIds: [],
      modelPointClouds: new Map(),
      giro3dDivId: null,
    };
  },
  created() {
    this.giro3dDivId = `3d-engine-${this.$viewer.localContext.pluginsUnit.id}`;

    this.localContextResizeSubscription = this.$viewer.localContext.hub.on(
      "context-resize",
      this.onResize
    );
  },
  destroyed() {
    this.$viewer.localContext.hub.off(this.localContextResizeSubscription);
  },
  async mounted() {
    const viewerDiv = document.getElementById(this.giro3dDivId);

    // need to wait a tick to let areas render the window.
    await this.$nextTick();

    const instance = new Instance(viewerDiv, {
      renderer: {
        clearColor: false,
      },
    });

    const controls = new MapControls(
      instance.camera.camera3D,
      instance.domElement,
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    instance.useTHREEControls(controls);

    instance.notifyChange(instance.camera.camera3D);

    this.instance = instance;
    this.controls = controls;
  },
  methods: {
    onResize({ width, height }) {
      if (!this.instance) {
        return;
      }
      // https://gitlab.com/giro3d/giro3d/-/blob/master/src/Core/Instance.js#L167-174
      this.instance.mainLoop.gfxEngine.onWindowResize(width, height);
      this.instance.notifyChange(this.instance.camera.camera3D);
    },
    placeCamera(position, lookAt) {
      const { instance, controls } = this;

      instance.camera.camera3D.position.set(position.x, position.y, position.z);
      instance.camera.camera3D.lookAt(lookAt);

      controls.target.copy(lookAt);
    },
    initializeCamera(pointcloud) {
      const tmpVec3 = new Vector3();

      const bbox = pointcloud.root.bbox
        ? pointcloud.root.bbox
        : pointcloud.root.boundingVolume.box.clone().applyMatrix4(pointcloud.root.matrixWorld);

      this.instance.camera.camera3D.far = 2.0 * bbox.getSize(tmpVec3).length();

      const ratio = bbox.getSize(tmpVec3).x / bbox.getSize(tmpVec3).z;
      const position = bbox.min.clone().add(
        bbox.getSize(tmpVec3).multiply({ x: 0, y: 0, z: ratio * 0.5 }),
      );

      const lookAt = bbox.getCenter(tmpVec3);
      lookAt.z = bbox.min.z;

      this.placeCamera(position, lookAt);
    },
    async loadModels(models) {
      this.loadedModelIds.push(...models.map(model => model.id).filter(modelId => !this.loadedModelIds.includes(modelId)));

      models.forEach(async (model, i) => {
        // Configure Point Cloud

        const { apiUrl, cloudId, projectId, accessToken } = this.$viewer.api;

        const tileset = await  fetch(`${apiUrl}/cloud/${cloudId}/project/${projectId}/model/${model.id}/tileset?tile_format=pnts`, {
          headers: new Headers({
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`
          })
        })

        const url = URL.createObjectURL(await tileset.blob());

        const pointcloud = new Tiles3D(
          'pointcloud',
          new Tiles3DSource(url),
        );

        this.modelPointClouds.set(model, pointcloud);

        await this.instance.add(pointcloud);

        URL.revokeObjectURL(url);

        if (i === 0) {
          this.initializeCamera(pointcloud);
        }
      })
    },
    async unloadModels(models) {
      const pointClouds = models.map(model => this.modelPointClouds.get(model)).filter(Boolean);
      models.forEach(model => this.modelPointClouds.delete(model));

      pointClouds.forEach(pointCloud => {
        this.instance.remove(pointCloud);
      });

      const modelIds = models.map(model => model.id);
      this.loadedModelIds = this.loadedModelIds.filter(id => !modelIds.includes(id));
    },
  },
};
</script>

<style lang="scss" scoped>
.bimdata-giro3d {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  &__viewer {
    width: 100%;
    height: 100%;
    display: block;
    touch-action: none;
  }
}
</style>

<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <NoModelWindowPlaceHolder v-if="loadedModelIds.length === 0 && !loading" />
    <ModelsLoader
      :types="['POINT_CLOUD']"
      @load-models="loadModels"
      @unload-models="unloadModels"
      preview
    />
    <canvas :id="engine3dCanvasId" class="bimdata-giro3d__viewer"></canvas>
  </div>
</template>

<script>
// import { Vector3 } from 'three';
// import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Instance from '@giro3d/giro3d/Core/Instance.js';
// import Tiles3D from '@giro3d/giro3d/entities/Tiles3D.js';
// import { STRATEGY_DICHOTOMY } from '@giro3d/giro3d/Core/layer/LayerUpdateStrategy.js';
// import ColorLayer from '@giro3d/giro3d/Core/layer/ColorLayer.js';
// import PointsMaterial, { MODE } from '@giro3d/giro3d/Renderer/PointsMaterial.js';
// import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource.js';
export default {
  name: "giro3d",
  data() {
    return {
      loadedModelIds: [],
    };
  },
  created() {
    this.giro3dCanvasId = `3d-engine-${this.$viewer.localContext.pluginsUnit.id}`;
  },
  mounted() {
    const tmpVec3 = new Vector3();

    const viewerDiv = document.getElementById(this.giro3dCanvasId);

    const instance = new Instance(viewerDiv, {
      crs: 'EPSG:3857',
      renderer: {
        clearColor: 0xcccccc,
      },
    });

    // Create a custom material for our point cloud.
    const material = new PointsMaterial({
      size: 4,
      mode: MODE.TEXTURE,
    });

    // Create the 3D tiles entity
    const pointcloud = new Tiles3D(
      'pointcloud',
      new Tiles3DSource('https://3d.oslandia.com/3dtiles/lyon.3dtiles/tileset.json'),
      {
        material,
      },
    );

    document.getElementById('pointcloud_mode').addEventListener('change', e => {
      const newMode = parseInt(e.target.value, 10);
      material.mode = newMode;
      instance.notifyChange(pointcloud, true);
    });

    function placeCamera(position, lookAt) {
      instance.camera.camera3D.position.set(position.x, position.y, position.z);
      instance.camera.camera3D.lookAt(lookAt);
      // create controls
      const controls = new MapControls(
        instance.camera.camera3D,
        instance.domElement,
      );
      controls.target.copy(lookAt);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;

      instance.useTHREEControls(controls);

      instance.notifyChange(instance.camera.camera3D);
    }

    // add pointcloud to scene
    function initializeCamera() {
      const bbox = pointcloud.root.bbox
          ? pointcloud.root.bbox
          : pointcloud.root.boundingVolume.box.clone().applyMatrix4(pointcloud.root.matrixWorld);

      instance.camera.camera3D.far = 2.0 * bbox.getSize(tmpVec3).length();

      const ratio = bbox.getSize(tmpVec3).x / bbox.getSize(tmpVec3).z;
      const position = bbox.min.clone().add(
          bbox.getSize(tmpVec3).multiply({ x: 0, y: 0, z: ratio * 0.5 }),
      );
      const lookAt = bbox.getCenter(tmpVec3);
      lookAt.z = bbox.min.z;

      placeCamera(position, lookAt);
    }

    instance.add(pointcloud).then(initializeCamera);

  },
  methods: {
    async loadModels(models) {
      console.log('LOAD models', models)
    },
    async unloadModels(models) {
      console.log('UNLOAD models', models)
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

  &__header {
    position: absolute;
    top: var(--spacing-unit);
    left: calc(var(--plugin-units-width) / 2);
    transform: translate(-50%, 0);
  }

  &__viewer {
    width: 100%;
    height: 100%;
    display: block;
    touch-action: none;
  }
}

</style>

<template>
  <div class="bimdata-giro3d">
    <NoModelWindowPlaceHolder v-if="loadedModelIds.length === 0 && !loading" />
    <ModelsLoader :types="['POINT_CLOUD', 'IFC']" @load-models="loadModels" @unload-models="unloadModels" preview />
    <div :id="giro3dDivId" class="bimdata-giro3d__viewer"></div>
  </div>
</template>

<script>
import XYZ from 'ol/source/XYZ.js';
import TileWMS from 'ol/source/TileWMS.js';
import { AmbientLight, DirectionalLight, Vector3, Box3, Matrix4, MathUtils as ThreeMath } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Instance from '@giro3d/giro3d/core/Instance.js';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D.js';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource.js';
import HttpConfiguration from '@giro3d/giro3d/utils/HttpConfiguration.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GiroMap from '@giro3d/giro3d/entities/Map.js';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer.js';
import Extent from '@giro3d/giro3d/core/geographic/Extent.js';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer.js';
import BilFormat from '@giro3d/giro3d/formats/BilFormat.js';
import axios from 'axios'

const MAPTILER_TOKEN = "OFf7zv3r1RU4T2yn8M1u";


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
  },
  destroyed() {
    this.$viewer.localContext.hub.off(this.localContextResizeSubscription);
  },
  async mounted() {
    const test = await axios.get('www.google.fr')
    console.log(test)
    const viewerDiv = document.getElementById(this.giro3dDivId);

    // need to wait a tick to let areas render the window.
    await this.$nextTick();
    const { apiUrl, accessToken } = this.$viewer.api;

    HttpConfiguration.setHeader(apiUrl, 'Authorization', 'Bearer ' + accessToken);

    // Instance.registerCRS('EPSG:2154',
    //     "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs")
    // const extent = new Extent(
    //     'EPSG:2154',
    //     -378305.81, 6005281.2,
    //     1320649.57, 7235612.72,
    // );
    
    const extent = new Extent(
        'EPSG:3857',
        -20037508.342789244, 20037508.342789244,
        -20037508.342789244, 20037508.342789244,
    );
    
    const instance = new Instance(viewerDiv, {
      renderer: {
        clearColor: false,
      },
      crs: extent.crs(),
    });

    const map = new GiroMap('planar', { extent });
    instance.add(map);

    const tmsSource = new XYZ({
      attributions: '',
      minZoom: 0,
      maxZoom: 22,
      url: 'http://osm.oslandia.io/styles/osm-bright/{z}/{x}/{y}.png',
    });

    map.addLayer(new ColorLayer(
      'osm',
      {
        source: tmsSource,
      },
    )).catch(e => console.error(e));

    const elevationSource = new TileWMS({
      url: 'https://wxs.ign.fr/altimetrie/geoportail/r/wms',
      projection: 'EPSG:3857',
      crossOrigin: 'anonymous',
      params: {
        LAYERS: ['ELEVATION.ELEVATIONGRIDCOVERAGE', 'ELEVATION.ELEVATIONGRIDCOVERAGE.SRTM3'],
        FORMAT: 'image/x-bil;bits=32',
      },
      version: '1.3.0',
    });

    elevationSource.format = new BilFormat();

    const elevationLayer = new ElevationLayer(
      'wms_elevation',
      {
        source: elevationSource,
        noDataValue: -10000,
      },
    );

    map.addLayer(elevationLayer);


    // Adds lights for the IFC (as a Three object)
    const lightColor = 0xffffff;

    const ambientLight = new AmbientLight(lightColor, 0.5);
    instance.scene.add(ambientLight);

    const dirLight = new DirectionalLight(lightColor, 0.5);
    dirLight.position.set(1, -1.75, 1);
    instance.scene.add(dirLight);
    dirLight.updateMatrixWorld();

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
    placeCamera(position, lookAt) {
      const { instance, controls } = this;

      instance.camera.camera3D.position.set(position.x, position.y, position.z);
      instance.camera.camera3D.lookAt(lookAt);

      controls.target.copy(lookAt);
    },
    initializeCamera(bbox) {
      const tmpVec3 = new Vector3();
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
        if (model.type === 'POINT_CLOUD') {
          const { apiUrl, cloudId, projectId } = this.$viewer.api;

          const pointcloud = new Tiles3D(
            'pointcloud',
            new Tiles3DSource(`${apiUrl}/cloud/${cloudId}/project/${projectId}/model/${model.id}/tileset?tile_format=pnts`),
          );

          this.modelPointClouds.set(model, pointcloud);

          await this.instance.add(pointcloud);

          if (i === 0) {
            const bbox = pointcloud.root.bbox
              ? pointcloud.root.bbox
              : pointcloud.root.boundingVolume.box.clone().applyMatrix4(pointcloud.root.matrixWorld);
            this.initializeCamera(bbox);
          }
        } else {
          const loader = new GLTFLoader().load(model.gltf_file, (gltf) => {
            this.instance.add(gltf.scene);
            window.scene = gltf.scene
            gltf.scene.rotation.x = Math.PI / 2;
            gltf.scene.updateMatrixWorld();

            if (i === 0) {
              const box = new Box3().setFromObject(gltf.scene);
              this.initializeCamera(box);
            }
          });
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

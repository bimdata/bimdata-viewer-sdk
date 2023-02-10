<template>
  <div class="home">
    <header class="flex justify-center">
      <div class="flex items-center">
        <div class="">
          <h1>BIMData SDK</h1>
          <p>
            Quickly build a reliable & full featured plugin. Our BIMData SDK is made specifically to help you create your own plugins.
          </p>
          <a href="https://developers-staging.bimdata.io/" class="bimdata-btn bimdata-btn__fill bimdata-btn__fill--secondary bimdata-btn__radius m-t-30" target="_blank">Explore our documentation</a>
        </div>
        <div class="flex justify-center">
          <img src="./assets/home-illu.png" width="260" />
        </div>
      </div>
    </header>
    <div class="home-form flex flex-col m-t-24">
      <h2>Let's start</h2>
      <p>
        Choose one cloud, project and model to see your first plugin in viewer
        environment
      </p>
      <div class="flex m-t-24">
        <div class="home-form__card">
          <div class="flex items-center m-b-18">
            <h5 class="m-r-12">Step 01 : Select a cloud</h5>
            <BIMDataIcon
              name="validate"
              fill
              color="success"
              v-if="selectedCloud"
              size="xxs"
            />
          </div>
          <BIMDataSelect
            width="300px"
            label="Clouds list"
            :options="clouds"
            optionKey="name"
            v-model="selectedCloud"
            :disabled="fetchingClouds"
          />
        </div>
        <div class="home-form__card m-x-24">
          <div class="flex items-center m-b-18">
            <h5 class="m-r-12">Step 02 : Select a project</h5>
            <BIMDataIcon
              name="validate"
              fill
              color="success"
              v-if="selectedProject"
              size="xxs"
            />
          </div>
          <BIMDataSelect
            width="300px"
            label="Projects list"
            :options="projects"
            optionKey="name"
            v-model="selectedProject"
            :disabled="!selectedCloud || fetchingProjects"
          />
        </div>
        <div class="home-form__card">
          <div class="flex items-center m-b-18">
            <h5 class="m-r-12">Step 03 : Select a model</h5>
            <BIMDataIcon
              name="validate"
              fill
              color="success"
              v-if="selectedModel"
              size="xxs"
            />
          </div>
          <BIMDataSelect
            width="300px"
            label="Models list"
            :options="models"
            optionKey="name"
            v-model="selectedModel"
            :disabled="!selectedProject || fetchingModels"
          />
        </div>
      </div>
      <BIMDataButton
        color="primary"
        width="250px"
        fill
        radius
        class="m-t-36"
        :disabled="!selectedCloud || !selectedProject"
        @click="go"
      >
        Go
      </BIMDataButton>
    </div>
    <div class="home-explications m-t-42 m-b-24">
      <h4>It just works like this</h4>
      <div class="flex">
        <div>
          <h4>1.</h4>
          <strong>Install SDK</strong>
          <p>
            Choose one cloud, project and model to see your first plugin in
            viewer environment
          </p>
        </div>
        <div>
          <h4>2.</h4>
          <strong>Create your plugin</strong>
          <p>
            A single line of code sets up your future plugin and gets you
            started quickly.
          </p>
        </div>
        <div>
          <h4>3.</h4>
          <strong>Build your own plugin</strong>
          <p>
            Use your UI elements with our SDK and build the plugin you need.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import getClient from "../api/api.js";

import {
  BIMDataButton,
  BIMDataSelect,
  BIMDataIcon,
} from "@bimdata/design-system/dist/js/BIMDataComponents/vue3/index.js";

import { mapGetters } from "vuex";

export default {
  name: "home",
  data() {
    return {
      clouds: [],
      selectedCloud: null,
      fetchingClouds: false,
      projects: [],
      selectedProject: null,
      fetchingProjects: false,
      models: [],
      selectedModel: null,
      fetchingModels: false,
    };
  },
  components: {
    BIMDataButton,
    BIMDataSelect,
    BIMDataIcon,
  },
  computed: {
    ...mapGetters(["oidcAccessToken"]),
    collaborationApi() {
      const apiClient = getClient({
        accessToken: this.oidcAccessToken,
        apiUrl: import.meta.env.VITE_APP_BIMDATA_API_URL,
      });
      return apiClient.collaborationApi;
    },
    modelApi() {
      const apiClient = getClient({
        accessToken: this.oidcAccessToken,
        apiUrl: import.meta.env.VITE_APP_BIMDATA_API_URL,
      });
      return apiClient.modelApi;
    },
  },
  watch: {
    selectedCloud() {
      if (this.selectedCloud) {
        this.selectedModel = null;
        this.selectedProject = null;
        this.getProjects();
      }
    },
    selectedProject() {
      if (this.selectedProject) {
        this.selectedModel = null;
        this.getModels();
      }
    },
  },
  created() {
    this.getClouds();
  },
  methods: {
    go() {
      this.$router.push({
        name: "viewer",
        query: {
          cloudId: this.selectedCloud.id,
          projectId: this.selectedProject.id,
          modelId: this.selectedModel.id,
        },
      });
    },
    async getClouds() {
      this.fetchingClouds = true;
      this.clouds = await this.collaborationApi.getClouds();
      this.fetchingClouds = false;
    },
    async getProjects() {
      this.fetchingProjects = true;
      this.projects = await this.collaborationApi.getProjects(
        this.selectedCloud.id
      );
      this.fetchingProjects = false;
    },
    async getModels() {
      this.fetchingModels = true;
      this.models = await this.modelApi.getModels(
        this.selectedCloud.id,
        this.selectedProject.id
      );
      this.fetchingModels = false;
    },
  },
};
</script>

<style lang="scss" scoped src="./_Home.scss"></style>

<template>
  <div class="home p-24">
    <h2>BIMData SDK</h2>
    <div class="m-y-6">
      <select v-model="selectedCloud" :disabled="fetchingClouds">
        <option disabled :value="null">{{
          fetchingClouds ? "Fetching clouds" : "Select a cloud"
        }}</option>
        <option v-for="cloud of clouds" :key="cloud.id" :value="cloud">{{
          cloud.name
        }}</option>
      </select>
    </div>
    <div class="m-y-6">
      <select
        v-model="selectedProject"
        :disabled="!selectedCloud || fetchingProjects"
      >
        <option disabled :value="null">{{
          fetchingProjects ? "Fetching projects" : "Select a project"
        }}</option>
        <option
          v-for="project of projects"
          :key="project.id"
          :value="project"
          >{{ project.name }}</option
        >
      </select>
    </div>
    <div class="m-y-6">
      <select
        v-model="selectedModel"
        :disabled="!selectedProject || fetchingModels"
      >
        <option disabled :value="null">{{
          fetchingModels ? "Fetching Models" : "Select a Model"
        }}</option>
        <option v-for="ifc of models" :key="ifc.id" :value="ifc">{{
          ifc.name
        }}</option>
      </select>
    </div>
    <button
      class="m-t-12"
      :disabled="!selectedCloud || !selectedProject"
      @click="go"
    >
      Go
    </button>
  </div>
</template>

<script>
import getClient from "../api/api.js";

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
  computed: {
    ...mapGetters(["oidcAccessToken"]),
    collaborationApi() {
      const apiClient = getClient({
        accessToken: this.oidcAccessToken,
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL,
      });
      return apiClient.collaborationApi;
    },
    modelApi() {
      const apiClient = getClient({
        accessToken: this.oidcAccessToken,
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL,
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

<style lang="scss" scoped>
.home {
  margin: auto;
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  select {
    width: 250px;
    height: 32px;
    border: none;
    background-color: white;
    border-bottom: 1px solid;
    outline: none;
    cursor: pointer;
  }
  button {
    width: 250px;
    height: 32px;
    background-color: #2f374a;
    color: #fff;
    border-radius: 3px;
    background-origin: none;
    border: none;
    cursor: pointer;
    &:hover {
      background-color: #3b455d;
    }
  }
  &.p-24 {
    padding: 24px;
  }
  .m-y-6 {
    margin: 6px 0;
  }
  .m-t-12 {
    margin-top: 12px;
  }
}
</style>

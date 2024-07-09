<template>
  <div style="">
    <BIMDataInput v-model="projectName" placeholder="Name" />
    <BIMDataTextarea
      label="projectDescription"
      name="example"
      v-model="projectDescription"
      resizable
    />

    <BIMDataButton
      width="100%"
      icon
      v-on:click="addProject"
      class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius m-y-12 p-x-24"
    >
      <BIMDataIcon name="plus" size="xxxs" margin="0 12px 0 0" />
      Add project
    </BIMDataButton>

    <BIMDataButton
      width="100%"
      color="high"
      fill
      square
      icon
      v-on:click="cancel"
      class="bimdata-btn__fill bimdata-btn__fill--secondary bimdata-btn__radius m-y-12 p-x-24"
    >
      <BIMDataIcon name="chevron" size="xxxs" margin="0 12px 0 0" />
      Cancel
    </BIMDataButton>
  </div>
</template>

<script>
import {
  BIMDataIcon,
  BIMDataTextarea,
  BIMDataInput,
  BIMDataButton,
} from "@bimdata/design-system";
import func from "../func.js";

export default {
  name: "AddProjectReflect",
  components: {
    BIMDataButton,
    BIMDataInput,
    BIMDataTextarea,
    BIMDataIcon,
  },
  props: {
    access_token: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loadedIfc: null,
      exportStructure: true,
      projectName: "",
      projectDescription: "",
      projectCreated: false,
    };
  },
  computed: {
    reflect_url() {
      return "https://smarty.plateforme-tipee.com";
    },
  },
  created() {
    // Set default fileName
    const parts = this.$viewer.state.models[0].document.file_name.split(".");
    parts.pop(); // Remove extension
    const name = parts.join("."); // rebuild name without extension
    const date = new Date();
    const created_at =
      date.toLocaleDateString(this.$i18n.locale).replace(/\//g, "-") +
      "-" +
      date.getHours() +
      "-" +
      date.getMinutes();
    this.projectName = "Reflect_" + name + "-" + created_at;
    this.projectDescription = "";
  },

  methods: {
    async loadIfcBimData(url, filename) {
      let response = await fetch(url);
      let data = await response.text();
      console.log("data:", data);
      let metadata = {
        type: "application/ifc",
      };
      let file = new File([data], filename, metadata);
      return file;
    },

    get_access_token() {
      return this.access_token;
    },

    getInfoIfcFile() {
      const models = this.$viewer.state.models;
      console.log("loadedIfcs", models);
      console.log("this.$viewer.state", this.$viewer.state);
      this.loadedIfc = models[0];
      return {
        url: this.loadedIfc.document.file,
        filename: this.loadedIfc.document.name,
      };
    },

    headers(token) {
      return {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json;charset=UTF-8",
      };
    },
    cancel() {
      this.projectCreated = true;
      this.$emit("project-method", this.projectCreated);
    },

    async addProject() {
      const res = await fetch(`${this.reflect_url}/reflect/project`, {
        headers: this.headers(this.access_token),
        body: JSON.stringify({
          name: this.projectName,
          description: this.projectDescription,
        }),
        method: "POST",
      });
      const json = await res.json();
      const id_current_project = json.project_id;

      const info = this.getInfoIfcFile();
      const url = info.url;
      const filename = info.filename;

      console.log("this.get_access_token()", this.get_access_token());

      // async function createFile2(url,access_token, fn) {
      //   let request = new XMLHttpRequest();
      //   let file1;
      //   request.open("GET", url, true);
      //   request.responseType = 'text';
      //   request.onload = function () {
      //     file1 = new File([request.response], "filename.ifc", {
      //       type: "application/ifc",
      //     });
      //     fn({file:file1, access_token:access_token});
      //   };
      //   request.send();
      // }
      // const rere = await createFile2(url,this.access_token, function (data) {
      //   const formData = new FormData();
      //   formData.append("file", data.file);
      //   func.addIfc(formData, id_current_project,data.access_token);
      //   return "fde";
      // }).then(res => {
      //   console.log("res:", res);
      // });

      const ifc_bimdata = await this.loadIfcBimData(url, filename);
      const formData = new FormData();

      console.log("ifc_bimdata", ifc_bimdata);
      formData.append("file", ifc_bimdata);
      func.addIfc(formData, id_current_project, this.access_token);

      if (id_current_project) {
        this.projectCreated = true;
        this.$emit("project-method", this.projectCreated);
        this.$emit("reflect-connected-method", "");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@bimdata/design-system/dist/scss/BIMDataUtilities.scss";
</style>

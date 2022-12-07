<template>
  <div class="camera-follow">
    <div class="camera-follow__box">
      <UserAvatar
        class="user-avatar-list__item"
        :class="{ selected: user === followedUser }"
        v-for="user of availableUserObjects"
        :key="user.uuid"
        :user="user"
        @avatarClick="onUserClick(user)"
      />
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import UserAvatar from "./UserAvatar";

const colors = {
  red: "#ff3d1e",
  brown: "#a52a2a",
  darkgreen: "#006400",
  bisque: "#ffe4c4",
  maroon: "#800000",
  khaki: "#f0e68c",
  tan: "#d2b48c",
  coral: "#ff7f50",
  orange: "#ffa500",
  greenyellow: "#adff2f",
  peru: "#cd853f",
  sienna: "#a0522d",
  yellowgreen: "#9acd32",
  forestgreen: "#00af50",
  green: "#008000",
  lightcyan: "#e0ffff",
  skyblue: "#87ceeb",
  steelblue: "#4682b4",
  blue: "#0000ff",
  darkblue: "#00008b",
  mistyrose: "#ffe4e1",
  hotpink: "#ff69b4",
  magenta: "#ff00ff",
  purple: "#800080",
  indigo: "#4b0082",
  whitesmoke: "#f5f5f5",
  silver: "#c0c0c0",
  darkgray: "#a9a9a9",
  grey: "#7a7a7a",
  black: "#000000",
};

export default {
  // https://vuejs.org/v2/guide/components.html
  components: {
    UserAvatar,
  },
  name: "cameraFollow",
  data() {
    return {
      user: undefined,
      followedUser: null,
      projectUsers: [],
      availableUsers: [],
    };
  },
  async created() {
    this.viewer3d = this.$viewer.localContext.getPlugin("viewer3d");
    this.currentModelIds = this.viewer3d.loadedIfcIds;
    this.user = await this.getSelf();
    this.projectUsers = await this.getProjectUsers();
    // this.webSocket = new WebSocket(this.getCameraFollowServerUrl());
    this.webSocket = new WebSocket("ws://localhost:3000/");
    this.lastAskedCameraPos = null;
    this.webSocket.addEventListener("message", event => {
      // console.log("event", event);

      const { meta, message } = JSON.parse(event.data);

      switch (meta) {
        case "USERLIST":
          this.availableUsers = message;
          const colorValues = Object.values(colors);
          this.availableUsers.forEach(
            (user, index) => (user.color = colorValues[index])
          );
          break;
        case "INITIALVIEWPOINT":
          this.sendCamera();
          this.sendModel();
          break;
        case "STARTFOLLOW":
          this.listenCamera();
          this.listenModels();
          // this.listenMousePosition();
          this.listenSelectedObjects();
          this.listenHighlightedObjects();
          this.isFollowing = true;
          break;
        case "ENDFOLLOW":
          if (!this.isFollowing) return;
          // document.removeEventListener("mousemove", this.sendMousePosition);
          this.viewer3d.xeokit.scene.camera.off(this.viewerxeokitListener);
          this.$viewer.localContext.hub.off(this.loadedModelsListener);
          this.$viewer.localContext.hub.off(this.unloadedModelsListener);
          this.$viewer.state.hub.off(this.selectedObjectListener);
          this.$viewer.state.hub.off(this.deselectedObjectListener);
          this.$viewer.state.hub.off(this.highlightedObjectListener);
          this.$viewer.state.hub.off(this.unhighlightedObjectListener);
          this.lastAskedCameraPos = null;
          this.lastAskedSelectedObjects = null;
          this.lastAskedHighlightedObjects = null;
          this.isCursorCreated = false;
          break;
        case "SET_CAMERA":
          this.lastAskedCameraPos = message;
          break;
        case "SET_MODELS":
          if (this.currentModelIds.includes(message.modelId)) return;
          this.currentModelIds.push(message.modelId);
          break;
        case "SET_MOUSE_POSITION":
          const [x, y] = message;

          if (!this.isCursorCreated) {
            const viewer = document.getElementById(
              this.viewer3d.engine3dCanvasId
            ).parentNode;
            const cursor = document.createElement("div");
            // cursor.src = "../assets/cursor-icon.svg";
            cursor.id = "mouse-pointer";
            cursor.style.backgroundColor = "red";
            cursor.style.position = "absolute";
            cursor.style.width = 5 + "px";
            cursor.style.height = 5 + "px";
            cursor.style.left = x + "%";
            cursor.style.top = y + "%";
            viewer.appendChild(cursor);
            this.isCursorCreated = true;
          }

          const cursor = document.getElementById("mouse-pointer");
          cursor.style.left = x + "%";
          cursor.style.top = y + "%";
          break;
        case "SET_SELECTED_OBJECTS":
          this.lastAskedSelectedObjects = message;
          break;
        case "SET_HIGHLIGHT_OBJECTS":
          this.lastAskedHighlightedObjects = message;
          break;
      }
    });
    this.webSocket.onopen = () => {
      this.sendToServer("JOIN", {
        project_id: this.$viewer.api.projectId,
        email: this.user.email,
        uuid: uuidv4(),
      });
    };
  },
  mounted() {
    this.canvasElement = document.getElementById(
      this.viewer3d.engine3dCanvasId
    ).parentNode;
  },
  computed: {
    availableUserObjects() {
      let users = new Set();
      this.availableUsers.forEach(user => {
        users.add({
          ...this.projectUsers.find(u => (u.email = user.email)),
          ...user,
        });
      });
      return users;
    },
  },
  methods: {
    async getSelf() {
      return new this.$viewer.api.apiClient.CollaborationApi().getSelfUser();
    },
    async getProjectUsers() {
      return new this.$viewer.api.apiClient.CollaborationApi().getProjectUsers(
        this.$viewer.api.cloudId,
        this.$viewer.api.projectId
      );
    },
    getCameraFollowServerUrl() {
      const url = new URL(this.$viewer.api.apiUrl);
      const hostname = url.hostname;
      let env = "";
      const [apiEnv, ...domainPath] = hostname.split(".");
      const domain = domainPath.join(".");
      if (apiEnv.includes("-staging")) {
        env = "-staging";
      } else if (apiEnv.includes("-next")) {
        env = "-next";
      }
      const protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return protocol + "//websocket" + env + "." + domain;
    },
    sendToServer(meta, message) {
      this.webSocket.send(
        JSON.stringify({
          meta,
          message,
        })
      );
    },
    activateBorder(color) {
      this.canvasElement.style.border = `5px solid ${color}`;
    },
    deactivateBorder() {
      this.canvasElement.style.border = "";
    },
    onUserClick(user) {
      const followedUser = this.followedUser;
      if (followedUser) {
        this.unfollow();
        this.followedUser = null;
        this.deactivateBorder();
      }
      if (followedUser !== user) {
        this.follow(user.uuid);
        this.followedUser = user;
        this.activateBorder(user.color);
      }
    },
    unfollow() {
      this.sendToServer("UNFOLLOW");
      this.lastAskedCameraPos = null;
      this.lastAskedSelectedObjects = null;
      this.lastAskedHighlightedObjects = null;
    },
    follow(uuid) {
      this.sendToServer("FOLLOW", uuid);
      this.viewer3d.xeokit.scene.on("tick", () => {
        if (this.lastAskedCameraPos) {
          this.viewer3d.xeokit.scene.camera.eye = this.lastAskedCameraPos.eye;
          this.viewer3d.xeokit.scene.camera.look = this.lastAskedCameraPos.look;
          this.viewer3d.xeokit.scene.camera.up = this.lastAskedCameraPos.up;
          this.viewer3d.xeokit.scene.camera.projection =
            this.lastAskedCameraPos.projection;

          this.lastAskedCameraPos = null;
        }
        if (this.lastAskedSelectedObjects) {
          this.$viewer.state.selectObjects(this.lastAskedSelectedObjects, {
            exclusive: true,
          });
          this.lastAskedSelectedObjects = null;
        }
        if (this.lastAskedHighlightedObjects) {
          const oldHighlightedObjects =
            this.$viewer.state.highlightedObjectsIds;
          this.$viewer.state.unhighlightObjects(oldHighlightedObjects);
          this.$viewer.state.highlightObjects(this.lastAskedHighlightedObjects);
          this.lastAskedHighlightedObjects = null;
        }
      });
    },
    sendCamera() {
      this.sendToServer("CAMERA", {
        up: Array.from(this.viewer3d.xeokit.scene.camera.up),
        eye: Array.from(this.viewer3d.xeokit.scene.camera.eye),
        look: Array.from(this.viewer3d.xeokit.scene.camera.look),
        projection: this.viewer3d.xeokit.scene.camera.projection,
      });
    },
    sendModel(model) {
      if (model) {
        this.sendToServer("MODELS", model);
      } else {
        this.viewer3d.loadedIfcIds.forEach(modelId =>
          this.sendToServer("MODELS", {
            type: "load",
            modelId,
          })
        );
      }
    },
    sendSelectedObjects() {
      this.sendToServer(
        "SELECTED_OBJECTS",
        this.$viewer.state.selectedObjectsIds
      );
    },
    sendHighlightedObjects() {
      this.sendToServer(
        "HIGHLIGHT_OBJECTS",
        this.$viewer.state.highlightedObjectsIds
      );
    },
    listenCamera() {
      this.xeokitListener = this.viewer3d.xeokit.scene.camera.on(
        "matrix",
        this.sendCamera
      );
    },
    listenModels() {
      this.$viewer.localContext.hub.on("3d-model-loading", ({ ifc }) => {
        this.sendModel({
          type: "load",
          modelId: ifc.id,
        });
      });
      this.$viewer.localContext.hub.on("models-unloading", models => {
        this.sendModel({ type: "unload", models });
      });
    },
    listenSelectedObjects() {
      this.selectedObjectListener = this.$viewer.state.hub.on(
        "objects-selected",
        this.sendSelectedObjects
      );
      this.deselectedObjectListener = this.$viewer.state.hub.on(
        "objects-deselected",
        this.sendSelectedObjects
      );
    },
    listenHighlightedObjects() {
      this.highlightedObjectListener = this.$viewer.state.hub.on(
        "objects-highlighted",
        this.sendHighlightedObjects
      );
      this.unhighlightedObjectListener = this.$viewer.state.hub.on(
        "objects-unhighlighted",
        this.sendHighlightedObjects
      );
    },
    listenMousePosition() {
      document.addEventListener("mousemove", this.sendMousePosition);
    },
    sendMousePosition(event) {
      const viewer = document.getElementById(
        this.viewer3d.engine3dCanvasId
      ).parentNode;

      const { height, width } = viewer.getBoundingClientRect();
      const info = viewer.getBoundingClientRect();
      // console.log("info", info);
      this.sendToServer("MOUSE_POSITION", [
        parseInt((event.pageX * 100) / height, 10),
        parseInt((event.pageY * 100) / width, 10),
      ]);
    },
  },
  destroyed() {
    this.webSocket.close();
  },
};
</script>

<style lang="scss" scoped>
.camera-follow {
  &__cursor {
    position: absolute;
  }
}
</style>

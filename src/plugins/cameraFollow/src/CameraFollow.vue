<template>
  <div class="camera-follow">
    <div class="camera-follow__box">
      <div
        class="camera-follow__box__user"
        v-for="user in userList"
        :key="user.uuid"
        @click="onFollow(user.uuid)"
      >
        {{user.email}}
      </div>
      <div>
        <BIMDataButton width="12px">close</BIMDataButton>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "cameraFollow",
  data() {
    return {
      user: undefined,
      userList: [],
    };
  },
  async created() {
    this.user = await this.getSelf();
    this.webSocket = new WebSocket("ws://192.168.17.3:3000/");
    this.lastAskedCameraPos = null;
    this.webSocket.addEventListener("message", event => {
      console.log("event", event);

      const { meta, message } = JSON.parse(event.data);

      switch (meta) {
        case "USERLIST":
          this.userList = message;
          break;
        case "INITIALVIEWPOINT":
          this.sendCamera();
          this.sendModels();
          break;
        case "STARTFOLLOW":
          this.listenCamera();
          this.listenModels();
          this.listenMousePosition();
          this.isFollowing = true;
          break;
        case "ENDFOLLOW":
          if (!this.isFollowing) return;
          document.removeEventListener("mousemove", this.sendMousePosition);
          this.viewer3d.xeokit.scene.camera.off(this.viewerxeokitListener);
          this.$viewer.localContext.hub.off(this.loadedModelsListener);
          this.$viewer.localContext.hub.off(this.unloadedModelsListener);
          this.lastAskedCameraPos = null;
          this.isCursorCreated = false;
          break;
        case "SET_CAMERA":
          console.log("set camera");
          this.lastAskedCameraPos = message;

          break;
        case "SET_MODELS":
          // this.$viewer.state.models = message.data;
          // this.$viewer.state.loadModel()
          // const filteredModels = this.viewer3d.loadedIfcIds.
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
      }
    });
    this.webSocket.onopen = () => {
      this.webSocket.send(
        JSON.stringify({
          meta: "JOIN",
          message: {
            project_id: this.$viewer.api.projectId,
            email: this.user.email,
            uuid: uuidv4(),
          },
        })
      );
    };
    this.viewer3d = this.$viewer.localContext.getPlugin("viewer3d");
  },
  methods: {
    async getSelf() {
      return new this.$viewer.api.apiClient.CollaborationApi().getSelfUser();
    },
    onFollow(uuid) {
      this.webSocket.send(
        JSON.stringify({
          meta: "FOLLOW",
          message: uuid,
        })
      );
      this.viewer3d.xeokit.scene.on("tick", () => {
        if (this.lastAskedCameraPos) {
          this.viewer3d.xeokit.scene.camera.eye = this.lastAskedCameraPos.eye;
          this.viewer3d.xeokit.scene.camera.look = this.lastAskedCameraPos.look;
          this.viewer3d.xeokit.scene.camera.up = this.lastAskedCameraPos.up;
          this.viewer3d.xeokit.scene.camera.projection =
            this.lastAskedCameraPos.projection;

          this.lastAskedCameraPos = null;
        }
      });
    },
    sendCamera() {
      this.webSocket.send(
        JSON.stringify({
          meta: "CAMERA",
          message: {
            up: Array.from(this.viewer3d.xeokit.scene.camera.up),
            eye: Array.from(this.viewer3d.xeokit.scene.camera.eye),
            look: Array.from(this.viewer3d.xeokit.scene.camera.look),
            projection: this.viewer3d.xeokit.scene.camera.projection,
          },
        })
      );
    },
    sendModels() {
      this.webSocket.send(
        JSON.stringify({
          meta: "MODELS",
          message: this.viewer3d.loadedIfcIds,
        })
      );
    },
    listenCamera() {
      this.xeokitListener = this.viewer3d.xeokit.scene.camera.on(
        "matrix",
        () => {
          this.webSocket.send(
            JSON.stringify({
              meta: "CAMERA",
              message: {
                up: Array.from(this.viewer3d.xeokit.scene.camera.up),
                eye: Array.from(this.viewer3d.xeokit.scene.camera.eye),
                look: Array.from(this.viewer3d.xeokit.scene.camera.look),
                projection: this.viewer3d.xeokit.scene.camera.projection,
              },
            })
          );
        }
      );
    },
    listenModels() {
      this.loadedModelsListener = this.$viewer.localContext.hub.on(
        "3d-model-loaded",
        () => this.sendModels()
      );
      this.unloadedModelsListener = this.$viewer.localContext.hub.on(
        "3d-model-unloaded",
        () => this.sendModels()
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
      console.log("info", info);
      this.webSocket.send(
        JSON.stringify({
          meta: "MOUSE_POSITION",
          message: [
            parseInt((event.pageX * 100) / height, 10),
            parseInt((event.pageY * 100) / width, 10),
          ],
        })
      );
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

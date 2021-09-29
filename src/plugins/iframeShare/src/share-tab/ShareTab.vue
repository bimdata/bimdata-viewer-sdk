<template>
  <div class="share-tab">
    <ShareInfo
      v-if="shareUrl"
      :shareBackendUrl="shareBackendUrl"
      :shareUrl="shareUrl"
    />
    <ShareCreationForm
      v-else
      :shareBackendUrl="shareBackendUrl"
      @share-created="shareUrl = $event"
    />
  </div>
</template>

<script>
import ShareCreationForm from "./ShareCreationForm.vue";
import ShareInfo from "./ShareInfo.vue";

export default {
  components: {
    ShareCreationForm,
    ShareInfo,
  },
  props: {
    shareBackendUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      shareUrl: null,
    };
  },
};
</script>

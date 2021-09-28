<template>
  <div class="share-info">
    <BIMDataButton
      class="share-info__btn-close"
      ghost
      radius
      @click="$emit('close')"
    >
      <BIMDataIcon name="arrow" size="xxs" margin="0 6px 0 0" />
      <span>
        {{ $t("IframeSharePlugin.ShareInfo.backButtonText") }}
      </span>
    </BIMDataButton>

    <div>
      <h2>
        <BIMDataIcon name="share" size="s" margin="0 6px 0 0" />
        <span>
          {{ $t("IframeSharePlugin.ShareInfo.shareButtonText") }}
        </span>
      </h2>
      <div class="share-info__link">
        <span class="share-info__link__url">
          {{ shareUrl }}
        </span>
        <BIMDataButton
          class="share-info__link__btn"
          height="10px"
          color="primary"
          fill
          square
          @click="copyUrl"
        >
          {{ $t("IframeSharePlugin.ShareInfo.copyButtonText") }}
        </BIMDataButton>
      </div>
    </div>

    <div>
      <h2>
        &lt;&sol;&gt;
        {{ $t("IframeSharePlugin.ShareInfo.shareIframeTitle") }}
      </h2>
      <div class="share-info__iframe">
        <pre>{{ iframeSnippet }}</pre>
      </div>
    </div>

    <BIMDataButton color="primary" fill radius @click="copyIframe">
      {{ $t("IframeSharePlugin.ShareInfo.copyButtonText") }}
    </BIMDataButton>
  </div>
</template>

<script>
import {
  BIMDataButton,
  BIMDataIcon,
} from "@bimdata/design-system/components.js";

export default {
  components: {
    BIMDataButton,
    BIMDataIcon,
  },
  props: {
    shareBackendUrl: {
      type: String,
    },
    share: {
      type: String,
      default: null,
    },
  },
  emits: ["close"],
  computed: {
    shareUrl() {
      return `${this.shareBackendUrl}/${this.share.id}`;
    },
    iframeSnippet() {
      return (
        `<iframe\n` +
        `  width="560" height="315"\n` +
        `  src="${this.shareUrl}"  \n` +
        `  frameborder="0"\n` +
        `  allowfullscreen>\n` +
        `</iframe>`
      );
    },
  },
  methods: {
    async copy(text) {
      await navigator.clipboard.writeText(text);
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: this.$t("IframeSharePlugin.ShareInfo.copySuccessMessage"),
      });
    },
    copyUrl() {
      this.copy(this.shareUrl);
    },
    copyIframe() {
      this.copy(this.iframeSnippet);
    },
  },
};
</script>

<style scoped lang="scss">
.share-info {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  &__btn-close {
    position: absolute;
    top: 0;
    left: 0;
  }

  h2 {
    margin: 0;
    margin-bottom: var(--spacing-unit);
  }

  &__link {
    display: flex;

    &__url {
      flex-grow: 1;
      background-color: var(--color-tertiary-lightest);
      padding: calc(var(--spacing-unit) / 2) var(--spacing-unit);
      white-space: nowrap;
    }
  }

  &__iframe {
    pre {
      margin: 0;
      padding: calc(var(--spacing-unit) / 2) var(--spacing-unit);
      overflow: auto;
      background-color: var(--color-tertiary-lightest);
    }
  }
}
</style>

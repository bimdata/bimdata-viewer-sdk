<template>
  <div class="process-group">
    <div class="head" @click="showItems = true">
      <img class="icon" :src="group.icon" />
      <span class="label">{{ group.label }}</span>
      <BIMDataIconChevron size="m" />
    </div>

    <div class="body" v-show="showItems">
      <BIMDataButton class="back" ghost square @click="showItems = false">
        <BIMDataIconArrow size="xs" />
        <span class="m-l-6">Retour</span>
      </BIMDataButton>
      <h3 class="title">
        <img :src="group.icon" />
        <span>{{ group.label }}</span>
      </h3>
      <BIMDataSearch
        class="search"
        width="100%"
        color="primary"
        placeholder="Rechercher"
        v-model="searchText"
      />
      <ProcessItem
        v-for="item in displayedItems"
        :key="item.label"
        :item="item"
      />
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";

import ProcessItem from "./ProcessItem.vue";

export default {
  components: {
    ProcessItem,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const showItems = ref(false);
    const searchText = ref("");

    const displayedItems = computed(() => {
      const items = props.group.items;
      const text = searchText.value.trim().toLowerCase();
      if (text) {
        return items.filter(item => item.label.toLowerCase().includes(text));
      } else {
        return items;
      }
    });

    return {
      displayedItems,
      showItems
    };
  },
};
</script>

<style scoped>
.process-group {
  > .head {
    padding: calc(var(--spacing-unit) * 2);
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 2);
    border-radius: 3px;
    box-shadow: var(--box-shadow);
    cursor: pointer;

    .label {
      margin-right: auto;
      font-weight: bold;
    }
  }

  > .body {
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(100% - var(--spacing-unit) * 2 - 44px);
    padding: var(--spacing-unit);
    background-color: var(--color-white);
    overflow: auto;

    display: flex;
    flex-direction: column;
    gap: var(--spacing-unit);

    .back {
      position: absolute;
      z-index: 1;
      top: calc(var(--spacing-unit) + 2px);
    }

    .title {
      position: relative;
      margin: 0;
      padding: calc(var(--spacing-unit) / 2);
      text-align: center;

      > img {
        height: 24px;
        display: inline;
        vertical-align: top;
        margin-right: var(--spacing-unit);
      }

      &::before {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 42px;
        height: 4px;
        background-color: #007686;
      }
    }

    .search {
      min-height: 32px;
      margin: var(--spacing-unit) 0;
    }
  }
}
</style>

<template>
  <BIMDataTable
    class="reflect-validation-table"
    tableLayout="fixed"
    :columns="columns"
    :rows="rows"
    :rowHeight="36"
    placeholder="Aucune règle"
  >
    <template #cell-titre_chapitre="{ row }">
      <BIMDataTextbox :text="row.titre_chapitre" />
    </template>
    <template #cell-validation_finale="{ row }">
      <div
        class="validation-status-cell"
        :class="row.validation_finale === '100.0%' ? 'valid' : 'not-valid'"
      >
        {{ row.validation_finale }}
      </div>
    </template>
  </BIMDataTable>
</template>

<script>
import { BIMDataTextbox } from "@bimdata/design-system";

const columns = [
  {
    id: "numero_chapitre",
    label: "N°",
    width: "100px"
  },
  {
    id: "titre_chapitre",
    label: "Titre"
  },
  {
    id: "code_regle",
    label: "Code",
    width: "150px"
  },
  {
    id: "validation_finale",
    label: " ",
    width: "100px",
    align: "center"
  }
];

export default {
  components: {
    BIMDataTextbox
  },
  props: {
    rows: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      columns,
    };
  },
};
</script>

<style scoped lang="scss">
.reflect-validation-table {
  height: 100%;
  ::v-deep .bimdata-table__container {
    height: 100%;
  }

  .validation-status-cell {
    height: 35px;
    border-bottom: 1px solid var(--color-white);
    display: flex;
    justify-content: center;
    align-items: center;
  
    &.valid {
      background-color: #42B983;
      color: var(--color-white);
    }
    
    &.not-valid {
      background-color: #DB0F0F;
      color: var(--color-white);
    }
  }
}
</style>

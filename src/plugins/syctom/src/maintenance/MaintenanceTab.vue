<template>
  <div class="maintenance-tab">
    <div class="maintenance-tab__header flex m-b-18">
      <BIMDataSearch
        placeholder="Search"
        color="primary"
        radius
        clear="false"
        width="100%"
        height="32px"
        class="search"
        v-model="searchText"
      />
      <BIMDataButton
        class="filter-btn"
        color="primary"
        fill
        radius
        @click="displayFilters = !displayFilters"
      >
        Filtres
        <BIMDataIconChevron size="xxxs" :rotate="displayFilters ? 90 : 0" />
      </BIMDataButton>
      <transition name="slide-fade-up" mode="out-in">
        <template v-if="displayFilters && data">
          <div class="filters p-x-18 p-y-30">
            <div class="flex justify-between">
              <BIMDataSelect
                :multi="true"
                width="200px"
                label="Type d'intervention"
                :options="typeOptions"
                v-model="filters.types"
              >
              </BIMDataSelect>
              <BIMDataSelect
                :multi="true"
                width="200px"
                label="Statut de la demande"
                :options="statutOptions"
                v-model="filters.statuses"
              >
              </BIMDataSelect>
            </div>
            <div class="flex justify-between m-y-24">
              <BIMDataSelect
                :multi="true"
                width="200px"
                label="Priorité"
                :options="priorityOptions"
                v-model="filters.priorities"
              >
              </BIMDataSelect>
              <BIMDataDatePicker
                v-model="filters.startDate"
                :value="filters.startDate"
                @to-date-change="filters.endDate = $event"
                :toDate="filters.endDate"
                :language="fr"
                :clearButton="true"
                fixedPosition="bottom"
                width="100%"
                :showEdgeDates="true"
                :isDateRange="true"
                :autoCloseRange="true"
                placeholder="Plage de dates"
              >
              </BIMDataDatePicker>
            </div>
            <div class="flex m-b-24">
              <div class="flex-1 flex items-center">
                <BIMDataInput
                  v-model="filters.startPrice"
                  placeholder="Coût minimum"
                />
                €
              </div>
              <div class="flex-1 flex items-center">
                <BIMDataInput
                  v-model="filters.endPrice"
                  placeholder="Coût maximal"
                />
                €
              </div>
            </div>
            <div class="flex justify-end">
              <BIMDataButton
                color="default"
                width="125px"
                fill
                radius
                @click="resetFilters"
              >
                <span>Réinitialiser</span>
              </BIMDataButton>
              <BIMDataButton
                color="primary"
                width="125px"
                fill
                radius
                @click="submitFilters"
              >
                <BIMDataIconSearch size="xxs" margin="0 6px 0 0" />
                <span>Rechercher</span>
              </BIMDataButton>
            </div>
          </div>
        </template>
      </transition>
    </div>
    <div v-if="filteredData.length === 0">
      Il n'y a pas de données à afficher
    </div>
    <BIMDataList v-else class="card-list" :items="filteredData" :itemHeight="200">
      <template #default="{ item: data }">
        <div class="card flex">
          <template v-if="PRIORITIES[data[PRIORITY]]">
            <div
              :style="{
                backgroundColor: PRIORITIES[data[PRIORITY]].color,
                width: '15px',
              }"
            ></div>
          </template>
          <template v-else>
            <div :style="{ backgroundColor: '#898989', width: '15px' }"></div>
          </template>
          <div class="card__left flex flex-col justify-between p-12">
            <div>Priorité: {{ data[PRIORITY] || OTHER }}</div>
            <div>
              {{ new Date(data[START_DATE]).toLocaleString() }}
            </div>
          </div>
          <div class="card__right">
            <div class="content">
              <div class="content__title">
                {{ data[DESC] }}
              </div>
              <div>
                <strong>Type:</strong> <span class="color-granite">{{ TYPES[data[TYPE]].text }}</span>
              </div>
              <div>
                <strong>Statut:</strong> <span class="color-high">{{ data[STATUS] }}</span>
              </div>
            </div>
            <div class="date flex justify-between">
              <div>
                <span class="color-granite"
                  >Début SEC:
                  {{
                    data[SEC_START]
                      ? new Date(data[SEC_START]).toLocaleString()
                      : "-"
                  }}</span
                >
              </div>
              <div>
                <span class="color-granite"
                  >Fin SEC:
                  {{
                    data[SEC_END]
                      ? new Date(data[SEC_END]).toLocaleString()
                      : "-"
                  }}</span
                >
              </div>
            </div>
            <div class="price flex justify-between">
              <div class="flex flex-col items-center justify-center">
                <span class="color-granite">Coût matériel</span>
                <strong>{{ data[COST_MAT] }}€</strong>
              </div>
              <div class="flex flex-col items-center justify-center">
                <span class="color-granite">Coût service</span>
                <strong>{{ data[COST_SERV] }}€</strong>
              </div>
              <div class="flex flex-col items-center justify-center">
                <span class="color-granite">Coût total</span>
                <strong class="color-neutral">{{ data[COST_TOTAL] }}€</strong>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BIMDataList>
  </div>
</template>

<script>
import { computed, ref, reactive, inject } from "vue";
import { FIELDS, PRIORITIES, TYPES } from "../../data/syctom-maintenance-config.js";

const {
  COST_MAT,
  COST_SERV,
  COST_TOTAL,
  DESC,
  IFC_OBJECTS,
  PRIORITY,
  SEC_END,
  SEC_START,
  START_DATE,
  STATUS,
  TYPE
} = FIELDS;

const OTHER = "AUTRE";

function getSelectOptions(list) {
  return Array.from(new Set(list)).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

export default {
  props: {
    data: {
      type: Array,
    },
  },
  setup(props) {
    const displayFilters = ref(false);

    const $viewer = inject("$viewer");

    const priorityOptions = computed(() =>
      getSelectOptions(
        props.data.map(d => d[PRIORITY] || OTHER)
      )
    );
    const typeOptions = computed(() =>
      {
        const groupedTypes = Object.values(TYPES).map(type => type.text);
        return [...new Set(groupedTypes)];
      }
    );
    const statutOptions = computed(() =>
      getSelectOptions(props.data.map(d => d[STATUS]))
    );

    let maxValue = 0;
    props.data.forEach(data => {
      const priceData = data[COST_MAT].replace(",", ".");
      const valuesFromObject = parseFloat(priceData);
      maxValue = Math.max(maxValue, valuesFromObject);
    });

    const createFiltersObject = () => {
      return reactive({
        types: [],
        statuses: [],
        priorities: [],
        startDate: null,
        endDate: null,
        startPrice: 0,
        endPrice: maxValue,
        objects: new Set(),
      });
    };

    const filters = createFiltersObject();
    const filtersUI = createFiltersObject();

    $viewer.state.hub.on("objects-selected", (objects) => {
      filters.objects = new Set()
    })

    const submitFilters = () => {
      filtersUI.endDate?.setHours(23, 59, 59);

      filters.types = Array.from(filtersUI.types);
      filters.statuses = Array.from(filtersUI.statuses);
      filters.priorities = Array.from(filtersUI.priorities);
      filters.startDate = filtersUI.startDate;
      filters.endDate = filtersUI.endDate;
      filters.startPrice = filtersUI.startPrice;
      filters.endPrice = filtersUI.endPrice;

      displayFilters.value = false;
    };

    const resetFilters = () => {
      filtersUI.types = [];
      filtersUI.statuses = [];
      filtersUI.priorities = [];
      filtersUI.startDate = null;
      filtersUI.endDate = null;
      filtersUI.startPrice = 0;
      filtersUI.endPrice = maxValue;
    };

    const searchText = ref("");
    const filteredData = computed(() => {
      let data = props.data;
      if (searchText.value !== "") {
        data = data.filter(newData =>
          newData[DESC]
            .toLowerCase()
            .includes(searchText.value.toLowerCase())
        );
      }

      if (filters.types.length > 0) {
        const selectedTypeIds = filters.types.map(
          selectedText =>
            Object.values(TYPES).find(type => type.text === selectedText)?.id
        );
        data = data.filter(newData =>
          selectedTypeIds.includes(newData[TYPE])
        );
      }

      if (filters.statuses.length > 0) {
        data = data.filter(newData =>
          Object.values(filters.statuses).includes(newData[STATUS])
        );
      }

      if (filters.priorities.length > 0) {
        const selectedPriorityTexts = filters.priorities;

        data = data.filter(newData => {
          const priority = newData[PRIORITY];
          if (
            selectedPriorityTexts.includes(OTHER) &&
            (!priority || priority === OTHER)
          ) {
            return true;
          }
          return selectedPriorityTexts.includes(priority);
        });
      }

      if (filters.startDate && filters.endDate) {
        data = data.filter(
          newData =>
            newData[START_DATE] >= filters.startDate.toISOString() &&
            newData[START_DATE] <= filters.endDate.toISOString()
        );
      }

      if (filters.startPrice > 0) {
        console.log("startPrice", filters.startPrice);
        data = data.filter(
          newData =>
            parseFloat(newData[COST_TOTAL]) >= filters.startPrice &&
            parseFloat(newData[COST_TOTAL]) <= filters.endPrice
        );
      }

      if (filters.endPrice !== maxValue) {
        console.log("endPrice", filters.endPrice);
        data = data.filter(
          newData =>
            parseFloat(newData[COST_TOTAL]) >= filters.startPrice &&
            parseFloat(newData[COST_TOTAL]) <= filters.endPrice
        );
      }

      if (filters.objects.size > 0) {
        console.log("objects", filters.objects);
        data = data.filter(
          newData => {
            const objects = newData[IFC_OBJECTS];
            if (!objects) {
              return false;
            }
            const objectsSet = new Set(objects);
            return objectsSet.isSubsetOf(filters.objects);
          }
        );
      }
      return data;
    });

    return {
      // Constants
      COST_MAT,
      COST_SERV,
      COST_TOTAL,
      DESC,
      IFC_OBJECTS,
      OTHER,
      PRIORITIES,
      PRIORITY,
      SEC_END,
      SEC_START,
      START_DATE,
      STATUS,
      TYPE,
      TYPES,
      // Refs
      displayFilters,
      priorityOptions,
      statutOptions,
      typeOptions,
      searchText,
      filteredData,
      filters: filtersUI,
      // Methods
      submitFilters,
      resetFilters,
    };
  },
};
</script>

<style scoped lang="scss">
.maintenance-tab {
  padding-top: calc(var(--spacing-unit) * 2);

  &__header {
    position: relative;
    gap: var(--spacing-unit);

    .search {
      flex: 4;
    }

    .filter-btn {
      flex: 1;
      justify-content: space-between;
    }

    .filters {
      position: absolute;
      width: 100%;
      background-color: white;
      top: 38px;
      z-index: 1;
      box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
      > .flex {
        gap: 18px;
        .bimdata-select,
        .bimdata-datepicker,
        .bimdata-input,
        .flex-1 {
          flex: 1;
        }
        .bimdata-select {
          :deep(.bimdata-select__option-list) {
            z-index: 3;
          }
        }
      }
    }
  }

  .card-list {
    height: calc(100% - var(--spacing-unit) * 2 - 27px);
  }

  .card {
    border-radius: 3px;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    &__left {
      width: 160px;
    }

    &__right {
      width: 100%;
      flex: 4;
      border-left: 1px solid var(--color-silver);

      .content,
      .date,
      .price {
        padding: 0 20px;
      }

      .date,
      .price {
        > div {
          flex: 1;
        }
      }

      .content {
        min-height: 94px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        &__title {
          min-height: 30px;
        }
      }

      .date {
        min-height: 33px;
      }

      .price {
        min-height: 66px;
        border-top: 1px solid var(--color-silver);
        > div {
          border-right: 1px solid var(--color-silver);
          &:last-child {
            border-right: none;
          }
        }
      }
    }
  }
}
</style>

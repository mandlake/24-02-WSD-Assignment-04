<script setup lang="ts">

import {ref} from "vue";

const emit = defineEmits(
    [
        'change-options'
    ]
);

const dropdowns = {
  originalLanguage: ['장르 (전체)', 'Action', 'Adventure', 'Comedy', 'Crime', 'Family'],
  translationLanguage: ['평점 (전체)', '9~10', '8~9', '7~8', '6~7', '5~6', '4~5', '4점 이하'],
  sorting: ['언어 (전체)', '영어', '한국어']
};

const DEFAULTOption = {
  originalLanguage: '장르 (전체)',
  translationLanguage: '평점 (전체)',
  sorting: '언어 (전체)'
};

const selectedOptions = ref(DEFAULTOption);


const activeDropdown = ref(null as string | null);

const toggleDropdown = (key: string) => {
  activeDropdown.value = activeDropdown.value === key ? null : key;
};

const selectOption = (key: string, option: string) => {
  selectedOptions.value[key as keyof typeof selectedOptions.value] = option;
  activeDropdown.value = null;
  emit('change-options', selectedOptions.value);
};

const clearOptions = () => {
  for (const key in selectedOptions.value) {
    selectedOptions.value[key as keyof typeof selectedOptions.value] = dropdowns[key as keyof typeof dropdowns][0];
  }
  emit('change-options', selectedOptions.value);
};
</script>

<template>
  <div class="dropdown-container">
    <label>선호하는 설정을 선택하세요</label>
    <div v-for="(options, key) in dropdowns" :key="key" class="custom-select">
      <div class="select-selected" @click="toggleDropdown(key)">
        {{ selectedOptions[key] }}
      </div>
      <div
          v-show="activeDropdown === key"
          class="select-items"
      >
        <div v-for="option in options" :key="option[0]" @click="selectOption(key, option)">
          {{ option }}
        </div>
      </div>
    </div>
    <button class="clear-options" @click="clearOptions">초기화</button>
  </div>
</template>

<style scoped>
.dropdown-container {
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 15px;
}
.custom-select {
  min-width: 120px;
  position: relative;
  display: inline-block;
}
.select-selected {
  background-color: black;
  color: white;
  padding: 10px;
  border: 1px solid #fff;
  font-size: 16px;
  cursor: pointer;
}
.select-items {
  display: block;
  position: absolute;
  background-color: #333;
  border: 1px solid #fff;
  z-index: 99;
  top: 100%;
  left: 0;
  right: 0;
}
.select-items div {
  color: white;
  padding: 10px;
  cursor: pointer;
}
.select-items div:hover {
  background-color: #575757;
}
.select-arrow-active:after {
  content: "\25B2";
  position: absolute;
  right: 10px;
  top: 14px;
}
.select-selected:after {
  content: "\25BC";
  position: absolute;
  right: 10px;
  top: 14px;
}
.select-selected.select-arrow-active:after {
  content: "\25B2";
}

.clear-options {
  min-width: 120px;
  background-color: black;
  color: white;
  padding: 10px;
  border: 1px solid #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 0 !important;
}
.clear-options:hover {
  background-color: #333;
}
</style>

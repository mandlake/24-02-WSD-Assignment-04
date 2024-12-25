<script setup lang="ts">
import MovieSearch from "@/components/search/MovieSearch.vue";
import MovieInfiniteScroll from "@/components/popular/MovieInfiniteScroll.vue";
import {ref} from "vue";
const apiKey = localStorage.getItem('TMDb-Key') || '';

const genreId = ref('28');
const ageId = ref(-1);
const sortId = ref('all');


const genreCode = {
  '장르 (전체)': 0,
  'Action': 28,
  'Adventure': 12,
  'Comedy': 35,
  'Crime': 80,
  'Family': 10751
};

const sortingCode = {
  '언어 (전체)': 'all',
  '영어': 'en',
  '한국어': 'ko'
};

const ageCode = {
  '평점 (전체)': -1,
  '9~10': 9,
  '8~9': 8,
  '7~8': 7,
  '6~7': 6,
  '5~6': 5,
  '4~5': 4,
  '4점 이하': -2
};

const changeOptions = (options: { originalLanguage: string, translationLanguage: string, sorting: string }) => {
  genreId.value = `${genreCode[options['originalLanguage'] as keyof typeof genreCode]}`;
  ageId.value = ageCode[options['translationLanguage'] as keyof typeof ageCode];
  sortId.value = sortingCode[options['sorting'] as keyof typeof sortingCode];
};

</script>

<template>
  <div class="container-search">
    <div class="container-search-bar">
      <MovieSearch
          @change-options="changeOptions"
      />
    </div>
    <div class="content-search">
      <MovieInfiniteScroll
          :api-key="apiKey"
          :genre-code="genreId"
          :sorting-order="sortId"
          :vote-everage="ageId"
      />
    </div>
  </div>
</template>

<style scoped>
.container-search {
  margin-top: 50px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.container-search-bar {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: right;
  margin-top: 10px;
}

.content-search {
  width: 100%;
}
</style>

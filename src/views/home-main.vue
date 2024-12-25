
<script>
import BannerComponent from "@/components/main/BannerComponent.vue";
import MovieRow from "@/components/main/MovieRow.vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  fetchFeaturedMovie,
  getURL4GenreMovies,
  getURL4PopularMovies,
  getURL4ReleaseMovies
} from "@/script/movie/URL.ts";

library.add(faSearch, faUser);

export default {
  name: 'Home',
  components: {
    BannerComponent,
    MovieRow,
    FontAwesomeIcon
  },
  data() {
    return {
      apiKey: localStorage.getItem('TMDb-Key') || '',
      featuredMovie: null,
      popularMoviesUrl: '',
      newReleasesUrl: '',
      actionMoviesUrl: '',
    };
  },
  created() {
    this.popularMoviesUrl = getURL4PopularMovies(this.apiKey);
    this.newReleasesUrl = getURL4ReleaseMovies(this.apiKey);
    this.actionMoviesUrl = getURL4GenreMovies(this.apiKey, '28');
    fetchFeaturedMovie(this.apiKey).then((movie) => {
      this.featuredMovie = movie;
    });
  },
  methods: {
    handleScroll() {
      const header = document.querySelector('.app-header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    setInterval(() => {
    }, 1000);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
};
</script>

<template>
    <BannerComponent :movie="featuredMovie" />

    <movie-row title="인기 영화" :fetchUrl="popularMoviesUrl" />
    <movie-row title="최신 영화" :fetchUrl="newReleasesUrl" />
    <movie-row title="액션 영화" :fetchUrl="actionMoviesUrl" />
</template>

<style scoped>
html, body {
  overflow-y: scroll !important;
}

body {
  background-color: #141414 !important;
}
</style>

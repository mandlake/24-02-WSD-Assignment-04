<template>
  <div class="movie-grid" ref="gridContainer">
    <div :class="['grid-container', currentView]">
      <div v-for="(movieGroup, index) in visibleMovieGroups" :key="index"
           :class="['movie-row', { 'full': movieGroup.length === rowSize }]">
        <div v-for="movie in movieGroup" :key="movie.id" class="movie-card"
             @mouseup="toggleWishlist(movie)"
        >
          <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
          <div class="movie-title">{{ movie.title }}</div>
          <div v-if="isInWishlist(movie.id)" class="wishlist-indicator">👍</div>
        </div>
      </div>
    </div>
    <div ref="loadingTrigger" class="loading-trigger">
      <div v-if="isLoading" class="loading-indicator">Loading...</div>
    </div>
    <button v-show="showTopButton" @click="scrollToTopAndReset" class="top-button">Top</button>
  </div>
</template>

<script lang="ts">
import {ref, computed, onMounted, onUnmounted, defineComponent, watch} from 'vue';
import axios from 'axios';
import {useWishlist} from "@/script/movie/wishlist.ts";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  original_language: string;
  vote_average: number;
  // Add other relevant movie properties
}

export default defineComponent({
  name: 'MovieGrid',
  props: {
    genreCode : {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true
    },
    sortingOrder: {
      type: String,
      required: true,
      default: 'all'
    },
    voteEverage: {
      type: Number,
      required: true,
      default: 100

    }
  },
  setup(props) {
    const movies = ref<Movie[]>([]);
    const currentPage = ref(1);
    const gridContainer = ref<HTMLElement | null>(null);
    const loadingTrigger = ref<HTMLElement | null>(null);
    const rowSize = ref(4);
    const isLoading = ref(false);
    const isMobile = ref(window.innerWidth <= 768);
    const currentView = ref('grid');
    const hasMore = ref(true);
    const showTopButton = ref(false);
    let wishlistTimer: number | null = null;

    watch(() => props.genreCode, () => {
      resetMovies();
    });

    watch(() => props.sortingOrder, () => {
      resetMovies();
    });

    watch(() => props.voteEverage, () => {
      resetMovies();
    });

    // Use the wishlist composable
    const {  loadWishlist, toggleWishlist, isInWishlist } = useWishlist();

    const fetchMovies = async (): Promise<void> => {
      if (isLoading.value || !hasMore.value) return;

      isLoading.value = true;
      let response = null;
      try {
        if (props.genreCode === "0") {
          response = await axios.get<{ results: Movie[] }>(
              `https://api.themoviedb.org/3/movie/popular`, {
                params: {
                  api_key: props.apiKey,
                  language: 'ko-KR',
                  page: currentPage.value,
                  per_page: 10
                }
              }
          );
        } else {
          response = await axios.get<{ results: Movie[] }>(
              `https://api.themoviedb.org/3/discover/movie`, {
                params: {
                  api_key: props.apiKey,
                  with_genres: props.genreCode,
                  language: 'ko-KR',
                  page: currentPage.value,
                  per_page: 10
                }
              }
          );
        }

        const newMovies = response.data.results;
        if (newMovies.length > 0) {
          let movieArray = [...movies.value, ...newMovies];

          if (props.sortingOrder !== 'all') {
            movieArray = movieArray.filter((movie) => movie.original_language === props.sortingOrder);
          }

          movieArray = movieArray.filter((movie) => {
            let result = false;

            if (props.voteEverage === -1) result = true;
            else if(props.voteEverage === -2) result = movie.vote_average <= 4;
            else result = movie.vote_average >= props.voteEverage && movie.vote_average < props.voteEverage + 1;

            return result;
          });

          movies.value = movieArray;

          currentPage.value++;
        } else {
          hasMore.value = false;
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const getImageUrl = (path: string | null): string => {
      return path ? `https://image.tmdb.org/t/p/w300${path}` : '/placeholder-image.jpg';
    };

    const calculateLayout = (): void => {
      if (gridContainer.value) {
        const containerWidth = gridContainer.value.offsetWidth;
        const movieCardWidth = isMobile.value ? 100 : 300;
        const horizontalGap = isMobile.value ? 10 : 15;

        rowSize.value = Math.floor(containerWidth / (movieCardWidth + horizontalGap));
      }
    };

    const visibleMovieGroups = computed(() => {
      return movies.value.reduce<Movie[][]>((resultArray, item, index) => {
        const groupIndex = Math.floor(index / rowSize.value);
        if (!resultArray[groupIndex]) {
          resultArray[groupIndex] = [];
        }
        resultArray[groupIndex].push(item);
        return resultArray;
      }, []);
    });

    const handleResize = (): void => {
      isMobile.value = window.innerWidth <= 768;
      calculateLayout();
    };

    const checkAndLoadMore = (): void => {
      if (!gridContainer.value) return;

      const lastRow = gridContainer.value.lastElementChild;
      if (!lastRow) return;

      const containerBottom = gridContainer.value.getBoundingClientRect().bottom;
      const lastRowBottom = lastRow.getBoundingClientRect().bottom;

      if (containerBottom >= lastRowBottom - 100 && !isLoading.value && hasMore.value) {
        fetchMovies();
      }
    };

    const handleScroll = (): void => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      showTopButton.value = scrollTop > 300;
      checkAndLoadMore();
    };

    const resetMovies = (): void => {
      movies.value = [];
      currentPage.value = 1;
      hasMore.value = true;
      fetchMovies();
    };

    const scrollToTopAndReset = (): void => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      resetMovies();
    };

    const startWishlistTimer = (movie: Movie): void => {
      clearWishlistTimer();
      wishlistTimer = window.setTimeout(() => {
        toggleWishlist(movie);
      }, 800);
    };

    const clearWishlistTimer = (): void => {
      if (wishlistTimer !== null) {
        clearTimeout(wishlistTimer);
        wishlistTimer = null;
      }
    };

    onMounted(() => {
      fetchMovies().then(() => {
        checkAndLoadMore();
      });
      calculateLayout();
      loadWishlist();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);

      const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && !isLoading.value && hasMore.value) {
              fetchMovies();
            }
          },
          { rootMargin: '100px', threshold: 0.1 }
      );

      if (loadingTrigger.value) {
        observer.observe(loadingTrigger.value);
      }

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
        if (loadingTrigger.value) {
          observer.unobserve(loadingTrigger.value);
        }
      });
    });

    return {
      visibleMovieGroups,
      getImageUrl,
      gridContainer,
      loadingTrigger,
      rowSize,
      isLoading,
      currentView,
      hasMore,
      showTopButton,
      scrollToTopAndReset,
      startWishlistTimer,
      clearWishlistTimer,
      toggleWishlist,
      isInWishlist
    };
  }
});
</script>


<style scoped>
html, body {
  overflow-y: scroll !important;
}

.movie-grid {
  width: 100%;
  margin-bottom: 40px;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}


.wishlist-indicator {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 30px;
  background-color: rgba(229, 9, 20, 0.5);
}


.movie-row {
  display: flex;
  justify-content: center;
  margin: 0 auto 20px;
  width: 100%;
}

.grid-container.list .movie-row {
  flex-direction: column;
}

.movie-card {
  width: 300px;
  margin: 0 10px;
  transition: transform 0.3s;
  position: relative;
  user-select: none; /* 텍스트 선택 방지 */
}

.grid-container.list .movie-card {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.movie-card:hover {
  transform: scale(1.05);
}

.movie-card img {
  width: 100%;
  border-radius: 4px;
  object-fit: cover;
}

.grid-container.list .movie-card img {
  width: 100px;
  margin-right: 20px;
}

.movie-title {
  margin-top: 5px;
  text-align: center;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-container.list .movie-title {
  text-align: left;
  white-space: normal;
}

.loading-trigger {
  height: 20px;
  margin-top: 20px;
}

.loading-indicator {
  text-align: center;
  font-size: 160px;
  color: white;
}

.top-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #E50914;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s, transform 0.3s;
  z-index: 1000;
  font-weight: bolder;
}

.top-button:hover {
  background-color: #9b0f16;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .movie-card {
    width: 120px;
    margin: 0 5px;
  }

  .movie-title {
    font-size: 12px;
  }

  .grid-container.list .movie-card img {
    width: 60px;
  }

  .top-button {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
}
</style>

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
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">&lt; 이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">다음 &gt;</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import {useWishlist} from "@/script/movie/wishlist.ts";

export default {
  name: 'MovieGrid',
  props: {
    fetchUrl: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const movies = ref([]);
    const currentPage = ref(1);
    const gridContainer = ref(null);
    const rowSize = ref(4);
    const moviesPerPage = ref(20);
    const isMobile = ref(window.innerWidth <= 768);
    const currentView = ref('grid');
    let wishlistTimer = null;

    // Use the wishlist composable
    const { wishlist, loadWishlist, toggleWishlist, isInWishlist } = useWishlist();

    const fetchMovies = async () => {
      try {
        const totalMoviesNeeded = 120; // 원하는 총 영화 수
        const numberOfPages = Math.ceil(totalMoviesNeeded / 20);

        let allMovies = [];

        for (let page = 1; page <= numberOfPages; page++) {
          const response = await axios.get(props.fetchUrl, {
            params: {
              page: page,
              per_page: moviesPerPage
            }
          });
          allMovies = [...allMovies, ...response.data.results];
        }

        // 원하는 수만큼 잘라내기
        movies.value = allMovies.slice(0, totalMoviesNeeded);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    const getImageUrl = (path) => {
      return `https://image.tmdb.org/t/p/w300${path}`;
    };

    const calculateLayout = () => {
      if (gridContainer.value) {
        const containerWidth = gridContainer.value.offsetWidth;
        const containerHeight = window.innerHeight - gridContainer.value.offsetTop;
        const movieCardWidth = isMobile.value ? 90 : 200;
        const movieCardHeight = isMobile.value ? 150 : 220;
        const horizontalGap = isMobile.value ? 10 : 15;
        const verticalGap = -10;

        rowSize.value = Math.floor(containerWidth / (movieCardWidth + horizontalGap));
        const maxRows = Math.floor(containerHeight / (movieCardHeight + verticalGap));
        moviesPerPage.value = rowSize.value * maxRows;
      }
    };

    const visibleMovieGroups = computed(() => {
      const startIndex = (currentPage.value - 1) * moviesPerPage.value;
      const endIndex = startIndex + moviesPerPage.value;
      const paginatedMovies = movies.value.slice(startIndex, endIndex);

      return paginatedMovies.reduce((resultArray, item, index) => {
        const groupIndex = Math.floor(index / rowSize.value);
        if (!resultArray[groupIndex]) {
          resultArray[groupIndex] = [];
        }
        resultArray[groupIndex].push(item);
        return resultArray;
      }, []);
    });

    const totalPages = computed(() => Math.ceil(movies.value.length / moviesPerPage.value));

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
      calculateLayout();
    };

    const startWishlistTimer = (movie) => {
      clearWishlistTimer();
      wishlistTimer = setTimeout(() => {
        toggleWishlist(movie);
      }, 2000);
    };

    const clearWishlistTimer = () => {
      if (wishlistTimer) {
        clearTimeout(wishlistTimer);
        wishlistTimer = null;
      }
    };

    onMounted(() => {
      fetchMovies();
      calculateLayout();
      loadWishlist();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    watch([rowSize, moviesPerPage], () => {
      currentPage.value = 1;
    });

    return {
      visibleMovieGroups,
      currentPage,
      totalPages,
      getImageUrl,
      nextPage,
      prevPage,
      gridContainer,
      rowSize,
      startWishlistTimer,
      clearWishlistTimer,
      toggleWishlist,
      isInWishlist
    };
  }
};
</script>

<style scoped>
.wishlist-indicator {
  position: absolute;
  top: 0;
  right: 10px;
  font-size: 20px;
  background-color: rgba(229, 9, 20, 0.5);
  box-shadow: 0 0 5px rgba(229, 9, 20, 0.7);
}

.movie-grid {
  width: 100%;
  height: calc(100vh - 200px);
  margin-bottom: 40px;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  width: 200px;
  margin: 0 10px;
  transition: transform 0.3s;
  position: relative;
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
  width: 80%;
  aspect-ratio: 1/1;
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


.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 0 10px;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .movie-grid {
    width: 100%;
    height: calc(90svh - 200px);
    margin-bottom: 40px;
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .movie-card {
    width: 90px;
    margin: 0 5px;
  }

  .movie-title {
    font-size: 12px;
  }

  .pagination button {
    padding: 8px 12px;
    font-size: 14px;
  }
  .grid-container.list .movie-card img {
    width: 60px;
  }
}
</style>

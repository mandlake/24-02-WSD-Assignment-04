<template>
  <div class="movie-row">
    <h2>{{ title }}</h2>
    <div class="slider-container"
         @wheel="handleWheel"
         @touchstart="handleTouchStart"
         @touchmove="handleTouchMove"
         @touchend="handleTouchEnd"
         @mousemove="handleMouseMove"
         @mouseleave="handleMouseLeave">
      <button class="slider-button left" @click="slide('left')" :style="{ opacity: showButtons && !atLeftEdge ? 1 : 0 }" :disabled="atLeftEdge">&lt;</button>
      <div class="slider-window" ref="sliderWindow">
        <div class="movie-slider" ref="slider" :style="{ transform: `translateX(${-scrollAmount}px)` }">
          <div v-for="movie in movies" :key="movie.id" class="movie-card" @click="toggleWishlist(movie)">
            <img :src="getImageUrl(movie.poster_path)" :alt="movie.title">
            <div v-if="isInWishlist(movie.id)" class="wishlist-indicator">👍</div>
          </div>
        </div>
      </div>
      <button class="slider-button right" @click="slide('right')" :style="{ opacity: showButtons && !atRightEdge ? 1 : 0 }" :disabled="atRightEdge">&gt;</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useWishlist } from '@/script/movie/wishlist'; // 경로는 실제 위치에 맞게 조정해주세요

export default {
  name: 'MovieRow',
  props: {
    title: {
      type: String,
      required: true
    },
    fetchUrl: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const movies = ref([]);
    const slider = ref(null);
    const sliderWindow = ref(null);
    const scrollAmount = ref(0);
    const showButtons = ref(false);
    const isScrolling = ref(false);
    const touchStartX = ref(0);
    const touchEndX = ref(0);

    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

    const calculateMaxScroll = () => {
      if (slider.value && sliderWindow.value) {
        return Math.max(0, slider.value.scrollWidth - sliderWindow.value.clientWidth);
      }
      return 0;
    };

    const maxScroll = ref(calculateMaxScroll());

    const atLeftEdge = computed(() => scrollAmount.value <= 0);
    const atRightEdge = computed(() => scrollAmount.value >= maxScroll.value);

    const fetchMovies = async () => {
      try {
        const response = await axios.get(props.fetchUrl);
        movies.value = response.data.results;
        console.log(movies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    const getImageUrl = (path) => {
      return `https://image.tmdb.org/t/p/w300${path}`;
    };

    const slide = (direction, amount = null) => {
      const slideAmount = amount || sliderWindow.value.clientWidth * 0.8;
      if (direction === 'left') {
        scrollAmount.value = Math.max(0, scrollAmount.value - slideAmount);
      } else {
        scrollAmount.value = Math.min(maxScroll.value, scrollAmount.value + slideAmount);
      }
    };

    const handleMouseMove = () => {
      showButtons.value = true;
    };

    const handleMouseLeave = () => {
      showButtons.value = false;
    };

    const handleWheel = (event) => {
      event.preventDefault();
      if (isScrolling.value) return;

      isScrolling.value = true;
      const direction = event.deltaY > 0 ? 'right' : 'left';
      slide(direction);

      setTimeout(() => {
        isScrolling.value = false;
      }, 500);
    };

    const handleTouchStart = (event) => {
      touchStartX.value = event.touches[0].clientX;
      touchEndX.value = event.touches[0].clientX;
    };

    const handleTouchMove = (event) => {
      touchEndX.value = event.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const touchDiff = touchStartX.value - touchEndX.value;
      const minSwipeDistance = 50; // 최소 스와이프 거리

      if (Math.abs(touchDiff) > minSwipeDistance) {
        const direction = touchDiff > 0 ? 'right' : 'left';
        slide(direction, Math.abs(touchDiff));
      }
    };

    const handleResize = () => {
      maxScroll.value = calculateMaxScroll();
      scrollAmount.value = Math.min(scrollAmount.value, maxScroll.value);
    };

    onMounted(() => {
      fetchMovies();
      window.addEventListener('resize', handleResize);
      handleResize();
    });

    watch(movies, () => {
      setTimeout(handleResize, 0);
    });

    return {
      movies,
      slider,
      sliderWindow,
      scrollAmount,
      maxScroll,
      atLeftEdge,
      atRightEdge,
      showButtons,
      getImageUrl,
      slide,
      handleMouseMove,
      handleMouseLeave,
      handleWheel,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      toggleWishlist,
      isInWishlist
    };
  }
};
</script>

<style scoped>

.wishlist-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  border-radius: 50%;
  font-size: 12px;
}

.movie-row {
  margin-bottom: 40px;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.movie-row h2 {
  text-align: left;
  margin-left: 30px;
}

.slider-container {
  position: relative;
  touch-action: pan-y; /* 수직 스크롤만 허용 */
}

.slider-window {
  overflow: hidden;
  margin: 0 40px;
}

.movie-slider {
  display: flex;
  transition: transform 0.3s ease;
  padding: 20px 0;
}

.movie-card {
  flex: 0 0 auto;
  width: 200px;
  margin-right: 10px;
  transition: transform 0.3s;
  position: relative;
  cursor: pointer;
}

.movie-card:hover {
  transform: scale(1.05);
}

.movie-card img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 20px 10px;
  cursor: pointer;
  z-index: 10;
  transition: opacity 0.3s, background-color 0.3s;
}

.slider-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.slider-button.left {
  left: 0;
}

.slider-button.right {
  right: 0;
}

.slider-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .movie-row {
    margin-bottom: 20px;
    position: relative;
    width: 100%;
    overflow: hidden;
  }


  .movie-card {
    flex: 0 0 auto;
    width: 120px;
    margin-right: 5px;
    transition: transform 0.3s;
  }


  .movie-slider {
    display: flex;
    transition: transform 0.3s ease;
    padding: 0px 0;
  }


  .slider-window {
    overflow: hidden;
    margin: 0 10px;
  }
}

</style>

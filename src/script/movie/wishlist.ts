// useWishlist.ts
import { ref, Ref } from 'vue';

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    // Add other relevant movie properties
}

export function useWishlist() {
    const wishlist: Ref<Movie[]> = ref([]);

    const loadWishlist = (): void => {
        const storedWishlist = localStorage.getItem('movieWishlist');
        if (storedWishlist) {
            wishlist.value = JSON.parse(storedWishlist);
        }
    };

    const saveWishlist = (): void => {
        localStorage.setItem('movieWishlist', JSON.stringify(wishlist.value));
    };

    const toggleWishlist = (movie: Movie): void => {
        const index = wishlist.value.findIndex(item => item.id === movie.id);
        if (index === -1) {
            wishlist.value.push(movie);
        } else {
            wishlist.value.splice(index, 1);
        }
        saveWishlist();
    };

    const isInWishlist = (movieId: number): boolean => {
        return wishlist.value.some(item => item.id === movieId);
    };

    return {
        wishlist,
        loadWishlist,
        toggleWishlist,
        isInWishlist
    };
}

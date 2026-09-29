import AsyncStorage from '@react-native-async-storage/async-storage';
import { createCartStore, trackPendingWrites } from './createCartStore';

const { storage, flush } = trackPendingWrites(AsyncStorage);

export const flushAsyncStorageWrites = flush;
export const useCartAsyncStorage = createCartStore('use-cart-async-storage', storage);

// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../reducers/userSlice'; // Assuming you named the reducer file `userSlice.js`

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
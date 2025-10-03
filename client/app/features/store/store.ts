"use client";
import { configureStore } from "@reduxjs/toolkit";
import { assignmentApi } from "../api/assignmentApi";

export const store = configureStore({
  reducer: {
    [assignmentApi.reducerPath]: assignmentApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(assignmentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

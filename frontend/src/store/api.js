import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import routes from '../utils/routes.js';

export const api = createApi({
  reducerPath: 'queryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: routes.apiPath,
    tagTypes: ['Channels', 'Message'],
    prepareHeaders: ((headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }),
  }),
  endpoints: (builder) => ({
    getAuthToken: builder.mutation({
      query: (user) => ({
        url: routes.loginPath,
        method: 'POST',
        body: user,
      }),
    }),
    addNewUser: builder.mutation({
      query: (newUser) => ({
        url: routes.signupPath,
        method: 'POST',
        body: newUser,
      }),
    }),
    getChannels: builder.query({
      query: () => ({
        url: routes.channelsPath,
      }),
      keepUnusedDataFor: 1,
      providesTags: ['Channels', 'Message'],
    }),
    addChannel: builder.mutation({
      query: (channel) => ({
        url: routes.channelsPath,
        method: 'POST',
        body: channel,
      }),
      invalidatesTags: ['Channels'],
    }),
    editChannel: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: routes.channelsPathWithID(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Channels'],
    }),
    removeChannel: builder.mutation({
      query: (id) => ({
        url: routes.channelsPathWithID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Channels'],
    }),
    getMessages: builder.query({
      query: () => ({
        url: routes.messagesPath,
      }),
      keepUnusedDataFor: 1,
      providesTags: ['Channels', 'Message'],
    }),
    addMessage: builder.mutation({
      query: (message) => ({
        url: routes.messagesPath,
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),
    removeMessage: builder.mutation({
      query: (id) => ({
        url: routes.messagesPathWithID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useGetAuthTokenMutation,
  useAddNewUserMutation,
  useGetChannelsQuery,
  useAddChannelMutation,
  useEditChannelMutation,
  useRemoveChannelMutation,
  useGetMessagesQuery,
  useAddMessageMutation,
  useRemoveMessageMutation,
} = api;

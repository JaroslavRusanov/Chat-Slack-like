import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import routes from '../utils/routes';
import type { Message, Channel, UserCredentials } from './types';

export const api = createApi({
  reducerPath: 'queryApi',

  baseQuery: fetchBaseQuery({
    baseUrl: "",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Cache-Control', 'no-cache')
      return headers
    },
  }),

  tagTypes: ['Channels', 'Message'],

  endpoints: (builder) => ({
    // auth
    getAuthToken: builder.mutation<{ token: string }, UserCredentials>({
      query: (user) => ({
        url: routes.loginPath,
        method: 'POST',
        body: user,
      }),
    }),

    addNewUser: builder.mutation<void, UserCredentials>({
      query: (newUser) => ({
        url: routes.signupPath,
        method: 'POST',
        body: newUser,
      }),
    }),

    // channels
    getChannels: builder.query<Channel[], void>({
      query: () => ({
        url: routes.channelsPath,
      }),
      keepUnusedDataFor: 1,
      providesTags: ['Channels'],
    }),

    addChannel: builder.mutation<Channel, Partial<Channel>>({
      query: (channel) => ({
        url: routes.channelsPath,
        method: 'POST',
        body: channel,
      }),
      invalidatesTags: ['Channels'],
    }),

    editChannel: builder.mutation<Channel, { id: number; name: string }>({
      query: ({ id, ...patch }) => ({
        url: routes.channelsPathWithID(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Channels'],
    }),

    removeChannel: builder.mutation<void, number>({
      query: (id) => ({
        url: routes.channelsPathWithID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Channels'],
    }),

    // messages
    getMessages: builder.query<Message[], void>({
      query: () => ({
        url: routes.messagesPath,
      }),
      keepUnusedDataFor: 1,
      providesTags: ['Message'],
    }),

    addMessage: builder.mutation<Message, Partial<Message>>({
      query: (message) => ({
        url: routes.messagesPath,
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),

    removeMessage: builder.mutation<void, number>({
      query: (id) => ({
        url: routes.messagesPathWithID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
  }),
})

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

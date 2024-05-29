---
sidebar_position: 2
description: Using TanStack Query and service composables
---

# Data Fetching

We use [TanStack Query](https://tanstack.com/query/latest/docs/framework/vue/overview) to manage data fetched from the API. It offers a lot of cool functionality, for not many extra lines of code, such as interval refetching, retrying failed requests, and more.

Our implementation is straight-forward: We create a service composable for each controller in the API, create a standard axios request function, then wrap that function in a TanStack Query query or mutation which we use in our components.

:::tip useHttp Composable
The useHttp composable is the standard axios wrapper for our app, make sure to use it when dealing with our API to handle the user token injection and setting the base URL.
:::

## Querying Example

Let's say we wanted to fetch a list of users, we will first need to create our service under the `composables/services` directory:

```ts
export const useUsersService = () => {
  // Initialize the useHttp composable
  const { sendRequest } = useHttp();
};
```

Then, we create the fetch function:

```ts
function getUsers() {
  return sendRequest('/users', {
    method: 'GET', // Optional for GET requests
  });
}
```

Now, we create the TanStack Query function:

```ts
function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // We want the data to stay cached for 5 minutes
  });
}

// Return the query so you are able to use it in your components
return {
  useUsersQuery,
};
```

And finally, we can use it like this in our components:

```ts
<script setup lang="ts">
const { useUsersQuery } = useUsersService();
const { data: users, isFetching } = useUsersQuery();
</script>

<template>
  <template v-if="!isFetching">
    <template v-for="user in users" :key="user.id">
      {{ user.firstName }}
    </template>
  </template>
  <template v-else>Loading..</template>
</template>
```

Any query you have in your component will fetch as soon as the component loads. To change this behavior, use the [enabled option](https://tanstack.com/query/latest/docs/framework/vue/guides/dependent-queries) in the useQuery function from TanStack.

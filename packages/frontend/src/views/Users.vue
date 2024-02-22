<template>
  <UsersTable />
</template>

<script lang="ts">
import UsersTable from '@/modules/users/UsersTable.vue';

export default {
  name: 'Users',
  components: {
    UsersTable,
  },
};
</script>

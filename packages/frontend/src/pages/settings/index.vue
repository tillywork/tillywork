<script setup lang="ts">
const router = useRouter();

definePage({
  meta: {
    requiresAuth: true,
    hideNavigationDrawer: true,
  },
});

onMounted(() => router.replace('/settings/theme'));
</script>

<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

</script>

<main>
    <p>Profile for user: {data.user?.username}</p>
</main>
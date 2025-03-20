<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<main>
    <p>Profile for user: {data.user?.username}</p>


	<form method="post" action="?/uploadCsv" class=" flex flex-col" use:enhance enctype="multipart/form-data">
		<label for="csv">Choose which account statement you want to upload.</label>
		<input class=" bg-neutral-800" type="file" id="csv" name="csv" accept=".csv">
		<button class=" cursor-pointer bg-neutral-800">Upload</button>
	</form>
</main>
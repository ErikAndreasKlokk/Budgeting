<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

</script>

<main>
    <p>Profile for user: {data.user?.username}</p>


	<form action="?/uploadCsv" class=" flex flex-col">
		<label for="csv">Choose which account statement you want to upload.</label>
		<input class=" bg-neutral-800" type="file" id="csv" name="csv" accept=".csv">

		<button>Upload</button>
	</form>
</main>
<script lang="ts">
	import { enhance } from '$app/forms';
	import { clickOutside } from 'svelte-outside';
	import type { PageServerData } from './$types';
	import type { ActionData } from './$types';

	let uploadModal = $state(false)

	let { data, form }: {data: PageServerData, form: ActionData} = $props();

</script>

<main>
	<div use:clickOutside={() => uploadModal = false} class=" w-full flex justify-end">
		<button onclick={() => uploadModal = true} class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 flex gap-2 items-center">
			Upload account statement
			<svg class="w-5 h-5 text-neutral-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
				<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
			</svg>
		</button>
		{#if uploadModal}
			<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center">
				<button onclick={() => uploadModal = false} aria-label="Closes the upload modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-20 top-0 left-0"></button>
				{#if form?.missing}
					<p>No file or incorrect file type.</p>
				{/if}
				{#if form?.incorrect}
					<p>You are not logged in, log in to upload file.</p>
				{/if}
				<form method="post" action="?/uploadCsv" class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4" use:enhance enctype="multipart/form-data">
					<div class="flex items-center justify-center w-full">
						<label for="csv" class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neutral-700 bg-neutral-600 border-neutral-500 hover:border-neutral-400">
							<div class="flex flex-col items-center justify-center pt-5 pb-6">
								<svg class="w-8 h-8 mb-4 text-neutral-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
								</svg>
								<p class="mb-2 text-sm text-neutral-200"><span class="font-semibold">Click to upload</span> or drag and drop</p>
								<p class="text-xs text-neutral-200">CSV files only</p>
							</div>
							<input id="csv" type="file"  name="csv" class="hidden" required={true} />
						</label>
					</div> 
					<button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Upload file</button>
					<button onclick={() => uploadModal = false} type="submit" class=" text-neutral-200 bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
				</form>
			</div>
		{/if}
	</div>

	<div class=" flex flex-col mt-20 pb-20 gap-20 items-center">
		<div class=" flex justify-evenly w-full">
			<div class=" w-5/12  rounded-4xl h-[600px] bg-neutral-800">
				
			</div>
	
			<div class=" w-5/12  rounded-4xl h-[600px] bg-neutral-800">
				
			</div>
		</div>

		<div class=" w-11/12 rounded-4xl bg-neutral-800 overflow-x-auto relative border border-neutral-700	">
			<table class="w-full text-sm text-left text-neutral-400 rounded-4xl">
				<thead class="text-xs uppercase bg-neutral-700 text-neutral-200 text-nowrap">
					<tr>
						<th scope="col" class="px-6 py-5">
							Date
						</th>
						<th scope="col" class="px-6 py-5">
							Money in (+)
						</th>
						<th scope="col" class="px-6 py-5">
							Money out (-)
						</th>
						<th scope="col" class="px-6 py-5">
							Type
						</th>
						<th scope="col" class="px-6 py-5">
							Text
						</th>
						<th scope="col" class="px-6 py-5">
							Main category
						</th>
						<th scope="col" class="px-6 py-5">
							Sub category
						</th>
					</tr>
				</thead>
				<tbody>
					{#if data.accountStatements}
						{#each data.accountStatements as statement}
							<tr class=" border-b bg-neutral-800 border-neutral-700 ">
								<td class="px-6 py-4 text-nowrap">
									{statement.dato.toDateString()}
								</td>
								<td class="px-6 py-4">
									{statement.innPaaKonto}
								</td>
								<td class="px-6 py-4">
									{statement.utFraKonto}
								</td>
								<td class="px-6 py-4">
									{statement.type}
								</td>
								<td class="px-6 py-4">
									{statement.tekst}
								</td>
								<td class="px-6 py-4">
									{statement.hovedkategori}
								</td>
								<td class="px-6 py-4">
									{statement.underkategori}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</main>
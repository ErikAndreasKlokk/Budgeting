<script lang="ts">
	import { enhance, applyAction  } from '$app/forms';
	import { clickOutside } from 'svelte-outside';
	import type { PageServerData } from './$types';
	import type { ActionData } from './$types';
	import { Chart, Pie, Svg, Tooltip } from 'layerchart';
	import type { accountStatementFormat } from './proxy+page.server';



	let uploadModal = $state(false)
	let editStatementModal = $state(false)
	let addCategoryModal = $state(false)
	let addCategoryValue = $state("")
	let isMainCategory = $state(false)

	let selectedStatement: accountStatementFormat | null = $state(null)

	let { data, form }: {data: PageServerData, form: ActionData} = $props();

	const kategoridata = $derived(data.statistics?.kategoriData)

	const keyColors = [
		'#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
	]

</script>

<main>
	<div use:clickOutside={() => uploadModal = false} class=" w-full flex justify-end">
		<button onclick={() => uploadModal = true} class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 flex gap-2 items-center hover:bg-blue-800">
			Upload account statement
			<svg class="w-5 h-5 text-neutral-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
				<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
			</svg>
		</button>
		{#if uploadModal}
			<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center">
				<button onclick={() => uploadModal = false} aria-label="Closes the upload modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
				{#if form?.missing}
					<p>No file or incorrect file type.</p>
				{/if}
				{#if form?.incorrect}
					<p>You are not logged in, log in to upload file.</p>
				{/if}
				<form method="post" action="?/uploadCsv" class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4" enctype="multipart/form-data" 
				use:enhance={({}) => {
					return async ({ result }) => {

						if (result.type === "success") {
							uploadModal = false
							location.reload()
						}

						await applyAction(result);
					}
				}}>
					<div class="flex items-center justify-center w-full">
						<label for="csv" class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neutral-700 bg-neutral-600 border-neutral-500 hover:border-neutral-400">
							<div class="flex flex-col items-center justify-center pt-5 pb-6">
								<svg class="w-8 h-8 mb-4 text-neutral-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
								</svg>
								<p class="mb-2 text-sm text-neutral-200"><span class="font-semibold">Click to upload</span> or drag and drop</p>
								<p class="text-xs text-neutral-200">CSV files only</p>
							</div>
							<input id="csv" type="file"  name="csv" class="hidden" accept=".csv" required={true} />
						</label>
					</div> 
					<button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Upload file</button>
					<button onclick={() => uploadModal = false} type="button" class=" text-neutral-200 bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
				</form>
			</div>
		{/if}
	</div>

	<div class=" flex flex-col mt-20 pb-20 gap-20 items-center z-0">
		<div class=" flex justify-evenly w-full">
			<div class=" w-5/12  rounded-4xl h-[700px] bg-neutral-800 flex flex-col p-10">
				<div class=" mb-9">
					<p class=" text-4xl font-bold text-neutral-200">Money spent</p>
					<p class=" italic text-neutral-400">The last 30 days</p>
				</div>
				{#await data.statistics}
					<p>Awaiting data...</p>
				{:then statistics} 
					<div class="h-[300px] p-4 overflow-auto relative w-full mb-9">
						<Chart data={statistics?.kategoriData} x="moneyOut" c="hovedkategori" cRange={keyColors} let:tooltip>
							<Svg center>
								<Pie innerRadius={100} {tooltip} padAngle={0.03}/>
							</Svg>
							<Tooltip.Root let:data>
								<Tooltip.Header>{data.hovedkategori}</Tooltip.Header>
								<Tooltip.List>
								  <Tooltip.Item
									label="value"
									value={data.moneyOut}
									format="integer"
									valueAlign="right"
								  />
								</Tooltip.List>
							  </Tooltip.Root>
						</Chart>
						<p class=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl ">{statistics?.moneyOut.toFixed(0)} kr</p>
					</div>
					<div class=" h-[200px] bg-neutral-700 rounded-3xl p-5 flex flex-col items-center">
						<p class="text-2xl w-full font-bold">Top 3 categories</p>
						<div class=" flex mt-6 w-4/5 justify-between">
							<ul>
								<li>- {statistics?.kategoriData.sort((a, b) => b.moneyOut - a.moneyOut)[0].hovedkategori}</li>
								<li>- {statistics?.kategoriData.sort((a, b) => b.moneyOut - a.moneyOut)[1].hovedkategori}</li>
								<li>- {statistics?.kategoriData.sort((a, b) => b.moneyOut - a.moneyOut)[2].hovedkategori}</li>
							</ul>
							<ul class=" text-end font-bold italic">
								<li>{statistics?.kategoriData.sort((a, b) => b.moneyOut - a.moneyOut)[0].moneyOut.toFixed(0)} kr</li>
								<li>{statistics?.kategoriData.sort((a, b) => b.moneyOut - a.moneyOut)[1].moneyOut.toFixed(0)} kr</li>
								<li>{statistics?.kategoriData.sort((a, b) => b.moneyOut - a.moneyOut)[2].moneyOut.toFixed(0)} kr</li>
							</ul>
						</div>
					</div>
				{/await}
				  
			</div>
	
			<div class=" w-5/12  rounded-4xl h-[700px] bg-neutral-800 flex flex-col p-10">
				<div class=" mb-9">
					<p class=" text-4xl font-bold text-neutral-200">Money earned</p>
					<p class=" italic text-neutral-400">The last 30 days</p>
				</div>
				{#await data.statistics}
					<p>Awaiting data...</p>
				{:then statistics} 
					<div class="h-[300px] p-4 overflow-auto relative w-full mb-9">
						<Chart data={statistics?.kategoriData} x="moneyIn" c="hovedkategori" cRange={keyColors} let:tooltip>
							<Svg center>
								<Pie innerRadius={100} {tooltip} padAngle={0.03}/>
							</Svg>
							<Tooltip.Root let:data>
								<Tooltip.Header>{data.hovedkategori}</Tooltip.Header>
								<Tooltip.List>
								  <Tooltip.Item
									label="value"
									value={data.moneyIn}
									format="integer"
									valueAlign="right"
								  />
								</Tooltip.List>
							  </Tooltip.Root>
						</Chart>
						<p class=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl ">{statistics?.moneyIn.toFixed(0)} kr</p>
					</div>
					<div class=" h-[200px] bg-neutral-700 rounded-3xl p-5 flex flex-col items-center">
						<p class="text-2xl w-full font-bold">Top 3 categories</p>
						<div class=" flex mt-6 w-4/5 justify-between">
							<ul>
								<li>- {statistics?.kategoriData.sort((a, b) => b.moneyIn - a.moneyIn)[0].hovedkategori}</li>
								<li>- {statistics?.kategoriData.sort((a, b) => b.moneyIn - a.moneyIn)[1].hovedkategori}</li>
								<li>- {statistics?.kategoriData.sort((a, b) => b.moneyIn - a.moneyIn)[2].hovedkategori}</li>
							</ul>
							<ul class=" text-end font-bold italic">
								<li>{statistics?.kategoriData.sort((a, b) => b.moneyIn - a.moneyIn)[0].moneyIn.toFixed(0)} kr</li>
								<li>{statistics?.kategoriData.sort((a, b) => b.moneyIn - a.moneyIn)[1].moneyIn.toFixed(0)} kr</li>
								<li>{statistics?.kategoriData.sort((a, b) => b.moneyIn - a.moneyIn)[2].moneyIn.toFixed(0)} kr</li>
							</ul>
						</div>
					</div>
				{/await}
				  
			</div>
		</div>

		{#await data.accountStatements}
			<div class=" w-11/12 rounded-xl bg-neutral-800 border border-neutral-700 h-60"></div>
		{:then accountStatements} 
			{#if accountStatements?.length !== 0 && accountStatements !== undefined}
				{#if addCategoryModal}
					<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center z-50">
						<button onclick={() => addCategoryModal = false} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
						{#await data.statistics}
							<p>Awaiting data...</p>
						{:then statistics}
						<form class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4">
							<div class="flex items-center justify-center w-full flex-col">

								<div class="relative z-0 w-full mb-5 group mt-2">
									<label for="text" class="block mb-2 text-sm font-medium text-white">Add {isMainCategory ? "main" : "sub"} category</label>
									<input type="text" bind:value={addCategoryValue} id="text" name="text" class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
								</div>
							</div> 
							<button type="button" onclick={() => {
								if (isMainCategory && data.statistics) {
									const statistics = data.statistics
									statistics.hovedkategorier.push(addCategoryValue)
									data = { ...data, statistics}
								} else {
									if (data.statistics) {
										const statistics = data.statistics
										statistics.underkategorier.push(addCategoryValue)
										data = { ...data, statistics}
									}
								}

								addCategoryModal = false
							}} 
							class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Add category</button>
							<button onclick={() => addCategoryModal = false} type="button" class=" text-neutral-200 bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
						</form>
						{/await}
					</div>
				{/if}
				{#if editStatementModal}
					<div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center">
						<button onclick={() => editStatementModal = false} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
						<form method="post" action="?/editStatement" class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4"
						use:enhance={({}) => {
							return async ({ result, update }) => {

								console.log(kategoridata)

								await applyAction(result);
								
								if (result.type === "success") {
									editStatementModal = false
									update();
								}
							}
						}}>
							<div class="flex items-center justify-center w-full flex-col">
								<div class="relative z-0 w-full mb-5 group mt-2">
									<label for="text" class="block mb-2 text-sm font-medium text-white">Text</label>
									<input type="text" id="text" name="text" value={selectedStatement?.tekst} class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
								</div>
								{#await data.statistics}
									<p>Awaiting data...</p>
								{:then statistics}
									<p class=" w-full text-start mb-2 text-sm font-medium ">Main category</p>
									<div class="flex w-full mb-5">
										<button onclick={() => {
											isMainCategory = true
											addCategoryModal = true
										}} class="cursor-pointer shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center border  rounded-s-lg  focus:ring-4 focus:outline-none  bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-700 text-white border-neutral-600" type="button">
											+
										</button>
										<label for="hovedkategori" class="sr-only">Choose a main category</label>
										<select id="hovedkategori" name="hovedkategori" class=" cursor-pointer text-sm rounded-e-lg border-s-neutral-700 border-s-2 block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
											{#if data.statistics}
												{#each data.statistics.hovedkategorier as hovedkategori}
													<option selected={selectedStatement?.hovedkategori === hovedkategori} value={hovedkategori}>{hovedkategori}</option>	
												{/each}
											{/if}
										</select>
									</div>
									<p class=" w-full text-start mb-2 text-sm font-medium ">Sub category</p>
									<div class="flex w-full mb-5">
										<button onclick={() => {
											isMainCategory = false
											addCategoryModal = true
										}} class="cursor-pointer shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center border  rounded-s-lg  focus:ring-4 focus:outline-none  bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-700 text-white border-neutral-600" type="button">
											+
										</button>
										<label for="underkategori" class="sr-only">Choose a sub category</label>
										<select id="underkategori" name="underkategori" class=" cursor-pointer text-sm rounded-e-lg border-s-neutral-700 border-s-2 block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
											{#if data.statistics}
												{#each data.statistics.underkategorier as underkategori}
													<option selected={selectedStatement?.underkategori === underkategori} value={underkategori}>{underkategori}</option>	
												{/each}
											{/if}
										</select>
									</div>
								{/await}
								<input class=" hidden" type="text" name="id" id="id" value={selectedStatement?.statementId}>
							</div> 
							<button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Confirm changes</button>
							<button onclick={() => editStatementModal = false} type="button" class=" text-neutral-200 bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
						</form>
					</div>
				{/if}
				<div class=" w-11/12 rounded-xl bg-neutral-800 overflow-x-auto border border-neutral-700">
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
									Text
								</th>
								<th scope="col" class="px-6 py-5">
									Main category
								</th>
								<th scope="col" class="px-6 py-5">
									Sub category
								</th>
								<th scope="col" class="px-6 py-5"></th>
								<th scope="col" class="px-6 py-5"></th>
							</tr>
						</thead>
						<tbody>
							{#each accountStatements as statement}
								<tr class=" border-b bg-neutral-800 border-neutral-700 text-xs">
									<td class="px-6 py-4 text-nowrap">
										{new Date(statement.dato).toDateString()}
									</td>
									<td class="px-6 py-4">
										{statement.innPaaKonto}
									</td>
									<td class="px-6 py-4">
										{statement.utFraKonto}
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
									<td class="px-6 py-4">
										<button onclick={() => [editStatementModal = true, selectedStatement = statement]} class=" flex text-nowrap font-bold cursor-pointer">. . .</button>
									</td>
									<td class="px-6 py-4">
										<button 
											onclick={async (e) => {
												await fetch("/api/accountStatements/deleteStatement", {
													method: "DELETE",
													headers: {
														'Content-Type': 'application/json'
													},
													body: JSON.stringify(statement.statementId)
												});

												if (data.accountStatements) {
													const accountStatements = data.accountStatements.filter((dataStatement) => dataStatement.statementId !== statement.statementId);
													data = { ...data, accountStatements}
												}

											}} 
											class=" flex text-nowrap font-bold cursor-pointer">x</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/await}
	</div>
</main>
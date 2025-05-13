<script lang="ts">
	import { type accountStatementFormat, type SortKey } from "../../routes/dashboard/proxy+page.server";
    import { enhance, applyAction  } from '$app/forms';
	import Edit from "./icons/edit.svelte";
	import Delete from "./icons/delete.svelte";
	import Search from "./icons/search.svelte";
	import { goto, invalidateAll } from "$app/navigation";
	import { clickOutside } from "svelte-outside";
	import ArrowDown from "./icons/arrowDown.svelte";
	import ArrowUp from "./icons/arrowUp.svelte";
	import { onMount } from "svelte";
	import Calendar from "./icons/calendar.svelte";

    const { accountStatements, statistics }: { accountStatements: accountStatementFormat[], statistics: any} = $props()

    let editStatementModal = $state(false)
	let confirmDeleteStatementModal = $state(false)

    let mainCategoryValue: string | null = $state(null)
    let mainCategoryFocused = $state(false)

    let subCategoryValue: string | null  = $state(null)
    let subCategoryFocused = $state(false)

	let selectedStatement: accountStatementFormat | null = $state(null)
	let selectedStatements: number[] = $state([])

    let currentSortParam = $state();
    let currentDirParam = $state();
    let searchValue = $state()

    onMount(() => {
        currentSortParam = new URLSearchParams(window.location.search).get("sortBy")
        currentDirParam = new URLSearchParams(window.location.search).get("sortDir")
        searchValue = new URLSearchParams(window.location.search).get("search")
    })

    function updateSort(col: SortKey) {
        const params = new URLSearchParams(window.location.search);
        const currentBy  = params.get('sortBy');
        const currentDir = params.get('sortDir');
        const dir =
            currentBy === col
                ? (currentDir === 'asc' ? 'desc' : 'asc')
                : 'desc';
        params.set('sortBy', col);
        params.set('sortDir', dir);
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
        currentSortParam = col
        currentDirParam = dir
    }

    function searchFunc(searchParam: string) {
        const params = new URLSearchParams(window.location.search);
        params.set('search', searchParam);
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

</script>

<div class=" w-full">
    <!-- -------------------- -->
    <!-- edit statement modal -->
    <!-- -------------------- -->
    {#if editStatementModal}
        <div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center">
            <button onclick={() => [editStatementModal = false, selectedStatement = null, mainCategoryFocused = false, subCategoryFocused = false, mainCategoryValue = "", subCategoryValue = ""]} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
            <form method="post" action="?/editStatement" class=" flex flex-col w-80 z-30 bg-neutral-800 h-96 relative rounded-md p-4"
            use:enhance={({}) => {
                return async ({ result }) => {
                    if (result.type === "success") {
                        editStatementModal = false
                        selectedStatement = null
                        selectedStatements = []
                        mainCategoryValue = ""
                        subCategoryValue = ""
                        invalidateAll()
                    }

                    await applyAction(result);
                }
            }}>
                <div class="flex w-full flex-col">
                    <div class=" w-full mb-5 mt-2">
                        <p class="block mb-2 text-sm font-medium ">Text</p>
                        <input onfocus={() => [mainCategoryFocused = false, subCategoryFocused = false]} type="text" id="text" name="text" value={selectedStatement ? selectedStatement?.tekst : null} class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <p class=" block mb-2 text-sm font-medium ">Main category</p>
                    <div class=" w-full mb-5" use:clickOutside={() => mainCategoryFocused = false}>
                        <input autocapitalize="on" autocomplete="off" type="text" id="hovedkategori" name="hovedkategori" placeholder="Main category..." bind:value={mainCategoryValue} onfocus={() => [mainCategoryFocused = true, subCategoryFocused = false]} class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
                        {#if mainCategoryFocused}
                            <div class=" absolute z-50 bg-neutral-700 rounded-lg w-3/4 left-20 font-medium text-sm mt-1 border border-neutral-600 max-h-40 overflow-y-scroll">
                                {#each statistics.hovedkategorier as hovedkategori}
                                    <button type="button" onclick={() => [mainCategoryValue = hovedkategori, mainCategoryFocused = false]} class=" p-2 w-full h-full cursor-pointer flex flex-start hover:bg-neutral-800 rounded-lg">
                                        {hovedkategori}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <p class=" block mb-2 text-sm font-medium ">Sub category</p>
                    <div class=" w-full mb-5" use:clickOutside={() => subCategoryFocused = false}>
                        <input autocapitalize="on" autocomplete="off" type="text" id="underkategori" name="underkategori" placeholder="Sub category..." bind:value={subCategoryValue} onfocus={() => [mainCategoryFocused = false, subCategoryFocused = true]} class=" text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
                        {#if subCategoryFocused}
                            <div class=" absolute z-50 bg-neutral-700 rounded-lg w-3/4 left-20 font-medium text-sm mt-1 border border-neutral-600 max-h-40 overflow-y-scroll">
                                {#each statistics.underkategorier as underkategori}
                                    <button type="button" onclick={() => [subCategoryValue = underkategori, subCategoryFocused = false]} class=" p-2 w-full h-full cursor-pointer flex flex-start hover:bg-neutral-800 rounded-lg">
                                        {underkategori}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <input class=" hidden" type="text" name="id" id="id" value={selectedStatement ? selectedStatement?.statementId : JSON.stringify(accountStatements.filter((statement) => {
                        return selectedStatements.filter((statementId) => statementId === statement.statementId).length > 0
                    }))}>
                </div> 
                <button type="submit" class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Confirm changes</button>
                <button onclick={() => [editStatementModal = false, selectedStatement = null, mainCategoryFocused = false, subCategoryFocused = false, mainCategoryValue = "", subCategoryValue = ""]} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
            </form>
        </div>
    {/if}
    <!-- ------------------------------ -->
    <!-- confirm delete statement modal -->
    <!-- ------------------------------ -->
    {#if confirmDeleteStatementModal}
        <div class=" fixed w-screen h-screen top-0 left-0 flex justify-center items-center z-50">
            <button onclick={() => [confirmDeleteStatementModal = false, selectedStatement = null]} aria-label="Closes the edit statement modal" class=" fixed h-screen w-screen bg-neutral-900/60 z-30 top-0 left-0 backdrop-blur-xs"></button>
            <div class=" flex flex-col w-80 z-30 bg-neutral-800 h-48 relative rounded-md p-4">
                <div class="flex justify-center w-full flex-col">
                    {#if selectedStatement}
                        <p class=" font-semibold text-lg mb-1">Confirm delete statement</p>
                        <p>You are about to delete a statement!</p>
                    {:else}
                        <p class=" font-semibold text-lg mb-1">Confirm delete statements</p>
                        <p>You are about to delete <span class=" font-bold underline">{selectedStatements.length}</span> statements!</p>
                    {/if}
                </div>
                <button type="submit" onclick={async (e) => {
                    if (selectedStatement) {
                        await fetch("/api/accountStatements/deleteStatement", {
                            method: "DELETE",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(selectedStatement?.statementId)
                        });
                    } else {
                        await fetch("/api/accountStatements/deleteStatements", {
                            method: "DELETE",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(selectedStatements)
                        });
                    }

                    selectedStatement = null
                    selectedStatements = []
                    confirmDeleteStatementModal = false
                    invalidateAll()
                }}
                class=" bg-blue-700 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 left-5  hover:bg-blue-800">Confirm delete</button>
                <button onclick={() => [confirmDeleteStatementModal = false, selectedStatement = null]} type="button" class="  bg-neutral-600 cursor-pointer py-3 px-2 rounded-md text-sm font-semibold active:scale-95 absolute bottom-5 right-5 hover:bg-neutral-700 ">Cancel</button>
            </div>
        </div>
    {/if}
    <!-- ------------ -->
    <!-- Table filter -->
    <!-- ------------ -->
    <div class=" mb-5">
        <div class=" w-full">
            <div class=" w-full flex justify-between">
                <div class=" w-80 mb-5 group mt-2">
                    <label for="search" class="mb-2 text-sm font-medium text-white flex gap-1">
                        <Search />
                        Search
                    </label>
                    <div class=" flex">
                        <input bind:value={searchValue} type="text" id="search" name="search" class=" text-sm rounded-l-lg w-full p-2.5 bg-neutral-700 border border-neutral-600 placeholder-neutral-400 focus:ring-blue-500 focus:border-blue-500">
                        <button onclick={() => searchFunc(searchValue)} class=" text-sm rounded-r-lg p-2.5 bg-neutral-700 border border-neutral-600 cursor-pointer"><Search /></button>
                    </div>
                </div>
                <div class=" w-60 mb-5 group mt-2">
                    <label for="text" class="mb-2 text-sm font-medium text-white flex gap-1">
                        <Calendar />
                        Pick Date
                    </label>
                    <input disabled={true} type="text" id="text" name="text" class=" text-sm rounded-lg w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <p class=" text-xs text-neutral-400">Showing <span class=" font-bold text-neutral-200">{accountStatements.length}</span> account statements of <span class=" font-bold text-neutral-200">{accountStatements.length}</span></p>
        </div>
    </div>
    <!-- --------------------------- -->
    <!-- Table of account statements -->
    <!-- --------------------------- -->
    <div class=" rounded-xl bg-neutral-900 overflow-x-auto ">
        <table class="w-full text-sm text-left rounded-4xl">
            <thead class="text-xs uppercase bg-neutral-950  text-nowrap">
                <tr>
                    <th class="px-6 py-5">
                        <input onchange={() => {if (accountStatements.length === selectedStatements.length) {selectedStatements = []} else {selectedStatements = accountStatements.map((statement) => statement.statementId)}}} checked={accountStatements.length === selectedStatements.length} type="checkbox" name="checkbox" id="checkbox"  class=" cursor-pointer w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded-sm focus:ring-0"/>
                    </th>
                    <th class="px-3 py-5 cursor-pointer" onclick={() => updateSort("dato")}>
                        <div class=" flex">
                            Date 
                            {#if currentSortParam === "dato" && currentDirParam === "desc"}
                                <ArrowUp />
                            {:else}
                                <ArrowDown />
                            {/if}
                        </div>
                    </th>
                    <th class="px-3 py-5 cursor-pointer" onclick={() => updateSort("innPaaKonto")}>
                        <div class=" flex">
                            Money in
                            {#if currentSortParam === "innPaaKonto" && currentDirParam === "desc"}
                                <ArrowUp />
                            {:else}
                                <ArrowDown />
                            {/if}
                        </div>
                    </th>
                    <th class="px-3 py-5 cursor-pointer" onclick={() => updateSort("utFraKonto")}>
                        <div class=" flex">
                            Money out
                            {#if currentSortParam === "utFraKonto" && currentDirParam === "desc"}
                                <ArrowUp />
                            {:else}
                                <ArrowDown />
                            {/if}
                        </div>
                    </th>
                    <th class="px-3 py-5 cursor-pointer" onclick={() => updateSort("tekst")}>
                        <div class=" flex">
                            Text
                            {#if currentSortParam === "tekst" && currentDirParam === "desc"}
                                <ArrowUp />
                            {:else}
                                <ArrowDown />
                            {/if}
                        </div>
                    </th>
                    <th class="px-3 py-5 cursor-pointer" onclick={() => updateSort("hovedkategori")}>
                        <div class=" flex">
                            Main category
                            {#if currentSortParam === "hovedkategori" && currentDirParam === "desc"}
                                <ArrowUp />
                            {:else}
                                <ArrowDown />
                            {/if}
                        </div>
                    </th>
                    <th class="px-3 py-5 cursor-pointer" onclick={() => updateSort("underkategori")}>
                        <div class=" flex">
                            Sub category
                            {#if currentSortParam === "underkategori" && currentDirParam === "desc"}
                                <ArrowUp />
                            {:else}
                                <ArrowDown />
                            {/if}
                        </div>
                    </th>
                    <td class="px-5 py-4">
                        <button 
                            disabled={selectedStatements.length <= 0} 
                            onclick={() => [editStatementModal = true]} 
                            class=" flex text-nowrap font-bold cursor-pointer">
                            <Edit size="small" color={selectedStatements.length <= 0 ? "darkNeutral" : "neutral"}/>
                        </button>
                    </td>
                    <td class="px-5 py-4">
                        <button 
                            disabled={selectedStatements.length <= 0}
                            onclick={() => confirmDeleteStatementModal = true}
                            class=" flex text-nowrap font-bold cursor-pointer">
                            <Delete color={selectedStatements.length <= 0 ? "darkNeutral" : "neutral"} size="small"/>
                        </button>
                    </td>
                </tr>
            </thead>
            <tbody>
                {#each accountStatements as statement}
                    <tr class=" border-b bg-neutral-900 border-neutral-800 text-xs text-neutral-400">
                        <th scope="col" class="px-6 py-5">
                            <input bind:group={selectedStatements} value={statement.statementId} checked={selectedStatements.includes(statement.statementId)} type="checkbox" name="checkbox" id="checkbox" class=" cursor-pointer w-4 h-4 bg-neutral-700 border border-neutral-600 rounded-sm focus:ring-0"/>
                        </th>
                        <td class="px-3 py-5 text-nowrap">
                            {new Date(statement.dato).toDateString()}
                        </td>
                        <td class="px-3 py-5">
                            {statement.innPaaKonto}
                        </td>
                        <td class="px-3 py-5">
                            {statement.utFraKonto}
                        </td>
                        <td class="px-3 py-5">
                            {statement.tekst}
                        </td>
                        <td class="px-3 py-5">
                            {statement.hovedkategori}
                        </td>
                        <td class="px-3 py-5">
                            {statement.underkategori}
                        </td>
                        <td class="px-5 py-5">
                            <button onclick={() => [editStatementModal = true, selectedStatement = statement, mainCategoryValue = statement.hovedkategori, subCategoryValue = statement.underkategori]} class=" flex text-nowrap font-bold cursor-pointer">
                                <Edit color="darkNeutral" size="small" />
                            </button>
                        </td>
                        <td class="px-5 py-5">
                            <button 
                                onclick={() => [confirmDeleteStatementModal = true, selectedStatement = statement]}
                                class=" flex text-nowrap font-bold cursor-pointer">
                                <Delete color="darkNeutral" size="small"/>
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <div>

        </div>
    </div>
</div>

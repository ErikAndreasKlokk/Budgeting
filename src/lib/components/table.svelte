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
	import More from "./icons/more.svelte";
	import CalendarInput from "./calendarInput.svelte";
	import { page } from "$app/state";

    const { accountStatements, statistics, accountStatementsCount, defaultDateRange }: { accountStatements: accountStatementFormat[], statistics: any, accountStatementsCount: any, defaultDateRange?: { from: Date, to: Date } } = $props()

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
    let searchValue = $state("")

    let paginationNumber = $state(10000000)
    let perPageNumber = $state(20)
    let perPageFocused = $state(false)

    let dateRange: { from: Date | undefined; to: Date | undefined } = $state({
        from: undefined,
        to: undefined
    });

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        currentSortParam = params.get("sortBy")
        currentDirParam = params.get("sortDir")
        searchValue = params.get("search") ?? ""
        paginationNumber = params.get("page") ? Number(params.get("page")) : 0
        perPageNumber = params.get("perPage") ? Number(params.get("perPage")) : perPageNumber
    })

    // Sync dateRange with URL params after navigation
    $effect(() => {
        const url = page.url;
        const fromParam = url.searchParams.get('tableDateRangeFrom');
        const toParam = url.searchParams.get('tableDateRangeTo');

        if (fromParam && toParam) {
            dateRange.from = new Date(fromParam);
            dateRange.to = new Date(toParam);
        } else if (!fromParam && !toParam) {
            dateRange.from = undefined;
            dateRange.to = undefined;
        }
    });

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
        paginationNumber = 0
        const params = new URLSearchParams(window.location.search);
        params.set('search', searchParam);
        params.set('page', "0");
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

    function pagination(newPaginationNumber: number) {
        paginationNumber = newPaginationNumber
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPaginationNumber.toString());
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

    function setPerPage(newPerPageNumber: number) {
        paginationNumber = 0
        perPageNumber = newPerPageNumber
        const params = new URLSearchParams(window.location.search);
        params.set('perPage', newPerPageNumber.toString());
        params.set('page', "0");
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

    function handleDateSelect() {
        const params = new URLSearchParams(window.location.search);
        if (!dateRange.from || !dateRange.to) {
            params.set('tableDateRangeFrom', "")
            params.set('tableDateRangeTo', "")
            goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
            return;
        };
        params.set('tableDateRangeFrom', new Date(dateRange.from.setDate(dateRange.from.getDate() + 1)).toISOString().slice(0, 10))
        params.set('tableDateRangeTo', new Date(dateRange.to.setDate(dateRange.to.getDate() + 1)).toISOString().slice(0, 10))

        dateRange.from.setDate(dateRange.from.getDate() - 1)
        dateRange.to.setDate(dateRange.to.getDate() - 1)
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
    <div class=" mb-3">
        <div class=" w-full">
            <div class=" w-full flex justify-between">
                <div class=" w-80 mb-5 group mt-2">
                    <label for="search" class="mb-2 text-sm font-medium  flex gap-1">
                        <Search />
                        Search
                    </label>
                    <div class=" flex">
                        <input bind:value={searchValue} type="text" id="search" name="search" class=" text-sm rounded-l-lg w-full p-2.5 bg-neutral-900 border border-neutral-700 placeholder-neutral-400 focus:ring-blue-500 focus:border-blue-500">
                        <button onclick={() => searchFunc(searchValue)} class=" text-sm rounded-r-lg p-2.5 bg-neutral-800 border-r border-y border-neutral-700 cursor-pointer"><Search /></button>
                    </div>
                </div>
                <!-- TODO: add a select between dates dropdown to select what dates the account statements should be between -->
                <div class=" w-60 mb-5 group mt-2 flex flex-col">
                    <label for="datepicker" class="mb-2 text-sm font-medium flex gap-1">
                        <Calendar />
                        Select date 
                    </label>
                    <CalendarInput bind:rangeFrom={dateRange.from} bind:rangeTo={dateRange.to} onclear={handleDateSelect} onselect={handleDateSelect} defaultDate={defaultDateRange?.from ? new Date(defaultDateRange.from) : null} />
                </div>
            </div>
        </div>
    </div>
    <!-- --------------------------- -->
    <!-- Table of account statements -->
    <!-- --------------------------- -->
    <div class=" rounded-xl bg-neutral-900 overflow-x-auto ">
        <table class="w-full text-sm text-left ">
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
                {#if accountStatementsCount && accountStatementsCount[0] && accountStatementsCount[0].count > 0}
                    {#each { length: accountStatementsCount[0].count - (perPageNumber * paginationNumber + 1) >= perPageNumber ? perPageNumber : accountStatementsCount[0].count - (perPageNumber * paginationNumber + 1) + 1 }, i}
                        <tr class=" border-y border-x bg-neutral-900 border-neutral-800 text-xs text-neutral-300">
                            <th scope="col" class="px-6 py-5">
                                <input bind:group={selectedStatements} value={accountStatements[i].statementId} checked={selectedStatements.includes(accountStatements[i].statementId)} type="checkbox" name="checkbox" id="checkbox" class=" cursor-pointer w-4 h-4 bg-neutral-700 border border-neutral-600 rounded-sm focus:ring-0"/>
                            </th>
                            <td class="px-3 py-5 text-nowrap">
                                {accountStatements[i].dato.toString().slice(4,16)}
                            </td>
                            <td class="px-3 py-5">
                                {accountStatements[i].innPaaKonto}
                            </td>
                            <td class="px-3 py-5">
                                {accountStatements[i].utFraKonto}
                            </td>
                            <td class="px-3 py-5 text-nowrap ">
                                {accountStatements[i].tekst?.slice(0, 19) + "..."}
                            </td>
                            <td class="px-3 py-5">
                                {accountStatements[i].hovedkategori}
                            </td>
                            <td class="px-3 py-5">
                                {accountStatements[i].underkategori}
                            </td>
                            <td class="px-5 py-5">
                                <button onclick={() => [editStatementModal = true, selectedStatement = accountStatements[i], mainCategoryValue = accountStatements[i].hovedkategori, subCategoryValue = accountStatements[i].underkategori]} class=" flex text-nowrap font-bold cursor-pointer">
                                    <Edit color="darkNeutral" size="small" />
                                </button>
                            </td>
                            <td class="px-5 py-5">
                                <button
                                    onclick={() => [confirmDeleteStatementModal = true, selectedStatement = accountStatements[i]]}
                                    class=" flex text-nowrap font-bold cursor-pointer">
                                    <Delete color="darkNeutral" size="small"/>
                                </button>
                            </td>
                        </tr>
                    {/each}
                {:else}
                    <tr class="border-y border-x bg-neutral-900 border-neutral-800">
                        <td colspan="9" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center gap-4">
                                <div class="w-16 h-16 rounded-full border-4 border-neutral-800 flex items-center justify-center">
                                    <Calendar />
                                </div>
                                <div class="flex flex-col items-center gap-1">
                                    <p class="text-neutral-400 font-medium">No statements found</p>
                                    <p class="text-neutral-500 text-sm italic">Try selecting a different date range or upload new data</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
        <div class=" flex justify-between h-14 items-center p-4 bg-neutral-950">
            {#if accountStatementsCount && accountStatementsCount[0] && accountStatementsCount[0].count > 0}
                <p class=" text-xs text-neutral-400">Showing <span class=" font-bold text-neutral-200 underline">{perPageNumber * paginationNumber + 1} - {perPageNumber * paginationNumber + perPageNumber > accountStatementsCount[0].count ? accountStatementsCount[0].count : perPageNumber * paginationNumber + perPageNumber}</span> account statements of <span class=" font-bold text-neutral-200">{accountStatementsCount[0].count}</span></p>
                <div class=" h-full flex items-center">
                    <div class=" mr-5">
                        <div class=" w-full " use:clickOutside={() => perPageFocused = false}>
                            <button id="underkategori" onclick={() => [perPageFocused = !perPageFocused]} class=" flex items-center justify-center text-xs cursor-pointer border h-8 w-32 rounded-md border-neutral-700">Show <span class=" font-bold mx-1">{perPageNumber === accountStatementsCount[0].count ? "all" : perPageNumber}</span> rows <span class=" ml-1"><ArrowDown /></span></button>
                            {#if perPageFocused}
                                <div class=" absolute z-50 bg-neutral-950 rounded-lg  font-medium text-sm border border-neutral-700 mt-2 w-32">
                                    <button type="button" onclick={() => [perPageFocused = false, setPerPage(20)]} class=" p-2 w-full h-full cursor-pointer flex flex-start hover:bg-neutral-900 rounded-lg">
                                        20
                                    </button>
                                    <button type="button" onclick={() => [perPageFocused = false, setPerPage(50)]} class=" p-2 w-full h-full cursor-pointer flex flex-start hover:bg-neutral-900 rounded-lg">
                                        50
                                    </button>
                                    <button type="button" onclick={() => [perPageFocused = false, setPerPage(100)]} class=" p-2 w-full h-full cursor-pointer flex flex-start hover:bg-neutral-900 rounded-lg">
                                        100
                                    </button>
                                    <button type="button" onclick={() => [perPageFocused = false, setPerPage(accountStatementsCount[0].count)]} class=" p-2 w-full h-full cursor-pointer flex flex-start hover:bg-neutral-900 rounded-lg">
                                        all
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                    <!-- Pagination -->
                    <button disabled={ paginationNumber === 0 } onclick={() => pagination(paginationNumber - 1) } class=" h-8 w-8 flex items-center justify-center rotate-90 active:scale-95 {paginationNumber !== 0 ? "hover:bg-neutral-900 cursor-pointer rounded-md" : ""}">
                        <ArrowDown color={ paginationNumber === 0 ? "darkNeutral" : "neutral" } />
                    </button>
                    <div class=" flex">
                        {#if Math.ceil(accountStatementsCount[0].count / perPageNumber) <= 7}
                            {#each { length: Math.ceil(accountStatementsCount[0].count / perPageNumber) }, i }
                                <button onclick={() => pagination(i)} class=" h-8 w-8 flex justify-center items-center font-medium rounded-md cursor-pointer active:scale-95 text-sm { paginationNumber === i ? " border border-neutral-700" : " hover:bg-neutral-900"}">{i + 1}</button>
                            {/each}
                        {:else}
                            <button
                                onclick={() => pagination(0)}
                                class=" h-8 w-8 flex justify-center items-center font-medium cursor-pointer active:scale-95 text-sm rounded-md {paginationNumber === 0 ? " border border-neutral-700" : "hover:bg-neutral-900" }">
                                1
                            </button>
                            <button
                                disabled={ paginationNumber > 3 }
                                onclick={() => pagination(1)}
                                class=" h-8 w-8 flex justify-center items-center font-medium text-sm {paginationNumber > 3 ? "" : paginationNumber === 1 ? " active:scale-95 cursor-pointer border border-neutral-700 rounded-md" : " rounded-md hover:bg-neutral-900 active:scale-95 cursor-pointer"}">
                                {#if paginationNumber > 3}
                                    <More />
                                {:else}
                                    2
                                {/if}
                            </button>
                            <button
                                onclick={() => pagination(paginationNumber <= 2 ? 2 : paginationNumber >= Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 ? Math.ceil(accountStatementsCount[0].count / perPageNumber) - 5 : paginationNumber - 1)}
                                class=" h-8 w-8 flex justify-center items-center font-medium rounded-md cursor-pointer active:scale-95 text-sm {paginationNumber === 2 ? " border border-neutral-700 " : " hover:bg-neutral-900"}">
                                { paginationNumber <= 2  ? "3" : paginationNumber >= Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 ? Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 : paginationNumber }
                            </button>
                            <button
                                onclick={() => pagination(paginationNumber <= 2 ? 3 : paginationNumber >= Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 ? Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 : paginationNumber)}
                                class=" h-8 w-8 flex justify-center items-center font-medium rounded-md cursor-pointer active:scale-95 text-sm {paginationNumber < Math.ceil(accountStatementsCount[0].count / perPageNumber) - 3 && paginationNumber > 2 ? " border border-neutral-700" : "hover:bg-neutral-900"}">
                                { paginationNumber <= 2 ? "4" : paginationNumber >= Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 ? Math.ceil(accountStatementsCount[0].count / perPageNumber) - 3 : paginationNumber + 1 }
                            </button>
                            <button
                                onclick={() => pagination(paginationNumber <= 2 ? 4 : paginationNumber >= Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 ? Math.ceil(accountStatementsCount[0].count / perPageNumber) - 3 : paginationNumber + 1)}
                                class=" h-8 w-8 flex justify-center items-center font-medium rounded-md cursor-pointer active:scale-95 text-sm {paginationNumber === Math.ceil(accountStatementsCount[0].count / perPageNumber) - 3 ? " border border-neutral-700" : " hover:bg-neutral-900"}">
                                { paginationNumber <= 2 ? "5" : paginationNumber >= Math.ceil(accountStatementsCount[0].count / perPageNumber) - 4 ? Math.ceil(accountStatementsCount[0].count / perPageNumber) - 2 : paginationNumber + 2 }
                            </button>
                            <button
                                disabled={ paginationNumber < Math.ceil(accountStatementsCount[0].count / perPageNumber)-4 }
                                onclick={() => pagination(Math.ceil(accountStatementsCount[0].count / perPageNumber) - 2)}
                                class=" h-8 w-8 flex justify-center items-center font-medium text-sm { paginationNumber < Math.ceil(accountStatementsCount[0].count / perPageNumber)-4 ? "" : paginationNumber ===  Math.ceil(accountStatementsCount[0].count / perPageNumber)-2 ? "active:scale-95 cursor-pointer border border-neutral-700 rounded-md" : " active:scale-95 cursor-pointer rounded-md hover:bg-neutral-900" }">
                                {#if paginationNumber < Math.ceil(accountStatementsCount[0].count / perPageNumber)-4}
                                    <More />
                                {:else}
                                    {Math.ceil(accountStatementsCount[0].count / perPageNumber)-1}
                                {/if}
                            </button>
                            <button
                                onclick={() => pagination(Math.ceil(accountStatementsCount[0].count / perPageNumber) - 1)}
                                class=" h-8 w-8 flex justify-center items-center font-medium rounded-md cursor-pointer active:scale-95 text-sm {paginationNumber === Math.ceil(accountStatementsCount[0].count / perPageNumber) - 1 ? " border border-neutral-700" : "hover:bg-neutral-900" }">
                                {Math.ceil(accountStatementsCount[0].count / perPageNumber)}
                            </button>
                        {/if}
                    </div>
                    <button disabled={ perPageNumber * paginationNumber + perPageNumber >= accountStatementsCount[0].count } onclick={() => pagination(paginationNumber + 1)} class=" h-8 w-8 flex items-center justify-center rotate-90 active:scale-95 {perPageNumber * paginationNumber + perPageNumber >= accountStatementsCount[0].count ? "" : "hover:bg-neutral-900 cursor-pointer rounded-md"}">
                        <ArrowUp color={ perPageNumber * paginationNumber + perPageNumber >= accountStatementsCount[0].count ? "darkNeutral" : "neutral" }  />
                    </button>
                </div>
            {:else}
                <p class="text-xs text-neutral-500 italic">No statements to display</p>
                <div></div>
            {/if}
        </div>
    </div>
</div>

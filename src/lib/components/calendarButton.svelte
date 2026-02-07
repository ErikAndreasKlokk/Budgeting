<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
	import ArrowDown from "./icons/arrowDown.svelte";

  const todaysDate = new Date()

  let { value = $bindable(), defaultDate = null, range = true, rangeFrom = $bindable(), rangeTo = $bindable(), locale = "default", firstDayOfWeek = 0, dateFormat, placeholder = "Select date", disabled = false, required = false, inputClass = "", inline = false, autohide = true, showActionButtons = false, title = "", onselect, onclear, onapply }: { value?: Date | undefined, defaultDate?: Date | null, range?: boolean, rangeFrom?: Date | undefined, rangeTo?: Date | undefined, locale?: string, firstDayOfWeek?: number, dateFormat?: Intl.DateTimeFormatOptions | undefined, placeholder?: string, disabled?: boolean, required?: boolean, inputClass?: string, inline?: boolean, autohide?: boolean, showActionButtons?: boolean, title?: string, onselect?: (range: { from: Date | undefined, to: Date | undefined }) => void, onclear?: () => void, onapply?: () => void } = $props();

  const dateFormatDefault = { year: "numeric", month: "long", day: "numeric" };
  const dateFormatOptions = $derived(dateFormat ?? dateFormatDefault);
  // Internal state
  let isOpen: boolean = $state(inline);
  let buttonElement: HTMLButtonElement | null = $state(null);
  let datepickerContainerElement: HTMLDivElement;
  let currentMonth: Date = $state(rangeFrom || value || defaultDate || new Date());
  let focusedDate: Date | null = null;
  let calendarRef: HTMLDivElement | null = $state(null);

  let daysInMonth = $derived(getDaysInMonth(currentMonth));

  onMount(() => {
    if (!inline) {
      datepickerContainerElement?.ownerDocument.addEventListener("click", handleClickOutside);
      return () => {
        datepickerContainerElement?.ownerDocument.removeEventListener("click", handleClickOutside);
      };
    }
  });

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 0);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray: Date[] = [];

    // Add days from previous month to fill the first week
    let start = firstDay.getDay() - firstDayOfWeek;
    if (start < 0) start += 7;
    for (let i = 0; i < start; i++) {
      daysArray.unshift(new Date(year, month, -i));
    }

    // Add days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, month, i));
    }

    // Add days from next month to fill the last week
    const remainingDays = 7 - (daysArray.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        daysArray.push(new Date(year, month + 1, i));
      }
    }

    return daysArray;
  }

  const getWeekdayNames = (): string[] => {
    return Array.from({ length: 7 }, (_, i) => new Date(1970, 0, 5 + i + firstDayOfWeek).toLocaleDateString(locale, { weekday: "short" }));
  };
  let weekdays = getWeekdayNames();

  const addDay = (date: Date, increment: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + increment);

  function changeMonth(increment: number) {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1);
  }

  function handleDaySelect(day: Date) {
    if (!rangeFrom || (rangeFrom && rangeTo)) {
      rangeFrom = day;
      rangeTo = undefined;
    } else if (day < rangeFrom) {
      rangeFrom = day;
      rangeTo = undefined;
    } else {
      rangeTo = day;
      isOpen = false;
      onselect?.({ from: rangeFrom, to: rangeTo });
    }
  }

  function handleInputChange() {
    const date = new Date();
    if (!isNaN(date.getTime())) {
      handleDaySelect(date);
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (isOpen && datepickerContainerElement && !datepickerContainerElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  const formatDate = (date?: Date): string => date?.toLocaleDateString(locale, dateFormat) ?? "";
  const isSameDate = (date1?: Date, date2?: Date): boolean => date1?.toDateString() === date2?.toDateString();
  const isToday = (day: Date): boolean => isSameDate(day, new Date());
  const isInRange = (day: Date): boolean => !!(range && rangeFrom && rangeTo && day > rangeFrom && day < rangeTo);

  let isSelected = $derived((day: Date): boolean => (range ? isSameDate(day, rangeFrom) || isSameDate(day, rangeTo) : isSameDate(day, value)));

  function handleCalendarKeydown(event: KeyboardEvent) {
    if (!isOpen) return;

    if (!focusedDate) {
      focusedDate = value || new Date();
    }

    switch (event.key) {
      case "ArrowLeft":
        focusedDate = addDay(focusedDate!, -1);
        break;
      case "ArrowRight":
        focusedDate = addDay(focusedDate!, 1);
        break;
      case "ArrowUp":
        focusedDate = addDay(focusedDate!, -7);
        break;
      case "ArrowDown":
        focusedDate = addDay(focusedDate!, 7);
        break;
      case "Enter":
        handleDaySelect(focusedDate!);
        break;
      case "Escape":
        isOpen = false;
        buttonElement?.focus();
        break;
      default:
        return;
    }

    event.preventDefault();
    if (focusedDate!.getMonth() !== currentMonth.getMonth()) {
      currentMonth = new Date(focusedDate!.getFullYear(), focusedDate!.getMonth(), 1);
    }

    // Focus the button for the focused date
    setTimeout(() => {
      const focusedButton = calendarRef?.querySelector(`button[aria-label="${focusedDate!.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}"]`) as HTMLButtonElement | null;
      focusedButton?.focus();
    }, 0);
  }

  function handleInputKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      isOpen = !isOpen;
    }
  }

</script>

{#snippet navButton(forward: boolean)}
  <button class=" w-6 h-6 flex justify-center items-center cursor-pointer" onclick={() => changeMonth(forward ? 1 : -1)} aria-label={forward ? "Next month" : "Previous month"}>
    <svg class="h-4 w-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={forward ? "M1 5h12m0 0L9 1m4 4L9 9" : "M13 5H1m0 0 4 4M1 5l4-4"}></path>
    </svg>
  </button>
{/snippet}

<div bind:this={datepickerContainerElement} class=" mt-1 w-full max-w-60">
  <div class=" flex">
    <button class=" cursor-pointer min-w-20 text-start flex items-center text-neutral-400 italic mt-1" bind:this={buttonElement} onclick={() => isOpen = true} onkeydown={handleInputKeydown} aria-haspopup="dialog" aria-label="popup">{range ? `${formatDate(rangeFrom)} - ${formatDate(rangeTo)}` : formatDate(value)} <ArrowDown color="darkNeutral"/> </button>
  </div>
  {#if isOpen}
    <div bind:this={calendarRef} id="datepicker-dropdown" class=" rounded-lg shadow-lg p-4 absolute bg-neutral-950 mt-4 border border-neutral-700 w-60 z-10" transition:fade={{ duration: 100 }} role="dialog" aria-label="Calendar">
      <div class=" mb-4 flex items-center justify-between">
        {@render navButton(false)}
        <h3 class=" text-sm rounded-lg  font-semibold py-2.5 px-5  focus:outline-none focus:ring-2 focus:ring-gray-200" aria-live="polite">
          {currentMonth.toLocaleString(locale, { month: "long", year: "numeric" })}
        </h3>
        {@render navButton(true)}
      </div>
      <div class=" grid grid-cols-7 gap-0.5 " role="grid">
        {#each weekdays as day}
          <div class=" text-center text-sm font-medium text-gray-500 dark:text-gray-400" role="columnheader">{day}</div>
        {/each}
        {#each daysInMonth as day}
          {@const current = day.getMonth() !== currentMonth.getMonth()}
          <button class="{isSelected(day) ? " bg-neutral-600" : ""} {isInRange(day) ? "bg-neutral-800" : ""} { isToday(day) ? " bg-blue-600/60" : ""} h-7 w-full hover:bg-neutral-700 flex-1 leading-9 border-0 rounded-md cursor-pointer text-center font-semibold text-sm flex justify-center items-center" onclick={() => handleDaySelect(day)} onkeydown={handleCalendarKeydown} aria-label={day.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} aria-selected={isSelected(day)} role="gridcell">
            {day.getDate()}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
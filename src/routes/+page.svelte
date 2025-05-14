<script lang="ts">
    import { onMount } from 'svelte';
    let welcomeMessage = "Welcome to Budgeting!";
    let description = "Track your income and expenses effortlessly.";
    let features = [
        { title: "Track Expenses", description: "Monitor your spending habits and stay on top of your finances." },
        { title: "Set Budgets", description: "Create budgets to manage your income and expenses effectively." },
        { title: "Analyze Data", description: "Gain insights into your financial trends with detailed charts." }
    ];
</script>

<!-- TODO: FIX THIS -->

<main class="w-full flex flex-col items-center bg-neutral-800 h-full">
    <div class="flex flex-col gap-10 my-20 px-12 items-center z-0 w-full max-w-[1100px]">
        <div class="text-center">
            <h1 class="text-5xl font-bold text-blue-500">{welcomeMessage}</h1>
            <p class="text-lg text-neutral-400 mt-4">{description}</p>
        </div>
        <div class="flex flex-col md:flex-row gap-10 justify-center items-center w-full">
            <a href="/dashboard" class="bg-blue-700 cursor-pointer py-4 px-6 rounded-md text-lg font-semibold active:scale-95 hover:bg-blue-800 text-white">
                Go to Dashboard
            </a>
            <a href="/about" class="bg-neutral-700 cursor-pointer py-4 px-6 rounded-md text-lg font-semibold active:scale-95 hover:bg-neutral-600 text-white">
                Learn More
            </a>
        </div>
    </div>

    <!-- Features Section -->
    <div class="flex flex-col gap-10 my-20 px-12 items-center z-0 w-full max-w-[1100px]">
        <h2 class="text-3xl font-bold text-blue-500">Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
            {#each features as feature}
                <div class="bg-neutral-700 p-6 rounded-lg text-center">
                    <h3 class="text-xl font-semibold text-blue-400">{feature.title}</h3>
                    <p class="text-neutral-300 mt-2">{feature.description}</p>
                </div>
            {/each}
        </div>
    </div>

    <!-- Call-to-Action Section -->
    <div class="flex flex-col gap-6 my-20 px-12 items-center z-0 w-full max-w-[1100px] bg-neutral-700 p-10 rounded-lg">
        <h2 class="text-3xl font-bold text-blue-500">Get Started Today</h2>
        <p class="text-neutral-300 text-center">
            Take control of your finances and achieve your financial goals. Sign up now and start budgeting smarter!
        </p>
        <a href="/signup" class="bg-blue-700 cursor-pointer py-4 px-6 rounded-md text-lg font-semibold active:scale-95 hover:bg-blue-800 text-white">
            Sign Up
        </a>
    </div>
</main>
<script lang="ts">
    import type { PageServerData } from './$types';

    let { data }: { data: PageServerData } = $props();
</script>

<main class="w-full flex flex-col items-center bg-neutral-900 min-h-screen">
    <!-- Hero Section -->
    <section class="w-full max-w-[1200px] px-6 pt-24 pb-20">
        <div class="flex flex-col items-center text-center gap-6">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 border border-neutral-700 text-sm text-neutral-300">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Open Source & Self-Hostable
            </div>
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight">
                Your finances,
                <span class="text-blue-500">your control.</span>
            </h1>
            <p class="text-xl text-neutral-400 max-w-2xl">
                A privacy-first budgeting app that helps you track expenses, analyze spending patterns, and take control of your financial future. No subscriptions. No data mining. Just you and your money.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 mt-4">
                <a href="/auth" class="px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors">
                    Get Started
                </a>
                <a href="https://github.com/ErikAndreasKlokk/budgeting" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-lg transition-colors border border-neutral-700 flex items-center gap-3">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <span>Star on GitHub</span>
                    {#if data.githubStars !== null}
                        <span class="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-700 text-sm">
                            <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                            {data.githubStars}
                        </span>
                    {/if}
                </a>
            </div>
        </div>
    </section>

    <!-- Stats/Trust Section -->
    <section class="w-full border-y border-neutral-800 bg-neutral-800/30">
        <div class="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="text-center">
                <p class="text-3xl font-bold text-white">100%</p>
                <p class="text-neutral-400 mt-1">Open Source</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-white">0</p>
                <p class="text-neutral-400 mt-1">Monthly Fees</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-white">Your</p>
                <p class="text-neutral-400 mt-1">Data Stays Yours</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-white">Self</p>
                <p class="text-neutral-400 mt-1">Hostable</p>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="w-full max-w-[1200px] px-6 py-24">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to manage your money</h2>
            <p class="text-neutral-400 text-lg max-w-2xl mx-auto">Simple yet powerful features designed to give you complete visibility into your spending habits.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature 1 -->
            <div class="p-6 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Spending Analytics</h3>
                <p class="text-neutral-400">Visualize your spending with interactive charts. See where your money goes with category breakdowns and trends over time.</p>
            </div>
            <!-- Feature 2 -->
            <div class="p-6 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Easy Import</h3>
                <p class="text-neutral-400">Import your bank statements with a simple CSV upload. Support for multiple Norwegian banks including Bulder and DNB.</p>
            </div>
            <!-- Feature 3 -->
            <div class="p-6 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Smart Categories</h3>
                <p class="text-neutral-400">Organize transactions with categories and subcategories. Drill down into your spending to understand exactly where your money goes.</p>
            </div>
            <!-- Feature 4 -->
            <div class="p-6 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div class="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Month Comparison</h3>
                <p class="text-neutral-400">Compare your spending and income month-over-month. See if you're improving and track your progress toward financial goals.</p>
            </div>
            <!-- Feature 5 -->
            <div class="p-6 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div class="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Privacy First</h3>
                <p class="text-neutral-400">Your financial data never leaves your control. Self-host on your own server or use our hosted version - your choice.</p>
            </div>
            <!-- Feature 6 -->
            <div class="p-6 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div class="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Date Filtering</h3>
                <p class="text-neutral-400">Filter your transactions and analytics by any date range. View weekly, monthly, or yearly summaries with a click.</p>
            </div>
        </div>
    </section>

    <!-- Open Source Section -->
    <section class="w-full bg-gradient-to-b from-neutral-900 to-neutral-800">
        <div class="max-w-[1200px] mx-auto px-6 py-24">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-4">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Open Source
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Built in the open, for everyone</h2>
                    <p class="text-neutral-400 text-lg mb-6">
                        We believe financial tools should be transparent. Our entire codebase is open source, meaning you can inspect every line of code, contribute improvements, or fork it to build your own version.
                    </p>
                    <ul class="space-y-3 text-neutral-300">
                        <li class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Full source code available on GitHub
                        </li>
                        <li class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Community-driven development
                        </li>
                        <li class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            No hidden tracking or analytics
                        </li>
                        <li class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Contributions welcome
                        </li>
                    </ul>
                </div>
                <div class="bg-neutral-900 rounded-xl border border-neutral-800 p-6 font-mono text-sm">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div class="space-y-2 text-neutral-300">
                        <p><span class="text-neutral-500">$</span> git clone https://github.com/ErikAndreasKlokk/budgeting.git</p>
                        <p><span class="text-neutral-500">$</span> cd budgeting</p>
                        <p><span class="text-neutral-500">$</span> npm install</p>
                        <p><span class="text-neutral-500">$</span> npm run dev</p>
                        <p class="text-emerald-400 mt-4">Ready at http://localhost:5173</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Self-Host Section -->
    <section class="w-full bg-neutral-800">
        <div class="max-w-[1200px] mx-auto px-6 py-24">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Host it yourself</h2>
                <p class="text-neutral-400 text-lg max-w-2xl mx-auto">
                    Deploy on your own infrastructure in minutes. Your data never touches our servers - complete privacy and control.
                </p>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                    <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-white mb-2">Docker Ready</h3>
                    <p class="text-neutral-400">Deploy with a single docker-compose command. Pre-configured for production use with PostgreSQL.</p>
                </div>
                <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                    <div class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-white mb-2">Easy Configuration</h3>
                    <p class="text-neutral-400">Simple environment variables for all settings. No complicated setup or hidden requirements.</p>
                </div>
                <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                    <div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-white mb-2">Your Infrastructure</h3>
                    <p class="text-neutral-400">Run on any VPS, home server, or cloud provider. You control where your financial data lives.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="w-full bg-neutral-900">
        <div class="max-w-[1200px] mx-auto px-6 py-24">
            <div class="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-neutral-800 p-12">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to take control?</h2>
                <p class="text-neutral-400 text-lg max-w-xl mx-auto mb-8">
                    Start tracking your finances today. No credit card required. No hidden fees. Just you and your money.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/auth" class="px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors">
                        Get Started Free
                    </a>
                    <a href="https://github.com/ErikAndreasKlokk/budgeting" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-lg transition-colors border border-neutral-700">
                        Star on GitHub
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="w-full border-t border-neutral-800">
        <div class="max-w-[1200px] mx-auto px-6 py-12">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="flex items-center gap-2">
                    <span class="text-xl font-bold text-white">Budgeting</span>
                    <span class="text-neutral-500">|</span>
                    <span class="text-neutral-400 text-sm">Open Source Personal Finance</span>
                </div>
                <div class="flex items-center gap-6 text-neutral-400 text-sm">
                    <a href="https://github.com/ErikAndreasKlokk/budgeting" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">GitHub</a>
                    <a href="/auth" class="hover:text-white transition-colors">Sign In</a>
                </div>
            </div>
        </div>
    </footer>
</main>

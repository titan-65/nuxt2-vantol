<script setup lang="ts">
import { computed } from "vue";
import { LIVE_STAGE, STAGES, STAGE_COUNT } from "./stages";
import "./style.css";

const props = withDefaults(
  defineProps<{
    stage?: number;
    embed?: boolean;
  }>(),
  {
    stage: LIVE_STAGE,
    embed: false,
  },
);

const requestedStage = computed(() =>
  Math.min(Math.max(Number(props.stage) || LIVE_STAGE, 1), STAGE_COUNT),
);

const currentStage = computed(() => STAGES[LIVE_STAGE - 1]);
const nextStage = computed(() => STAGES[LIVE_STAGE]);
const seriesUrl = "https://vantolbennett.vercel.app/learn/void";

const pad = (n: number) => String(n).padStart(2, "0");
</script>

<template>
  <div class="jumble" :class="{ embed }">
    <div class="shell">
      <header class="site-header">
        <a class="brand" href="/" aria-label="Jumble Cookies home">
          Jumble<span class="brand-dot" aria-hidden="true" />
        </a>

        <nav class="site-nav" aria-label="Jumble">
          <a href="#build">The build</a>
          <a href="#roadmap">Roadmap</a>
          <a :href="seriesUrl" target="_blank" rel="noopener noreferrer">Read the series</a>
        </nav>

        <div class="header-right">
          <span class="stage-pill">Stage {{ pad(LIVE_STAGE) }} / {{ pad(STAGE_COUNT) }}</span>
          <a
            class="header-link"
            :href="seriesUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the series ↗
          </a>
        </div>
      </header>

      <main>
        <p
          v-if="requestedStage > LIVE_STAGE"
          class="stage-pill"
          style="margin-top: 18px"
        >
          Stage {{ pad(requestedStage) }} is not live yet — showing stage
          {{ pad(LIVE_STAGE) }}
        </p>

        <section class="hero">
          <div>
            <h1 class="hero-title">Cookies worth the detour.</h1>
            <p class="hero-copy">
              Jumble is a small-batch Jamaican cookie shop, built in public as the running example
              for the Void series. Every lesson ships one real stage of this app — no screenshots,
              no separate mockups.
            </p>
            <div class="hero-actions">
              <a class="btn" href="#build">See what is live</a>
              <a
                class="btn btn-ghost"
                :href="seriesUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the series
              </a>
            </div>
            <p class="hero-note">
              Live stage {{ pad(LIVE_STAGE) }} / {{ pad(STAGE_COUNT) }} · {{ currentStage.title }} ·
              Void + Vue
            </p>
          </div>

          <div class="hero-art">
            <svg
              class="cookie-art"
              viewBox="0 0 360 360"
              fill="none"
              role="img"
              aria-label="A Jumble cookie"
            >
              <defs>
                <radialGradient id="jumble-cookie" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(154 140) rotate(54.7) scale(206)">
                  <stop stop-color="#E9BE75" />
                  <stop offset="0.62" stop-color="#D9A45B" />
                  <stop offset="1" stop-color="#C88B46" />
                </radialGradient>
                <linearGradient id="jumble-edge" x1="180" y1="28" x2="180" y2="336" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#F2CE8C" />
                  <stop offset="1" stop-color="#B9783C" />
                </linearGradient>
              </defs>
              <circle cx="180" cy="180" r="156" fill="url(#jumble-edge)" />
              <circle cx="180" cy="176" r="150" fill="url(#jumble-cookie)" />
              <circle cx="120" cy="118" r="15" fill="#5A3322" />
              <circle cx="226" cy="102" r="11" fill="#5A3322" />
              <circle cx="256" cy="184" r="15" fill="#5A3322" />
              <circle cx="194" cy="202" r="10" fill="#5A3322" />
              <circle cx="120" cy="238" r="12" fill="#5A3322" />
              <circle cx="172" cy="276" r="15" fill="#5A3322" />
              <circle cx="248" cy="262" r="9" fill="#5A3322" />
              <circle cx="92" cy="174" r="8" fill="#5A3322" />
              <circle cx="206" cy="148" r="7" fill="#5A3322" />
              <path
                d="M146 224c11 13 30 20 48 17"
                stroke="#B9783C"
                stroke-opacity="0.5"
                stroke-width="5"
                stroke-linecap="round"
              />
            </svg>

            <div class="stage-stamp" aria-hidden="true">
              <span>{{ pad(LIVE_STAGE) }}</span>
              <small>stage</small>
            </div>
          </div>
        </section>

        <div class="marquee" aria-hidden="true">
          <span>Sorrel</span><span>·</span><span>Coconut</span><span>·</span><span>Guava</span
          ><span>·</span><span>Blue Mountain</span><span>·</span><span>Ginger</span
          ><span>·</span><span>Lime</span><span>·</span><span>Brown sugar</span><span>·</span>
          <span>Sorrel</span><span>·</span><span>Coconut</span><span>·</span><span>Guava</span
          ><span>·</span><span>Blue Mountain</span>
        </div>

        <section id="build" class="build">
          <div class="section-head">
            <h2>What is live right now.</h2>
            <p>
              Stage one is the foundation: the brand shell, the Void app, and the stage route that
              every future lesson will embed.
            </p>
          </div>

          <div class="build-grid">
            <article class="build-card">
              <span class="card-index">01</span>
              <h3>Void + Vue</h3>
              <p>One Vite app with Void Pages, a typed loader, and Vue components.</p>
              <span class="card-meta">Live</span>
            </article>
            <article class="build-card">
              <span class="card-index">02</span>
              <h3>Stage route</h3>
              <p><code>/preview/:stage</code> is the actual app, not a screenshot.</p>
              <span class="card-meta">Live</span>
            </article>
            <article class="build-card">
              <span class="card-index">03</span>
              <h3>Ready for D1</h3>
              <p>The database is scaffolded. The weekly menu lands in stage two.</p>
              <span class="card-meta">Next</span>
            </article>
          </div>
        </section>

        <section id="roadmap" class="roadmap">
          <div class="section-head">
            <h2>Eight stages, one app.</h2>
            <p>
              The final storefront is the same code with every feature unlocked. Until then, each
              stage is a real route you can click through.
            </p>
          </div>

          <div class="roadmap-grid">
            <article
              v-for="s in STAGES"
              :key="s.n"
              class="stage-card"
              :class="{ 'is-current': s.n === LIVE_STAGE }"
            >
              <span class="stage-n">{{ pad(s.n) }}</span>
              <h3>{{ s.title }}</h3>
              <p>{{ s.detail }}</p>
              <span class="stage-state" :class="{ soon: s.n !== LIVE_STAGE }">
                {{ s.n === LIVE_STAGE ? "Live now" : "Next" }}
              </span>
            </article>
          </div>
        </section>

        <div v-if="nextStage" class="next-note">
          <p>
            <strong>Next up:</strong> {{ nextStage.title }} — {{ nextStage.detail }}. The menu
            moves into D1 and the storefront gets its first real data.
          </p>
          <a :href="seriesUrl" target="_blank" rel="noopener noreferrer">Follow the build →</a>
        </div>
      </main>

      <footer class="site-footer">
        <div>
          <span class="brand">Jumble<span class="brand-dot" aria-hidden="true" /></span>
          <p>Kingston, Jamaica · Small-batch cookies</p>
        </div>
        <div class="footer-meta">
          <span>Built on Void</span>
          <span>Stage {{ pad(LIVE_STAGE) }} / {{ pad(STAGE_COUNT) }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

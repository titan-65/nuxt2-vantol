<script setup lang="ts">
const colorMode = useState("colorMode", () => "dark");

const toggleDarkMode = () => {
  colorMode.value = colorMode.value === "dark" ? "light" : "dark";
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", colorMode.value === "dark");
    document.documentElement.style.colorScheme = colorMode.value;
    localStorage.setItem("colorMode", colorMode.value);
  }
};

onMounted(() => {
  const saved = localStorage.getItem("colorMode");
  colorMode.value = saved || "dark";
  document.documentElement.classList.toggle("dark", colorMode.value === "dark");
  document.documentElement.style.colorScheme = colorMode.value;
});
</script>

<template>
  <button
    type="button"
    class="grid h-9 w-9 place-items-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    aria-label="Toggle color theme"
    @click="toggleDarkMode"
  >
    <svg
      class="hidden h-4 w-4 dark:block"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        stroke-linecap="round"
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
    <svg
      class="block h-4 w-4 dark:hidden"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
      />
    </svg>
  </button>
</template>

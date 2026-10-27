<script setup lang="ts">
const error = useError();

const handleGoHome = () => {
  clearError({ redirect: "/" });
};

const handleGoBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    handleGoHome();
  }
};
</script>

<template>
  <div class="min-h-screen bg-muted dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-lg w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-brand dark:text-brand">
          {{ error?.statusCode || "404" }}
        </h1>
      </div>

      <h2 class="text-2xl md:text-3xl font-bold text-foreground dark:text-foreground mb-4">
        <template v-if="error?.statusCode === 404"> Page Not Found </template>
        <template v-else> Something went wrong </template>
      </h2>

      <p class="text-muted-foreground dark:text-muted-foreground mb-8">
        <template v-if="error?.statusCode === 404">
          The page you're looking for doesn't exist or has been moved.
        </template>
        <template v-else>
          {{ error?.message || "An unexpected error occurred." }}
        </template>
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="handleGoBack"
          class="px-6 py-3 bg-gray-200 dark:bg-muted text-foreground dark:text-foreground font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Go Back
        </button>
        <button
          @click="handleGoHome"
          class="px-6 py-3 bg-brand text-brand-foreground font-semibold rounded-lg hover:bg-brand-hover transition-colors"
        >
          Go Home
        </button>
      </div>

      <div class="mt-12">
        <p class="text-muted-foreground dark:text-muted-foreground text-sm">
          Looking for something specific? Try our
          <NuxtLink to="/blog" class="text-brand dark:text-brand hover:underline"
            >blog</NuxtLink
          >
          or
          <NuxtLink to="/projects" class="text-brand dark:text-brand hover:underline"
            >projects</NuxtLink
          >.
        </p>
      </div>
    </div>
  </div>
</template>

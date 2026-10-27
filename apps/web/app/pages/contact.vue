<script setup lang="ts">
import { Mail, Twitter, Github, Linkedin } from "lucide-vue-next";

useSeoMeta({
  title: "Contact - VantolBennett",
  description: "Get in touch with Vantol R. Bennett",
});

const socials = [
  {
    name: "Email",
    icon: Mail,
    href: "mailto:vantolbennett@gmail.com",
    label: "vantolbennettclm@gmail.com",
    description: "Send me an email",
  },
  {
    name: "Bluesky",
    icon: Twitter,
    href: "https://bsky.app/profile/vantolbennett.bsky.social",
    label: "@vantolbennett.bsky.social",
    description: "Follow me on Twitter",
  },
  {
    name: "GitHub",
    icon: Github,
    href: "https://github.com/titan-65",
    label: "titan-65",
    description: "Check out my projects",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/in/vantolbennett",
    label: "vantolbennett",
    description: "Connect on LinkedIn",
  },
];

const formData = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const handleSubmit = () => {
  console.log("Form submitted:", formData.value);
};
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans">
    <!-- Hero Section -->
    <section class="py-20 border-b border-border">
      <div class="max-w-[1088px] mx-auto px-6">
        <div class="max-w-3xl">
          <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Get In Touch
          </p>
          <h1 class="text-5xl md:text-6xl font-semibold tracking-tight mb-8">Contact Me</h1>
          <p
            class="text-xl text-muted-foreground font-light leading-relaxed border-l-2 border-border pl-6"
          >
            Have a question or want to work together? Feel free to reach out!
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form & Social Links Section -->
    <section class="py-16 md:py-24">
      <div class="max-w-[1088px] mx-auto px-6">
        <div class="grid gap-12 lg:grid-cols-2">
          <!-- Contact Form -->
          <div>
            <div class="mb-8">
              <h2 class="text-2xl font-semibold mb-2">Send a Message</h2>
              <p class="text-muted-foreground font-light">
                Fill out the form below and I'll get back to you.
              </p>
            </div>

            <form
              @submit.prevent="handleSubmit"
              class="space-y-6 border border-border p-8 bg-card rounded-xl"
            >
              <div class="space-y-2">
                <label
                  for="name"
                  class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Name</label
                >
                <input
                  id="name"
                  v-model="formData.name"
                  placeholder="Your name"
                  required
                  class="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder-zinc-600 focus:outline-none focus:border-blue transition-colors rounded-lg"
                />
              </div>

              <div class="space-y-2">
                <label
                  for="email"
                  class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Email</label
                >
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  class="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder-zinc-600 focus:outline-none focus:border-blue transition-colors rounded-lg"
                />
              </div>

              <div class="space-y-2">
                <label
                  for="subject"
                  class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Subject</label
                >
                <input
                  id="subject"
                  v-model="formData.subject"
                  placeholder="What's this about?"
                  required
                  class="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder-zinc-600 focus:outline-none focus:border-blue transition-colors rounded-lg"
                />
              </div>

              <div class="space-y-2">
                <label
                  for="message"
                  class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Message</label
                >
                <textarea
                  id="message"
                  v-model="formData.message"
                  placeholder="Your message..."
                  rows="6"
                  required
                  class="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder-zinc-600 focus:outline-none focus:border-blue transition-colors resize-none rounded-lg"
                ></textarea>
              </div>

              <button
                type="submit"
                class="w-full bg-brand text-brand-foreground py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors rounded-lg"
              >
                Send Message
              </button>
            </form>
          </div>

          <!-- Social Links -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-semibold mb-2">Connect With Me</h2>
              <p class="text-muted-foreground font-light">
                Prefer social media? You can find me on these platforms.
              </p>
            </div>

            <div class="grid gap-4">
              <a
                v-for="social in socials"
                :key="social.name"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-6 p-6 border border-border bg-card rounded-xl hover:border-border-strong transition-all"
              >
                <div
                  class="p-3 bg-muted rounded-lg group-hover:bg-brand group-hover:text-brand-foreground transition-colors"
                >
                  <component :is="social.icon" class="h-6 w-6" />
                </div>
                <div>
                  <h3 class="font-semibold mb-1">{{ social.name }}</h3>
                  <p class="text-sm text-muted-foreground mb-1">{{ social.description }}</p>
                  <p class="text-xs font-bold text-blue">{{ social.label }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

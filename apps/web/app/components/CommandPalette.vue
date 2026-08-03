<script setup lang="ts">
import {
  Home,
  FileText,
  FolderOpen,
  Image,
  Compass,
  User,
  Wrench,
  Mail,
  BarChart3,
  BookOpen,
  Search,
  MessageSquare,
} from "lucide-vue-next";

const isOpen = ref(false);
const searchQuery = ref("");
const selectedIndex = ref(0);

const pages = [
  { name: "Home", to: "/", icon: Home, group: "Navigation" },
  { name: "Blog", to: "/blog", icon: FileText, group: "Navigation" },
  { name: "Learn", to: "/learn", icon: BookOpen, group: "Navigation" },
  { name: "Projects", to: "/projects", icon: FolderOpen, group: "Navigation" },
  { name: "Publications", to: "/publications", icon: FileText, group: "Navigation" },
  { name: "Gallery", to: "/gallery", icon: Image, group: "Navigation" },
  { name: "Explore", to: "/explore", icon: Compass, group: "Navigation" },
  { name: "About", to: "/about", icon: User, group: "Navigation" },
  { name: "Uses", to: "/uses", icon: Wrench, group: "Navigation" },
  { name: "Contact", to: "/contact", icon: Mail, group: "Navigation" },
  { name: "Blog Stats", to: "/stats", icon: BarChart3, group: "Navigation" },
  { name: "Guestbook", to: "/guestbook", icon: MessageSquare, group: "Navigation" },
  { name: "Saved Posts", to: "/bookmarks", icon: BookOpen, group: "Navigation" },
];

const { data: allPosts } = await useAsyncData("cmd-posts", () => {
  return queryCollection("blog").all() as Promise<any[]>;
});

const postItems = computed(() => {
  return (allPosts.value || []).map((post) => ({
    name: post.title,
    to: `/blog/${post.path?.split("/").pop()}`,
    icon: FileText,
    group: "Posts",
  }));
});

const allItems = computed(() => [...pages, ...postItems.value]);

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return pages;
  const q = searchQuery.value.toLowerCase();
  return allItems.value.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 10);
});

const groupedItems = computed(() => {
  const groups: Record<string, typeof filteredItems.value> = {};
  for (const item of filteredItems.value) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group]!.push(item);
  }
  return groups;
});

const flatItems = computed(() => filteredItems.value);

watch(searchQuery, () => {
  selectedIndex.value = 0;
});

const open = () => {
  isOpen.value = true;
  searchQuery.value = "";
  selectedIndex.value = 0;
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const navigate = (to: string) => {
  close();
  navigateTo(to);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, flatItems.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const item = flatItems.value[selectedIndex.value];
    if (item) navigate(item.to);
  }
};

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (isOpen.value) {
        close();
      } else {
        open();
      }
    }
    if (e.key === "Escape" && isOpen.value) {
      close();
    }
  };
  document.addEventListener("keydown", handler);
  onUnmounted(() => {
    document.removeEventListener("keydown", handler);
  });
});

defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-100 overflow-y-auto">
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="close" />
      <div class="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div
          class="relative w-full max-w-lg bg-[#111] border border-white/10 shadow-2xl rounded-xl overflow-hidden"
          @keydown="handleKeydown"
        >
          <!-- Search Input -->
          <div class="flex items-center border-b border-white/10 px-4 py-3">
            <Search class="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search pages and posts..."
              class="w-full ml-3 bg-transparent outline-none text-sm text-white placeholder-zinc-500 font-mono"
              autofocus
            />
            <kbd
              class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-zinc-500 border border-white/10 rounded"
            >
              ESC
            </kbd>
          </div>

          <!-- Results -->
          <div class="max-h-80 overflow-y-auto py-2">
            <div
              v-if="filteredItems.length === 0"
              class="px-4 py-8 text-center text-sm text-zinc-500 font-mono"
            >
              No results for "{{ searchQuery }}"
            </div>

            <template v-for="(items, group) in groupedItems" :key="group">
              <div class="px-4 pt-3 pb-1">
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{{
                  group
                }}</span>
              </div>
              <button
                v-for="(item, idx) in items"
                :key="item.to"
                @click="navigate(item.to)"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                :class="
                  flatItems.indexOf(item) === selectedIndex
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-300 hover:bg-white/5'
                "
              >
                <component
                  :is="item.icon"
                  class="w-4 h-4 shrink-0"
                  :class="
                    flatItems.indexOf(item) === selectedIndex ? 'text-[#f5c542]' : 'text-zinc-500'
                  "
                />
                <span class="text-sm font-medium truncate">{{ item.name }}</span>
              </button>
            </template>
          </div>

          <!-- Footer -->
          <div class="border-t border-white/10 px-4 py-2.5 flex items-center justify-between">
            <div class="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
              <span class="flex items-center gap-1">
                <kbd class="px-1 py-0.5 border border-white/10 rounded text-[9px]">↑↓</kbd> navigate
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1 py-0.5 border border-white/10 rounded text-[9px]">↵</kbd> open
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1 py-0.5 border border-white/10 rounded text-[9px]">esc</kbd> close
              </span>
            </div>
            <span class="text-[10px] font-mono text-zinc-600"
              >{{ filteredItems.length }} results</span
            >
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

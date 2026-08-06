import { ref as dbRef, onValue, get, child } from "firebase/database";
import type { Database, Unsubscribe } from "firebase/database";

export interface PostStat {
  slug: string;
  title: string;
  views: number;
  likes: number;
  commentCount: number;
}

export const useBlogStats = () => {
  const nuxtApp = useNuxtApp();

  const stats = useState<PostStat[]>("blog:stats", () => []);
  const totalViews = useState<number>("blog:totalViews", () => 0);
  const totalLikes = useState<number>("blog:totalLikes", () => 0);
  const totalComments = useState<number>("blog:totalComments", () => 0);
  const loading = useState<boolean>("blog:stats:loading", () => true);

  let unsubscribe: Unsubscribe | null = null;

  const init = async (posts: Array<{ path: string; title: string }>) => {
    if (import.meta.server) return;

    const db = nuxtApp.$firebaseDatabase as Database;
    if (!db) return;

    const postsRef = dbRef(db, "posts");

    unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val() || {};

      const postStats: PostStat[] = posts.map((post) => {
        const slug = post.path?.split("/").pop() || "";
        const postData = data[slug] || {};

        const views = postData.views || 0;
        const likes = postData.likes ? Object.keys(postData.likes).length : 0;
        const commentCount = postData.comments ? Object.keys(postData.comments).length : 0;

        return { slug, title: post.title, views, likes, commentCount };
      });

      // Sort by views descending
      postStats.sort((a, b) => b.views - a.views);

      stats.value = postStats;
      totalViews.value = postStats.reduce((sum, p) => sum + p.views, 0);
      totalLikes.value = postStats.reduce((sum, p) => sum + p.likes, 0);
      totalComments.value = postStats.reduce((sum, p) => sum + p.commentCount, 0);
      loading.value = false;
    });
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  return {
    stats,
    totalViews,
    totalLikes,
    totalComments,
    loading,
    init,
    cleanup,
  };
};

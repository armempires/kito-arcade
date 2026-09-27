import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types/blog';
import { INITIAL_BLOG_POSTS } from '../data/initialBlogPosts';
import { supabase } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'kito_arcade_blog_posts_v10';

const sanitizePost = (post: BlogPost): BlogPost => {
  let cover = post.cover_image || '';
  if (cover.includes('card_gestor_os_web.jpg')) cover = cover.replace('.jpg', '.png');
  if (cover.includes('card_kito_trainner_web.jpg')) cover = cover.replace('.jpg', '.png');
  if (cover.includes('card_kito_esportes.jpg')) cover = cover.replace('.jpg', '.png');
  if (post.id === 'post-sites-conversao') {
    cover = '/assets/hero_banner_sites_apps.jpg';
  }

  let avatar = post.author_avatar || '/assets/kito-avatar-mech.png';
  if (avatar.includes('card_kito_expert.jpg')) avatar = '/assets/kito-avatar-mech.png';

  let content = post.content || '';
  if (content.includes('kito-trainner-web.png')) {
    content = content.replace(/\/assets\/kito-trainner-web\.png/g, '/assets/covers/card_kto_personal.png');
  }
  if (post.id === 'post-kito-esportes' && content.includes('card_calculadora_pro.png')) {
    content = content.replace(/\/assets\/covers\/card_calculadora_pro\.png/g, '/assets/covers/kito_esportes_odds_board.png');
  }

  return {
    ...post,
    cover_image: cover,
    author_avatar: avatar,
    content
  };
};

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed: BlogPost[] = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map(sanitizePost);
          // Preserve custom user-created posts and combine with updated initial posts
          const initialIds = new Set(INITIAL_BLOG_POSTS.map(p => p.id));
          const customPosts = sanitized.filter(p => !initialIds.has(p.id));
          const updatedInitials = INITIAL_BLOG_POSTS.map(sanitizePost);
          const merged = [...updatedInitials, ...customPosts];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {
      // Fallback
    }
    const fresh = INITIAL_BLOG_POSTS.map(sanitizePost);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
    return fresh;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync from Supabase on mount
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map Supabase columns to BlogPost
        const mappedPosts: BlogPost[] = data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          cover_image: item.cover_image,
          category: item.category,
          category_slug: item.category_slug,
          tags: item.tags || [],
          author_name: item.author_name || 'Kito Expert',
          author_avatar: item.author_avatar || '/assets/covers/card_kito_expert.jpg',
          author_role: item.author_role || 'Especialista Kito',
          reading_time_minutes: item.reading_time_minutes || 4,
          views_count: item.views_count || 0,
          shares_count: item.shares_count || 0,
          is_published: item.is_published ?? true,
          is_featured: item.is_featured ?? false,
          related_project_id: item.related_project_id,
          published_at: item.published_at || new Date().toISOString(),
          updated_at: item.updated_at
        }));

        setPosts(mappedPosts);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedPosts));
      } else {
        // If supabase has no table or records yet, initialize with INITIAL_BLOG_POSTS
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!local) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
        }
      }
    } catch (err) {
      console.warn('Supabase fetchPosts fallback to local storage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const saveToLocal = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPosts));
    } catch (e) {
      console.error('Error saving blog posts to localStorage', e);
    }
  };

  const createPost = async (postData: Omit<BlogPost, 'id' | 'views_count' | 'shares_count' | 'published_at'>) => {
    const newPost: BlogPost = {
      ...postData,
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      views_count: 0,
      shares_count: 0,
      published_at: new Date().toISOString()
    };

    const updated = [newPost, ...posts];
    saveToLocal(updated);

    // Try saving to Supabase
    try {
      await supabase.from('blog_posts').insert([{
        slug: newPost.slug,
        title: newPost.title,
        excerpt: newPost.excerpt,
        content: newPost.content,
        cover_image: newPost.cover_image,
        category: newPost.category,
        category_slug: newPost.category_slug,
        tags: newPost.tags,
        author_name: newPost.author_name,
        author_avatar: newPost.author_avatar,
        author_role: newPost.author_role,
        reading_time_minutes: newPost.reading_time_minutes,
        views_count: 0,
        shares_count: 0,
        is_published: newPost.is_published,
        is_featured: newPost.is_featured,
        related_project_id: newPost.related_project_id,
        published_at: newPost.published_at
      }]);
    } catch (err) {
      console.warn('Could not insert post to Supabase:', err);
    }

    return newPost;
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    const updated = posts.map(p => {
      if (p.id === id) {
        return { ...p, ...updates, updated_at: new Date().toISOString() };
      }
      return p;
    });

    saveToLocal(updated);

    try {
      await supabase
        .from('blog_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Could not update post in Supabase:', err);
    }
  };

  const deletePost = async (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    saveToLocal(updated);

    try {
      await supabase.from('blog_posts').delete().eq('id', id);
    } catch (err) {
      console.warn('Could not delete post from Supabase:', err);
    }
  };

  const incrementViews = (id: string) => {
    const updated = posts.map(p => {
      if (p.id === id) {
        return { ...p, views_count: (p.views_count || 0) + 1 };
      }
      return p;
    });
    saveToLocal(updated);
  };

  return {
    posts,
    isLoading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    incrementViews
  };
};

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML formatted text
  cover_image: string;
  category: string;
  category_slug: string;
  tags: string[];
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  reading_time_minutes: number;
  views_count: number;
  shares_count?: number;
  is_published: boolean;
  is_featured?: boolean;
  related_project_id?: string; // Links to a project in REAL_PROJECTS (e.g. 'gestor-os-web', 'kito-esportes')
  published_at: string;
  updated_at?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

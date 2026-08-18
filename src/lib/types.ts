export type Category = {
  id: string;
  slug: string;
  name: string;
  color: string;
  order: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  category?: Category | null;
  image: string;
  author: string;
  status: "draft" | "pending" | "published" | "rejected";
  breaking: boolean;
  featured: boolean;
  publishedAt: string | null;
  views: number;
};

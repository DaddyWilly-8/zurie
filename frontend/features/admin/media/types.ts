export type AdminMediaItem = {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  folder: string | null;
  used_in: string[] | null;
  created_at: string;
};

export type MediaListResult = {
  data: AdminMediaItem[];
  count: number;
};

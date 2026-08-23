import { mediaService } from "@/services/media/media.service";
import type { AdminMediaItem, MediaListResult } from "./types";

const pageSize = 20;

export const mediaActions = {
  pageSize,

  async list(page: number, search: string): Promise<MediaListResult> {
    const payload = await mediaService.listMedia({
      page,
      pageSize,
      search: search.trim() || undefined,
    });

    return {
      data: (payload.data ?? []) as AdminMediaItem[],
      count: payload.count ?? 0,
    };
  },

  upload(file: File, folder: string) {
    return mediaService.upload(file, folder);
  },

  remove(id: string) {
    return mediaService.remove(id);
  },
};

import { apiFetch } from "@/lib/api";

export type SaveableEntityType = "ALBUM" | "TRACK" | "PLAYLIST";

export async function saveItem(
  entityType: SaveableEntityType,
  entityId: string,
): Promise<void> {
  await apiFetch("/saved-items", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId }),
  });
}

export async function unsaveItem(
  entityType: SaveableEntityType,
  entityId: string,
): Promise<void> {
  await apiFetch(`/saved-items?entityType=${entityType}&entityId=${entityId}`, {
    method: "DELETE",
  });
}

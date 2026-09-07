import { apiFetch } from "@/lib/api";

export type LikeableEntityType =
  "EDITORIAL" | "REVIEW" | "NOTE" | "PLAYLIST" | "SERIES";

export async function likeEntity(
  entityType: LikeableEntityType,
  entityId: string,
): Promise<void> {
  await apiFetch("/likes", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId }),
    // LikeButton debounces this call ~400ms after the click — small enough
    // a body that a browser navigation/reload right after clicking can still
    // outrace it and abort the request mid-flight. keepalive tells the
    // browser to let it finish in the background instead of cancelling it.
    keepalive: true,
  });
}

export async function unlikeEntity(
  entityType: LikeableEntityType,
  entityId: string,
): Promise<void> {
  await apiFetch(`/likes?entityType=${entityType}&entityId=${entityId}`, {
    method: "DELETE",
    keepalive: true,
  });
}

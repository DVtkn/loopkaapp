export async function uploadPhotoApi(formData: FormData, token: string): Promise<any> {
  const res = await fetch("/api/photos/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return await res.json();
}

export async function fetchPhotosListApi(coupleId: string, token: string): Promise<any> {
  const res = await fetch(`/api/photos/list/${encodeURIComponent(coupleId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function deletePhotoApi(photoId: string, token: string): Promise<any> {
  const res = await fetch(`/api/photos/${encodeURIComponent(photoId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

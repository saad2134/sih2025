"""Uploadcare file management service."""

import httpx
from app.config import settings


UPLOADCARE_API_BASE = "https://api.uploadcare.com"


async def delete_uploadcare_file(file_uuid: str) -> bool:
    """
    Delete a file from Uploadcare using the REST API.
    Returns True on success, False if the file was not found or deletion failed.
    """
    if not file_uuid or not getattr(settings, "UPLOADCARE_SECRET_KEY", None):
        return False

    url = f"{UPLOADCARE_API_BASE}/files/{file_uuid}/"
    headers = {
        "Accept": "application/vnd.uploadcare-v0.7+json",
        "Authorization": f"Uploadcare.Simple {settings.UPLOADCARE_PUBLIC_KEY}:{settings.UPLOADCARE_SECRET_KEY}",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.delete(url, headers=headers)
            return response.status_code in (200, 204)
    except Exception:
        return False

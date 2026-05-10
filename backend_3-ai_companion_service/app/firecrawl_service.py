import httpx
import logging
from typing import List, Dict, Optional
from .config import settings

logger = logging.getLogger(__name__)


class FirecrawlService:
    def __init__(self):
        self.api_key = settings.FIRECRAWL_API_KEY
        self.base_url = "https://api.firecrawl.dev/v1"

    async def scrape_url(self, url: str) -> Dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {"url": url, "formats": ["markdown", "text"]}

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/scrape", headers=headers, json=payload
                )
                data = response.json()
                return self._parse_scrape_result(data)
            except Exception:
                logger.exception("Firecrawl scrape failed for url=%s", url)
                return {"error": "Unable to scrape URL at this time", "success": False}

    def _parse_scrape_result(self, data: Dict) -> Dict:
        if data.get("success") and data.get("data"):
            return {
                "content": data["data"].get("markdown", ""),
                "text": data["data"].get("text", ""),
                "url": data["data"].get("url", ""),
                "success": True,
            }
        return {"error": "Failed to scrape", "success": False}

    async def crawl(self, url: str, limit: int = 5) -> List[Dict]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "url": url,
            "limit": limit,
            "scrapeOptions": {"formats": ["markdown", "text"]},
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/crawl", headers=headers, json=payload
                )
                data = response.json()
                return self._parse_crawl_results(data)
            except Exception:
                logger.exception("Firecrawl crawl failed for url=%s limit=%s", url, limit)
                return [{"error": "Unable to crawl URL at this time", "success": False}]

    def _parse_crawl_results(self, data: Dict) -> List[Dict]:
        results = []
        if data.get("success") and data.get("data"):
            for item in data["data"]:
                results.append(
                    {
                        "url": item.get("url", ""),
                        "content": item.get("markdown", ""),
                        "title": item.get("metadata", {}).get("title", ""),
                        "success": True,
                    }
                )
        return results

    async def search_educational_content(self, topic: str) -> Dict:
        query_url = (
            f"https://www.google.com/search?q={topic}+tutorial+site:edu+OR+site:gov"
        )
        return await self.scrape_url(query_url)

    async def get_course_details(self, course_url: str) -> Dict:
        return await self.scrape_url(course_url)


firecrawl_service = FirecrawlService()

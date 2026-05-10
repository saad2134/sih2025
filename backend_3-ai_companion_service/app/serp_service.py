import httpx
import logging
from typing import List, Dict, Optional
from .config import settings

logger = logging.getLogger(__name__)


class SerpService:
    def __init__(self):
        self.api_key = settings.SERP_API_KEY
        self.base_url = "https://serpapi.com/search.json"

    async def search_courses(
        self,
        query: str,
        location: str = "India",
        language: str = "hi",
        country: str = "in",
        domain: str = "google.co.in",
        num: int = 10,
    ) -> List[Dict]:
        params = {
            "q": query,
            "location": location,
            "hl": language,
            "gl": country,
            "google_domain": domain,
            "api_key": self.api_key,
            "num": num,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(self.base_url, params=params)
                data = response.json()
                return self._parse_results(data)
            except Exception:
                logger.exception("Failed to fetch course search results from SerpAPI")
                return [{"error": "Unable to fetch course results at this time."}]

    def _parse_results(self, data: Dict) -> List[Dict]:
        results = []
        organic_results = data.get("organic_results", [])

        for result in organic_results:
            results.append(
                {
                    "title": result.get("title", ""),
                    "link": result.get("link", ""),
                    "snippet": result.get("snippet", ""),
                    "source": result.get("source", ""),
                    "position": result.get("position", 0),
                }
            )

        return results

    async def search_online_courses(self, topic: str) -> List[Dict]:
        query = f"online courses {topic} India"
        return await self.search_courses(query)

    async def search_free_courses(self, topic: str) -> List[Dict]:
        query = f"free online courses {topic} India"
        return await self.search_courses(query)

    async def search_certifications(self, topic: str) -> List[Dict]:
        query = f"certification courses {topic} India"
        return await self.search_courses(query)

    async def search_ugc_courses(self, topic: str) -> List[Dict]:
        query = f"UGC approved courses {topic} India"
        return await self.search_courses(query)


serp_service = SerpService()

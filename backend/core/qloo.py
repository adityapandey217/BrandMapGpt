import aiohttp
import asyncio
import logging
from typing import Dict, List, Optional, Any
from django.conf import settings

logger = logging.getLogger(__name__)

class QlooAPIClient:
    """An async Qloo API client that follows the documented v2 API."""

    def __init__(self):
        self.api_key = getattr(settings, 'QLOO_API_KEY', None)
        self.base_url = getattr(settings, 'QLOO_API_BASE_URL', 'https://hackathon.api.qloo.com')
        self.headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def _make_request(self, session: aiohttp.ClientSession, endpoint: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Makes an async request to the Qloo API and handles common errors."""
        if not self.api_key:
            logger.warning("QLOO_API_KEY not configured. Skipping API call.")
            return None

        try:
            # Clean up params - remove None values and convert lists to comma-separated strings
            clean_params = {}
            for key, value in params.items():
                if value is not None:
                    if isinstance(value, list):
                        clean_params[key] = ','.join(str(v) for v in value)
                    else:
                        clean_params[key] = value

            url = f"{self.base_url}/{endpoint}"
            async with session.get(url, params=clean_params, headers=self.headers, timeout=aiohttp.ClientTimeout(total=15)) as response:
                logger.info(f"Qloo API request: {response.url}")
                response.raise_for_status()
                return await response.json()
        except asyncio.TimeoutError:
            logger.error(f"Qloo API request timeout for {endpoint}")
            return None
        except aiohttp.ClientError as e:
            logger.error(f"Qloo API request failed for {endpoint}: {e}")
            return None

    async def search_entities(self, session: aiohttp.ClientSession, query: str, entity_types: List[str]) -> List[Dict[str, Any]]:
        """Searches for entities using the legacy search endpoint."""
        params = {"query": query, "types": entity_types, "take": 5}
        data = await self._make_request(session, "search", params)
        return data.get('results', []) if data else []

    async def get_insights(self, session: aiohttp.ClientSession, filter_type: str, signal_entities: List[str] = None,
                          signal_location_query: str = None, take: int = 12) -> List[Dict[str, Any]]:
        """Gets insights using the v2/insights endpoint."""
        params = {"filter.type": filter_type, "take": take}
        
        if signal_entities:
            params["signal.interests.entities"] = signal_entities
        if signal_location_query:
            params["signal.location.query"] = signal_location_query

        data = await self._make_request(session, "v2/insights", params)
        if data and data.get('success') and 'results' in data:
            results = data['results']
            if isinstance(results, dict):
                return results.get('entities', [])
        return []

    async def get_demographics(self, session: aiohttp.ClientSession, signal_entities: List[str]) -> Dict[str, Any]:
        """Gets demographic insights using the v2/insights endpoint with urn:demographics filter."""
        params = {
            "filter.type": "urn:demographics",
            "signal.interests.entities": signal_entities,
        }
        data = await self._make_request(session, "v2/insights", params)
        if data and data.get('success') and 'results' in data:
            results = data['results']
            if isinstance(results, dict):
                return results.get('demographics', [])
        return {}

    async def get_trending(self, session: aiohttp.ClientSession, filter_type: str, signal_entities: List[str], start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Gets trending data using the v2/trending endpoint."""
        params = {
            "filter.type": filter_type,
            "signal.interests.entities": signal_entities,
            "filter.start_date": start_date,
            "filter.end_date": end_date,
            "take": 8,
        }
        data = await self._make_request(session, "v2/trending", params)
        if data and data.get('success') and 'results' in data:
            return data['results']
        return []

    async def get_location_insights(self, session: aiohttp.ClientSession, location_query: str, filter_type: str = "urn:entity:place") -> List[Dict[str, Any]]:
        """Gets location-based insights."""
        params = {
            "filter.type": filter_type,
            "signal.location.query": location_query,
            "take": 10
        }
        data = await self._make_request(session, "v2/insights", params)
        if data and data.get('success') and 'results' in data:
            results = data['results']
            if isinstance(results, dict):
                return results.get('entities', [])
        return []

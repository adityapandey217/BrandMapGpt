from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import BrandMapRequestSerializer
from .qloo import QlooAPIClient
from .utils import (
    analyze_cultural_profile_async,
    generate_brand_strategy_async,
    compare_country_profiles_async,
    generate_brand_persona_async,
    perform_competitive_analysis_async,
)
from typing import Dict, Any
from datetime import datetime, timedelta
import logging
import asyncio
import aiohttp
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)

class BrandMapAPIView(APIView):

    def post(self, request):
        serializer = BrandMapRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        brand_info = serializer.validated_data
        
        try:
            # Run the async processing
            result = asyncio.run(self._process_brand_map_async(brand_info))
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error processing brand map: {e}")
            return Response(
                {"error": "An error occurred while processing your request. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    async def _process_brand_map_async(self, brand_info: Dict[str, Any]) -> Dict[str, Any]:
        """Process the brand map request asynchronously."""
        qloo_client = QlooAPIClient()
        
        # Create aiohttp session for all requests
        timeout = aiohttp.ClientTimeout(total=60)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            # Fetch cultural profiles for all target countries concurrently
            country_profiles = await self._get_country_profiles_async(qloo_client, session, brand_info)

        # Process all analyses concurrently
        tasks = []
        countries = brand_info['target_countries']
        
        # Cultural analysis tasks
        cultural_tasks = [
            analyze_cultural_profile_async(country_profiles.get(country, {}))
            for country in countries
        ]
        
        # Strategy generation tasks
        strategy_tasks = []
        persona_tasks = []
        competitive_tasks = []
        
        for country in countries:
            profile = country_profiles.get(country, {})
            
            # These depend on cultural analysis, so we'll do them after
            strategy_tasks.append((country, profile))
            persona_tasks.append((country, profile))
            competitive_tasks.append((country, brand_info.get('competitors', [])))

        # Wait for cultural analysis to complete
        cultural_results = await asyncio.gather(*cultural_tasks, return_exceptions=True)
        cultural_analysis = {}
        for i, country in enumerate(countries):
            result = cultural_results[i]
            if isinstance(result, Exception):
                logger.error(f"Cultural analysis failed for {country}: {result}")
                cultural_analysis[country] = {"error": str(result)}
            else:
                cultural_analysis[country] = result

        # Now run strategy, persona, and competitive analysis concurrently
        all_tasks = []
        
        # Strategy tasks
        for country, profile in strategy_tasks:
            all_tasks.append(generate_brand_strategy_async(brand_info, cultural_analysis.get(country, {})))
        
        # Persona tasks  
        for country, profile in persona_tasks:
            all_tasks.append(generate_brand_persona_async(country, profile))
        
        # Competitive tasks
        for country, competitors in competitive_tasks:
            all_tasks.append(perform_competitive_analysis_async(brand_info['brand_name'], competitors, country))
        
        # Comparison task
        all_tasks.append(compare_country_profiles_async(cultural_analysis))

        # Execute all remaining tasks concurrently
        results = await asyncio.gather(*all_tasks, return_exceptions=True)
        
        # Parse results
        num_countries = len(countries)
        strategy_results = results[:num_countries]
        persona_results = results[num_countries:2*num_countries]
        competitive_results = results[2*num_countries:3*num_countries]
        comparison_result = results[-1]
        
        # Build response dictionaries
        brand_strategies = {}
        brand_personas = {}
        competitive_analysis = {}
        
        for i, country in enumerate(countries):
            # Handle strategy results
            if isinstance(strategy_results[i], Exception):
                logger.error(f"Strategy generation failed for {country}: {strategy_results[i]}")
                brand_strategies[country] = {"error": str(strategy_results[i])}
            else:
                brand_strategies[country] = strategy_results[i]
            
            # Handle persona results
            if isinstance(persona_results[i], Exception):
                logger.error(f"Persona generation failed for {country}: {persona_results[i]}")
                brand_personas[country] = {"error": str(persona_results[i])}
            else:
                brand_personas[country] = persona_results[i]
            
            # Handle competitive results
            if isinstance(competitive_results[i], Exception):
                logger.error(f"Competitive analysis failed for {country}: {competitive_results[i]}")
                competitive_analysis[country] = {"error": str(competitive_results[i])}
            else:
                competitive_analysis[country] = competitive_results[i]
        
        # Handle comparison result
        if isinstance(comparison_result, Exception):
            logger.error(f"Comparison analysis failed: {comparison_result}")
            comparison = {"error": str(comparison_result)}
        else:
            comparison = comparison_result

        return {
            "brand_info": brand_info,
            "cultural_analysis": cultural_analysis,
            "brand_strategies": brand_strategies,
            "brand_personas": brand_personas,
            "competitive_analysis": competitive_analysis,
            "comparison": comparison,
        }

    async def _get_country_profiles_async(self, client: QlooAPIClient, session: aiohttp.ClientSession, brand_info: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """Fetches and constructs cultural profiles for each target country concurrently."""
        tasks = [
            self._fetch_and_build_profile_async(client, session, country)
            for country in brand_info['target_countries']
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        profiles = {}
        for i, country in enumerate(brand_info['target_countries']):
            result = results[i]
            if isinstance(result, Exception):
                logger.error(f"Profile building failed for {country}: {result}")
                profiles[country] = {"error": f"Failed to build profile for {country}: {str(result)}"}
            else:
                profiles[country] = result
        
        return profiles

    async def _fetch_and_build_profile_async(self, client: QlooAPIClient, session: aiohttp.ClientSession, country: str) -> Dict[str, Any]:
        """Fetches data from Qloo and builds a structured cultural profile asynchronously."""
        try:
            # 1. Find the location entity for the country
            locations = await client.search_entities(session, query=country, entity_types=["urn:entity:destination", "urn:entity:locality"])
            if not locations:
                logger.warning(f"Could not find location information for {country}")
                return {"error": f"Could not find location information for {country}."}
            
            # Get the entity ID from the first result
            location_entity = locations[0]
            location_id = location_entity.get('entity_id') or location_entity.get('id')
            if not location_id:
                logger.warning(f"No valid entity ID found for {country}")
                return {"error": f"No valid entity ID found for {country}."}

            logger.info(f"Found location ID for {country}: {location_id}")

            # 2. Build the profile
            profile = {"country": country, "location_id": location_id}

            # Get insights for different entity types with location signal - run concurrently
            entity_types = {
                "music": "urn:entity:artist",
                "fashion": "urn:entity:brand", 
                "entertainment": "urn:entity:movie",
                "places": "urn:entity:place",
            }

            # Create concurrent tasks for insights
            insight_tasks = []
            for domain, entity_type in entity_types.items():
                task = client.get_insights(
                    session,
                    filter_type=entity_type,
                    signal_location_query=country,
                    take=8
                )
                insight_tasks.append((domain, task))

            # Add demographics and trending tasks
            demographics_task = client.get_demographics(session, signal_entities=[location_id])
            trending_task = client.get_trending(
                session,
                filter_type="urn:entity:artist", 
                signal_entities=[location_id], 
                start_date=(datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d'), 
                end_date=datetime.now().strftime('%Y-%m-%d')
            )

            # Execute all tasks concurrently
            all_tasks = [task for _, task in insight_tasks] + [demographics_task, trending_task]
            results = await asyncio.gather(*all_tasks, return_exceptions=True)

            # Process insight results
            for i, (domain, _) in enumerate(insight_tasks):
                result = results[i]
                if isinstance(result, Exception):
                    logger.error(f"Error getting {domain} insights for {country}: {result}")
                    profile[domain] = []
                else:
                    profile[domain] = []
                    for item in result:
                        if isinstance(item, dict) and 'name' in item:
                            profile[domain].append(item['name'])
                    logger.info(f"Got {len(profile[domain])} {domain} insights for {country}")

            # Process demographics result
            demographics_result = results[-2]
            if isinstance(demographics_result, Exception):
                logger.error(f"Error getting demographics for {country}: {demographics_result}")
                profile['demographics'] = {}
            else:
                profile['demographics'] = demographics_result

            # Process trending result
            trending_result = results[-1]
            if isinstance(trending_result, Exception):
                logger.error(f"Error getting trending data for {country}: {trending_result}")
                profile['trending'] = {"music": []}
            else:
                trending_artists = []
                if isinstance(trending_result, list):
                    for item in trending_result:
                        if isinstance(item, dict):
                            name = item.get('name') or item.get('entity', {}).get('name')
                            if name:
                                trending_artists.append(name)
                
                profile['trending'] = {"music": trending_artists}
                logger.info(f"Got {len(trending_artists)} trending artists for {country}")

            return profile

        except Exception as e:
            logger.error(f"Error building profile for {country}: {e}")
            return {"error": f"Error building profile for {country}: {str(e)}"}

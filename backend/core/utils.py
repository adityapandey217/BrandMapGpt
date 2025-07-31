import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Any
import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)

# Configure the Gemini API key
genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_gemini_response(prompt: str) -> str:
    """Generates a response from the Gemini API."""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating response from Gemini: {e}")
        return ""

async def generate_gemini_response_async(prompt: str) -> str:
    """Generates a response from the Gemini API asynchronously."""
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor(max_workers=4) as executor:
        try:
            result = await loop.run_in_executor(executor, generate_gemini_response, prompt)
            return result
        except Exception as e:
            logger.error(f"Error generating async response from Gemini: {e}")
            return ""

async def analyze_cultural_profile_async(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Analyzes a single cultural profile to extract key insights using Gemini asynchronously."""
    if not profile or profile.get('error'):
        return {"error": "Invalid or empty profile provided."}

    prompt = f"""
    Analyze the following cultural profile for a country and extract key insights.
    Provide a summary of cultural values, consumer behavior, and communication style.
    Also, determine the market maturity and digital adoption rate.

    Profile:
    {profile}
    """
    analysis_text = await generate_gemini_response_async(prompt)
    return {"analysis": analysis_text}

async def generate_brand_strategy_async(brand_info: Dict[str, Any], cultural_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a targeted brand strategy based on cultural insights using Gemini asynchronously."""
    prompt = f"""
    Given the brand information and cultural profile below, generate a comprehensive brand strategy.
    The strategy should include a core message, positioning statement, marketing channels, and key themes.

    Brand Information:
    {brand_info}

    Cultural Profile:
    {cultural_profile}
    """
    strategy_text = await generate_gemini_response_async(prompt)
    return {"strategy": strategy_text}

async def generate_brand_persona_async(country: str, cultural_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a brand persona for a specific country using Gemini asynchronously."""
    prompt = f"""
    Create a brand persona for {country} based on the following cultural profile.
    The persona should include a name, age, profession, hobbies, and a short bio
    that reflects the cultural nuances of the region.

    Cultural Profile:
    {cultural_profile}
    """
    persona_text = await generate_gemini_response_async(prompt)
    return {"persona": persona_text}

async def perform_competitive_analysis_async(brand_name: str, competitors: List[str], country: str) -> Dict[str, Any]:
    """Performs a competitive analysis using Gemini asynchronously."""
    prompt = f"""
    Analyze the competitive landscape for '{brand_name}' in {country}.
    The main competitors are: {', '.join(competitors)}.
    Provide a summary of each competitor's strengths and weaknesses, and suggest a strategy for '{brand_name}' to differentiate itself.
    """
    analysis_text = await generate_gemini_response_async(prompt)
    return {"competitive_analysis": analysis_text}

async def compare_country_profiles_async(profiles: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Compares multiple country profiles to find similarities and differences using Gemini asynchronously."""
    if not profiles:
        return {"error": "No profiles to compare."}

    prompt = f"""
    Compare the following country profiles and highlight the key similarities and differences.
    Based on the comparison, provide a market opportunity ranking.

    Profiles:
    {profiles}
    """
    comparison_text = await generate_gemini_response_async(prompt)
    return {"comparison": comparison_text}

def analyze_cultural_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Analyzes a single cultural profile to extract key insights using Gemini."""
    if not profile or profile.get('error'):
        return {"error": "Invalid or empty profile provided."}

    prompt = f"""
    Analyze the following cultural profile for a country and extract key insights.
    Provide a summary of cultural values, consumer behavior, and communication style.
    Also, determine the market maturity and digital adoption rate.

    Profile:
    {profile}
    """
    analysis_text = generate_gemini_response(prompt)
    return {"analysis": analysis_text}

def generate_brand_strategy(brand_info: Dict[str, Any], cultural_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a targeted brand strategy based on cultural insights using Gemini."""
    prompt = f"""
    Given the brand information and cultural profile below, generate a comprehensive brand strategy.
    The strategy should include a core message, positioning statement, marketing channels, and key themes.

    Brand Information:
    {brand_info}

    Cultural Profile:
    {cultural_profile}
    """
    strategy_text = generate_gemini_response(prompt)
    return {"strategy": strategy_text}

def compare_country_profiles(profiles: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Compares multiple country profiles to find similarities and differences using Gemini."""
    if not profiles:
        return {"error": "No profiles to compare."}

    prompt = f"""
    Compare the following country profiles and highlight the key similarities and differences.
    Based on the comparison, provide a market opportunity ranking.

    Profiles:
    {profiles}
    """
    comparison_text = generate_gemini_response(prompt)
    return {"comparison": comparison_text}

def generate_brand_persona(country: str, cultural_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a brand persona for a specific country using Gemini."""
    prompt = f"""
    Create a brand persona for {country} based on the following cultural profile.
    The persona should include a name, age, profession, hobbies, and a short bio
    that reflects the cultural nuances of the region.

    Cultural Profile:
    {cultural_profile}
    """
    persona_text = generate_gemini_response(prompt)
    return {"persona": persona_text}

def perform_competitive_analysis(brand_name: str, competitors: List[str], country: str) -> Dict[str, Any]:
    """Performs a competitive analysis using Gemini."""
    prompt = f"""
    Analyze the competitive landscape for '{brand_name}' in {country}.
    The main competitors are: {', '.join(competitors)}.
    Provide a summary of each competitor's strengths and weaknesses, and suggest a strategy for '{brand_name}' to differentiate itself.
    """
    analysis_text = generate_gemini_response(prompt)
    return {"competitive_analysis": analysis_text}

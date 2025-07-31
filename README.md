# 🌍 BrandMap GPT - AI-Powered Cultural Localization Platform


## 🚀 Overview

**BrandMap GPT** is an intelligent brand strategy generator that revolutionizes how companies enter new markets by combining **Qloo's cultural intelligence** with **advanced LLM reasoning**. Unlike traditional market research that takes weeks and costs thousands, BrandMap GPT delivers actionable, culturally-aware brand strategies in under 60 seconds.

### 🎯 What Makes It Special

- **🧠 Cultural Intelligence**: Leverages Qloo's Taste AI™ for real-time cultural insights
- **🤖 AI-Powered Strategy**: Uses Google Gemini 2.5 Flash for intelligent reasoning
- **🌐 Privacy-First**: No personal data required, anonymous cultural patterns only
- **⚡ Lightning Fast**: Complete analysis in under 60 seconds
- **📊 Enterprise-Ready**: Scalable architecture supporting business-grade usage

---

## 🏆 Hackathon Achievements

### ✅ Perfect Requirements Alignment

**LLM Integration Excellence**
- Advanced Google Gemini 2.5 Flash integration with sophisticated prompting strategies
- Multi-layered reasoning for cultural context understanding
- Async processing for concurrent AI operations

**Qloo API Mastery**
- **Search Endpoint**: Smart location and entity discovery
- **Insights v2**: Cross-domain cultural preference analysis  
- **Demographics**: Target audience profiling
- **Trending**: Real-time cultural movement tracking

**Cultural Intelligence Innovation**
- First platform to combine cultural intelligence with AI-powered brand strategy
- Demonstrates cross-domain preference connections (music → fashion → dining)
- Privacy-first approach using anonymous taste data

### 🌟 Technical Innovations

- **Concurrent Processing**: Async architecture handling 50+ API calls simultaneously
- **Smart Error Handling**: Robust fallback mechanisms for enterprise reliability
- **Progressive UI**: Multi-step form with intelligent auto-completion
- **Real-time Analysis**: Live cultural intelligence processing with visual feedback

---

### API Integration Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │───▶│  Django Backend  │───▶│   Qloo API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Gemini AI      │
                       └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Qloo API Key (from hackathon)
- Google Gemini API Key

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/brandmapgpt/brandmapgpt.git
cd brandmapgpt/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt


# Run development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env.local
# Edit .env.local:
# REACT_APP_API_BASE_URL=http://localhost:8000

# Start development server
npm start
```


---

## 📊 API Documentation

### Core Endpoint

**POST** `/api/brandmap/`

Request Body:
```json
{
  "brand_name": "EcoStyle",
  "brand_description": "Sustainable fashion brand focusing on eco-friendly materials and ethical manufacturing.",
  "origin_country": "United States",
  "target_countries": ["Japan", "Germany", "Brazil"],
  "brand_keywords": ["sustainable", "eco-friendly", "trendy", "ethical"],
  "competitors": ["Patagonia", "Eileen Fisher"]
}
```

Response Structure:
```json
{
  "brand_info": { /* Original brand information */ },
  "cultural_analysis": {
    "Japan": {
      "analysis": "Detailed cultural intelligence analysis..."
    }
  },
  "brand_strategies": {
    "Japan": {
      "strategy": "Comprehensive localization strategy..."
    }
  },
  "brand_personas": {
    "Japan": {
      "persona": "Target customer persona..."
    }
  },
  "competitive_analysis": {
    "Japan": {
      "competitive_analysis": "Market competition insights..."
    }
  },
  "comparison": {
    "comparison": "Multi-market comparison analysis..."
  }
}
```

---


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

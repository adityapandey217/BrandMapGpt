import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  // Get data from navigation state
  const resultData = location.state?.resultData || {};
  const { 
    brand_info,
    brand_strategies,
    brand_personas,
    competitive_analysis,
    cultural_analysis,
    comparison
  } = resultData;

  useEffect(() => {
    setTimeout(() => setLoadingAnimation(false), 2000);
    setTimeout(() => setShowSummary(true), 2500);
  }, []);

  const countries = brand_info?.target_countries || [];

  // Enhanced markdown parsing function
  const parseMarkdown = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    let parsed = text
      // Headers with consistent styling
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold text-white mb-6 mt-8 pb-3 border-b-2 border-gradient-to-r from-purple-400 to-pink-400">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold text-white mb-6 mt-10 pb-4 border-b-2 border-purple-500/60">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold text-white mb-8 mt-12">$1</h1>')
      
      // Bold text with consistent color
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white bg-purple-500/20 px-2 py-1 rounded">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-blue-200 font-medium">$1</em>')
      
      // Code blocks
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800/80 text-cyan-300 px-3 py-1 rounded-lg font-mono text-sm border border-slate-600/50">$1</code>')
      
      // Lists with custom bullets
      .replace(/^\* (.*$)/gm, '<li class="text-gray-100 mb-3 pl-6 relative leading-relaxed"><span class="absolute left-0 top-1 text-purple-400 font-bold">•</span>$1</li>')
      .replace(/^- (.*$)/gm, '<li class="text-gray-100 mb-3 pl-6 relative leading-relaxed"><span class="absolute left-0 top-1 text-purple-400 font-bold">•</span>$1</li>')
      
      // Numbered lists
      .replace(/^\d+\. (.*$)/gm, '<li class="text-gray-100 mb-3 pl-8 relative leading-relaxed list-decimal marker:text-purple-400 marker:font-bold">$1</li>')
      
      // Wrap consecutive list items in ul tags
      .replace(/((<li[^>]*>.*?<\/li>\s*)+)/gs, '<ul class="space-y-2 mb-6">$1</ul>')
      
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-100 leading-relaxed mb-6 text-base">')
      .replace(/\n/g, '<br class="mb-2"/>')
      
      // Wrap in paragraph tags if not already wrapped
      .replace(/^(?!<[hul])/gm, '<p class="text-gray-100 leading-relaxed mb-6 text-base">')
      .replace(/(?<!\>)$/gm, '</p>');

    return parsed;
  };

  // Enhanced copy function
  const copyToClipboard = (text, index, sectionName) => {
    const plainText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
    navigator.clipboard.writeText(plainText);
    setCopiedIndex(index);
    
    // Enhanced toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-lg text-white px-8 py-4 rounded-2xl shadow-2xl z-50 border border-green-400/30 animate-slide-in';
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-2xl">✅</span>
        <div>
          <div class="font-semibold">${sectionName}</div>
          <div class="text-sm text-green-100">Copied to clipboard</div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      setCopiedIndex(null);
    }, 3000);
  };

  const toggleSection = (countryIndex, section) => {
    const key = `${countryIndex}-${section}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSectionExpanded = (countryIndex, section) => {
    return expandedSections[`${countryIndex}-${section}`];
  };

  // Helper function to get country flag
  function getCountryFlag(country) {
    const flagMap = {
      'United States': '🇺🇸', 'Japan': '🇯🇵', 'Germany': '🇩🇪', 'India': '🇮🇳', 'Brazil': '🇧🇷',
      'Canada': '🇨🇦', 'United Kingdom': '🇬🇧', 'France': '🇫🇷', 'Spain': '🇪🇸', 'Italy': '🇮🇹',
      'China': '🇨🇳', 'Australia': '🇦🇺', 'Mexico': '🇲🇽', 'South Korea': '🇰🇷', 'Netherlands': '🇳🇱'
    };
    return flagMap[country] || '🌍';
  }

  // Enhanced loading screen
  if (loadingAnimation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="text-center z-10">
          <div className="relative mb-8">
            <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <div className="absolute inset-0 inline-block animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            🧠 Analyzing Cultural Intelligence
          </h2>
          <p className="text-xl text-purple-200 animate-fade-in animation-delay-1000">
            Generating your personalized brand strategy...
          </p>
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // No data screen
  if (!countries.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-3xl font-bold text-white mb-4">No Results Available</h2>
          <p className="text-purple-200 mb-8">Unable to load brand strategy results.</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-8">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-2xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    {brand_info?.brand_name || 'Brand Analysis'}
                  </h1>
                  <p className="text-purple-200 mt-2 text-lg">
                    AI-Powered Cultural Localization Strategy
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium"
              >
                {showSummary ? '📊 Hide Summary' : '📋 Show Summary'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg transform hover:scale-105"
              >
                ✨ New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {showSummary && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="mr-4 text-4xl">📈</span>
              Executive Summary
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-8 border border-green-500/30">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-white font-bold text-xl mb-3">Target Markets</h3>
                <p className="text-green-200 text-lg">{countries.length} countries analyzed</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-blue-500/30">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-white font-bold text-xl mb-3">Market Intelligence</h3>
                <p className="text-blue-200 text-lg">Comprehensive cultural analysis</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-white font-bold text-xl mb-3">Cultural Insights</h3>
                <p className="text-purple-200 text-lg">Deep localization strategy</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Country Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          {countries.map((country, index) => (
            <button
              key={country}
              onClick={() => setActiveTab(index)}
              className={`group relative px-8 py-5 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 text-lg ${
                activeTab === index
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{getCountryFlag(country)}</span>
                <span>{country}</span>
              </div>
              {activeTab === index && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-50 -z-10 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Active Country Content */}
        {countries[activeTab] && (
          <div className="animate-fade-in">
            <CountryAnalysis
              country={countries[activeTab]}
              countryIndex={activeTab}
              copyToClipboard={copyToClipboard}
              copiedIndex={copiedIndex}
              toggleSection={toggleSection}
              isSectionExpanded={isSectionExpanded}
              brandStrategies={brand_strategies}
              brandPersonas={brand_personas}
              competitiveAnalysis={competitive_analysis}
              culturalAnalysis={cultural_analysis}
              parseMarkdown={parseMarkdown}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Country Analysis Component
const CountryAnalysis = ({ 
  country, 
  countryIndex, 
  copyToClipboard, 
  copiedIndex, 
  toggleSection, 
  isSectionExpanded,
  brandStrategies,
  brandPersonas,
  competitiveAnalysis,
  culturalAnalysis,
  parseMarkdown
}) => {
  const sections = [
    {
      id: 'cultural',
      title: 'Cultural Intelligence Overview',
      icon: '🧠',
      gradient: 'from-purple-500 via-indigo-500 to-blue-500',
      bgGradient: 'from-purple-500/15 via-indigo-500/15 to-blue-500/15',
      borderColor: 'border-purple-500/30',
      component: <CulturalOverview 
        analysis={culturalAnalysis?.[country]?.analysis || 'No cultural analysis available'} 
        parseMarkdown={parseMarkdown}
        copyToClipboard={copyToClipboard}
        copiedIndex={copiedIndex}
        sectionIndex={`${countryIndex}-cultural`}
      />
    },
    {
      id: 'strategy',
      title: 'Brand Strategy & Positioning',
      icon: '🎯',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      bgGradient: 'from-blue-500/15 via-cyan-500/15 to-teal-500/15',
      borderColor: 'border-blue-500/30',
      component: <BrandStrategy 
        strategy={brandStrategies?.[country]?.strategy || 'No strategy data available'} 
        parseMarkdown={parseMarkdown}
        copyToClipboard={copyToClipboard}
        copiedIndex={copiedIndex}
        sectionIndex={`${countryIndex}-strategy`}
      />
    },
    {
      id: 'persona',
      title: 'Target Persona Profile',
      icon: '👤',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      bgGradient: 'from-pink-500/15 via-rose-500/15 to-red-500/15',
      borderColor: 'border-pink-500/30',
      component: <BrandPersona 
        persona={brandPersonas?.[country]?.persona || 'No persona data available'} 
        parseMarkdown={parseMarkdown}
        copyToClipboard={copyToClipboard}
        copiedIndex={copiedIndex}
        sectionIndex={`${countryIndex}-persona`}
      />
    },
    {
      id: 'competitive',
      title: 'Competitive Market Intelligence',
      icon: '⚔️',
      gradient: 'from-slate-500 via-gray-500 to-zinc-500',
      bgGradient: 'from-slate-500/15 via-gray-500/15 to-zinc-500/15',
      borderColor: 'border-slate-500/30',
      component: <CompetitiveAnalysis 
        analysis={competitiveAnalysis?.[country]?.competitive_analysis || 'No competitive analysis available'} 
        parseMarkdown={parseMarkdown}
        copyToClipboard={copyToClipboard}
        copiedIndex={copiedIndex}
        sectionIndex={`${countryIndex}-competitive`}
      />
    },
  ];

  return (
    <div className="space-y-10">
      {sections.map((section, index) => (
        <div key={section.id} className="animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
          <ExpandableSection
            section={section}
            countryIndex={countryIndex}
            isExpanded={isSectionExpanded(countryIndex, section.id)}
            onToggle={() => toggleSection(countryIndex, section.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Enhanced Expandable Section Component
const ExpandableSection = ({ section, countryIndex, isExpanded, onToggle }) => {
  return (
    <div className={`group bg-gradient-to-br ${section.bgGradient} backdrop-blur-md rounded-3xl border ${section.borderColor} overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500`}>
      <button
        onClick={onToggle}
        className="w-full px-10 py-8 text-left transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-3xl">{section.icon}</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white group-hover:text-purple-200 transition-colors mb-2">
                {section.title}
              </h3>
              <p className="text-purple-300 text-base">
                Click to {isExpanded ? 'collapse' : 'expand'} detailed analysis
              </p>
            </div>
          </div>
          <div className={`transform transition-all duration-300 ${isExpanded ? 'rotate-180' : ''} group-hover:scale-110`}>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-10 pb-10 border-t border-white/10 animate-fade-in">
          <div className="mt-8">
            {section.component}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Content Components
const CulturalOverview = ({ analysis, parseMarkdown, copyToClipboard, copiedIndex, sectionIndex }) => (
  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-purple-500/20 overflow-hidden backdrop-blur-sm">
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <h4 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-4 text-3xl">🌍</span>
          Cultural Intelligence Analysis
        </h4>
        <button
          onClick={() => copyToClipboard(analysis, sectionIndex, 'Cultural Analysis')}
          className={`p-4 rounded-2xl transition-all duration-300 font-medium ${
            copiedIndex === sectionIndex 
              ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
          }`}
          title="Copy to clipboard"
        >
          {copiedIndex === sectionIndex ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <div 
        className="prose prose-invert max-w-none cultural-analysis text-white"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }}
      />
    </div>
  </div>
);

const BrandStrategy = ({ strategy, parseMarkdown, copyToClipboard, copiedIndex, sectionIndex }) => (
  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-blue-500/20 overflow-hidden backdrop-blur-sm">
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <h4 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-4 text-3xl">🚀</span>
          Strategic Recommendations
        </h4>
        <button
          onClick={() => copyToClipboard(strategy, sectionIndex, 'Brand Strategy')}
          className={`p-4 rounded-2xl transition-all duration-300 font-medium ${
            copiedIndex === sectionIndex 
              ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
          }`}
          title="Copy to clipboard"
        >
          {copiedIndex === sectionIndex ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <div 
        className="prose prose-invert max-w-none brand-strategy text-white"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(strategy) }}
      />
    </div>
  </div>
);

const BrandPersona = ({ persona, parseMarkdown, copyToClipboard, copiedIndex, sectionIndex }) => (
  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-pink-500/20 overflow-hidden backdrop-blur-sm">
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <h4 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-4 text-3xl">🎭</span>
          Target Customer Persona
        </h4>
        <button
          onClick={() => copyToClipboard(persona, sectionIndex, 'Brand Persona')}
          className={`p-4 rounded-2xl transition-all duration-300 font-medium ${
            copiedIndex === sectionIndex 
              ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
          }`}
          title="Copy to clipboard"
        >
          {copiedIndex === sectionIndex ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <div 
        className="prose prose-invert max-w-none brand-persona text-white"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(persona) }}
      />
    </div>
  </div>
);

const CompetitiveAnalysis = ({ analysis, parseMarkdown, copyToClipboard, copiedIndex, sectionIndex }) => (
  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-500/20 overflow-hidden backdrop-blur-sm">
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <h4 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-4 text-3xl">📊</span>
          Competitive Market Analysis
        </h4>
        <button
          onClick={() => copyToClipboard(analysis, sectionIndex, 'Competitive Analysis')}
          className={`p-4 rounded-2xl transition-all duration-300 font-medium ${
            copiedIndex === sectionIndex 
              ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
          }`}
          title="Copy to clipboard"
        >
          {copiedIndex === sectionIndex ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <div 
        className="prose prose-invert max-w-none competitive-analysis text-white"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }}
      />
    </div>
  </div>
);

export default ResultPage;
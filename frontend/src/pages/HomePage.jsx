import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitBrandMapForm } from '../api/brandmap';

const HomePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brandName: '',
    brandDescription: '',
    originCountry: '',
    targetCountries: [],
    brandKeywords: '',
    competitors: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedBrandType, setSelectedBrandType] = useState(null);

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 
    'Japan', 'China', 'India', 'Australia', 'Brazil', 'Mexico', 'South Korea', 
    'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 
    'Austria', 'Belgium', 'Ireland', 'Argentina', 'Colombia', 'Chile', 'Peru',
    'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
    'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Greece', 'Portugal',
    'Turkey', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'Morocco',
    'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Ukraine', 'New Zealand'
  ];

  const popularBrandTypes = [
    { icon: '🛍️', type: 'Retail & Fashion', keywords: 'fashion, style, trendy, clothing, accessories', gradient: 'from-pink-500 to-rose-500' },
    { icon: '🍔', type: 'Food & Beverage', keywords: 'food, dining, restaurant, cuisine, delicious', gradient: 'from-orange-500 to-red-500' },
    { icon: '💻', type: 'Technology', keywords: 'tech, innovation, digital, software, smart', gradient: 'from-blue-500 to-indigo-500' },
    { icon: '🏥', type: 'Health & Wellness', keywords: 'health, wellness, fitness, medical, care', gradient: 'from-green-500 to-emerald-500' },
    { icon: '🎮', type: 'Entertainment', keywords: 'entertainment, fun, gaming, media, content', gradient: 'from-purple-500 to-violet-500' },
    { icon: '🏦', type: 'Financial Services', keywords: 'finance, banking, investment, money, secure', gradient: 'from-gray-500 to-slate-500' },
    { icon: '🚗', type: 'Automotive', keywords: 'automotive, cars, transportation, mobility, drive', gradient: 'from-slate-500 to-gray-600' },
    { icon: '🏠', type: 'Real Estate', keywords: 'real estate, property, home, housing, investment', gradient: 'from-amber-500 to-orange-600' }
  ];

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTargetCountriesChange = (country) => {
    if (formData.targetCountries.includes(country)) {
      setFormData(prev => ({
        ...prev,
        targetCountries: prev.targetCountries.filter(c => c !== country)
      }));
    } else if (formData.targetCountries.length < 5) {
      setFormData(prev => ({
        ...prev,
        targetCountries: [...prev.targetCountries, country]
      }));
    }
    setCountrySearch('');
    setShowCountryDropdown(false);
  };

  const handleBrandTypeSelect = (brandType) => {
    setSelectedBrandType(brandType);
    setFormData(prev => ({
      ...prev,
      brandKeywords: brandType.keywords
    }));
    // Clear any existing errors for keywords
    if (errors.brandKeywords) {
      setErrors(prev => ({
        ...prev,
        brandKeywords: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required';
    }
    
    if (!formData.brandDescription.trim()) {
      newErrors.brandDescription = 'Brand description is required';
    } else if (formData.brandDescription.trim().length < 20) {
      newErrors.brandDescription = 'Please provide a more detailed description (at least 20 characters)';
    }
    
    if (!formData.originCountry) {
      newErrors.originCountry = 'Origin country is required';
    }
    
    if (formData.targetCountries.length === 0) {
      newErrors.targetCountries = 'Please select at least one target country';
    } else if (formData.targetCountries.length > 5) {
      newErrors.targetCountries = 'Please select no more than 5 target countries for better analysis';
    }
    
    if (!formData.brandKeywords.trim()) {
      newErrors.brandKeywords = 'Brand keywords are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }
    
    setLoading(true);
    setErrors({}); // Clear any existing errors
    
    try {
      console.log('Submitting to API...');
      const result = await submitBrandMapForm(formData);
      console.log('API response:', result);
      navigate('/results', { state: { resultData: result } });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.brandName.trim() || !formData.brandDescription.trim()) {
        setErrors({
          brandName: !formData.brandName.trim() ? 'Brand name is required' : '',
          brandDescription: !formData.brandDescription.trim() ? 'Brand description is required' : ''
        });
        return;
      }
      // Clear errors if validation passes
      setErrors({});
    }
    
    if (step === 2) {
      if (!formData.originCountry || formData.targetCountries.length === 0) {
        setErrors({
          originCountry: !formData.originCountry ? 'Origin country is required' : '',
          targetCountries: formData.targetCountries.length === 0 ? 'Please select at least one target country' : ''
        });
        return;
      }
      // Clear errors if validation passes
      setErrors({});
    }
    
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // New function to skip to final submission with current data
  const submitWithCurrentData = async () => {
    if (!formData.originCountry || formData.targetCountries.length === 0) {
      setErrors({
        originCountry: !formData.originCountry ? 'Origin country is required' : '',
        targetCountries: formData.targetCountries.length === 0 ? 'Please select at least one target country' : ''
      });
      return;
    }
    
    // Use current form data (including auto-filled keywords)
    const submissionData = {
      ...formData,
      brandKeywords: formData.brandKeywords || (selectedBrandType ? selectedBrandType.keywords : '')
    };

    // Validate the submission data
    if (!submissionData.brandName.trim() || !submissionData.brandDescription.trim() || !submissionData.brandKeywords.trim()) {
      setErrors({
        submit: 'Please ensure all required fields are filled before submitting.'
      });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      console.log('Quick submitting to API...');
      const result = await submitBrandMapForm(submissionData);
      console.log('API response:', result);
      navigate('/results', { state: { resultData: result } });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.country-dropdown-container')) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
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
            🚀 Creating Your Brand Strategy
          </h2>
          <p className="text-xl text-purple-200 animate-fade-in animation-delay-1000">
            Our AI is analyzing global markets and cultural patterns...
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-2xl">🌍</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  BrandMap GPT
                </h1>
                <p className="text-purple-200 text-lg">
                  AI-Powered Cultural Localization Platform
                </p>
              </div>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Transform your brand for global markets with intelligent cultural adaptation strategies powered by Qloo's cultural intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-500 ${
                  step >= stepNumber 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50 scale-110' 
                    : 'bg-white/10 backdrop-blur-sm text-gray-400 border border-white/20'
                }`}>
                  <span>{stepNumber}</span>
                  {step >= stepNumber && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-50 -z-10 animate-pulse"></div>
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-500 ${
                    step > stepNumber ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 && "Brand Foundation"}
              {step === 2 && "Market Strategy"}
              {step === 3 && "Finalize & Launch"}
            </h2>
            <p className="text-gray-300">
              {step === 1 && "Tell us about your brand identity and vision"}
              {step === 2 && "Define your geographic expansion strategy"}
              {step === 3 && "Review and generate your cultural intelligence report"}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="animate-fade-in space-y-8">
                {/* Brand Name */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-lg font-medium ${
                      errors.brandName ? 'border-red-500 ring-2 ring-red-500/50 shadow-red-500/20' : 'border-white/30 hover:border-white/50 focus:shadow-purple-500/20'
                    } shadow-xl`}
                    placeholder="e.g., EcoStyle, TechFlow, UrbanEats"
                  />
                  {errors.brandName && <p className="mt-2 text-red-400 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.brandName}</p>}
                </div>

                {/* Brand Description */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Brand Description *
                  </label>
                  <textarea
                    name="brandDescription"
                    value={formData.brandDescription}
                    onChange={handleInputChange}
                    rows={5}
                    className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none text-base leading-relaxed ${
                      errors.brandDescription ? 'border-red-500 ring-2 ring-red-500/50 shadow-red-500/20' : 'border-white/30 hover:border-white/50 focus:shadow-purple-500/20'
                    } shadow-xl`}
                    placeholder="Describe your brand's mission, values, target audience, and what makes it unique. Be specific about your products/services and brand personality."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm ${formData.brandDescription.length > 500 ? 'text-red-400' : 'text-gray-400'}`}>
                      {formData.brandDescription.length}/500 characters
                    </span>
                  </div>
                  {errors.brandDescription && <p className="mt-2 text-red-400 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.brandDescription}</p>}
                </div>

                {/* Brand Type Quick Setup */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-4">
                    Brand Category (Quick Setup)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularBrandTypes.map((brandType, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleBrandTypeSelect(brandType)}
                        className={`group p-6 rounded-2xl border transition-all duration-300 transform hover:scale-105 ${
                          selectedBrandType?.type === brandType.type
                            ? `bg-gradient-to-r ${brandType.gradient} border-white/50 shadow-2xl`
                            : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                        }`}
                      >
                        <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                          {brandType.icon}
                        </div>
                        <div className={`text-sm font-medium transition-colors duration-300 ${
                          selectedBrandType?.type === brandType.type ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {brandType.type}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-gray-400 text-sm text-center">
                    💡 Select a category to auto-fill relevant keywords, or manually enter your own below
                  </p>
                </div>

                {/* Keywords Preview */}
                {formData.brandKeywords && (
                  <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 rounded-2xl p-6 backdrop-blur-sm">
                    <h4 className="text-white font-semibold mb-4 flex items-center text-lg">
                      <span className="mr-2">🏷️</span>
                      Keywords Preview
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {formData.brandKeywords.split(',').map((keyword, index) => (
                        <span key={index} className="bg-white/20 text-white px-4 py-2 rounded-full text-sm border border-white/30 font-medium hover:bg-white/30 transition-all duration-300">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-8">
                {/* Origin Country */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Brand Origin Country *
                  </label>
                  <select
                    name="originCountry"
                    value={formData.originCountry}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                      errors.originCountry ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <option value="" className="bg-slate-800 text-white">Select your brand's origin country</option>
                    {countries.map(country => (
                      <option key={country} value={country} className="bg-slate-800 text-white">{country}</option>
                    ))}
                  </select>
                  {errors.originCountry && <p className="mt-2 text-red-400 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.originCountry}</p>}
                </div>

                {/* Target Countries */}
                <div className="country-dropdown-container">
                  <label className="block text-lg font-semibold text-white mb-3">
                    Target Markets * (Select 1-5 countries)
                  </label>
                  
                  {/* Selected Countries Display */}
                  {formData.targetCountries.length > 0 && (
                    <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/20">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <span className="mr-2">🎯</span>
                        Selected Markets ({formData.targetCountries.length}/5)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.targetCountries.map(country => (
                          <span
                            key={country}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm flex items-center shadow-lg"
                          >
                            {country}
                            <button
                              type="button"
                              onClick={() => handleTargetCountriesChange(country)}
                              className="ml-2 text-white hover:text-red-200 transition-colors duration-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Country Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search and select target countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      onFocus={() => setShowCountryDropdown(true)}
                      className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                        errors.targetCountries ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/30 hover:border-white/50'
                      }`}
                      disabled={formData.targetCountries.length >= 5}
                    />
                    
                    {showCountryDropdown && formData.targetCountries.length < 5 && (
                      <div className="absolute z-20 w-full mt-2 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                        {filteredCountries
                          .filter(country => !formData.targetCountries.includes(country))
                          .map(country => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => handleTargetCountriesChange(country)}
                            className="w-full text-left px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {formData.targetCountries.length >= 5 && (
                    <p className="mt-2 text-amber-400 text-sm flex items-center">
                      <span className="mr-1">📊</span>
                      Maximum of 5 countries selected for optimal analysis
                    </p>
                  )}
                  
                  {errors.targetCountries && <p className="mt-2 text-red-400 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.targetCountries}</p>}
                </div>

                {/* Quick Launch Option if Brand Category Selected */}
                {selectedBrandType && formData.originCountry && formData.targetCountries.length > 0 && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center">
                      <span className="mr-2">⚡</span>
                      Quick Launch Option Available!
                    </h4>
                    <p className="text-green-200 mb-4">
                      Since you selected <strong>{selectedBrandType.type}</strong>, we've pre-filled optimized keywords. 
                      You can either customize further in step 3 or launch your analysis now with these settings.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedBrandType.keywords.split(',').map((keyword, index) => (
                        <span key={index} className="bg-green-500/30 text-green-100 px-3 py-1 rounded-full text-sm border border-green-400/30">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium"
                      >
                        🛠️ Customize in Step 3
                      </button>
                      <button
                        type="button"
                        onClick={submitWithCurrentData}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </span>
                        ) : (
                          '🚀 Quick Launch'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Market Insights Preview */}
                {formData.targetCountries.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center">
                      <span className="mr-2">📊</span>
                      Market Insights Preview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.targetCountries.slice(0, 3).map((country, index) => (
                        <div key={country} className="bg-white/10 rounded-xl p-4 border border-white/20">
                          <h5 className="text-blue-200 font-medium mb-2">{country}</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">Cultural Fit</span>
                              <span className="text-blue-300">Analyzing...</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">Market Size</span>
                              <span className="text-green-300">Large</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-8">
                {/* Enhanced Brand Keywords with Editing Capability */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Brand Keywords & Attributes *
                    {selectedBrandType && (
                      <span className="ml-2 text-sm text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                        Auto-filled from {selectedBrandType.type}
                      </span>
                    )}
                  </label>
                  
                  {/* Show current keywords as editable tags */}
                  {formData.brandKeywords && (
                    <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/20">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <span className="mr-2">🏷️</span>
                        Current Keywords (Click to remove, or add more below)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.brandKeywords.split(',').filter(k => k.trim()).map((keyword, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm flex items-center shadow-lg cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                            onClick={() => {
                              const newKeywords = formData.brandKeywords
                                .split(',')
                                .filter((_, i) => i !== index)
                                .filter(k => k.trim())
                                .join(', ');
                              setFormData(prev => ({ ...prev, brandKeywords: newKeywords }));
                            }}
                          >
                            {keyword.trim()}
                            <span className="ml-2 text-white hover:text-red-200 transition-colors duration-200">×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    name="brandKeywords"
                    value={formData.brandKeywords}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none ${
                      errors.brandKeywords ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/30 hover:border-white/50'
                    }`}
                    placeholder="sustainable, innovative, premium, affordable, trendy, reliable, eco-friendly, luxury, modern, traditional, authentic, cutting-edge"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-400 text-sm">
                      💡 Separate keywords with commas. These define your brand personality and help us create culturally relevant strategies.
                    </p>
                    {selectedBrandType && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, brandKeywords: selectedBrandType.keywords }))}
                        className="text-purple-300 hover:text-purple-200 text-sm underline transition-colors duration-200"
                      >
                        Reset to {selectedBrandType.type} defaults
                      </button>
                    )}
                  </div>
                  {errors.brandKeywords && <p className="mt-2 text-red-400 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.brandKeywords}</p>}
                </div>

                {/* Competitors */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Competitors (Optional)
                  </label>
                  <textarea
                    name="competitors"
                    value={formData.competitors}
                    onChange={handleInputChange}
                    rows={2}
                    className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none ${
                      errors.competitors ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/30 hover:border-white/50'
                    }`}
                    placeholder="e.g., Nike, Adidas, Puma"
                  />
                  <p className="mt-2 text-gray-400 text-sm">
                    💡 Separate competitor names with commas. This helps us create more targeted competitive analysis.
                  </p>
                  {errors.competitors && <p className="mt-2 text-red-400 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.competitors}</p>}
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-8">
                  <h4 className="text-white font-bold text-xl mb-6 flex items-center">
                    <span className="mr-3">📋</span>
                    Strategy Summary
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-indigo-200 font-semibold mb-2">Brand Identity</h5>
                        <p className="text-white font-medium">{formData.brandName || 'Not specified'}</p>
                        <p className="text-gray-300 text-sm mt-1">
                          {formData.brandDescription ? 
                            `${formData.brandDescription.substring(0, 100)}${formData.brandDescription.length > 100 ? '...' : ''}` : 
                            'No description provided'
                          }
                        </p>
                      </div>
                      <div>
                        <h5 className="text-indigo-200 font-semibold mb-2">Origin Market</h5>
                        <p className="text-white">{formData.originCountry || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-indigo-200 font-semibold mb-2">Target Markets ({formData.targetCountries.length})</h5>
                        <div className="flex flex-wrap gap-2">
                          {formData.targetCountries.length > 0 ? 
                            formData.targetCountries.map(country => (
                              <span key={country} className="bg-indigo-500/30 text-indigo-100 px-3 py-1 rounded-full text-sm border border-indigo-400/30">
                                {country}
                              </span>
                            )) : 
                            <span className="text-gray-400">None selected</span>
                          }
                        </div>
                      </div>
                      <div>
                        <h5 className="text-indigo-200 font-semibold mb-2">Brand Attributes</h5>
                        <div className="flex flex-wrap gap-2">
                          {formData.brandKeywords ? 
                            formData.brandKeywords.split(',').slice(0, 5).map((keyword, index) => (
                              <span key={index} className="bg-purple-500/30 text-purple-100 px-2 py-1 rounded text-xs border border-purple-400/30">
                                {keyword.trim()}
                              </span>
                            )) : 
                            <span className="text-gray-400 text-sm">No keywords specified</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6">
                    <div className="flex items-center">
                      <span className="text-red-400 text-2xl mr-3">⚠️</span>
                      <div>
                        <h5 className="text-red-200 font-semibold">Submission Error</h5>
                        <p className="text-red-300 mt-1">{errors.submit}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-white/20">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  step === 1 
                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' 
                    : 'bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:scale-105'
                }`}
              >
                ← Previous
              </button>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Step {step} of 3
                </p>
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-purple-500/25"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Strategy...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      🚀 Generate Strategy
                    </span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
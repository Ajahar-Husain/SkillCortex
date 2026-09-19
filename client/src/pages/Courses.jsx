import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, BookOpen, Clock, Award, Star, Coins, SlidersHorizontal, Tag } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const { user, refreshUser } = useAuth();

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const popularSkills = ['React', 'Node.js', 'TypeScript', 'Python', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Machine Learning', 'Data Science'];
  const allSkills = ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Docker', 'Kubernetes', 'AWS', 'MongoDB', 'PostgreSQL', 'Redux', 'Vue', 'Angular', 'Next.js', 'Express.js', 'NestJS', 'GraphQL', 'Flask', 'Django', 'FastAPI', 'Spring Boot', 'Go', 'Rust', 'Redis', 'RabbitMQ', 'gRPC', 'Terraform', 'CI/CD', 'Linux', 'Nginx', 'Monitoring', 'Security', 'Serverless', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Science', 'SQL', 'Analytics', 'Tableau', 'Power BI', 'Spark', 'Airflow', 'MLOps', 'PyTorch', 'TensorFlow'];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (selectedLevel) params.set('level', selectedLevel);
      if (selectedSkill) params.set('skill', selectedSkill);
      const res = await api.get('/api/notifications/courses?' + params.toString());
      let fetchedCourses = res.data;
      
      // Client-side price filtering
      if (priceFilter === 'free') {
        fetchedCourses = fetchedCourses.filter(c => c.priceCoins === 0);
      } else if (priceFilter === 'premium') {
        fetchedCourses = fetchedCourses.filter(c => c.priceCoins > 0);
      }
      
      setCourses(fetchedCourses);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [searchTerm, selectedLevel, selectedSkill, priceFilter]);

  const enroll = async (s) => {
    try {
      const { data } = await api.post(`/api/notifications/courses/${s}/enroll`);
      setMsg(data.message + ` (coins left: ${data.coins})`);
      await refreshUser();
      setTimeout(() => setMsg(''), 5000);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Enroll failed');
      setTimeout(() => setMsg(''), 5000);
    }
  };

  const clearFilters = () => {
    setSelectedLevel('');
    setSelectedSkill('');
    setPriceFilter('');
  };

  const activeFiltersCount = [selectedLevel, selectedSkill, priceFilter].filter(Boolean).length;

  const detail = slug ? courses.find((c) => c.slug === slug) : null;

  if (detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button 
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All courses
        </button>
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              detail.level === 'Beginner' ? 'bg-green-900/30 text-green-400 border border-green-800/50' :
              detail.level === 'Intermediate' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' :
              'bg-red-900/30 text-red-400 border border-red-800/50'
            }`}>
              {detail.level}
            </span>
            {detail.isPremium && (
              <span className="flex items-center gap-1 bg-purple-900/30 text-purple-400 text-xs px-3 py-1 rounded-full border border-purple-800/50">
                <Star className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{detail.title}</h1>
          <p className="text-lg text-slate-300 mb-6 leading-relaxed">{detail.description}</p>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-yellow-400">
              <Coins className="w-5 h-5" />
              <span className="font-bold">{detail.priceCoins} coins</span>
            </div>
            {detail.modules?.length > 0 && (
              <div className="flex items-center gap-2 text-slate-400">
                <BookOpen className="w-5 h-5" />
                <span>{detail.modules.length} modules</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {detail.skills?.map((skill, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                <Tag className="w-3 h-3" />
                {skill}
              </span>
            ))}
          </div>
          
          {detail.modules?.length > 0 && (
            <div className="space-y-3 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Course Modules</h3>
              {detail.modules.map((m, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white">{m.title}</p>
                      <p className="text-sm text-slate-400 mt-1">{m.notes}</p>
                    </div>
                    {m.durationMin && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 ml-4">
                        <Clock className="w-3 h-3" />
                        {m.durationMin} min
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => enroll(detail.slug)}
            disabled={!user || user.skillCoins < detail.priceCoins}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!user ? 'Sign in to enroll' : user.skillCoins < detail.priceCoins ? 'Not enough coins' : 'Enroll Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      {/* Sidebar Filters */}
      <div className={`${showFilters ? 'w-80' : 'w-0'} shrink-0 transition-all duration-300 overflow-hidden`}>
        <div className="sticky top-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-400" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Difficulty Level</label>
              <div className="space-y-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedLevel === level
                        ? level === 'Beginner' ? 'bg-green-600 text-white shadow-lg' :
                          level === 'Intermediate' ? 'bg-yellow-600 text-white shadow-lg' :
                          'bg-red-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Price</label>
              <div className="space-y-2">
                {[
                  { value: '', label: 'All Courses' },
                  { value: 'free', label: 'Free Only' },
                  { value: 'premium', label: 'Premium Only' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriceFilter(option.value)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      priceFilter === option.value
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Popular Skills</label>
              <div className="space-y-2">
                {popularSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedSkill === skill
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* All Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">All Skills</label>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {allSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedSkill === skill
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Courses</h1>
                <p className="text-slate-400">
                  Level up your skills with expert-led courses
                </p>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-2 bg-yellow-900/30 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-800/50">
                    <Coins className="w-5 h-5" />
                    <span className="font-bold">{user.skillCoins} coins</span>
                  </div>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
          
          {msg && (
            <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-800/50 rounded-xl text-emerald-400 text-sm">
              {msg}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-slate-400">
              {courses.length} course{courses.length !== 1 ? 's' : ''} available
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-500 text-lg">
                  No courses found. Try adjusting your filters.
                </div>
              ) : (
                courses.map((c) => (
                  <div
                    key={c.slug}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/80 hover:-translate-y-1 transition-all group shadow-lg hover:shadow-blue-900/20 flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        c.level === 'Beginner' ? 'bg-green-900/30 text-green-400 border border-green-800/50' :
                        c.level === 'Intermediate' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' :
                        'bg-red-900/30 text-red-400 border border-red-800/50'
                      }`}>
                        {c.level}
                      </span>
                      {c.isPremium && (
                        <span className="flex items-center gap-1 bg-purple-900/30 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-800/50">
                          <Star className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    
                    <h2 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                      {c.title}
                    </h2>
                    
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-grow">
                      {c.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {c.skills?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {skill}
                        </span>
                      ))}
                      {c.skills?.length > 3 && (
                        <span className="text-xs bg-slate-800/50 text-slate-500 px-2 py-0.5 rounded">+{c.skills.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        <Coins className="w-4 h-4" />
                        {c.priceCoins === 0 ? 'Free' : c.priceCoins}
                      </div>
                      <button
                        onClick={() => navigate(`/courses/${c.slug}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

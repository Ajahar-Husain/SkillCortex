import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Clock, Tag, SlidersHorizontal, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function Blog() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [active, setActive] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const categories = ['React', 'Node.js', 'TypeScript', 'CSS', 'Vue', 'Next.js', 'GraphQL', 'API', 'Security', 'DevOps', 'Database', 'Testing', 'Performance', 'Architecture', 'Machine Learning', 'Data Science', 'NLP', 'Computer Vision', 'MLOps', 'Python', 'Pandas', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'];
  
  const popularSkills = ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'CSS', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'];

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSkill) params.set('skill', selectedSkill);
      const res = await api.get('/api/notifications/blogs?' + params.toString());
      setBlogs(res.data);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [searchTerm, selectedCategory, selectedSkill]);

  useEffect(() => {
    if (slug) {
      api.get(`/api/notifications/blogs/${slug}`)
        .then((r) => setActive(r.data))
        .catch(() => navigate('/blog'));
    } else {
      setActive(null);
    }
  }, [slug, navigate]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSkill('');
  };

  const activeFiltersCount = [selectedCategory, selectedSkill].filter(Boolean).length;

  if (active) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button 
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All posts
        </button>
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              {active.category}
            </span>
            <span className="flex items-center text-slate-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {active.readMin} min read
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{active.title}</h1>
          
          <p className="text-lg text-slate-300 mb-6 leading-relaxed">{active.excerpt}</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {active.skills?.map((skill, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                <Tag className="w-3 h-3" />
                {skill}
              </span>
            ))}
          </div>
          
          <div className="prose prose-invert prose-slate max-w-none">
            <div className="text-slate-300 whitespace-pre-line leading-relaxed text-base">
              {active.content}
            </div>
          </div>
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
            {/* Popular Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Popular Topics</label>
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

            {/* All Categories */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">All Categories</label>
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {cat}
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
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Tech Blog</h1>
              <p className="text-slate-400">
                Explore articles on development, DevOps, and data science
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              placeholder="Search articles..."
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
              {blogs.length} article{blogs.length !== 1 ? 's' : ''} found
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {blogs.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-500 text-lg">
                  No articles found. Try adjusting your filters.
                </div>
              ) : (
                blogs.map((b) => (
                  <Link
                    key={b.slug}
                    to={`/blog/${b.slug}`}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/80 hover:-translate-y-1 transition-all group shadow-lg hover:shadow-blue-900/20 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800/50">
                        {b.category}
                      </span>
                      <span className="flex items-center text-xs text-slate-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {b.readMin} min
                      </span>
                    </div>
                    
                    <h2 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                      {b.title}
                    </h2>
                    
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-grow">
                      {b.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {b.skills?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {skill}
                        </span>
                      ))}
                      {b.skills?.length > 3 && (
                        <span className="text-xs bg-slate-800/50 text-slate-500 px-2 py-0.5 rounded">+{b.skills.length - 3}</span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

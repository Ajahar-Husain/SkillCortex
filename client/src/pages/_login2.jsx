                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cortex-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-[#0a0f1e]/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cortex-500/50 focus:border-cortex-500/50 outline-none transition-all"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cortex-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-[#0a0f1e]/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cortex-500/50 focus:border-cortex-500/50 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-to-r from-cortex-500 to-plasma hover:from-cortex-400 hover:to-plasma text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30 ring-glow disabled:opacity-60"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                    Signing in...
                                </span>
                            ) : (
                                <>
                                    Sign In <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        New here?{' '}
                        <Link to="/register" className="font-semibold text-cortex-400 hover:text-cortex-50 transition-colors inline-flex items-center gap-1 group">
                            Create an account
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

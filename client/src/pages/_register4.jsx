
                        {/* Company field — only for recruiters */}
                        <AnimatePresence>
                            {formData.role === 'hr' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-slate-500 group-focus-within:text-purple-300 transition-colors" />
                                        </div>
                                        <input type="text" name="company"
                                            className="block w-full pl-11 pr-4 py-3 bg-[#0a0f1e]/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-plasma/50 focus:border-plasma/50 outline-none transition-all"
                                            placeholder="Acme Corp"
                                            value={formData.company} onChange={handleChange} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cortex-400 transition-colors" />
                                </div>
                                <input type="password" name="password" required minLength={6}
                                    className="block w-full pl-11 pr-4 py-3 bg-[#0a0f1e]/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cortex-500/50 focus:border-cortex-500/50 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password} onChange={handleChange} />
                            </div>
                        </div>

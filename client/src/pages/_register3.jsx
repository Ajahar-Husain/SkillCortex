
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-cortex-400 transition-colors" />
                                </div>
                                <input type="text" name="name" required
                                    className="block w-full pl-11 pr-4 py-3 bg-[#0a0f1e]/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cortex-500/50 focus:border-cortex-500/50 outline-none transition-all"
                                    placeholder="John Doe"
                                    value={formData.name} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cortex-400 transition-colors" />
                                </div>
                                <input type="email" name="email" required
                                    className="block w-full pl-11 pr-4 py-3 bg-[#0a0f1e]/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cortex-500/50 focus:border-cortex-500/50 outline-none transition-all"
                                    placeholder="you@example.com"
                                    value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

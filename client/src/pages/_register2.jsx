
                {/* -------- Form panel -------- */}
                <div className="p-8 sm:p-10">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <BrainCircuit className="h-7 w-7 text-cortex-400" />
                        <span className="font-display font-bold text-xl gradient-text">SkillCortex</span>
                    </div>

                    <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-plasma to-cortex-400 bg-clip-text text-transparent">Create account</h2>
                    <p className="text-slate-400 mt-2 mb-8 text-sm">Unlock your potential in minutes</p>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role toggle */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { role: 'candidate', label: 'Candidate', icon: GraduationCap, active: 'bg-cortex-500/15 border-cortex-500/50 text-cortex-400', inactive: 'bg-[#0a0f1e] border-slate-800 text-slate-500 hover:border-slate-600' },
                                { role: 'hr', label: 'HR / Recruiter', icon: Briefcase, active: 'bg-plasma/15 border-plasma/50 text-purple-300', inactive: 'bg-[#0a0f1e] border-slate-800 text-slate-500 hover:border-slate-600' },
                            ].map(({ role, label, icon: Icon, active, inactive }) => (
                                <motion.button
                                    key={role}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.role === role ? active + ' ring-glow' : inactive}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{label}</span>
                                </motion.button>
                            ))}
                        </div>

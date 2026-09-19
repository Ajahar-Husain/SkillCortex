
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-to-r from-plasma to-cortex-500 hover:from-plasma hover:to-cortex-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30 ring-glow disabled:opacity-60"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                    Creating Account...
                                </span>
                            ) : (
                                <>Create Account <ArrowRight className="w-5 h-5" /></>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-cortex-400 hover:text-cortex-50 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

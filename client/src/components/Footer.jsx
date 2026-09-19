import React from 'react';
import { BrainCircuit, Twitter, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-8 w-8 text-blue-500" />
                            <span className="font-bold text-xl tracking-tight text-white">
                                SkillCortex
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Empowering global minds through peer-to-peer knowledge exchange. Connect, learn, and grow with interactive WebRTC video sessions powered by AI.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="https://github.com/Ajahar-Husain" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="https://www.linkedin.com/in/ajahar-husain/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Platform</h3>
                        <ul className="space-y-3 shrink-0">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Find a Mentor</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Become a Creator</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Community Hub</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">WebRTC Video</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Security</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-slate-400">
                                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                                <span>Gida Gorakhpur Uttar Pradesh</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                                <span>+919554659311</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                                <a href="mailto:hello@skillcortex.com" className="hover:text-blue-400 transition-colors">hello@skillcortex.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} SkillCortex Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4 mb-4 md:mb-0">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">EN</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

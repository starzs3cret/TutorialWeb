import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Code2,
    BookOpen,
    Layers,
    Zap,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import { useCourseContext } from '@/contexts/CourseContext';
import { useBundleContext } from '@/contexts/BundleContext';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { completedFiles } = useCourseContext();
    const { filteredCourses: courses, filteredFlatFiles: flatFiles } = useBundleContext();
    const progress = flatFiles.length > 0
        ? Math.round((completedFiles.filter((id) => flatFiles.some((f) => f.id === id)).length / flatFiles.length) * 100)
        : 0;

    const features = [
        { icon: <BookOpen size={20} />, title: 'Structured Lessons', desc: 'Follow a curated curriculum from basics to advanced patterns.' },
        { icon: <Code2 size={20} />, title: 'Syntax Highlighted Code', desc: 'Read beautifully rendered code blocks with line numbers.' },
        { icon: <Layers size={20} />, title: 'Progress Tracking', desc: 'Mark lessons as complete and track your journey.' },
        { icon: <Zap size={20} />, title: 'Keyboard Navigation', desc: 'Use ← → arrow keys to move between lessons.' },
    ];

    return (
        <>
            <Helmet>
                <title>DevTutorials.io — React Mastery</title>
                <meta name="description" content="A modern, developer-focused tutorial platform for mastering React." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-6 py-16 md:px-10">
                {/* Hero */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <Zap size={12} />
                        <span>{courses.length} Chapters · {flatFiles.length} Lessons</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Master <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">React</span> Development
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        A hands-on curriculum covering components, hooks, and real-world patterns.
                        Track your progress, study the code, and level up.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => navigate(`/course/${flatFiles[0]?.id || 'welcome'}`)}
                            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white
                hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30
                hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                        >
                            <span>Start Learning</span>
                            <ArrowRight size={16} />
                        </button>

                        {progress > 0 && (
                            <button
                                onClick={() => {
                                    // Navigate to first incomplete lesson
                                    const nextIncomplete = flatFiles.find((f) => !completedFiles.includes(f.id));
                                    if (nextIncomplete) navigate(`/course/${nextIncomplete.id}`);
                                }}
                                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm
                  bg-slate-800/60 text-slate-300 border border-slate-700/50
                  hover:bg-slate-800 hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer"
                            >
                                <span>Continue ({progress}%)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress card */}
                {progress > 0 && (
                    <div className="mb-16 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-300">Your Progress</span>
                            <span className="text-sm font-bold text-indigo-400">{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span>{completedFiles.length} of {flatFiles.length} lessons completed</span>
                        </div>
                    </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-indigo-500/20 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition-colors">
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Course outline */}
                <div className="mt-16">
                    <h2 className="text-xl font-bold text-white mb-6">Course Outline</h2>
                    <div className="space-y-3">
                        {courses.map((course, i) => (
                            <div
                                key={course.id}
                                className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-bold text-indigo-400 tabular-nums">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="font-semibold text-slate-200">{course.name}</h3>
                                    <span className="text-xs text-slate-500 ml-auto">
                                        {course.children?.length || 0} lessons
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 pl-8">
                                    {course.children?.map((lesson) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => navigate(`/course/${lesson.id}`)}
                                            className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${completedFiles.includes(lesson.id)
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-slate-200 hover:border-slate-600/50'
                                                }`}
                                        >
                                            {lesson.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-20" />
            </div>
        </>
    );
};

export default Landing;

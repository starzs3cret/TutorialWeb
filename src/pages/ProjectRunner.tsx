import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { transform } from 'sucrase';
import * as ReactModule from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useCourseContext } from '@/contexts/CourseContext';

const ProjectRunner = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const { flatFiles } = useCourseContext();
    const [error, setError] = useState<string | null>(null);
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
    
    const activeFile = useMemo(() => flatFiles.find((f) => f.id === lessonId), [flatFiles, lessonId]);

    useEffect(() => {
        if (!activeFile) {
            setError('Project file not found.');
            return;
        }

        try {
            const rawCode = activeFile.content || '';
            
            // Transpile JSX to standard JS with CommonJS imports
            const compiled = transform(rawCode, {
                transforms: ['jsx', 'imports'],
            }).code;

            // Fake require function to provide dependencies
            const requireFn = (moduleName: string) => {
                if (moduleName === 'react') return ReactModule;
                if (moduleName === 'lucide-react') return LucideIcons;
                throw new Error(`Module '${moduleName}' not supported in the standalone runner.`);
            };

            // Evaluate the transpiled code
            const exportsObj: Record<string, unknown> = {};
            const moduleObj = { exports: exportsObj };
            
            // We pass React in just in case the transpiler assumes global React,
            // though with 'imports' transform it should use require('react').
            const evalFunc = new Function('require', 'exports', 'module', 'React', compiled);
            evalFunc(requireFn, exportsObj, moduleObj, ReactModule);

            const DefaultComponent = moduleObj.exports.default || Object.values(moduleObj.exports)[0];
            
            if (!DefaultComponent) {
                throw new Error("No default export found in the file.");
            }
            
            setComponent(() => DefaultComponent as React.ComponentType);
            setError(null);
            
        } catch (err: unknown) {
            console.error("Transpilation/Evaluation Error:", err);
            setError(err instanceof Error ? err.message : String(err) || 'Failed to run project code.');
        }
    }, [activeFile]);

    if (error) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-canvas text-fg-primary p-6">
                <AlertTriangle size={64} className="text-warning mb-6" />
                <h1 className="text-2xl font-bold mb-4">Project Error</h1>
                <div className="bg-surface-highlight p-4 rounded-xl font-mono text-sm max-w-2xl text-warning break-words border border-warning/30">
                    {error}
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-8 flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-xl font-medium hover:bg-primary-hover transition-colors cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    <span>Go Back</span>
                </button>
            </div>
        );
    }

    if (!Component) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-canvas text-fg-primary">
                <Loader2 size={48} className="animate-spin text-primary mb-4" />
                <p className="text-fg-secondary animate-pulse">Building project...</p>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen overflow-hidden bg-canvas relative group">
            <Helmet>
                <title>{activeFile?.name || 'Project'} — DevTutorials.io</title>
            </Helmet>
            
            {/* The Back Pill - visible on hover or near top left */}
            <div className="absolute top-4 left-4 z-[9999] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-md border border-border-default/50 hover:border-primary/50 text-fg-secondary hover:text-primary rounded-full shadow-lg transition-all cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back to Course</span>
                </button>
            </div>

            {/* Render the actual component */}
            <div className="w-full h-full overflow-auto">
                <Component />
            </div>
        </div>
    );
}

export default ProjectRunner;

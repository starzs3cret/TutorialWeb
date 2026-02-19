import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    FileText,
    Folder,
    Upload,
    Save,
    X,
    AlertTriangle,
    RotateCcw,
    Edit3,
    FolderPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseContext } from '@/contexts/CourseContext';

const CourseManager: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        courses,
        addCourse,
        addChapter,
        addLesson,
        updateLesson,
        deleteNode,
        deleteCourse,
        reorderLesson,
        reorderCourse,
        importMarkdown,
        importMultipleMarkdown,
        resetToDefaults,
    } = useCourseContext();

    const [newCourseName, setNewCourseName] = useState('');
    const [addingChapterTo, setAddingChapterTo] = useState<string | null>(null);
    const [newChapterName, setNewChapterName] = useState('');
    const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
    const [newLessonName, setNewLessonName] = useState('');
    const [newLessonContent, setNewLessonContent] = useState('');
    const [editingLesson, setEditingLesson] = useState<{ lessonId: string } | null>(null);
    const [editName, setEditName] = useState('');
    const [editContent, setEditContent] = useState('');
    const [confirmReset, setConfirmReset] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importParentId, setImportParentId] = useState<string | null>(null);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <AlertTriangle size={48} className="text-amber-400/60" />
                <p className="text-slate-400">You need to sign in to manage courses.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                    Sign In
                </button>
            </div>
        );
    }

    const handleAddCourse = () => {
        if (!newCourseName.trim()) return;
        addCourse(newCourseName.trim());
        setNewCourseName('');
    };

    const handleAddChapter = (courseId: string) => {
        if (!newChapterName.trim()) return;
        addChapter(courseId, newChapterName.trim());
        setNewChapterName('');
        setAddingChapterTo(null);
    };

    const handleAddLesson = (parentId: string) => {
        if (!newLessonName.trim()) return;
        addLesson(parentId, newLessonName.trim(), newLessonContent || `# ${newLessonName.trim()}\n\nStart writing your lesson content here.`);
        setNewLessonName('');
        setNewLessonContent('');
        setAddingLessonTo(null);
    };

    const handleStartEdit = (lessonId: string, name: string, content: string) => {
        setEditingLesson({ lessonId });
        setEditName(name);
        setEditContent(content);
    };

    const handleSaveEdit = () => {
        if (!editingLesson) return;
        updateLesson(editingLesson.lessonId, { name: editName, content: editContent });
        setEditingLesson(null);
    };

    const handleImportClick = (parentId: string) => {
        setImportParentId(parentId);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset to allow re-selection
            fileInputRef.current.click();
        }
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !importParentId) return;

        const fileArray = Array.from(files);
        if (fileArray.length === 1) {
            await importMarkdown(importParentId, fileArray[0]);
        } else {
            await importMultipleMarkdown(importParentId, fileArray);
        }

        setImportParentId(null);
        e.target.value = '';
    };

    // ── Shared action buttons ──
    const ActionBtn: React.FC<{ onClick: () => void; title: string; hoverColor: string; disabled?: boolean; children: React.ReactNode }> = ({
        onClick, title, hoverColor, disabled, children,
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 text-slate-500 hover:${hoverColor} disabled:opacity-20 rounded transition-colors cursor-pointer`}
        >
            {children}
        </button>
    );

    return (
        <>
            <Helmet>
                <title>Manage Courses — DevTutorials.io</title>
            </Helmet>

            <div className="max-w-3xl mx-auto px-6 py-12 md:px-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Course Manager</h1>
                        <p className="text-sm text-slate-500">Add, edit, reorder, and organize your curriculum.</p>
                    </div>
                    <button
                        onClick={() => setConfirmReset(!confirmReset)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>
                </div>

                {/* Reset confirmation */}
                {confirmReset && (
                    <div className="mb-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <p className="text-sm text-amber-300 mb-3">This will reset all courses to defaults. Your progress will not be affected.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { resetToDefaults(); setConfirmReset(false); }}
                                className="px-4 py-2 text-xs bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors cursor-pointer"
                            >
                                Confirm Reset
                            </button>
                            <button
                                onClick={() => setConfirmReset(false)}
                                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Add course */}
                <div className="mb-8 flex gap-2">
                    <input
                        type="text"
                        placeholder="New course name..."
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCourse()}
                        className="flex-1 bg-slate-900/60 border border-slate-800/60 rounded-lg px-4 py-2.5 text-sm
                            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30
                            transition-all placeholder:text-slate-600"
                    />
                    <button
                        onClick={handleAddCourse}
                        disabled={!newCourseName.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium
                            hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>Add Course</span>
                    </button>
                </div>

                {/* Course list */}
                <div className="space-y-4">
                    {courses.map((course, courseIdx) => (
                        <div
                            key={course.id}
                            className="rounded-xl bg-slate-900/40 border border-slate-800/40 overflow-hidden"
                        >
                            {/* Course header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30">
                                <div className="flex items-center gap-2.5">
                                    <Folder size={16} className="text-indigo-400/70" />
                                    <span className="font-semibold text-sm text-white">{course.name}</span>
                                    <span className="text-xs text-slate-500">{course.children?.length || 0} items</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ActionBtn onClick={() => reorderCourse(course.id, 'up')} disabled={courseIdx === 0} title="Move up" hoverColor="text-white">
                                        <ChevronUp size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => reorderCourse(course.id, 'down')} disabled={courseIdx === courses.length - 1} title="Move down" hoverColor="text-white">
                                        <ChevronDown size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => handleImportClick(course.id)} title="Import .md file" hoverColor="text-indigo-400">
                                        <Upload size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => setAddingChapterTo(addingChapterTo === course.id ? null : course.id)} title="Add chapter" hoverColor="text-violet-400">
                                        <FolderPlus size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => setAddingLessonTo(addingLessonTo === course.id ? null : course.id)} title="Add lesson" hoverColor="text-emerald-400">
                                        <Plus size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => deleteCourse(course.id)} title="Delete course" hoverColor="text-red-400">
                                        <Trash2 size={14} />
                                    </ActionBtn>
                                </div>
                            </div>

                            {/* Add chapter form */}
                            {addingChapterTo === course.id && (
                                <div className="px-4 py-3 border-t border-slate-800/40 space-y-2 bg-violet-500/[0.03]">
                                    <input
                                        type="text"
                                        placeholder="Chapter name..."
                                        value={newChapterName}
                                        onChange={(e) => setNewChapterName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddChapter(course.id)}
                                        className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg px-3 py-2 text-sm
                                            focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-600"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddChapter(course.id)}
                                            disabled={!newChapterName.trim()}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium
                                                hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            <FolderPlus size={12} />
                                            <span>Add Chapter</span>
                                        </button>
                                        <button
                                            onClick={() => { setAddingChapterTo(null); setNewChapterName(''); }}
                                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Add lesson form (direct to course) */}
                            {addingLessonTo === course.id && (
                                <AddLessonForm
                                    parentId={course.id}
                                    onAdd={handleAddLesson}
                                    onCancel={() => { setAddingLessonTo(null); setNewLessonName(''); setNewLessonContent(''); }}
                                    lessonName={newLessonName}
                                    setLessonName={setNewLessonName}
                                    lessonContent={newLessonContent}
                                    setLessonContent={setNewLessonContent}
                                />
                            )}

                            {/* Course children (chapters + lessons) */}
                            {course.children?.map((child, childIdx) => {
                                if (child.type === 'folder') {
                                    // Chapter
                                    return (
                                        <div key={child.id} className="border-t border-slate-800/20">
                                            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/10 group">
                                                <div className="flex items-center gap-2 pl-4">
                                                    <Folder size={13} className="text-violet-400/60 shrink-0" />
                                                    <span className="text-sm font-medium text-slate-200">{child.name}</span>
                                                    <span className="text-[11px] text-slate-600">{child.children?.length || 0} lessons</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ActionBtn onClick={() => reorderLesson(course.id, child.id, 'up')} disabled={childIdx === 0} title="Move up" hoverColor="text-white">
                                                        <ChevronUp size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => reorderLesson(course.id, child.id, 'down')} disabled={childIdx === (course.children?.length || 0) - 1} title="Move down" hoverColor="text-white">
                                                        <ChevronDown size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => handleImportClick(child.id)} title="Import .md" hoverColor="text-indigo-400">
                                                        <Upload size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => setAddingLessonTo(addingLessonTo === child.id ? null : child.id)} title="Add lesson" hoverColor="text-emerald-400">
                                                        <Plus size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => deleteNode(child.id)} title="Delete chapter" hoverColor="text-red-400">
                                                        <Trash2 size={12} />
                                                    </ActionBtn>
                                                </div>
                                            </div>

                                            {/* Add lesson to chapter */}
                                            {addingLessonTo === child.id && (
                                                <AddLessonForm
                                                    parentId={child.id}
                                                    onAdd={handleAddLesson}
                                                    onCancel={() => { setAddingLessonTo(null); setNewLessonName(''); setNewLessonContent(''); }}
                                                    lessonName={newLessonName}
                                                    setLessonName={setNewLessonName}
                                                    lessonContent={newLessonContent}
                                                    setLessonContent={setNewLessonContent}
                                                />
                                            )}

                                            {/* Chapter lessons */}
                                            {child.children?.map((lesson, lessonIdx) => (
                                                <LessonRow
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    parentId={child.id}
                                                    lessonIdx={lessonIdx}
                                                    totalLessons={child.children?.length || 0}
                                                    indent={8}
                                                    onView={() => navigate(`/course/${lesson.id}`)}
                                                    onEdit={() => handleStartEdit(lesson.id, lesson.name, lesson.content || '')}
                                                    onReorder={(dir) => reorderLesson(child.id, lesson.id, dir)}
                                                    onDelete={() => deleteNode(lesson.id)}
                                                />
                                            ))}

                                            {(!child.children || child.children.length === 0) && (
                                                <div className="px-4 py-3 text-center text-[11px] text-slate-600 pl-12">
                                                    No lessons in this chapter.
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Direct lesson
                                return (
                                    <LessonRow
                                        key={child.id}
                                        lesson={child}
                                        parentId={course.id}
                                        lessonIdx={childIdx}
                                        totalLessons={course.children?.length || 0}
                                        indent={0}
                                        onView={() => navigate(`/course/${child.id}`)}
                                        onEdit={() => handleStartEdit(child.id, child.name, child.content || '')}
                                        onReorder={(dir) => reorderLesson(course.id, child.id, dir)}
                                        onDelete={() => deleteNode(child.id)}
                                    />
                                );
                            })}

                            {(!course.children || course.children.length === 0) && (
                                <div className="px-4 py-6 text-center text-xs text-slate-600">
                                    No items yet. Add a chapter or lesson.
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {courses.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <Folder size={48} className="mx-auto mb-4 text-slate-700" />
                        <p>No courses yet. Create one above.</p>
                    </div>
                )}

                {/* Edit modal */}
                {editingLesson && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingLesson(null)} />
                        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800/60 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white">Edit Lesson</h2>
                                <button
                                    onClick={() => setEditingLesson(null)}
                                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg px-4 py-2.5 text-sm
                                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                            />
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={16}
                                className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg px-4 py-3 text-sm font-mono
                                    focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-y"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingLesson(null)}
                                    className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium
                                        hover:bg-indigo-500 transition-colors cursor-pointer"
                                >
                                    <Save size={14} />
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".md,.markdown,.txt"
                    onChange={handleFileImport}
                    className="hidden"
                />

                <div className="h-20" />
            </div>
        </>
    );
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

interface LessonRowProps {
    lesson: { id: string; name: string; content?: string };
    parentId: string;
    lessonIdx: number;
    totalLessons: number;
    indent: number;
    onView: () => void;
    onEdit: () => void;
    onReorder: (dir: 'up' | 'down') => void;
    onDelete: () => void;
}

const LessonRow: React.FC<LessonRowProps> = ({ lesson, lessonIdx, totalLessons, indent, onView, onEdit, onReorder, onDelete }) => (
    <div
        className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/20 group hover:bg-white/[0.02] transition-colors"
        style={{ paddingLeft: `${16 + indent * 4}px` }}
    >
        <div className="flex items-center gap-2 min-w-0">
            <FileText size={13} className="text-slate-500 shrink-0" />
            <span className="text-sm text-slate-300 truncate">{lesson.name}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onView} className="p-1.5 text-slate-500 hover:text-indigo-400 rounded transition-colors cursor-pointer" title="View">
                <FileText size={12} />
            </button>
            <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-amber-400 rounded transition-colors cursor-pointer" title="Edit">
                <Edit3 size={12} />
            </button>
            <button onClick={() => onReorder('up')} disabled={lessonIdx === 0} className="p-1.5 text-slate-500 hover:text-white disabled:opacity-20 rounded transition-colors cursor-pointer">
                <ChevronUp size={12} />
            </button>
            <button onClick={() => onReorder('down')} disabled={lessonIdx === totalLessons - 1} className="p-1.5 text-slate-500 hover:text-white disabled:opacity-20 rounded transition-colors cursor-pointer">
                <ChevronDown size={12} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer">
                <Trash2 size={12} />
            </button>
        </div>
    </div>
);

interface AddLessonFormProps {
    parentId: string;
    onAdd: (parentId: string) => void;
    onCancel: () => void;
    lessonName: string;
    setLessonName: (v: string) => void;
    lessonContent: string;
    setLessonContent: (v: string) => void;
}

const AddLessonForm: React.FC<AddLessonFormProps> = ({ parentId, onAdd, onCancel, lessonName, setLessonName, lessonContent, setLessonContent }) => (
    <div className="px-4 py-3 border-t border-slate-800/40 space-y-2">
        <input
            type="text"
            placeholder="Lesson title..."
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
        />
        <textarea
            placeholder="Markdown content (optional)..."
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            rows={6}
            className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg px-3 py-2 text-sm font-mono
                focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 resize-y"
        />
        <div className="flex gap-2">
            <button
                onClick={() => onAdd(parentId)}
                disabled={!lessonName.trim()}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium
                    hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
                <Plus size={12} />
                <span>Add Lesson</span>
            </button>
            <button
                onClick={onCancel}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
                Cancel
            </button>
        </div>
    </div>
);

export default CourseManager;

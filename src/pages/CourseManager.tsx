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
        renameCourse,
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

    // Rename state
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editNodeName, setEditNodeName] = useState('');

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <AlertTriangle size={48} className="text-warning/60" />
                <p className="text-fg-muted">You need to sign in to manage courses.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-primary text-primary-fg rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
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

    // Rename functions
    const handleStartRename = (id: string, currentName: string) => {
        setEditingNodeId(id);
        setEditNodeName(currentName);
    };

    const handleSaveRenameNode = () => {
        if (!editingNodeId || !editNodeName.trim()) return;
        renameCourse(editingNodeId, editNodeName.trim());
        setEditingNodeId(null);
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
            className={`p-1.5 text-fg-muted hover:${hoverColor} disabled:opacity-20 rounded transition-colors cursor-pointer`}
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
                        <h1 className="text-2xl font-bold text-fg-primary mb-1">Course Manager</h1>
                        <p className="text-sm text-fg-secondary">Add, edit, reorder, and organize your curriculum.</p>
                    </div>
                    <button
                        onClick={() => setConfirmReset(!confirmReset)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-fg-muted hover:text-warning hover:bg-warning-bg rounded-lg transition-colors cursor-pointer"
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>
                </div>

                {/* Reset confirmation */}
                {confirmReset && (
                    <div className="mb-8 p-4 rounded-xl bg-warning-bg border border-warning/30">
                        <p className="text-sm text-warning mb-3">This will reset all courses to defaults. Your progress will not be affected.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { resetToDefaults(); setConfirmReset(false); }}
                                className="px-4 py-2 text-xs bg-warning/20 text-warning rounded-lg hover:bg-warning/30 transition-colors cursor-pointer"
                            >
                                Confirm Reset
                            </button>
                            <button
                                onClick={() => setConfirmReset(false)}
                                className="px-4 py-2 text-xs text-fg-muted hover:text-fg-primary rounded-lg hover:bg-surface-highlight transition-colors cursor-pointer"
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
                        className="flex-1 bg-surface border border-border-default rounded-lg px-4 py-2.5 text-sm
                            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
                            transition-all placeholder:text-fg-muted text-fg-primary"
                    />
                    <button
                        onClick={handleAddCourse}
                        disabled={!newCourseName.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-fg rounded-lg text-sm font-medium
                            hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                            className="rounded-xl bg-surface/40 border border-border-default overflow-hidden"
                        >
                            {/* Course header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-surface-highlight/50">
                                <div className="flex items-center gap-2.5">
                                    <Folder size={16} className="text-primary/70" />
                                    {editingNodeId === course.id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={editNodeName}
                                                onChange={(e) => setEditNodeName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameNode()}
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                                className="bg-surface border border-border-highlight rounded px-2 py-1 text-sm text-fg-primary focus:outline-none focus:border-primary/50 w-48"
                                            />
                                            <button onClick={handleSaveRenameNode} className="p-1 text-success hover:text-success/80 cursor-pointer">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => setEditingNodeId(null)} className="p-1 text-fg-muted hover:text-fg-primary cursor-pointer">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-semibold text-sm text-fg-primary">{course.name}</span>
                                            <span className="text-xs text-fg-muted">{course.children?.length || 0} items</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {editingNodeId !== course.id && (
                                        <ActionBtn onClick={() => handleStartRename(course.id, course.name)} title="Rename course" hoverColor="text-fg-primary">
                                            <Edit3 size={14} />
                                        </ActionBtn>
                                    )}
                                    <ActionBtn onClick={() => reorderCourse(course.id, 'up')} disabled={courseIdx === 0} title="Move up" hoverColor="text-fg-primary">
                                        <ChevronUp size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => reorderCourse(course.id, 'down')} disabled={courseIdx === courses.length - 1} title="Move down" hoverColor="text-fg-primary">
                                        <ChevronDown size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => handleImportClick(course.id)} title="Import .md file" hoverColor="text-primary">
                                        <Upload size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => setAddingChapterTo(addingChapterTo === course.id ? null : course.id)} title="Add chapter" hoverColor="text-accent">
                                        <FolderPlus size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => setAddingLessonTo(addingLessonTo === course.id ? null : course.id)} title="Add lesson" hoverColor="text-success">
                                        <Plus size={14} />
                                    </ActionBtn>
                                    <ActionBtn onClick={() => deleteCourse(course.id)} title="Delete course" hoverColor="text-warning">
                                        <Trash2 size={14} />
                                    </ActionBtn>
                                </div>
                            </div>

                            {/* Add chapter form */}
                            {addingChapterTo === course.id && (
                                <div className="px-4 py-3 border-t border-border-default space-y-2 bg-accent/5">
                                    <input
                                        type="text"
                                        placeholder="Chapter name..."
                                        value={newChapterName}
                                        onChange={(e) => setNewChapterName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddChapter(course.id)}
                                        className="w-full bg-surface border border-border-default rounded-lg px-3 py-2 text-sm
                                            focus:outline-none focus:border-accent/50 transition-all placeholder:text-fg-muted text-fg-primary"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddChapter(course.id)}
                                            disabled={!newChapterName.trim()}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-fg rounded-lg text-xs font-medium
                                                hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            <FolderPlus size={12} />
                                            <span>Add Chapter</span>
                                        </button>
                                        <button
                                            onClick={() => { setAddingChapterTo(null); setNewChapterName(''); }}
                                            className="px-3 py-1.5 text-xs text-fg-muted hover:text-fg-primary rounded-lg hover:bg-surface-highlight transition-colors cursor-pointer"
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
                                        <div key={child.id} className="border-t border-border-default">
                                            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-highlight/30 group">
                                                <div className="flex items-center gap-2 pl-4">
                                                    <Folder size={13} className="text-secondary/60 shrink-0" />
                                                    {editingNodeId === child.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="text"
                                                                value={editNodeName}
                                                                onChange={(e) => setEditNodeName(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameNode()}
                                                                autoFocus
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="bg-surface border border-border-highlight rounded px-2 py-1 text-sm text-fg-primary focus:outline-none focus:border-primary/50 w-40"
                                                            />
                                                            <button onClick={handleSaveRenameNode} className="p-1 text-success hover:text-success/80 cursor-pointer">
                                                                <Edit3 size={12} />
                                                            </button>
                                                            <button onClick={() => setEditingNodeId(null)} className="p-1 text-fg-muted hover:text-fg-primary cursor-pointer">
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-medium text-fg-primary">{child.name}</span>
                                                            <span className="text-[11px] text-fg-muted">{child.children?.length || 0} lessons</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {editingNodeId !== child.id && (
                                                        <ActionBtn onClick={() => handleStartRename(child.id, child.name)} title="Rename chapter" hoverColor="text-fg-primary">
                                                            <Edit3 size={12} />
                                                        </ActionBtn>
                                                    )}
                                                    <ActionBtn onClick={() => reorderLesson(course.id, child.id, 'up')} disabled={childIdx === 0} title="Move up" hoverColor="text-fg-primary">
                                                        <ChevronUp size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => reorderLesson(course.id, child.id, 'down')} disabled={childIdx === (course.children?.length || 0) - 1} title="Move down" hoverColor="text-fg-primary">
                                                        <ChevronDown size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => handleImportClick(child.id)} title="Import .md" hoverColor="text-primary">
                                                        <Upload size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => setAddingLessonTo(addingLessonTo === child.id ? null : child.id)} title="Add lesson" hoverColor="text-success">
                                                        <Plus size={12} />
                                                    </ActionBtn>
                                                    <ActionBtn onClick={() => deleteNode(child.id)} title="Delete chapter" hoverColor="text-warning">
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
                                                <div className="px-4 py-3 text-center text-[11px] text-fg-muted pl-12">
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
                                <div className="px-4 py-6 text-center text-xs text-fg-muted">
                                    No items yet. Add a chapter or lesson.
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {courses.length === 0 && (
                    <div className="text-center py-16 text-fg-muted">
                        <Folder size={48} className="mx-auto mb-4 text-fg-muted/50" />
                        <p>No courses yet. Create one above.</p>
                    </div>
                )}

                {/* Edit modal */}
                {editingLesson && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingLesson(null)} />
                        <div className="relative w-full max-w-2xl bg-surface border border-border-default rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-fg-primary">Edit Lesson</h2>
                                <button
                                    onClick={() => setEditingLesson(null)}
                                    className="p-1 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-surface border border-border-default rounded-lg px-4 py-2.5 text-sm
                                    focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-fg-primary"
                            />
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={16}
                                className="w-full bg-surface border border-border-default rounded-lg px-4 py-3 text-sm font-mono
                                    focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-y text-fg-primary"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingLesson(null)}
                                    className="px-4 py-2 text-sm text-fg-muted hover:text-fg-primary rounded-lg hover:bg-surface-highlight transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-fg rounded-lg text-sm font-medium
                                        hover:bg-primary-hover transition-colors cursor-pointer"
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
        className="flex items-center justify-between px-4 py-2.5 border-t border-border-default/50 group hover:bg-surface-highlight/30 transition-colors"
        style={{ paddingLeft: `${16 + indent * 4}px` }}
    >
        <div className="flex items-center gap-2 min-w-0">
            <FileText size={13} className="text-fg-muted shrink-0" />
            <span className="text-sm text-fg-secondary truncate">{lesson.name}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onView} className="p-1.5 text-fg-muted hover:text-primary rounded transition-colors cursor-pointer" title="View">
                <FileText size={12} />
            </button>
            <button onClick={onEdit} className="p-1.5 text-fg-muted hover:text-warning rounded transition-colors cursor-pointer" title="Edit">
                <Edit3 size={12} />
            </button>
            <button onClick={() => onReorder('up')} disabled={lessonIdx === 0} className="p-1.5 text-fg-muted hover:text-fg-primary disabled:opacity-20 rounded transition-colors cursor-pointer">
                <ChevronUp size={12} />
            </button>
            <button onClick={() => onReorder('down')} disabled={lessonIdx === totalLessons - 1} className="p-1.5 text-fg-muted hover:text-fg-primary disabled:opacity-20 rounded transition-colors cursor-pointer">
                <ChevronDown size={12} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-fg-muted hover:text-warning rounded transition-colors cursor-pointer">
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
    <div className="px-4 py-3 border-t border-border-default space-y-2">
        <input
            type="text"
            placeholder="Lesson title..."
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            className="w-full bg-surface border border-border-default rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:border-primary/50 transition-all placeholder:text-fg-muted text-fg-primary"
        />
        <textarea
            placeholder="Markdown content (optional)..."
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            rows={6}
            className="w-full bg-surface border border-border-default rounded-lg px-3 py-2 text-sm font-mono
                focus:outline-none focus:border-primary/50 transition-all placeholder:text-fg-muted text-fg-primary resize-y"
        />
        <div className="flex gap-2">
            <button
                onClick={() => onAdd(parentId)}
                disabled={!lessonName.trim()}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-fg rounded-lg text-xs font-medium
                    hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
                <Plus size={12} />
                <span>Add Lesson</span>
            </button>
            <button
                onClick={onCancel}
                className="px-3 py-1.5 text-xs text-fg-muted hover:text-fg-primary rounded-lg hover:bg-surface-highlight transition-colors cursor-pointer"
            >
                Cancel
            </button>
        </div>
    </div>
);

export default CourseManager;

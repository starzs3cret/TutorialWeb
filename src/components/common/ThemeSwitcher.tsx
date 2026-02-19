import { Moon, Sun, Monitor, Eye } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSwitcher() {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <div className="flex items-center gap-2 bg-surface-highlight p-1 rounded-lg border border-border-default">
            {availableThemes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`
            p-2 rounded-md transition-all duration-200
            ${theme === t.id
                            ? 'bg-primary text-primary-fg shadow-sm'
                            : 'text-fg-muted hover:text-fg-primary hover:bg-surface'
                        }
          `}
                    title={t.name}
                    aria-label={`Switch to ${t.name} theme`}
                >
                    {t.id === 'warm-dark' && <Sun size={18} />}
                    {t.id === 'cool-dark' && <Moon size={18} />}
                    {t.id === 'soft-light' && <Eye size={18} />}
                    {t.id === 'dim' && <Monitor size={18} />}
                </button>
            ))}
        </div>
    );
}

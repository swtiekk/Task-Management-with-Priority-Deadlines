import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme} style={{
      padding: '6px', borderRadius: '50%', border: 'none',
      cursor: 'pointer', background: 'transparent',
      color: 'var(--text-muted)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', transition: 'background .15s',
    }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)'}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
      title="Toggle dark mode">
      {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} />}
    </button>
  )
}

export default ThemeToggle
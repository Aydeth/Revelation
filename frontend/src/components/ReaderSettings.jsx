import { useState, useEffect } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight, AlignJustify, RefreshCw } from 'lucide-react';
import './ReaderSettings.css';

const STORAGE_KEY = 'reader_settings';

const defaultSettings = {
  fontSize: 'normal',
  fontWeight: 'normal',
  lineHeight: 'normal',
  textAlign: 'justify'
};

export default function ReaderSettings({ onClose, onApply }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  const applySettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    onApply(newSettings);
  };

  const handleFontSizeChange = (value) => {
    applySettings({ ...settings, fontSize: value });
  };

  const handleFontWeightChange = (value) => {
    applySettings({ ...settings, fontWeight: value });
  };

  const handleLineHeightChange = (value) => {
    applySettings({ ...settings, lineHeight: value });
  };

  const handleTextAlignChange = (value) => {
    applySettings({ ...settings, textAlign: value });
  };

  const resetSettings = () => {
    applySettings(defaultSettings);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Настройки чтения</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-section">
          <div className="setting-item">
            <div className="setting-label">
              <span style={{ fontSize: '18px' }}>Aa</span>
              <span>Размер шрифта</span>
            </div>
            <div className="setting-control">
              <button 
                className={`size-btn ${settings.fontSize === 'small' ? 'active' : ''}`}
                onClick={() => handleFontSizeChange('small')}
              >
                Маленький
              </button>
              <button 
                className={`size-btn ${settings.fontSize === 'normal' ? 'active' : ''}`}
                onClick={() => handleFontSizeChange('normal')}
              >
                Средний
              </button>
              <button 
                className={`size-btn ${settings.fontSize === 'large' ? 'active' : ''}`}
                onClick={() => handleFontSizeChange('large')}
              >
                Большой
              </button>
              <button 
                className={`size-btn ${settings.fontSize === 'xlarge' ? 'active' : ''}`}
                onClick={() => handleFontSizeChange('xlarge')}
              >
                Очень большой
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span style={{ fontWeight: 'bold' }}>B</span>
              <span>Насыщенность</span>
            </div>
            <div className="setting-control">
              <button 
                className={`weight-btn ${settings.fontWeight === 'normal' ? 'active' : ''}`}
                onClick={() => handleFontWeightChange('normal')}
              >
                Обычный
              </button>
              <button 
                className={`weight-btn ${settings.fontWeight === 'medium' ? 'active' : ''}`}
                onClick={() => handleFontWeightChange('medium')}
              >
                Полужирный
              </button>
              <button 
                className={`weight-btn ${settings.fontWeight === 'bold' ? 'active' : ''}`}
                onClick={() => handleFontWeightChange('bold')}
              >
                Жирный
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span style={{ fontSize: '18px' }}>⇅</span>
              <span>Межстрочный интервал</span>
            </div>
            <div className="setting-control">
              <button 
                className={`line-btn ${settings.lineHeight === 'compact' ? 'active' : ''}`}
                onClick={() => handleLineHeightChange('compact')}
              >
                Уплотнённый
              </button>
              <button 
                className={`line-btn ${settings.lineHeight === 'normal' ? 'active' : ''}`}
                onClick={() => handleLineHeightChange('normal')}
              >
                Обычный
              </button>
              <button 
                className={`line-btn ${settings.lineHeight === 'loose' ? 'active' : ''}`}
                onClick={() => handleLineHeightChange('loose')}
              >
                Разреженный
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <AlignLeft size={18} />
              <span>Выравнивание</span>
            </div>
            <div className="setting-control align-control">
              <button 
                className={`align-btn ${settings.textAlign === 'left' ? 'active' : ''}`}
                onClick={() => handleTextAlignChange('left')}
              >
                <AlignLeft size={18} />
              </button>
              <button 
                className={`align-btn ${settings.textAlign === 'center' ? 'active' : ''}`}
                onClick={() => handleTextAlignChange('center')}
              >
                <AlignCenter size={18} />
              </button>
              <button 
                className={`align-btn ${settings.textAlign === 'right' ? 'active' : ''}`}
                onClick={() => handleTextAlignChange('right')}
              >
                <AlignRight size={18} />
              </button>
              <button 
                className={`align-btn ${settings.textAlign === 'justify' ? 'active' : ''}`}
                onClick={() => handleTextAlignChange('justify')}
              >
                <AlignJustify size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="reset-btn" onClick={resetSettings}>
            <RefreshCw size={16} />
            Сбросить все
          </button>
        </div>
      </div>
    </div>
  );
}
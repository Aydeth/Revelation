import { useState, useEffect } from 'react';
import { X, Type, Bold, AlignLeft, AlignCenter, AlignRight, AlignJustify, RefreshCw } from 'lucide-react';
import './ReaderSettings.css';

const STORAGE_KEY = 'reader_settings';

const defaultSettings = {
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.8,
  textAlign: 'justify'
};

export default function ReaderSettings({ onClose, onApply }) {
  const [settings, setSettings] = useState(defaultSettings);

  // Загрузка сохранённых настроек
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

  // Применение настроек
  const applySettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    onApply(newSettings);
  };

  const handleFontSizeChange = (delta) => {
    const newSize = Math.min(32, Math.max(12, settings.fontSize + delta));
    applySettings({ ...settings, fontSize: newSize });
  };

  const handleFontWeightChange = (weight) => {
    applySettings({ ...settings, fontWeight: weight });
  };

  const handleLineHeightChange = (delta) => {
    const newHeight = Math.min(2.5, Math.max(1.2, settings.lineHeight + delta));
    applySettings({ ...settings, lineHeight: parseFloat(newHeight.toFixed(1)) });
  };

  const handleTextAlignChange = (align) => {
    applySettings({ ...settings, textAlign: align });
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
              <Type size={18} />
              <span>Размер шрифта</span>
            </div>
            <div className="setting-control">
              <button className="setting-btn" onClick={() => handleFontSizeChange(-2)}>A-</button>
              <span className="setting-value">{settings.fontSize}px</span>
              <button className="setting-btn" onClick={() => handleFontSizeChange(2)}>A+</button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <Bold size={18} />
              <span>Насыщенность</span>
            </div>
            <div className="setting-control">
              <button 
                className={`weight-btn ${settings.fontWeight === 400 ? 'active' : ''}`}
                onClick={() => handleFontWeightChange(400)}
              >
                Обычный
              </button>
              <button 
                className={`weight-btn ${settings.fontWeight === 500 ? 'active' : ''}`}
                onClick={() => handleFontWeightChange(500)}
              >
                Полужирный
              </button>
              <button 
                className={`weight-btn ${settings.fontWeight === 600 ? 'active' : ''}`}
                onClick={() => handleFontWeightChange(600)}
              >
                Жирный
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span style={{ fontSize: '18px' }}>📏</span>
              <span>Межстрочный интервал</span>
            </div>
            <div className="setting-control">
              <button className="setting-btn" onClick={() => handleLineHeightChange(-0.1)}>−</button>
              <span className="setting-value">{settings.lineHeight}</span>
              <button className="setting-btn" onClick={() => handleLineHeightChange(0.1)}>+</button>
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
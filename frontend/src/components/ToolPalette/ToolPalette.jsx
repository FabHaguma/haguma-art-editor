import React from 'react';
import Icon from '../common/Icon';
import styles from './ToolPalette.module.css';

const TOOLS = [
  { id: 'transform', name: 'Transform', icon: 'transform' },
  { id: 'crop', name: 'Crop', icon: 'crop' },
  { id: 'adjust', name: 'Adjust', icon: 'adjust' },
  { id: 'filter', name: 'Filter', icon: 'filter' },
  { id: 'brush', name: 'Brush', icon: 'brush' },
  { id: 'text', name: 'Text', icon: 'text' },
];

const ToolPalette = ({ activeTool, onToolSelect, isVisible }) => {
  return (
    <div className={`${styles.toolPalette} ${!isVisible ? styles.hidden : ''}`}>
      <div className={styles.toolList}>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            className={`${styles.toolButton} ${activeTool === tool.id ? styles.active : ''}`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.name}
            aria-label={tool.name}
          >
            <Icon name={tool.icon} />
            <span className={styles.toolLabel}>{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolPalette;

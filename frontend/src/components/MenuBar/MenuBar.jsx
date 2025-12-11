import React, { useState } from 'react';
import styles from './MenuBar.module.css';

const MenuBar = ({ 
  imageSession,
  onDownload,
  onClearImage,
  onSaveAs,
  theme,
  onThemeToggle
}) => {
  const [openMenu, setOpenMenu] = useState(null);

  const menus = {
    file: {
      label: 'File',
      items: [
        { label: 'New', action: () => onClearImage?.(), disabled: !imageSession },
        { label: 'Save', action: () => onDownload?.(), disabled: !imageSession },
        { label: 'Save As...', action: () => onSaveAs?.(), disabled: !imageSession },
        { label: 'Download', action: () => onDownload?.(), disabled: !imageSession },
        { type: 'separator' },
        { label: 'Close Image', action: () => onClearImage?.(), disabled: !imageSession },
      ]
    },
    edit: {
      label: 'Edit',
      items: [
        { label: 'Undo', action: () => {}, disabled: true },
        { label: 'Redo', action: () => {}, disabled: true },
      ]
    },
    image: {
      label: 'Image',
      items: [
        { label: 'Resize...', action: () => {}, disabled: !imageSession },
        { label: 'Rotate...', action: () => {}, disabled: !imageSession },
        { label: 'Flip...', action: () => {}, disabled: !imageSession },
        { label: 'Crop...', action: () => {}, disabled: !imageSession },
      ]
    },
    view: {
      label: 'View',
      items: [
        { label: 'Zoom In', action: () => {}, disabled: !imageSession },
        { label: 'Zoom Out', action: () => {}, disabled: !imageSession },
        { label: 'Fit to Screen', action: () => {}, disabled: !imageSession },
      ]
    },
    window: {
      label: 'Window',
      items: [
        { label: 'Tools Panel', action: () => {}, disabled: false },
        { label: 'Properties Panel', action: () => {}, disabled: false },
        { type: 'separator' },
        { label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`, action: () => onThemeToggle?.(), disabled: false },
      ]
    },
    help: {
      label: 'Help',
      items: [
        { label: 'About', action: () => {} },
        { label: 'Documentation', action: () => {} },
      ]
    }
  };

  const handleMenuClick = (menuKey) => {
    setOpenMenu(openMenu === menuKey ? null : menuKey);
  };

  const handleItemClick = (item) => {
    if (!item.disabled && item.action) {
      item.action();
      setOpenMenu(null);
    }
  };

  const handleMouseLeave = () => {
    // Close menu when mouse leaves the menu bar area
    setTimeout(() => setOpenMenu(null), 200);
  };

  return (
    <div className={styles.menuBar} onMouseLeave={handleMouseLeave}>
      {Object.entries(menus).map(([key, menu]) => (
        <div key={key} className={styles.menuItem}>
          <button
            className={`${styles.menuButton} ${openMenu === key ? styles.active : ''}`}
            onClick={() => handleMenuClick(key)}
            onMouseEnter={() => openMenu && setOpenMenu(key)}
          >
            {menu.label}
          </button>
          
          {openMenu === key && (
            <div className={styles.dropdown}>
              {menu.items.map((item, index) => (
                item.type === 'separator' ? (
                  <div key={index} className={styles.separator} />
                ) : (
                  <button
                    key={index}
                    className={`${styles.dropdownItem} ${item.disabled ? styles.disabled : ''}`}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;

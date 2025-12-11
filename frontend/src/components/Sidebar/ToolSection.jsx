import React, { useState } from 'react';
import styles from './ToolSection.module.css'; // Create ToolSection.module.css
// import { ChevronDownIcon, ChevronRightIcon } from '../common/Icons'; // Example

function ToolSection({ title, icon, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className={styles.toolSection}>
            <button className={styles.sectionHeader} onClick={toggleOpen} aria-expanded={isOpen}>
                <span className={styles.headerIconAndTitle}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <span className={styles.title}>{title}</span>
                </span>
                <span className={styles.chevron}>
                    {/* {isOpen ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />} */}
                    {isOpen ? '▼' : '►'}
                </span>
            </button>
            {isOpen && (
                <div className={styles.sectionContent}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default ToolSection;
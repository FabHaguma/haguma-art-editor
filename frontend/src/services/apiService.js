const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'; // Adjust if Caddy path changes

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error or unparseable JSON response" }));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
    }
    return response.json();
};

export const resizeImage = async (sessionId, originalExtension, params) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/resize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Resize failed with status: ${response.status}`);
    }
    return response.json();
};

export const rotateImage = async (sessionId, originalExtension, angle) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Rotate failed with status: ${response.status}`);
    }
    return response.json();
};

export const flipImage = async (sessionId, originalExtension, axis) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/flip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axis }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Flip failed with status: ${response.status}`);
    }
    return response.json();
};

export const cropImage = async (sessionId, originalExtension, preset) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Crop failed with status: ${response.status}`);
    }
    return response.json();
};

export const cropImageCustom = async (sessionId, originalExtension, cropData) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/crop-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Custom crop failed with status: ${response.status}`);
    }
    return response.json();
};

export const grayscaleImage = async (sessionId, originalExtension, intensity = 100) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/grayscale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Grayscale failed with status: ${response.status}`);
    }
    return response.json();
};

export const adjustBrightness = async (sessionId, originalExtension, level) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/brightness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Brightness adjustment failed with status: ${response.status}`);
    }
    return response.json();
};

export const adjustContrast = async (sessionId, originalExtension, level) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/contrast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Contrast adjustment failed with status: ${response.status}`);
    }
    return response.json();
};

export const applyFilter = async (sessionId, originalExtension, type, intensity = 0) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, intensity }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Filter application failed with status: ${response.status}`);
    }
    return response.json();
};

export const undoImage = async (sessionId, originalExtension) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/undo`, {
        method: 'POST',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Undo failed with status: ${response.status}`);
    }
    return response.json();
};

export const redoImage = async (sessionId, originalExtension) => {
    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/redo`, {
        method: 'POST',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Redo failed with status: ${response.status}`);
    }
    return response.json();
};

export const updateImage = async (sessionId, originalExtension, blob) => {
    const formData = new FormData();
    formData.append('file', blob, `updated.${originalExtension}`);

    const response = await fetch(`${API_BASE_URL}/process/${sessionId}/${originalExtension}/update`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Update failed with status: ${response.status}`);
    }
    return response.json();
};

export const getDownloadUrl = (sessionId, originalExtension, format = null, filename = null) => {
    let url = `${API_BASE_URL}/download/${sessionId}/${originalExtension}`;
    const params = new URLSearchParams();
    if (format) {
        params.append('format', format);
    }
    if (filename) {
        params.append('filename', filename);
    }
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    return url;
};
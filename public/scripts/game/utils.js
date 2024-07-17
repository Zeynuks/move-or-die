function interpolatePlayer(previous, current, t) {
    return {
        x: previous.x + (current.x - previous.x) * t, y: previous.y + (current.y - previous.y) * t
    };
}

function extrapolatePlayer(current, t) {
    return {
        x: current.x + current.vx * t, y: current.y + current.vy * t
    };
}

function calculatePosition(previous, current, t) {
    if (t < 1) {
        return interpolatePlayer(previous, current, t);
    } else {
        return extrapolatePlayer(current, t - 1);
    }
}

function transformKeys(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        const newKey = key.startsWith('_') ? key.slice(1) : key;
        acc[newKey] = (typeof obj[key] === 'object' && obj[key] !== null) ? transformKeys(obj[key]) : obj[key];
        return acc;
    }, Array.isArray(obj) ? [] : {});
}

export { calculatePosition, transformKeys };
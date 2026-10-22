/**
 * Formatters and Helper Utilities for MCM Studio
 */

/**
 * Validate input string for dimensions
 * Must contain at least 3 positive integers separated by commas or spaces (representing >= 2 matrices)
 */
export function validateDimensionsInput(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') {
    return { isValid: false, error: 'Please enter dimensions array, e.g., 10, 30, 5, 60' };
  }

  // Strip brackets if present: [10, 30, 5, 60] -> 10, 30, 5, 60
  const cleanStr = inputStr.replace(/^[\[\s]+|[\]\s]+$/g, '');
  const tokens = cleanStr.split(/[\s,]+/).filter(t => t.length > 0);

  if (tokens.length < 3) {
    return {
      isValid: false,
      error: `An array with n+1 dimensions defines n matrices. Enter at least 3 dimensions to define 2 matrices (e.g. 10, 30, 5). Currently found: ${tokens.length}.`
    };
  }

  if (tokens.length > 10) {
    return {
      isValid: false,
      error: `For smooth interactive visualization, the maximum recommended chain length is 9 matrices (10 dimensions).`
    };
  }

  const dimensions = [];
  for (let i = 0; i < tokens.length; i++) {
    const num = Number(tokens[i]);
    if (!Number.isInteger(num)) {
      return {
        isValid: false,
        error: `Value "${tokens[i]}" at position ${i + 1} is not a valid integer. Dimensions must be positive whole numbers.`
      };
    }
    if (num <= 0) {
      return {
        isValid: false,
        error: `Value ${num} at position ${i + 1} is not positive. Matrix dimensions must be strictly positive (> 0).`
      };
    }
    if (num > 100000) {
      return {
        isValid: false,
        error: `Dimension ${num} is too large. Please keep values <= 100,000 for realistic arithmetic.`
      };
    }
    dimensions.push(num);
  }

  return {
    isValid: true,
    dimensions,
    numMatrices: dimensions.length - 1
  };
}

/**
 * Extract matrix details from dimension array
 * e.g., p = [10, 30, 5, 60] =>
 * [
 *   { index: 1, name: 'A1', rows: 10, cols: 30, label: '10 × 30' },
 *   { index: 2, name: 'A2', rows: 30, cols: 5, label: '30 × 5' },
 *   { index: 3, name: 'A3', rows: 5, cols: 60, label: '5 × 60' }
 * ]
 */
export function getMatrixList(p) {
  const list = [];
  for (let i = 1; i < p.length; i++) {
    list.push({
      index: i,
      name: `A${i}`,
      rows: p[i - 1],
      cols: p[i],
      label: `${p[i - 1]} × ${p[i]}`
    });
  }
  return list;
}

/**
 * Format large numbers or BigInt for clean UI display
 */
export function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'bigint') {
    if (val < 1000000000n) {
      return val.toLocaleString();
    }
    // Scientific notation for huge BigInt
    const str = val.toString();
    const exp = str.length - 1;
    const mantissa = `${str[0]}.${str.slice(1, 4)}`;
    return `${mantissa} × 10^${exp}`;
  }
  if (typeof val === 'number') {
    if (val === Infinity) return '∞';
    return val.toLocaleString();
  }
  return String(val);
}

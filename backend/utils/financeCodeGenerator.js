/**
 * Auto-generate document codes following pattern: PREFIX-YYMM-NNN
 * e.g. PT-2504-001, PC-2504-001, CNT-2504-001, CNC-2504-001
 */

const getYYMM = (date = new Date()) => {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yy}${mm}`;
};

/**
 * Generate next sequential code for a given model + prefix
 * @param {Model} Model - Mongoose model
 * @param {string} codeField - field name that stores the code (e.g. 'transactionCode')
 * @param {string} prefix - e.g. 'PT', 'PC', 'CNT', 'CNC'
 * @param {Date} date
 */
const generateCode = async (Model, codeField, prefix, date = new Date()) => {
  const yymm = getYYMM(date);
  const prefixPattern = `${prefix}-${yymm}-`;
  const regex = new RegExp(`^${prefix}-${yymm}-`);

  const count = await Model.countDocuments({ [codeField]: regex });
  const seq = String(count + 1).padStart(3, '0');
  return `${prefixPattern}${seq}`;
};

module.exports = { generateCode, getYYMM };

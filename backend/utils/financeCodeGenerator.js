// const formatDateCode = (dateInput) => {
//   const date = new Date(dateInput);
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}${month}${day}`;
// };

// const getNextCode = async (Model, fieldName, prefix) => {
//   const regex = new RegExp(`^${prefix}-`);
//   const count = await Model.countDocuments({ [fieldName]: regex });
//   return `${prefix}-${String(count + 1).padStart(4, '0')}`;
// };

// module.exports = {
//   formatDateCode,
//   getNextCode,
// };

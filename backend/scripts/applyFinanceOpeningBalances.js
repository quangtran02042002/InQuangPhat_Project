// const dotenv = require('dotenv');
// const connectDB = require('../config/db');
// const {
//   buildLegacyDebtOpeningBalancePreview,
//   applyLegacyDebtOpeningBalances,
// } = require('../services/financeOpeningBalanceService');

// dotenv.config();

// const getArgValue = (flagName) => {
//   const match = process.argv.find((argument) => argument.startsWith(`${flagName}=`));
//   return match ? match.split('=').slice(1).join('=') : '';
// };

// const main = async () => {
//   const cutoffDate = getArgValue('--cutoffDate');
//   const migrationBatchCode = getArgValue('--batchCode');
//   const shouldApply = process.argv.includes('--apply');

//   await connectDB();

//   if (shouldApply) {
//     const result = await applyLegacyDebtOpeningBalances({
//       cutoffDateInput: cutoffDate,
//       migrationBatchCode,
//     });

//     console.log(
//       JSON.stringify(
//         {
//           mode: 'apply',
//           cutoffDate: result.cutoffDate,
//           migrationBatchCode: result.migrationBatchCode,
//           createdCount: result.createdCount,
//           skippedCount: result.skippedCount,
//           summary: result.summary,
//         },
//         null,
//         2
//       )
//     );
//     process.exit(0);
//   }

//   const preview = await buildLegacyDebtOpeningBalancePreview(cutoffDate);
//   console.log(
//     JSON.stringify(
//       {
//         mode: 'preview',
//         cutoffDate: preview.cutoffDate,
//         summary: preview.summary,
//         sampleItems: preview.items.slice(0, 20),
//       },
//       null,
//       2
//     )
//   );
//   process.exit(0);
// };

// if (require.main === module) {
//   main().catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
// }

// module.exports = main;

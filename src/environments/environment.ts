// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  appVersion: 'stock-analysis-short',
  USERDATA_KEY: 'auth',
  production: false,
  defaultauth: 'firebase',
  // defaultauth: 'fackbackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },
  color: [
    'maroon', 'red', 'orange', 'yellow', 'olive', 
    'green', 'purple', 'fuchsia', 'lime', 'teal',
    'aqua', 'blue', 'navy', 'black', 'gray', 'whitesmoke'
    ],
  apiUrl: 'api',
  apiRoot: 'http://localhost:8000/api-1.0/',
  apiUrls: {
    userLogin: 'auth/login',
    userregister: 'auth/register',
    authCheck: 'auth/check',
    getKlineWeekly: 'kline-weekly',
    getKlineYearly: 'kline-yearly',
    getKlineObserved: 'kline-observed',
    getKlineCashFlowEvent: 'kline-observed/kline-cashflow-events',
    getKlineObservedEvent: 'kline-observed/kline-observed-events',
    getStocks: 'stocks',
    getStockIndustry: 'analysis/industry',
    getKlineDaily: 'kline-daily',
    getKlineMonthly: 'kline-monthly',
    getIndustryStocks: 'industry-stocks',
    getStockDayIndex: 'stocks-day-index',
    getStockRadio10: 'stocks/{stock_code}/radio10',
    getStockAvgLineLevel: 'stocks/{stock_code}/avgline-level',
    getShortRatioDown: 'short/ratio-down',
    getAvgLineLevel: 'short/avg-line-level',
    getBullAlignment: 'short/bull-alignment'
  }
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

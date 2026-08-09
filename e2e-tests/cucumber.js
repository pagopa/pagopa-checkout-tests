module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['features/support/**/*.ts', 'features/step-definitions/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress', 'html:test_reports/cucumber-report.html'],
    publishQuiet: true,
  }
};


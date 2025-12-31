module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, missing semicolons, etc
        'refactor', // Code restructuring
        'perf',     // Performance improvement
        'test',     // Adding tests
        'build',    // Build system or dependencies
        'ci',       // CI/CD configuration
        'chore',    // Maintenance
        'revert',   // Revert previous commit
        'security', // Security improvements (VictoryKit specific)
        'api',      // API changes (VictoryKit specific)
        'tool',     // Tool-specific changes (VictoryKit specific)
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        // Core
        'shared',
        'gateway',
        'auth',
        'config',
        
        // Tools (can be expanded)
        'fraudguard',
        'intelliscout',
        'threatradar',
        'malwarehunter',
        'phishguard',
        'vulnscan',
        'pentestai',
        'securecode',
        'compliancecheck',
        'dataguardian',
        
        // Frontend
        'dashboard',
        'neural-link',
        'ui',
        
        // Infrastructure
        'docker',
        'nginx',
        'mongo',
        'redis',
        
        // Other
        'deps',
        'ci',
        'all',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
  prompt: {
    questions: {
      type: {
        description: 'Select the type of change you are committing',
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          security: {
            description: 'Security improvements or fixes',
            title: 'Security',
            emoji: '🔒',
          },
          api: {
            description: 'API changes or additions',
            title: 'API',
            emoji: '🔌',
          },
          tool: {
            description: 'Changes to a specific security tool',
            title: 'Tool',
            emoji: '🛠️',
          },
          perf: {
            description: 'Performance improvements',
            title: 'Performance',
            emoji: '⚡',
          },
          refactor: {
            description: 'Code refactoring',
            title: 'Refactor',
            emoji: '♻️',
          },
          test: {
            description: 'Adding or updating tests',
            title: 'Tests',
            emoji: '🧪',
          },
          build: {
            description: 'Build system or dependencies',
            title: 'Build',
            emoji: '📦',
          },
          ci: {
            description: 'CI/CD configuration',
            title: 'CI',
            emoji: '🚀',
          },
          chore: {
            description: 'Other changes',
            title: 'Chores',
            emoji: '🔧',
          },
        },
      },
    },
  },
};

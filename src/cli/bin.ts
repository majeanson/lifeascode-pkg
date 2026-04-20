import { Command } from 'commander'
import { initCmd } from './commands/init.js'
import { createCmd } from './commands/create.js'
import { buildCmd } from './commands/build.js'
import { lintCmd } from './commands/lint.js'
import { advanceCmd } from './commands/advance.js'
import { fillCmd } from './commands/fill.js'
import { statusCmd } from './commands/status.js'
import { searchCmd } from './commands/search.js'
import { diagramCmd } from './commands/diagram.js'
import { serveCmd } from './commands/serve.js'
import { exportCmd } from './commands/export.js'

const program = new Command()
  .name('lac')
  .description('Life-as-Code — knowledge graph CLI')
  .version('1.0.0')

program.addCommand(initCmd)
program.addCommand(createCmd)
program.addCommand(buildCmd)
program.addCommand(lintCmd)
program.addCommand(advanceCmd)
program.addCommand(fillCmd)
program.addCommand(statusCmd)
program.addCommand(searchCmd)
program.addCommand(diagramCmd)
program.addCommand(serveCmd)
program.addCommand(exportCmd)

program.parse()

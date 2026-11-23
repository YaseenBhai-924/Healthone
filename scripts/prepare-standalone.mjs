import { cpSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = '.next/standalone'

const staticSrc = '.next/static'
const staticDest = join(root, '.next/static')
mkdirSync(dirname(staticDest), { recursive: true })
cpSync(staticSrc, staticDest, { recursive: true })

if (existsSync('public')) {
  cpSync('public', join(root, 'public'), { recursive: true })
}

// Next copies .env* into standalone; never ship local secrets or localhost URLs to Azure.
for (const name of ['.env', '.env.local', '.env.development', '.env.production']) {
  const p = join(root, name)
  if (existsSync(p)) {
    unlinkSync(p)
    console.log(`Removed ${name} from standalone output.`)
  }
}

console.log('Copied static + public assets into standalone output.')

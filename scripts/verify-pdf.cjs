// Verifies the generated PDF contains real text by inflating its FlateDecode
// content streams. A PDF can be structurally valid yet visually blank, so the
// size check in build-pdf.mjs is not sufficient on its own.
const fs = require('fs')
const zlib = require('zlib')

const pdf = fs.readFileSync(process.argv[2] || 'docs/NRG_COWORKING_CRM_COMPLETE_LEARNING_GUIDE.pdf')
const raw = pdf.toString('latin1')

const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g
let match, inflated = '', count = 0

while ((match = streamRe.exec(raw)) !== null) {
  const buf = Buffer.from(match[1], 'latin1')
  try {
    inflated += zlib.inflateSync(buf).toString('latin1')
    count++
  } catch {
    // Not every stream is FlateDecode (images, fonts); skip those.
  }
}

console.log('streams inflated: ' + count)
console.log('text bytes recovered: ' + inflated.length)

// Chrome emits text as Tj/TJ operators with literal strings.
// Chrome emits text as TJ arrays containing literal strings, sometimes
// kerned into multiple runs per line, so each string fragment is collected
// individually and concatenated afterwards.
const fragments = []
const literalRe = /\(((?:\\.|[^\\()])*)\)/g
let m
while ((m = literalRe.exec(inflated)) !== null) {
  const s = m[1]
  // Skip non-text uses of parentheses: coordinates in path operators and
  // tiny fragments that are almost certainly kerning splits.
  if (s.length >= 3 && !/^\d+\.?\d*\s+\d+\s/.test(s)) fragments.push(s)
}

console.log('literal string fragments: ' + fragments.length)

const joined = fragments.join('')
console.log('recovered text length: ' + joined.length)
console.log('sample: ' + JSON.stringify(joined.slice(0, 200)))

const probes = [
  'NRG CO-WORKING CRM',
  'Project Master Overview',
  'Viva Question Bank',
  'API Reference',
  'Database Guide',
  'React Guide',
  'Contents',
]

console.log('\nContent probes:')
let hits = 0
for (const p of probes) {
  const found = joined.includes(p)
  if (found) hits++
  console.log('  ' + (found ? 'FOUND   ' : 'MISSING ') + p)
}

console.log('\n' + (hits === probes.length
  ? 'PASS: PDF contains the expected rendered text.'
  : 'WARN: ' + (probes.length - hits) + ' probe(s) missing — the PDF may be blank or incomplete.'))

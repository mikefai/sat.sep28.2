import { modules } from '../src/data/questions.js'

const errors = []
const ids = new Set()
const validDomains = new Set(['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'])

if (modules.length !== 2) errors.push(`Expected 2 modules, found ${modules.length}`)

for (const module of modules) {
  if (module.questions.length !== 27) errors.push(`${module.title} has ${module.questions.length} questions; expected 27`)
  const answerCounts = [0, 0, 0, 0]
  for (const question of module.questions) {
    if (ids.has(question.id)) errors.push(`Duplicate ID: ${question.id}`)
    ids.add(question.id)
    if (!validDomains.has(question.domain)) errors.push(`${question.id}: invalid domain`)
    if (!question.skill || !question.passage || !question.prompt || !question.explanation) errors.push(`${question.id}: missing required content`)
    if (!Array.isArray(question.choices) || question.choices.length !== 4) errors.push(`${question.id}: expected 4 choices`)
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) errors.push(`${question.id}: invalid answer index`)
    else answerCounts[question.answer] += 1
    if (new Set(question.choices).size !== 4) errors.push(`${question.id}: duplicate answer choice`)
  }
  if (Math.max(...answerCounts) - Math.min(...answerCounts) > 1) errors.push(`${module.title}: answer key is imbalanced (${answerCounts.join(', ')})`)
  console.log(`${module.title}: ${module.questions.length} questions | answer key A-D: ${answerCounts.join('/')}`)
}

if (errors.length) {
  console.error(`\nValidation failed:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(`\nValidated ${ids.size} unique questions with complete choices, answers, domains, and explanations.`)

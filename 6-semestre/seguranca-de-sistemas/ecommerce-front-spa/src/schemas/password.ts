import * as v from 'valibot'

// O limite técnico do bcrypt permanece no boundary, sem expor bytes na interface.
const fitsHash = v.check((s: string) => new TextEncoder().encode(s).length <= 72, 'Senha muito longa. Reduza a quantidade de caracteres.')
export const CurrentPasswordSchema = v.pipe(v.string(), v.minLength(1, 'Informe sua senha.'), fitsHash)
export const NewPasswordSchema = v.pipe(v.string(), v.check((s) => Array.from(s).length >= 12, 'Use uma senha com pelo menos 12 caracteres.'), fitsHash)

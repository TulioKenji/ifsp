import { AddressSchema } from '../../../schemas/orders'
import type { Address } from '../../../types/order'
import { useForm } from '../../../hooks/useForm'
import { Field, Form } from '../forms/Form'
import { Button } from '../Button'

const empty: Address = { recipient_name: '', postal_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', country: 'BR' }
const fields: { name: keyof Address; label: string; max: number; autoComplete?: string }[] = [
  { name: 'recipient_name', label: 'Destinatário', max: 150, autoComplete: 'shipping name' },
  { name: 'postal_code', label: 'CEP', max: 20, autoComplete: 'shipping postal-code' },
  { name: 'street', label: 'Rua', max: 200, autoComplete: 'shipping address-line1' },
  { name: 'number', label: 'Número', max: 20 }, { name: 'complement', label: 'Complemento', max: 100 },
  { name: 'neighborhood', label: 'Bairro', max: 100 }, { name: 'city', label: 'Cidade', max: 100, autoComplete: 'shipping address-level2' },
  { name: 'state', label: 'Estado', max: 100, autoComplete: 'shipping address-level1' }, { name: 'country', label: 'País', max: 100, autoComplete: 'shipping country' },
]
const steps = [fields.slice(0, 5).map((f) => f.name), fields.slice(5).map((f) => f.name)]
export function AddressForm({ initial = empty, onSubmit, pending, submitLabel }: { initial?: Address; onSubmit: (a: Address) => void; pending: boolean; submitLabel: string }) {
  const form = useForm({ initial, schema: AddressSchema, steps })
  return <Form onSubmit={form.submit(onSubmit)} className="rounded-2xl border border-border bg-surface p-6">
    <fieldset disabled={pending}><legend className="text-xl font-bold">Endereço de entrega</legend>
      <p className="mt-2 text-sm text-text-muted">Campos com <span className="text-danger-dark">*</span> são obrigatórios.</p>
      <ol aria-label="Etapas do endereço" className="my-6 flex gap-3">{['Destinatário e rua', 'Localização'].map((label, index) => <li key={label} aria-current={form.step === index ? 'step' : undefined} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${form.step === index ? 'bg-primary-100 text-primary-900' : 'bg-background-subtle text-text-muted'}`}>{index + 1}. {label}</li>)}</ol>
      <div className="grid gap-5 sm:grid-cols-2">{fields.filter((f) => steps[form.step].includes(f.name)).map((f) => <Field key={f.name} {...form.field(f.name)} label={f.label} mask={f.name === 'postal_code' && form.values.country.trim().toUpperCase() === 'BR' ? 'postalCode' : undefined} maxLength={f.max} required={f.name !== 'complement'} autoComplete={f.autoComplete} />)}</div>
      <div className="mt-6 flex justify-between gap-3">
        {form.step > 0 ? <Button tone="neutral" onClick={form.back} disabled={pending}>Voltar</Button> : <span />}
        {form.step === steps.length - 1 ? <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : submitLabel}</Button> : <Button onClick={form.next}>Continuar</Button>}
      </div>
    </fieldset>
  </Form>
}

import { DossierContent } from '@/lib/types';

export function DossierRenderer({ dossier }: { dossier: DossierContent }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Archetype</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{dossier.archetype}</h2>
        <p className="mt-4 max-w-3xl leading-7 text-neutral-700">{dossier.summary}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Complexion guidance</h3>
          <ul className="mt-4 grid gap-3 text-sm text-neutral-700">
            {dossier.complexionGuidance.map((item) => (
              <li key={item} className="rounded-2xl bg-neutral-50 p-4">{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Color harmony</h3>
          <ul className="mt-4 grid gap-3 text-sm text-neutral-700">
            {dossier.colorHarmony.map((item) => (
              <li key={item} className="rounded-2xl bg-neutral-50 p-4">{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Do more of</h3>
          <ul className="mt-4 grid gap-3 text-sm text-neutral-700">
            {dossier.doMoreOf.map((item) => (
              <li key={item} className="rounded-2xl bg-neutral-50 p-4">{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Avoid or adjust</h3>
          <ul className="mt-4 grid gap-3 text-sm text-neutral-700">
            {dossier.avoidOrAdjust.map((item) => (
              <li key={item} className="rounded-2xl bg-neutral-50 p-4">{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Jewelry + wardrobe</h3>
          <div className="mt-4">
            <p className="font-medium">Best jewelry</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {dossier.bestJewelry.map((item) => (
                <span key={item} className="rounded-full bg-neutral-100 px-3 py-1 text-sm">{item}</span>
              ))}
            </div>
            <ul className="mt-4 grid gap-3 text-sm text-neutral-700">
              {dossier.wardrobeGuidance.map((item) => (
                <li key={item} className="rounded-2xl bg-neutral-50 p-4">{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-semibold">Look blueprints</h3>
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {dossier.lookBlueprints.map((look) => (
            <article key={look.title} className="rounded-2xl border p-5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">{look.title}</h4>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs uppercase tracking-wide">
                  {look.occasion}
                </span>
              </div>
              <ol className="mt-4 grid gap-2 text-sm text-neutral-700">
                {look.steps.map((step, index) => (
                  <li key={step}><span className="font-semibold">{index + 1}.</span> {step}</li>
                ))}
              </ol>
              <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
                <p><span className="font-semibold">Pairing:</span> {look.pairing}</p>
                <p className="mt-2"><span className="font-semibold">Lip:</span> {look.lipIdea}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
"use client";

import Image from "next/image";

export default function DispatchSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Texto + Form CTA */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Coordinación de despacho
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Coordina tu despacho en minutos
            </h2>
            <p className="mt-3 text-gray-600">
              Ingresa tus datos, selecciona el producto y agenda el día. Nos encargamos del resto.
            </p>

            {/* Pasos */}
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { icon: "/assets/images/Iconos/icono_nota.webp", txt: "Completa tus datos" },
                { icon: "/assets/images/Iconos/icono_calendario.webp", txt: "Elige fecha" },
                { icon: "/assets/images/Iconos/ico-paso4-despacho-q85.webp", txt: "Recibe tu pedido" },
              ].map((p, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                    <Image 
                      src={p.icon} 
                      alt={`Paso ${i + 1}: ${p.txt}`} 
                      width={i === 2 ? 32 : 28} 
                      height={i === 2 ? 32 : 28}
                      className={i === 2 ? "w-8 h-8" : "w-7 h-7"}
                    />
                  </div>
                  <span className="text-sm text-gray-800">{p.txt}</span>
                </li>
              ))}
            </ol>

            {/* Botones */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/coordinador-despacho"
                className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-yellow-300 transition-colors"
              >
                Continuar al Calendario
              </a>
              <a
                href="https://wa.me/56963348909?text=Hola%20POLIMAX,%20quiero%20coordinar%20un%20despacho%20de%20policarbonato"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <Image src="/img/cta-whatsapp-light.svg" alt="" width={20} height={20} />
                Cotizar por WhatsApp
              </a>
            </div>

            {/* Badges */}
            <div className="mt-4 flex items-center gap-5">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Image src="/img/badge-datos-seguros.svg" alt="" width={18} height={18} />
                Datos seguros
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Image src="/img/badge-respuesta-2h.svg" alt="" width={18} height={18} />
                Respuesta &lt; 2h
              </div>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="relative">
            <div className="relative aspect-[10/7] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
              <Image
                src="/assets/images/Despachos/DespachoA.webp"
                alt="Chofer y cliente coordinando despacho frente a van de POLIMAX"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 640px, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
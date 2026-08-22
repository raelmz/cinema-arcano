// frontend/app/components/ui/BandeiraPagamento.tsx
import Image from 'next/image';

type Marca = 'visa' | 'mastercard' | 'pix';

type BandeiraPagamentoProps = {
  marca: Marca;
  className?: string;
  tamanho?: 'sm' | 'md';
};

const config: Record<Marca, { alt: string; src: string }> = {
  visa: { src: '/visa.webp', alt: 'Visa' },
  mastercard: { src: '/mastercard.webp', alt: 'Mastercard' },
  pix: { src: '/pix.png', alt: 'Pix' },
};

const alturas: Record<'sm' | 'md', number> = {
  sm: 16,
  md: 22,
};

export function BandeiraPagamento({
  marca,
  className = '',
  tamanho = 'sm',
}: BandeiraPagamentoProps) {
  const { alt, src } = config[marca];
  const altura = alturas[tamanho];

  return (
    <span
      className={`inline-flex items-center justify-center border-2 border-arcano-bg bg-white px-1.5 py-1 shadow-[2px_2px_0px_0px_var(--color-arcano-sec)] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={altura * 1.7}
        height={altura}
        style={{ height: altura, width: 'auto' }}
        className="object-contain"
      />
    </span>
  );
}

import React, { useState } from 'react';
import { 
  MessageCircle, Facebook, Twitter, PinIcon, Mail, Copy, Check 
} from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  coverImage?: string;
  sharesCount?: number;
  orientation?: 'vertical' | 'horizontal';
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  coverImage = '',
  sharesCount = 0,
  orientation = 'vertical'
}) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = encodeURIComponent(coverImage);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={`space-y-3 ${isVertical ? 'w-full' : 'w-full'}`}>
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00]">
          Compartilhar
        </span>
        {sharesCount > 0 && (
          <span className="text-[10px] font-bold text-zinc-400">
            {sharesCount} ações
          </span>
        )}
      </div>

      <div className={isVertical ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] transition-all hover:scale-102 text-xs font-bold"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>WhatsApp</span>
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] transition-all hover:scale-102 text-xs font-bold"
          title="Compartilhar no Facebook"
        >
          <Facebook className="w-4 h-4 shrink-0" />
          <span>Facebook</span>
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-zinc-200 transition-all hover:scale-102 text-xs font-bold"
          title="Compartilhar no X (Twitter)"
        >
          <Twitter className="w-4 h-4 shrink-0" />
          <span>X (Twitter)</span>
        </a>

        {/* Pinterest */}
        <a
          href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#E60023]/10 hover:bg-[#E60023]/20 border border-[#E60023]/30 text-[#E60023] transition-all hover:scale-102 text-xs font-bold"
          title="Salvar no Pinterest"
        >
          <PinIcon className="w-4 h-4 shrink-0" />
          <span>Pinterest</span>
        </a>

        {/* Copiar Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#C8FF00]/10 hover:bg-[#C8FF00]/20 border border-[#C8FF00]/30 text-[#C8FF00] transition-all hover:scale-102 text-xs font-bold cursor-pointer"
          title="Copiar Link"
        >
          {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
          <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
        </button>

        {/* E-mail */}
        <a
          href={`mailto:?subject=${encodedTitle}&body=Confira%20este%20artigo%20no%20Kito%20Arcade:%20${encodedUrl}`}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-white transition-all hover:scale-102 text-xs font-bold"
          title="Enviar por E-mail"
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span>E-mail</span>
        </a>
      </div>
    </div>
  );
};

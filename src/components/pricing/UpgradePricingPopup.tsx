import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Crown, Check, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOrgPlans, getBizPlans, type TieredPlan } from './pricingData';
import { useLanguage } from '@/contexts/LanguageContext';
import { isPortuguese } from '@/utils/languageHelpers';
import { eventPageThemes } from '@/config/eventPageThemes';

const theme = eventPageThemes.purple;

interface UpgradePricingPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment?: 'org' | 'biz';
}

const UpgradePricingPopup = ({ open, onOpenChange, segment = 'org' }: UpgradePricingPopupProps) => {
  const { language } = useLanguage();
  const pt = isPortuguese(language);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const plans = segment === 'org' ? getOrgPlans(pt) : getBizPlans(pt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 border-0 overflow-hidden bg-transparent shadow-none [&>button]:hidden"
        style={{ animation: 'fadeInScale 0.3s ease-out' }}
      >
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(15, 10, 30, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid rgba(255,255,255,0.08)`,
          }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.15)' }}>
                <Crown className="h-4 w-4" style={{ color: theme.accentDot }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: theme.textPrimary }}>
                  {pt ? 'Escolha o seu plano' : 'Choose your plan'}
                </h2>
                <p className="text-[11px]" style={{ color: theme.textMuted }}>
                  {pt ? 'Desbloqueie mais capacidade e funcionalidades' : 'Unlock more capacity and features'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: theme.textMuted }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="px-6 pb-4">
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['monthly', 'annual'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                    billing === b ? "shadow-sm" : ""
                  )}
                  style={{
                    background: billing === b ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: billing === b ? theme.textPrimary : theme.textMuted,
                  }}
                >
                  {b === 'monthly' ? (pt ? 'Mensal' : 'Monthly') : (pt ? 'Anual -15%' : 'Annual -15%')}
                </button>
              ))}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {plans.map((plan) => {
              const price = billing === 'annual' ? plan.annual : plan.price;
              return (
                <div
                  key={plan.tier}
                  className={cn(
                    "rounded-xl p-4 space-y-3 transition-all relative",
                    plan.pop && "ring-1"
                  )}
                  style={{
                    background: plan.pop ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${plan.pop ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {plan.pop && (
                    <div
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{ background: theme.accentDot, color: '#fff' }}
                    >
                      {pt ? 'Popular' : 'Popular'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold" style={{ color: theme.textPrimary }}>{plan.tier}</span>
                      <span className="text-[10px]" style={{ color: theme.textMuted }}>{plan.sub}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold" style={{ color: theme.textPrimary }}>€{price}</span>
                      <span className="text-[10px]" style={{ color: theme.textMuted }}>/{pt ? 'mês' : 'mo'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {plan.feats.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: theme.accentDot }} />
                        <span className="text-[11px] leading-tight" style={{ color: theme.textSecondary }}>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                    style={{
                      background: plan.pop ? theme.accentDot : 'rgba(255,255,255,0.06)',
                      color: plan.pop ? '#fff' : theme.textPrimary,
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 flex items-center justify-center gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Zap className="h-3 w-3" style={{ color: theme.accentDot }} />
            <span className="text-[10px]" style={{ color: theme.textMuted }}>
              {pt
                ? 'Todos os planos incluem eventos ilimitados. Cancele a qualquer momento.'
                : 'All plans include unlimited events. Cancel anytime.'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePricingPopup;

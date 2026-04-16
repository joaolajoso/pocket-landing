import { useState, Suspense, lazy, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useEventManagement } from '@/hooks/useEventManagement';
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  MapPin,
  Globe,
  Sparkles,
  FileText,
  Ticket,
  UserCheck,
  Maximize2,
  Pen,
  Check,
  Crown,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { isPortuguese } from '@/utils/languageHelpers';
import { EVENT_THEME_LIST, eventPageThemes, type EventPageTheme } from '@/config/eventPageThemes';
import coverNeodata from '@/assets/event-covers/cover-neodata.jpg';
import coverExpo from '@/assets/event-covers/cover-expo.jpg';
import coverProfiles from '@/assets/event-covers/cover-profiles.jpg';
import coverConnections from '@/assets/event-covers/cover-connections.jpg';
import coverBubbles from '@/assets/event-covers/cover-bubbles.jpg';
import UpgradePricingPopup from '@/components/pricing/UpgradePricingPopup';
const ThreeLavaLamp = lazy(() => import("@/components/ui/ThreeLavaLamp").then(m => ({ default: m.default })));

const COVER_GALLERY = [
  coverNeodata,
  coverExpo,
  coverProfiles,
  coverConnections,
  coverBubbles,
];

const CreateEvent = () => {
  const { createEvent, loading } = useEventManagement();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const pt = isPortuguese(language);

  const [selectedTheme, setSelectedTheme] = useState<EventPageTheme>(eventPageThemes.purple);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    country: '',
    city: '',
    event_type: '',
    image_url: '',
    access_type: 'public' as 'public' | 'invite_only',
    logo_url_landing: '',
    show_payment: false,
    payment_amount: '',
    payment_deadline: '',
    payment_url: '',
  });

  const [showDescription, setShowDescription] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showPricingPopup, setShowPricingPopup] = useState(false);
  const [capacityValue, setCapacityValue] = useState(50);
  const [ticketPrice, setTicketPrice] = useState('');

  // Plan limits
  const PLAN_LIMIT = 50; // Free plan
  const PLAN_NAME = 'Free';
  const MAX_CAPACITY = 2000;

  const CREDIT_TIERS = [
    { min: 51, max: 100, pricePerPerson: 0.25 },
    { min: 101, max: 500, pricePerPerson: 0.15 },
    { min: 501, max: 2000, pricePerPerson: 0.08 },
  ];

  const getExtraCost = (total: number) => {
    if (total <= PLAN_LIMIT) return 0;
    let cost = 0;
    let remaining = total - PLAN_LIMIT;
    for (const tier of CREDIT_TIERS) {
      const tierSize = tier.max - tier.min + 1;
      const inTier = Math.min(remaining, tierSize);
      if (inTier > 0) {
        cost += inTier * tier.pricePerPerson;
        remaining -= inTier;
      }
      if (remaining <= 0) break;
    }
    return cost;
  };

  const extraCost = getExtraCost(capacityValue);
  const isOverPlan = capacityValue > PLAN_LIMIT;

  const t = selectedTheme;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createEvent({
        ...formData,
        internal_event: true,
        event_url: null,
      });

      if (result?.id) {
        navigate(`/events/${result.id}/dashboard`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: t.pageBg }}>
      {/* Top nav bar */}
      <header
        className="sticky top-0 z-40 border-b transition-colors duration-500"
        style={{ background: t.headerBg, backdropFilter: 'blur(20px)', borderColor: t.cardBorder }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors text-sm"
            style={{ color: t.textSecondary }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{pt ? 'Voltar' : 'Back'}</span>
          </button>
          <div className="flex-1" />
          <Button
            type="submit"
            form="create-event-form"
            disabled={loading || !formData.title || !formData.event_date}
            className="rounded-full px-6 h-9 text-sm font-medium shadow-lg transition-colors duration-300"
            style={{
              background: t.ctaBg,
              color: t.ctaText,
              boxShadow: `0 4px 20px ${t.ctaShadow}`,
            }}
          >
            {loading ? (pt ? 'A criar...' : 'Creating...') : (pt ? 'Criar Evento' : 'Create Event')}
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left column - Cover image & Theme */}
          <div className="lg:col-span-5 space-y-4">
            {/* Cover image area */}
            <div
              className="aspect-square rounded-3xl overflow-hidden relative transition-all duration-500 cursor-pointer group"
              onClick={() => {
                if (!formData.image_url) {
                  document.getElementById('cover-upload-input')?.click();
                }
              }}
            >
              {formData.image_url ? (
                <img src={formData.image_url} alt="Event cover" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Suspense fallback={<div className="w-full h-full" style={{ background: t.coverGradient }} />}>
                    <ThreeLavaLamp />
                  </Suspense>
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="text-center space-y-3 px-8">
                      <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto group-hover:bg-white/20 transition-colors">
                        <Sparkles className="h-10 w-10 text-white/70" />
                      </div>
                      <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                        {pt ? 'Clique para adicionar capa' : 'Click to add cover'}
                      </p>
                    </div>
                  </div>
                </>
              )}
              <div className="absolute bottom-4 right-4">
                <label
                  htmlFor="cover-upload-input"
                  className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-xl flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                >
                  <Pen className="h-4 w-4 text-white" />
                </label>
                <input
                  id="cover-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const { supabase } = await import('@/integrations/supabase/client');
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                    const { error } = await supabase.storage.from('event-images').upload(fileName, file);
                    if (!error) {
                      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(fileName);
                      setFormData(prev => ({ ...prev, image_url: publicUrl }));
                    }
                  }}
                />
              </div>
            </div>

            {/* Cover gallery */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-2 px-1 transition-colors duration-300" style={{ color: t.textMuted }}>
                {pt ? 'Ou escolha uma capa' : 'Or choose a cover'}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {COVER_GALLERY.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: src }))}
                    className={cn(
                      "aspect-square rounded-xl overflow-hidden ring-2 transition-all duration-200",
                      formData.image_url === src ? "ring-white/60 scale-105" : "ring-transparent hover:ring-white/20"
                    )}
                  >
                    <img src={src} alt={`Cover ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-colors duration-300"
                style={{ background: t.cardBg }}
              >
                <div
                  className="h-10 w-10 rounded-xl shrink-0 transition-all duration-500"
                  style={{ background: t.swatch }}
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs transition-colors duration-300" style={{ color: t.textMuted }}>
                    {pt ? 'Tema' : 'Theme'}
                  </p>
                  <p className="text-sm font-medium transition-colors duration-300" style={{ color: t.textPrimary }}>
                    {pt ? selectedTheme.namePt : selectedTheme.name}
                  </p>
                </div>
                <Sparkles className="h-5 w-5 transition-colors duration-300" style={{ color: t.textMuted }} />
              </button>

              {/* Theme picker dropdown */}
              {showThemePicker && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl p-2 z-50 border shadow-2xl"
                  style={{ background: t.pageBg, borderColor: t.cardBorder, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
                >
                  {EVENT_THEME_LIST.map((theme) => (
                    <button
                      key={theme.key}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(theme);
                        setShowThemePicker(false);
                      }}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                      style={{
                        background: selectedTheme.key === theme.key ? theme.cardBg : 'transparent',
                      }}
                    >
                      <div
                        className="h-8 w-8 rounded-lg shrink-0"
                        style={{ background: theme.swatch }}
                      />
                      <span className="text-sm flex-1 text-left" style={{ color: theme.textPrimary }}>
                        {pt ? theme.namePt : theme.name}
                      </span>
                      {selectedTheme.key === theme.key && (
                        <Check className="h-4 w-4" style={{ color: theme.accentDot }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Form */}
          <div className="lg:col-span-7">
            <form id="create-event-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Access type */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, access_type: prev.access_type === 'public' ? 'invite_only' : 'public' }))}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-colors duration-300"
                  style={{ borderColor: t.cardBorder, color: t.textSecondary }}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {formData.access_type === 'public'
                    ? (pt ? 'Público' : 'Public')
                    : (pt ? 'Apenas Convite' : 'Invite Only')}
                </button>
              </div>

              {/* Event name */}
              <div>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder={pt ? 'Nome do Evento' : 'Event Name'}
                  className="w-full text-4xl md:text-5xl font-light bg-transparent border-none outline-none placeholder:italic py-2 transition-colors duration-300"
                  style={{
                    color: t.textPrimary,
                    caretColor: t.accentDot,
                    // @ts-ignore
                    '--tw-placeholder-color': t.textPlaceholder,
                  }}
                />
                <style>{`
                  #create-event-form input::placeholder,
                  #create-event-form textarea::placeholder {
                    color: ${t.textPlaceholder};
                  }
                `}</style>
              </div>

              {/* Date & Time */}
              <div
                className="rounded-2xl overflow-hidden transition-colors duration-300"
                style={{ background: t.cardBg }}
              >
                <div className="flex items-stretch">
                  <div className="flex-1 flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full transition-colors duration-300" style={{ background: t.accentDot }} />
                      <div className="w-px h-4" style={{ background: t.cardBorder }} />
                    </div>
                    <span className="text-sm w-12 transition-colors duration-300" style={{ color: t.textSecondary }}>{pt ? 'Início' : 'Start'}</span>
                    <input
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                      className="flex-1 bg-transparent border-none outline-none text-sm [color-scheme:dark] transition-colors duration-300"
                      style={{ color: t.textPrimary }}
                    />
                  </div>
                </div>
                <div className="flex items-stretch">
                  <div className="flex-1 flex items-center gap-3 px-5 py-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full border-2 transition-colors duration-300" style={{ borderColor: t.textMuted }} />
                    </div>
                    <span className="text-sm w-12 transition-colors duration-300" style={{ color: t.textSecondary }}>{pt ? 'Fim' : 'End'}</span>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="flex-1 bg-transparent border-none outline-none text-sm [color-scheme:dark] transition-colors duration-300"
                      style={{ color: t.textPrimary }}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              {!showLocation ? (
                <button
                  type="button"
                  onClick={() => setShowLocation(true)}
                  className="w-full flex items-center gap-3 rounded-2xl px-5 py-4 text-left transition-colors duration-300"
                  style={{ background: t.cardBg }}
                >
                  <MapPin className="h-5 w-5" style={{ color: t.textMuted }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: t.textPrimary }}>
                      {pt ? 'Adicionar Local do Evento' : 'Add Event Location'}
                    </p>
                    <p className="text-xs" style={{ color: t.textMuted }}>
                      {pt ? 'Localização offline ou link virtual' : 'Offline location or virtual link'}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="rounded-2xl p-5 space-y-3 transition-colors duration-300" style={{ background: t.cardBg }}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4" style={{ color: t.textMuted }} />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: t.textSecondary }}>
                      {pt ? 'Local' : 'Location'}
                    </span>
                  </div>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={pt ? 'Nome do local ou endereço' : 'Venue name or address'}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-300"
                    style={{
                      background: t.cardBg,
                      color: t.textPrimary,
                      border: `1px solid ${t.cardBorder}`,
                    }}
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder={pt ? 'Cidade' : 'City'}
                      className="rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-300"
                      style={{
                        background: t.cardBg,
                        color: t.textPrimary,
                        border: `1px solid ${t.cardBorder}`,
                      }}
                    />
                    <input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder={pt ? 'País' : 'Country'}
                      className="rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-300"
                      style={{
                        background: t.cardBg,
                        color: t.textPrimary,
                        border: `1px solid ${t.cardBorder}`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              {!showDescription ? (
                <button
                  type="button"
                  onClick={() => setShowDescription(true)}
                  className="w-full flex items-center gap-3 rounded-2xl px-5 py-4 text-left transition-colors duration-300"
                  style={{ background: t.cardBg }}
                >
                  <FileText className="h-5 w-5" style={{ color: t.textMuted }} />
                  <p className="text-sm font-medium" style={{ color: t.textPrimary }}>
                    {pt ? 'Adicionar Descrição' : 'Add Description'}
                  </p>
                </button>
              ) : (
                <div className="rounded-2xl p-5 space-y-3 transition-colors duration-300" style={{ background: t.cardBg }}>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" style={{ color: t.textMuted }} />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: t.textSecondary }}>
                      {pt ? 'Descrição' : 'Description'}
                    </span>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={pt ? 'Descreva o seu evento...' : 'Describe your event...'}
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors duration-300"
                    style={{
                      background: t.cardBg,
                      color: t.textPrimary,
                      border: `1px solid ${t.cardBorder}`,
                    }}
                    autoFocus
                  />
                </div>
              )}

              {/* Event Options */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-3 px-1 transition-colors duration-300" style={{ color: t.textMuted }}>
                  {pt ? 'Opções de Evento' : 'Event Options'}
                </p>
                <div className="rounded-2xl overflow-hidden transition-colors duration-300" style={{ background: t.cardBg }}>
                  {/* Ticket price */}
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
                    <div className="flex items-center gap-3">
                      <Ticket className="h-5 w-5" style={{ color: t.textMuted }} />
                      <span className="text-sm" style={{ color: t.textPrimary }}>{pt ? 'Preço do Ingresso' : 'Ticket Price'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: t.textSecondary }}>
                        {ticketPrice ? `€${ticketPrice}` : (pt ? 'Grátis' : 'Free')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const price = prompt(pt ? 'Preço em € (deixe vazio para grátis):' : 'Price in € (leave empty for free):');
                          setTicketPrice(price || '');
                          if (price) {
                            setFormData(prev => ({ ...prev, show_payment: true, payment_amount: price }));
                          } else {
                            setFormData(prev => ({ ...prev, show_payment: false, payment_amount: '' }));
                          }
                        }}
                        className="transition-colors"
                        style={{ color: t.textMuted }}
                      >
                        <Pen className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Require approval */}
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5" style={{ color: t.textMuted }} />
                      <span className="text-sm" style={{ color: t.textPrimary }}>{pt ? 'Exigir Aprovação' : 'Require Approval'}</span>
                    </div>
                    <Switch
                      checked={requireApproval}
                      onCheckedChange={(checked) => {
                        setRequireApproval(checked);
                        if (checked) {
                          setFormData(prev => ({ ...prev, access_type: 'invite_only' }));
                        }
                      }}
                      style={{ ['--switch-active' as string]: t.switchActive }}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {/* Capacity */}
                  <button
                    type="button"
                    onClick={() => {
                      setCapacityValue(capacity ? parseInt(capacity) || PLAN_LIMIT : PLAN_LIMIT);
                      setShowCapacityModal(true);
                    }}
                    className="flex items-center justify-between px-5 py-4 w-full text-left transition-colors hover:bg-white/5"
                    style={{ borderBottom: `1px solid ${t.cardBorder}` }}
                  >
                    <div className="flex items-center gap-3">
                      <Maximize2 className="h-5 w-5" style={{ color: t.textMuted }} />
                      <span className="text-sm" style={{ color: t.textPrimary }}>{pt ? 'Capacidade' : 'Capacity'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: t.textSecondary }}>
                        {capacity || (pt ? 'Ilimitado' : 'Unlimited')}
                      </span>
                      <Pen className="h-3.5 w-3.5" style={{ color: t.textMuted }} />
                    </div>
                  </button>

                  {/* Capacity Modal */}
                  {showCapacityModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCapacityModal(false)}>
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md rounded-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                          background: t.cardBg,
                          border: `1px solid ${t.cardBorder}`,
                          backdropFilter: 'blur(24px)',
                          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Maximize2 className="h-5 w-5" style={{ color: t.textMuted }} />
                            <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>
                              {pt ? 'Capacidade do Evento' : 'Event Capacity'}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowCapacityModal(false)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                            style={{ color: t.textMuted }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Plan Info */}
                        <div
                          className="rounded-xl p-3.5 flex items-center gap-3"
                          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.cardBorder}` }}
                        >
                          <Crown className="h-4 w-4 shrink-0" style={{ color: t.accentDot || '#a78bfa' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium" style={{ color: t.textPrimary }}>
                              {pt ? 'Plano' : 'Plan'} {PLAN_NAME}
                            </p>
                            <p className="text-[11px]" style={{ color: t.textMuted }}>
                              {pt ? `Até ${PLAN_LIMIT} participantes incluídos` : `Up to ${PLAN_LIMIT} participants included`}
                            </p>
                          </div>
                        </div>

                        {/* Capacity display */}
                        <div className="text-center space-y-1">
                          <p className="text-3xl font-bold tracking-tight" style={{ color: t.textPrimary }}>
                            {capacityValue.toLocaleString()}
                          </p>
                          <p className="text-xs" style={{ color: t.textMuted }}>
                            {pt ? 'participantes' : 'participants'}
                          </p>
                        </div>

                        {/* Slider */}
                        <div className="relative px-1">
                          <Slider
                            value={[capacityValue]}
                            onValueChange={([v]) => setCapacityValue(v)}
                            min={10}
                            max={MAX_CAPACITY}
                            step={10}
                            className="w-full"
                          />
                          {/* Plan limit marker */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                            style={{ left: `${(PLAN_LIMIT / MAX_CAPACITY) * 100}%` }}
                          >
                            <div className="w-px h-4 rounded-full" style={{ background: t.accentDot || '#a78bfa' }} />
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-[10px]" style={{ color: t.textMuted }}>10</span>
                            <span className="text-[10px]" style={{ color: t.textMuted }}>
                              {pt ? `Plano: ${PLAN_LIMIT}` : `Plan: ${PLAN_LIMIT}`}
                            </span>
                            <span className="text-[10px]" style={{ color: t.textMuted }}>2.000</span>
                          </div>
                        </div>

                        {/* Extra cost info */}
                        {isOverPlan && (
                          <div
                            className="rounded-xl p-3.5 space-y-2 animate-in fade-in duration-200"
                            style={{ background: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.15)' }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>
                                {pt ? 'Créditos extra necessários' : 'Extra credits needed'}
                              </span>
                              <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>
                                €{extraCost.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: t.textMuted }}>
                              {pt
                                ? `+${capacityValue - PLAN_LIMIT} pessoas além do plano ${PLAN_NAME}. Compre créditos de visitante para desbloquear.`
                                : `+${capacityValue - PLAN_LIMIT} people beyond ${PLAN_NAME} plan. Purchase visitor credits to unlock.`}
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowPricingPopup(true)}
                              className="flex items-center gap-1.5 text-xs font-medium mt-1 transition-colors hover:opacity-80"
                              style={{ color: t.accentDot || '#a78bfa' }}
                            >
                              {pt ? 'Ver planos e créditos' : 'View plans & credits'}
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCapacity('');
                              setShowCapacityModal(false);
                            }}
                            className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
                            style={{ color: t.textSecondary, border: `1px solid ${t.cardBorder}` }}
                          >
                            {pt ? 'Ilimitado' : 'Unlimited'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCapacity(String(capacityValue));
                              setShowCapacityModal(false);
                            }}
                            className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors"
                            style={{ background: t.ctaBg, color: t.ctaText }}
                          >
                            {pt ? 'Confirmar' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Type */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5" style={{ color: t.textMuted }} />
                      <span className="text-sm" style={{ color: t.textPrimary }}>{pt ? 'Tipo de Evento' : 'Event Type'}</span>
                    </div>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="bg-transparent text-sm outline-none cursor-pointer text-right appearance-none"
                      style={{ color: t.textSecondary }}
                    >
                      <option value="" style={{ background: t.pageBg }}>{pt ? 'Selecionar' : 'Select'}</option>
                      <option value="conference" style={{ background: t.pageBg }}>Conference</option>
                      <option value="workshop" style={{ background: t.pageBg }}>Workshop</option>
                      <option value="seminar" style={{ background: t.pageBg }}>Seminar</option>
                      <option value="networking" style={{ background: t.pageBg }}>Networking</option>
                      <option value="meetup" style={{ background: t.pageBg }}>Meetup</option>
                      <option value="hackathon" style={{ background: t.pageBg }}>Hackathon</option>
                      <option value="webinar" style={{ background: t.pageBg }}>Webinar</option>
                      <option value="expo" style={{ background: t.pageBg }}>Expo</option>
                      <option value="festival" style={{ background: t.pageBg }}>Festival</option>
                      <option value="other" style={{ background: t.pageBg }}>{pt ? 'Outro' : 'Other'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment URL */}
              {formData.show_payment && (
                <div className="rounded-2xl p-5 space-y-3 transition-colors duration-300" style={{ background: t.cardBg }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket className="h-4 w-4" style={{ color: t.textMuted }} />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: t.textSecondary }}>
                      {pt ? 'Pagamento' : 'Payment'}
                    </span>
                  </div>
                  <input
                    value={formData.payment_url}
                    onChange={(e) => setFormData({ ...formData, payment_url: e.target.value })}
                    placeholder={pt ? 'Link de pagamento externo (https://...)' : 'External payment link (https://...)'}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-300"
                    style={{
                      background: t.cardBg,
                      color: t.textPrimary,
                      border: `1px solid ${t.cardBorder}`,
                    }}
                  />
                  <input
                    type="date"
                    value={formData.payment_deadline}
                    onChange={(e) => setFormData({ ...formData, payment_deadline: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none [color-scheme:dark] transition-colors duration-300"
                    style={{
                      background: t.cardBg,
                      color: t.textPrimary,
                      border: `1px solid ${t.cardBorder}`,
                    }}
                  />
                </div>
              )}

              {/* Create button */}
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.event_date}
                className="w-full h-14 rounded-2xl text-base font-semibold transition-all duration-300"
                style={{
                  background: t.ctaBg,
                  color: t.ctaText,
                  boxShadow: `0 8px 30px ${t.ctaShadow}`,
                }}
              >
                {loading ? (pt ? 'A criar...' : 'Creating...') : (pt ? 'Criar Evento' : 'Create Event')}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <UpgradePricingPopup open={showPricingPopup} onOpenChange={setShowPricingPopup} segment="org" />
    </div>
  );
};

export default CreateEvent;

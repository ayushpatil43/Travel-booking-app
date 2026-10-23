import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Check, AlertCircle, CheckCircle2, Tag, ShieldCheck, Download, Printer, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function ReservationDrawer({
  adventure,
  currency,
  exchangeRates,
  onClose,
  onReservationSuccess
}) {
  const [step, setStep] = useState(1); // 1: details/cost, 2: traveler form, 3: confirmed voucher

  // Booking details state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [slot, setSlot] = useState(adventure.availableSlots ? adventure.availableSlots[0] : '09:00 AM');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Add-ons
  const ADD_ON_OPTIONS = [
    { id: 'pickup', name: 'Private Hotel Morning Shuttle', price: 25, perPerson: true, desc: 'Direct pickup from your hotel lobby' },
    { id: 'photo', name: 'Pro Travel Photography Pack', price: 55, perPerson: false, desc: '30+ edited high-resolution action photos' },
    { id: 'tasting', name: 'Artisan Keepsake & Gourmet Tasting', price: 30, perPerson: false, desc: 'Handcrafted ceramic souvenir and local sweet box' },
    { id: 'carbon', name: 'Certified Forest Carbon Offset', price: 5, perPerson: false, desc: 'Supports regional native tree planting initiatives' }
  ];
  const [selectedAddOnIds, setSelectedAddOnIds] = useState(['pickup']);

  // Coupon code
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  // Traveler form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Form errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // Currency conversions
  const rate = exchangeRates[currency] || 1;
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
  const symbol = currencySymbols[currency] || '$';

  // Real-time Cost Calculation
  const costPerHeadUSD = adventure.costPerHead;
  const childCostPerHeadUSD = Math.round(costPerHeadUSD * 0.75);

  const baseTotalUSD = (adults * costPerHeadUSD) + (children * childCostPerHeadUSD);
  
  let addOnsTotalUSD = 0;
  const activeAddOnsList = [];
  selectedAddOnIds.forEach(id => {
    const opt = ADD_ON_OPTIONS.find(o => o.id === id);
    if (opt) {
      const price = opt.perPerson ? opt.price * (adults + children) : opt.price;
      addOnsTotalUSD += price;
      activeAddOnsList.push({ name: opt.name, price });
    }
  });

  const serviceFeeUSD = Math.round((baseTotalUSD + addOnsTotalUSD) * 0.05);

  let discountUSD = 0;
  if (appliedCoupon === 'SAGE10') {
    discountUSD = Math.round((baseTotalUSD + addOnsTotalUSD) * 0.10);
  } else if (appliedCoupon === 'EARLYBIRD') {
    discountUSD = 20;
  }

  const grandTotalUSD = Math.max(0, baseTotalUSD + addOnsTotalUSD + serviceFeeUSD - discountUSD);

  // Converted display values
  const fmt = (usd) => `${symbol}${Math.round(usd * rate).toLocaleString()}`;

  // Coupon application handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SAGE10' || code === 'EARLYBIRD') {
      setAppliedCoupon(code);
      setCouponError('');
    } else {
      setCouponError('Invalid promo code. Try "SAGE10" for 10% off.');
    }
  };

  // Toggle add-on
  const toggleAddOn = (id) => {
    if (selectedAddOnIds.includes(id)) {
      setSelectedAddOnIds(selectedAddOnIds.filter(i => i !== id));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, id]);
    }
  };

  // Validate Step 2 Comprehensive Form
  const validateTravelerForm = () => {
    const errs = {};
    if (!fullName || fullName.trim().length < 3) {
      errs.fullName = 'Please enter your full legal first and last name.';
    } else if (!fullName.trim().includes(' ')) {
      errs.fullName = 'Please enter both your first and last name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errs.email = 'Please provide a valid email for confirmation and e-tickets.';
    }

    const phoneClean = phone.replace(/[^\d+]/g, '');
    if (!phoneClean || phoneClean.length < 8) {
      errs.phone = 'Please provide a valid phone number with country code.';
    }

    if (!agreedTerms) {
      errs.terms = 'Please accept the flexible booking and cancellation policy.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit reservation to REST API
  const handleSubmitBooking = async () => {
    if (!validateTravelerForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        adventureId: adventure.id,
        date,
        slot,
        traveler: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          adults,
          children,
          guests: adults + children,
          specialRequests
        },
        selectedAddOns: activeAddOnsList,
        couponCode: appliedCoupon
      };

      const result = await api.createReservation(payload);
      setConfirmedReservation(result);
      setStep(3);
      if (onReservationSuccess) onReservationSuccess(result);
    } catch (err) {
      console.error('Reservation error:', err);
      alert(err.message || 'Booking submission failed. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--stone-200)', backgroundColor: 'var(--stone-50)' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--sage-700)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reservation Concierge
            </span>
            <h2 style={{ fontSize: '1.45rem', marginTop: '2px' }}>
              {step === 3 ? 'Reservation Confirmed' : adventure.name}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Multi-step Progress indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--blush-border)', backgroundColor: 'var(--blush-surface)' }}>
            <div style={{ flex: 1, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: step === 1 ? '3px solid var(--sage-700)' : '3px solid transparent', color: step === 1 ? 'var(--sage-800)' : 'var(--stone-500)', fontWeight: 600, fontSize: '0.85rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step === 1 ? 'var(--sage-700)' : 'var(--blush-border)', color: step === 1 ? '#ffffff' : 'var(--stone-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
              <span>Schedule & Guests</span>
            </div>
            <div style={{ flex: 1, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: step === 2 ? '3px solid var(--sage-700)' : '3px solid transparent', color: step === 2 ? 'var(--sage-800)' : 'var(--stone-500)', fontWeight: 600, fontSize: '0.85rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step === 2 ? 'var(--sage-700)' : 'var(--blush-border)', color: step === 2 ? '#ffffff' : 'var(--stone-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
              <span>Traveler Details</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '28px' }}>
          {/* STEP 1: SCHEDULE, GUESTS & REAL-TIME COST CALCULATION */}
          {step === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Date Picker */}
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" htmlFor="res-date">Select Date</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="res-date"
                      type="date"
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--stone-500)' }}>
                    ✓ 48-hour free cancellation applies
                  </span>
                </div>

                {/* Time Slot */}
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Departure Slot</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(adventure.availableSlots || ['08:30 AM', '01:30 PM']).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: slot === s ? '2px solid var(--sage-700)' : '1px solid var(--blush-border)',
                          backgroundColor: slot === s ? 'var(--sage-100)' : 'var(--blush-elevated)',
                          color: slot === s ? 'var(--sage-900)' : 'var(--stone-700)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 160ms ease'
                        }}
                      >
                        <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Guests Selector */}
              <div style={{ backgroundColor: 'var(--stone-50)', border: '1px solid var(--stone-200)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: '24px' }}>
                <span className="input-label" style={{ display: 'block', marginBottom: '12px' }}>Traveler Party</span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--stone-200)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Adults (Ages 13+)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--stone-500)' }}>{fmt(costPerHeadUSD)} per adult</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults(adults - 1)}
                      className="btn btn-stone-solid btn-sm"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                    >-</button>
                    <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{adults}</span>
                    <button
                      type="button"
                      disabled={adults + children >= 10}
                      onClick={() => setAdults(adults + 1)}
                      className="btn btn-stone-solid btn-sm"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                    >+</button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Children (Ages 4-12)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--sage-700)' }}>{fmt(childCostPerHeadUSD)} (25% off)</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren(children - 1)}
                      className="btn btn-stone-solid btn-sm"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                    >-</button>
                    <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{children}</span>
                    <button
                      type="button"
                      disabled={adults + children >= 10}
                      onClick={() => setChildren(children + 1)}
                      className="btn btn-stone-solid btn-sm"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Add-ons Selection */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="input-label">Custom Experience Add-Ons</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--stone-500)' }}>Optional</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ADD_ON_OPTIONS.map((opt) => {
                    const isChecked = selectedAddOnIds.includes(opt.id);
                    const optPriceUSD = opt.perPerson ? opt.price * (adults + children) : opt.price;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleAddOn(opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: isChecked ? '1.5px solid var(--sage-600)' : '1px solid var(--blush-border)',
                          backgroundColor: isChecked ? 'var(--sage-100)' : 'var(--blush-elevated)',
                          cursor: 'pointer',
                          transition: 'all 160ms ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ accentColor: 'var(--sage-700)', cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--stone-900)' }}>{opt.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--stone-500)' }}>{opt.desc}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--stone-900)' }}>
                          +{fmt(optPriceUSD)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Cost Calculation Card */}
              <div className="cost-calculator-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sage-800)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Real-Time Cost Breakdown
                  </span>
                  <span className="badge badge-sage">Instant Quote</span>
                </div>

                <div className="cost-row">
                  <span>Base rate ({adults} adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} child` : ''})</span>
                  <span>{fmt(baseTotalUSD)}</span>
                </div>

                {addOnsTotalUSD > 0 && (
                  <div className="cost-row">
                    <span>Selected Add-ons ({activeAddOnsList.length})</span>
                    <span>+{fmt(addOnsTotalUSD)}</span>
                  </div>
                )}

                <div className="cost-row">
                  <span>Concierge & Environmental Service Fee (5%)</span>
                  <span>+{fmt(serviceFeeUSD)}</span>
                </div>

                {discountUSD > 0 && (
                  <div className="cost-row" style={{ color: 'var(--sage-700)', fontWeight: 600 }}>
                    <span>Promo Discount ({appliedCoupon})</span>
                    <span>-{fmt(discountUSD)}</span>
                  </div>
                )}

                {/* Coupon Code Input */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--stone-200)', display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Have a promo code? (e.g. SAGE10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--stone-300)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-stone-solid btn-sm"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--sage-700)', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>Coupon "{appliedCoupon}" applied successfully!</span>
                  </div>
                )}
                {couponError && (
                  <div style={{ fontSize: '0.78rem', color: '#c53929', marginTop: '4px' }}>
                    {couponError}
                  </div>
                )}

                {/* Total Row */}
                <div className="cost-row total-row">
                  <div>
                    <div>Estimated Total</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--stone-500)' }}>
                      All local taxes & park permits included
                    </div>
                  </div>
                  <div style={{ fontSize: '1.45rem', color: 'var(--sage-800)' }}>
                    {fmt(grandTotalUSD)}
                  </div>
                </div>
              </div>

              {/* Proceed to Step 2 Button */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-stone-outline" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-sage-primary btn-lg"
                  onClick={() => setStep(2)}
                >
                  <span>Continue to Traveler Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TRAVELER VERIFICATION & FORM VALIDATION */}
          {step === 2 && (
            <div>
              <div style={{ backgroundColor: 'var(--sage-50)', border: '1px solid var(--sage-200)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--sage-700)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--sage-900)' }}>
                  <strong>Verified Reservation Guarantee:</strong> Your booking is instantly logged with local guides. Free cancellation up to 48 hours prior.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Full Name */}
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" htmlFor="fullName">Lead Traveler Legal Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: null });
                    }}
                  />
                  {errors.fullName ? (
                    <div className="input-error-msg"><AlertCircle size={13} /> {errors.fullName}</div>
                  ) : fullName.trim().includes(' ') && fullName.trim().length >= 4 ? (
                    <div className="input-success-msg"><CheckCircle2 size={13} /> Valid name format</div>
                  ) : null}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {/* Email */}
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      className={`input-field ${errors.email ? 'input-error' : ''}`}
                      placeholder="e.g. eleanor@slowtravel.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                    />
                    {errors.email ? (
                      <div className="input-error-msg"><AlertCircle size={13} /> {errors.email}</div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--stone-500)' }}>
                        E-ticket and meeting location GPS pin sent here
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" htmlFor="phone">Mobile Phone (with Country Code) *</label>
                    <input
                      id="phone"
                      type="tel"
                      className={`input-field ${errors.phone ? 'input-error' : ''}`}
                      placeholder="e.g. +1 555-019-2834"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                    />
                    {errors.phone && (
                      <div className="input-error-msg"><AlertCircle size={13} /> {errors.phone}</div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" htmlFor="specialRequests">Dietary Restrictions or Accessibility Notes</label>
                  <textarea
                    id="specialRequests"
                    rows="3"
                    className="input-field"
                    placeholder="e.g. Vegetarian diet, gluten-free, shoe size for trekking poles, hotel room number..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                {/* Terms Agreement Checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '6px' }}>
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--sage-700)', cursor: 'pointer' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--stone-700)', cursor: 'pointer' }}>
                    I acknowledge and agree to QTrip’s flexible 48h cancellation guidelines, small group environmental charter, and payment terms ({fmt(grandTotalUSD)} total).
                  </label>
                </div>
                {errors.terms && (
                  <div className="input-error-msg"><AlertCircle size={13} /> {errors.terms}</div>
                )}
              </div>

              {/* Form Navigation Buttons */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-stone-outline"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  ← Back to Schedule
                </button>

                <button
                  type="button"
                  className="btn btn-sage-primary btn-lg"
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Securing Reservation...</span>
                  ) : (
                    <>
                      <span>Confirm & Generate Voucher ({fmt(grandTotalUSD)})</span>
                      <Check size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & BOARDING PASS VOUCHER */}
          {step === 3 && confirmedReservation && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--sage-100)', color: 'var(--sage-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.65rem', marginBottom: '4px' }}>
                  Your Journey is Confirmed!
                </h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--stone-600)' }}>
                  A confirmation voucher has been sent to <strong>{confirmedReservation.traveler.email}</strong>.
                </p>
              </div>

              {/* Travel Voucher / Boarding Pass */}
              <div className="voucher-pass">
                <div className="voucher-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={20} />
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                        Official Expedition Voucher
                      </div>
                      <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-editorial)', fontWeight: 600 }}>
                        QTrip Sanctuary Access Pass
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-sage" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                    {confirmedReservation.status}
                  </span>
                </div>

                <div className="voucher-body">
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--stone-500)', letterSpacing: '0.04em' }}>
                      Experience & Location
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--stone-900)', margin: '2px 0 16px 0' }}>
                      {confirmedReservation.adventureName}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--stone-500)' }}>Lead Guest</div>
                        <div style={{ fontWeight: 600, color: 'var(--stone-900)' }}>{confirmedReservation.traveler.fullName}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--stone-500)' }}>Party Size</div>
                        <div style={{ fontWeight: 600, color: 'var(--stone-900)' }}>{confirmedReservation.traveler.guests} Guest(s)</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--stone-500)' }}>Departure Date</div>
                        <div style={{ fontWeight: 600, color: 'var(--stone-900)' }}>{confirmedReservation.date}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--stone-500)' }}>Time Slot</div>
                        <div style={{ fontWeight: 600, color: 'var(--stone-900)' }}>{confirmedReservation.slot}</div>
                      </div>
                    </div>

                    {confirmedReservation.addOns && confirmedReservation.addOns.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--stone-200)', fontSize: '0.825rem', color: 'var(--stone-700)' }}>
                        <strong>Add-ons Included:</strong> {confirmedReservation.addOns.map(a => a.name).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Barcode & Verification */}
                  <div className="voucher-barcode">
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--stone-500)', letterSpacing: '0.06em' }}>
                      Booking Reference
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: 'var(--sage-800)', margin: '4px 0 12px 0', letterSpacing: '0.08em' }}>
                      {confirmedReservation.reservationCode}
                    </div>

                    {/* Stylized simulated barcode */}
                    <div style={{ width: '130px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', background: '#ffffff', padding: '4px', border: '1px solid var(--stone-300)' }}>
                      {[4, 2, 6, 2, 5, 1, 3, 7, 2, 4, 1, 6, 3, 2, 5, 2, 6, 1].map((w, idx) => (
                        <div key={idx} style={{ width: `${w}px`, height: '36px', backgroundColor: '#1f211d' }}></div>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--stone-500)', marginTop: '8px' }}>
                      Mobile E-Ticket Ready
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-stone-outline"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  <span>Print Voucher</span>
                </button>
                <button
                  className="btn btn-sage-primary"
                  onClick={onClose}
                >
                  <span>Return to Destinations</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

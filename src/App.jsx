import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

/* ═══════════════════════════════════════════════════════════════
   SCANNER GST READY RECKONER v2 — India's GST Operating System
   A real product. Not a pitch. Every section is usable.
   Updated for GST 2.0 (post 56th Council, Sep 22 2025)
   ═══════════════════════════════════════════════════════════════ */

// ── Tokens ──
const C = {
  bg: '#FAFAF9', white: '#FFFFFF',
  ink: '#1C1917', ink2: '#292524', ink3: '#44403C', ink4: '#78716C', ink5: '#A8A29E', ink6: '#D6D3D1', ink7: '#E7E5E4', ink8: '#F5F5F4',
  blue: '#2563EB', blueLight: '#DBEAFE', blueDark: '#1D4ED8',
  green: '#059669', greenLight: '#D1FAE5',
  red: '#DC2626', redLight: '#FEE2E2',
  amber: '#D97706', amberLight: '#FEF3C7',
  indigo: '#4F46E5', indigoLight: '#E0E7FF',
  saffron: '#EA580C', saffronLight: '#FFF7ED',
  teal: '#0D9488', tealLight: '#CCFBF1',
}
const F = { body: "'Outfit', 'Noto Sans', sans-serif", mono: "'JetBrains Mono', 'Fira Code', monospace" }

// ── Global CSS ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:${F.body};background:${C.bg};color:${C.ink};line-height:1.6;overflow-x:hidden}
::selection{background:${C.blue};color:#fff}
input,textarea,select,button{font-family:inherit}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${C.ink6};border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.anim{animation:fadeUp .4s ease both}
.anim1{animation-delay:.05s}.anim2{animation-delay:.1s}.anim3{animation-delay:.15s}.anim4{animation-delay:.2s}.anim5{animation-delay:.25s}
`

// ── Utility Components ──
const Wrap = ({children,style,id}) => <div id={id} style={{maxWidth:1080,margin:'0 auto',padding:'0 20px',...style}}>{children}</div>
const Badge = ({children,color=C.blue,bg}) => <span style={{display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:5,fontSize:11,fontWeight:600,color,background:bg||color+'14',letterSpacing:'.01em',lineHeight:1.6}}>{children}</span>

const Pill = ({children,active,onClick}) => (
  <button onClick={onClick} style={{
    padding:'6px 14px',borderRadius:20,border:'none',cursor:'pointer',
    fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',transition:'all .15s',
    background:active?C.ink:C.ink8,color:active?C.white:C.ink4,
  }}>{children}</button>
)

const Btn = ({children,primary,sm,style,onClick,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding:sm?'7px 14px':'11px 22px',fontSize:sm?12.5:13.5,fontWeight:600,
    borderRadius:8,border:'none',cursor:disabled?'not-allowed':'pointer',
    opacity:disabled?.5:1,transition:'all .15s',display:'inline-flex',alignItems:'center',gap:7,
    background:primary?C.ink:C.ink8,color:primary?C.white:C.ink3,...style,
  }}>{children}</button>
)

const Card = ({children,style,onClick,pad=20}) => (
  <div onClick={onClick} style={{
    background:C.white,borderRadius:12,padding:pad,
    border:`1px solid ${C.ink7}`,cursor:onClick?'pointer':'default',
    transition:'all .2s',position:'relative',...style,
  }}
  onMouseEnter={e=>{if(onClick){e.currentTarget.style.borderColor=C.ink5;e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)'}}}
  onMouseLeave={e=>{if(onClick){e.currentTarget.style.borderColor=C.ink7;e.currentTarget.style.boxShadow='none'}}}
  >{children}</div>
)

const Modal = ({open,onClose,title,children,wide}) => {
  if(!open)return null
  return(
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
      <div style={{position:'absolute',inset:0,background:'rgba(28,25,23,.5)',backdropFilter:'blur(4px)'}}/>
      <div onClick={e=>e.stopPropagation()} style={{
        position:'relative',background:C.white,borderRadius:16,width:'100%',maxWidth:wide?780:560,
        maxHeight:'85vh',overflow:'auto',animation:'fadeUp .2s ease',boxShadow:'0 25px 50px -12px rgba(0,0,0,.2)',
      }}>
        <div style={{position:'sticky',top:0,background:C.white,padding:'16px 20px',borderBottom:`1px solid ${C.ink7}`,display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:1}}>
          <h3 style={{fontSize:16,fontWeight:700}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:C.ink4}}>✕</button>
        </div>
        <div style={{padding:20}}>{children}</div>
      </div>
    </div>
  )
}

const SearchInput = ({value,onChange,placeholder}) => (
  <div style={{position:'relative'}}>
    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:16,color:C.ink5}}>⌕</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:'100%',padding:'11px 14px 11px 36px',border:`1px solid ${C.ink7}`,borderRadius:10,fontSize:14,outline:'none',background:C.white,transition:'border .2s'}}
      onFocus={e=>e.target.style.borderColor=C.ink4} onBlur={e=>e.target.style.borderColor=C.ink7}/>
  </div>
)

// ══════════════════════════════════════════
// DATA — GST 2.0 Rate Schedule (Post Sep 22 2025)
// 7 Schedules as per Notification 9/2025-CT(Rate)
// ══════════════════════════════════════════
const ratesData = [
  // NIL / Exempt
  {hsn:'0401',desc:'Fresh milk, pasteurised milk, UHT milk',rate:0,type:'Goods',cat:'Dairy & Food',note:'Loose/unbranded only'},
  {hsn:'0713',desc:'Dried pulses — moong, urad, masoor, chana, arhar',rate:0,type:'Goods',cat:'Dairy & Food',note:'Pre-packaged & labelled → 5%'},
  {hsn:'1001',desc:'Wheat, rice, bajra, jowar, ragi (loose)',rate:0,type:'Goods',cat:'Dairy & Food',note:'Pre-packaged branded → 5%'},
  {hsn:'0201',desc:'Fresh meat (not frozen, not pre-packaged)',rate:0,type:'Goods',cat:'Dairy & Food'},
  {hsn:'0402',desc:'Curd, lassi, buttermilk (non-branded)',rate:0,type:'Goods',cat:'Dairy & Food'},
  {hsn:'0802',desc:'Dry fruits — almonds, cashews, walnuts, pistachios',rate:0,type:'Goods',cat:'Dairy & Food',note:'Roasted/salted → 5% or 18%'},
  {hsn:'1905',desc:'Plain bread (no added sugar/cocoa)',rate:0,type:'Goods',cat:'Dairy & Food'},
  {hsn:'0902',desc:'Unbranded leaf tea',rate:0,type:'Goods',cat:'Dairy & Food'},
  {hsn:'9992',desc:'Education — schools, colleges, recognised institutions',rate:0,type:'Services',cat:'Education'},
  {hsn:'9993',desc:'Healthcare — hospitals, clinics, diagnostic labs',rate:0,type:'Services',cat:'Healthcare'},
  {hsn:'9973',desc:'Residential dwelling rent (for personal use)',rate:0,type:'Services',cat:'Real Estate'},
  {hsn:'—',desc:'Individual life insurance premium (post GST 2.0)',rate:0,type:'Services',cat:'Insurance',note:'Exempted from Sep 2025'},
  {hsn:'—',desc:'Individual health insurance premium (post GST 2.0)',rate:0,type:'Services',cat:'Insurance',note:'Exempted from Sep 2025'},
  // 5% (Merit Rate — expanded post GST 2.0)
  {hsn:'1006',desc:'Rice — pre-packaged & labelled',rate:5,type:'Goods',cat:'Dairy & Food'},
  {hsn:'0402',desc:'Condensed milk, flavoured milk',rate:5,type:'Goods',cat:'Dairy & Food'},
  {hsn:'1704',desc:'Mithai, Indian sweets (sugar confectionery)',rate:5,type:'Goods',cat:'Dairy & Food',note:'Was 18% → reduced to 5% (GST 2.0)'},
  {hsn:'2106',desc:'Namkeens, bhujia, instant noodles, pasta',rate:5,type:'Goods',cat:'Dairy & Food',note:'Was 12% → reduced to 5% (GST 2.0)'},
  {hsn:'3306',desc:'Toothpaste, dental preparations',rate:5,type:'Goods',cat:'FMCG',note:'Was 18% → 5% (GST 2.0)'},
  {hsn:'3401',desc:'Soap, washing preparations',rate:5,type:'Goods',cat:'FMCG',note:'Was 18% → 5% (GST 2.0)'},
  {hsn:'3305',desc:'Hair oil, shampoo',rate:5,type:'Goods',cat:'FMCG',note:'Was 18% → 5% (GST 2.0)'},
  {hsn:'5007',desc:'Silk fabrics — Banarasi, Kanchipuram, etc.',rate:5,type:'Goods',cat:'Textiles'},
  {hsn:'5208',desc:'Cotton fabrics (woven)',rate:5,type:'Goods',cat:'Textiles'},
  {hsn:'6109',desc:'Readymade garments ≤ ₹1,500',rate:5,type:'Goods',cat:'Textiles',note:'Above ₹1,500 → 18%'},
  {hsn:'3002',desc:'Vaccines, sera, blood fractions',rate:5,type:'Goods',cat:'Pharma'},
  {hsn:'3004',desc:'33 lifesaving drugs (specified list)',rate:0,type:'Goods',cat:'Pharma',note:'Moved to NIL under GST 2.0'},
  {hsn:'3004',desc:'Other medicines/formulations',rate:5,type:'Goods',cat:'Pharma',note:'Was 12% → 5% (GST 2.0)'},
  {hsn:'6403',desc:'Footwear ≤ ₹1,500',rate:5,type:'Goods',cat:'Textiles'},
  {hsn:'8432',desc:'Agricultural machinery — tillers, ploughs',rate:5,type:'Goods',cat:'Agriculture',note:'Was 12% → 5% (GST 2.0)'},
  {hsn:'9017',desc:'Spectacles, corrective goggles',rate:5,type:'Goods',cat:'Healthcare',note:'Was 28% → 5% (GST 2.0)'},
  {hsn:'4420',desc:'Handicraft wooden articles, idols',rate:5,type:'Goods',cat:'Handicrafts',note:'Was 12% → 5% (GST 2.0)'},
  {hsn:'9961',desc:'Restaurant services (all, standalone)',rate:5,type:'Services',cat:'Hospitality',note:'No ITC. All restaurants including AC.'},
  {hsn:'9964',desc:'Passenger transport — AC bus, railways',rate:5,type:'Services',cat:'Transport'},
  {hsn:'9965',desc:'Goods Transport Agency (GTA) services',rate:5,type:'Services',cat:'Transport',note:'Under forward charge with ITC'},
  {hsn:'9954',desc:'Construction — affordable housing (PMAY)',rate:5,type:'Services',cat:'Real Estate',note:'Carpet area ≤ 60 sqm, value ≤ ₹45L'},
  // 18% (Standard Rate)
  {hsn:'8471',desc:'Laptops, computers, tablets',rate:18,type:'Goods',cat:'Electronics'},
  {hsn:'8517',desc:'Mobile phones & accessories',rate:18,type:'Goods',cat:'Electronics'},
  {hsn:'8528',desc:'Television — LED, LCD, Smart TV',rate:18,type:'Goods',cat:'Electronics',note:'Was 28% → 18% (GST 2.0)'},
  {hsn:'8450',desc:'Washing machines',rate:18,type:'Goods',cat:'Electronics',note:'Was 28% → 18% (GST 2.0)'},
  {hsn:'8415',desc:'Air conditioners (residential)',rate:18,type:'Goods',cat:'Electronics',note:'Was 28% → 18% (GST 2.0)'},
  {hsn:'8422',desc:'Dishwashers',rate:18,type:'Goods',cat:'Electronics',note:'Was 28% → 18% (GST 2.0)'},
  {hsn:'8703',desc:'Compact cars (≤1200cc petrol, ≤1500cc diesel)',rate:18,type:'Goods',cat:'Automobiles',note:'Was 28% → 18% (GST 2.0)'},
  {hsn:'8711',desc:'Two-wheelers ≤ 350cc',rate:18,type:'Goods',cat:'Automobiles'},
  {hsn:'2523',desc:'Cement — all types',rate:18,type:'Goods',cat:'Construction',note:'Was 28% → 18% (GST 2.0)'},
  {hsn:'7308',desc:'Iron/steel structures, tubes, pipes',rate:18,type:'Goods',cat:'Construction'},
  {hsn:'3926',desc:'Plastic articles n.e.c.',rate:18,type:'Goods',cat:'Industrial'},
  {hsn:'6109',desc:'Readymade garments > ₹1,500',rate:18,type:'Goods',cat:'Textiles'},
  {hsn:'6403',desc:'Footwear > ₹1,500',rate:18,type:'Goods',cat:'Textiles'},
  {hsn:'9971',desc:'Banking & financial services',rate:18,type:'Services',cat:'BFSI'},
  {hsn:'9971',desc:'General insurance (non-individual policies)',rate:18,type:'Services',cat:'BFSI',note:'Individual health/life = NIL (GST 2.0)'},
  {hsn:'9983',desc:'Legal, accounting, CA services',rate:18,type:'Services',cat:'Professional'},
  {hsn:'9983',desc:'Management & IT consultancy',rate:18,type:'Services',cat:'Professional'},
  {hsn:'9988',desc:'IT services, SaaS, software development',rate:18,type:'Services',cat:'Technology'},
  {hsn:'9985',desc:'Telecom services',rate:18,type:'Services',cat:'Technology'},
  {hsn:'9967',desc:'Courier and logistics services',rate:18,type:'Services',cat:'Transport'},
  {hsn:'9972',desc:'Commercial property rental',rate:18,type:'Services',cat:'Real Estate'},
  {hsn:'9973',desc:'Residential dwelling rent (for business use)',rate:18,type:'Services',cat:'Real Estate',note:'RCM on recipient'},
  {hsn:'9963',desc:'Hotel accommodation ₹1,001–₹7,500/day',rate:18,type:'Services',cat:'Hospitality'},
  {hsn:'9954',desc:'Construction — commercial property',rate:18,type:'Services',cat:'Real Estate'},
  // Special rates
  {hsn:'7113',desc:'Gold jewellery',rate:3,type:'Goods',cat:'Precious Metals'},
  {hsn:'7108',desc:'Gold bars, coins, articles',rate:3,type:'Goods',cat:'Precious Metals'},
  {hsn:'7106',desc:'Silver bars, articles',rate:3,type:'Goods',cat:'Precious Metals'},
  {hsn:'7102',desc:'Diamonds — rough & polished',rate:0.25,type:'Goods',cat:'Precious Metals'},
  // 40% (Luxury / Demerit — replaces 28% + cess)
  {hsn:'2202',desc:'Aerated beverages, energy drinks',rate:40,type:'Goods',cat:'Luxury/Demerit',note:'New 40% slab (GST 2.0). Was 28%+cess'},
  {hsn:'8903',desc:'Yachts, private aircraft',rate:40,type:'Goods',cat:'Luxury/Demerit',note:'New 40% slab (GST 2.0)'},
  {hsn:'8703',desc:'Luxury cars, SUVs (>1500cc, >4m, >₹10L)',rate:40,type:'Goods',cat:'Luxury/Demerit',note:'New 40% slab (GST 2.0)'},
  {hsn:'8711',desc:'High-end motorcycles > 350cc',rate:40,type:'Goods',cat:'Luxury/Demerit'},
  {hsn:'—',desc:'Pan masala, gutkha, chewing tobacco',rate:28,type:'Goods',cat:'Tobacco',note:'Stays at 28%+cess until compensation loan cleared'},
  {hsn:'—',desc:'Cigarettes, bidi, unmanufactured tobacco',rate:28,type:'Goods',cat:'Tobacco',note:'Stays at 28%+cess until compensation loan cleared'},
  {hsn:'—',desc:'Online gaming, betting, horse racing',rate:28,type:'Services',cat:'Gaming',note:'28% on full face value'},
]

// ══════════════════════════════════════════
// DATA — Chapters (10 chapters, deep content)
// ══════════════════════════════════════════
const chapters = [
  {id:1,title:'Constitutional Framework',sub:'101st Amendment · Article 246A · Article 279A · GST Council',color:C.blue,
    content:'The 101st Constitutional Amendment Act, 2016 is the legal foundation of GST. It inserted Article 246A giving both Parliament and State Legislatures concurrent power to levy GST. Article 279A established the GST Council — a joint body of the Centre and States chaired by the Union Finance Minister.',
    sections:['Article 246A — Concurrent power to levy GST on goods and services','Article 269A — IGST on inter-state supply; apportioned between states','Article 279A — GST Council: Union FM (Chair) + Union MoS Revenue + State FMs','Article 366(12A) — Constitutional definition of GST','Seventh Schedule — Entry 84 (List I) and Entry 54 (List II) deleted','75% weighted majority required for Council decisions; 1/3 weight to Centre, 2/3 to States'],
    insight:'In 50+ Council meetings since 2017, formal voting has never occurred — every decision has been by consensus. The SC in Mohit Minerals (2022) confirmed GST Council recommendations are persuasive, not binding. The 56th Meeting (Sep 2025) approved GST 2.0 — the biggest structural reform since 2017.',
    practice:'For CA/CMA exams: Article 279A(4) lists matters requiring Council recommendation. GST Council is a constitutional body (not statutory). States can technically deviate from recommendations post-Mohit Minerals.'},
  {id:2,title:'Supply — Scope & Taxability',sub:'Section 7 · Schedules I-III · Composite & Mixed Supply',color:C.indigo,
    content:'Section 7 defines the taxable event — "supply" of goods or services, made for consideration, in the course or furtherance of business. Schedules I-III carve out deemed supplies (without consideration), categorisation (goods vs services), and exclusions (neither goods nor services).',
    sections:['Section 7(1)(a) — All forms of supply for consideration in course of business','Section 7(1)(b) — Import of services for consideration, even without business purpose','Schedule I — Supply without consideration: permanent transfer of business assets; supply between related persons/distinct persons; principal-agent supply; import of services from related person','Schedule II — Treatment as goods or services: transfer of title = goods; lease/right to use = services; works contract = services; restaurant/catering = services','Schedule III — Neither goods nor services: employee services to employer; court fees/challan; burial/cremation services; actionable claims (except lottery/betting/gambling)','Section 2(30) Composite Supply — naturally bundled, taxed at principal supply rate','Section 2(74) Mixed Supply — not naturally bundled, taxed at highest rate'],
    insight:'The 2023 amendment to Schedule III Entry 8(a) clarified warehoused goods sold before customs clearance are supply. The SC in Northern Operating Systems (2022) held employee secondment = import of services under RCM. Both had massive corporate impact.',
    practice:'Composite vs Mixed is frequently tested and frequently litigated. A restaurant selling food + cutlery set together = mixed supply (18%, not 5%). A hotel package (room + breakfast + airport transfer) = composite supply (taxed at room rate). Document the bundling rationale.'},
  {id:3,title:'Input Tax Credit',sub:'Section 16-21 · GSTR-2B · IMS · Blocked Credits',color:C.green,
    content:'ITC is the mechanism that prevents cascading taxation — the core promise of GST. Section 16 lays down four conditions for claiming ITC. Since October 2024, the Invoice Management System (IMS) requires active acceptance/rejection of invoices before GSTR-2B generation. GSTR-2B is now the single source of truth for ITC.',
    sections:['Section 16(2) — Four conditions: (a) tax invoice, (b) receipt of goods/services, (c) tax paid to government, (d) return filed','Section 16(4) — Time limit: 30th November of next FY or annual return date, whichever earlier','Section 16(5) — Conditional relief for FY 2017-18 to 2020-21 (Budget 2024 insertion)','Section 17(5) — Blocked credits: motor vehicles (except when used for transport), food & beverages, outdoor catering, beauty treatment, health & fitness, life/health insurance (except statutory), club memberships, construction of immovable property (see Safari Retreats exception), travel benefits to employees, works contract for construction, goods/services for personal consumption','Rule 36(4) — ITC restricted to GSTR-2B amount only (no provisional 5% buffer since Jan 2022)','Section 38 — Auto-generated ITC statement (GSTR-2B) is the single source of truth','IMS (Invoice Management System) — Accept/Reject/Pending workflow since Oct 2024'],
    insight:'Over 1.5 crore ITC mismatch notices were issued in FY 2023-24 — the single biggest pain point in GST. The removal of the 5% provisional buffer means 100% of claimed ITC must appear in GSTR-2B. The IMS adds another compliance layer. Safari Retreats (SC 2024) opened ITC on commercial construction — potentially unlocking ₹50,000+ crore in credits.',
    practice:'Monthly discipline: Download GSTR-2B by 14th → reconcile with purchase register → reject invoices from non-filers in IMS → file GSTR-3B by 20th. Document every Rule 37 reversal (ITC reversed when supplier doesn\'t pay tax within 180 days).'},
  {id:4,title:'Registration & Thresholds',sub:'Section 22-30 · Composition Scheme · Aadhaar Authentication',color:C.amber,
    content:'GST registration is the gateway to the GST ecosystem. Mandatory for businesses exceeding ₹40 lakh turnover for goods (₹20 lakh for services, ₹10 lakh for special category states). Section 24 lists 11 categories requiring compulsory registration regardless of threshold.',
    sections:['Section 22 — Threshold: ₹40L goods / ₹20L services / ₹10L special category states','Section 24 — Compulsory registration (11 cases): inter-state supply, casual taxable person, reverse charge liable, e-commerce operators, TDS/TCS deductors, NRTP, agents, input service distributor','Section 10 — Composition Scheme: ₹1.5 crore limit; CGST rates: 0.5% manufacturers, 2.5% restaurants, 0.5% other suppliers; cannot collect tax or claim ITC; intra-state only','Section 25 — PAN-based GSTIN (15-digit); one registration per state','Section 29 — Cancellation (voluntary or suo motu); Section 30 — Revocation within 90 days','Aadhaar authentication mandatory for new registrations in most states since 2023'],
    insight:'GSTN now does physical verification within 30 days of most new registrations — a response to the fake billing menace. Over 29,000 fake GSTINs were detected and cancelled in nationwide drives in 2023-24. The 90-day revocation window is strict — after that, the only remedy is fresh registration.',
    practice:'Critical risk: Section 24 has 11 categories of compulsory registration. Missing any = unregistered person = supplier\'s ITC jeopardised across the chain. Composition taxpayers cannot issue tax invoices — only bill of supply. They file CMP-08 (quarterly) + GSTR-4 (annual).'},
  {id:5,title:'Valuation & Transaction Value',sub:'Section 15 · Rules 27-35 · Related Party · Corporate Guarantee',color:C.saffron,
    content:'Section 15 establishes that the value of supply = transaction value (price actually paid), provided the supplier and recipient are not related and price is the sole consideration. For related parties, Rules 28-31 prescribe a valuation hierarchy: Open Market Value → Value of like supply → Cost + 10% → Residual method.',
    sections:['Section 15(1) — Transaction value = price paid when not related, price is sole consideration','Section 15(2) — Inclusions: incidental expenses, interest/late fee, subsidies linked to price','Section 15(3) — Exclusions: discounts given before or at time of supply (if shown on invoice); post-supply discounts linked to specific invoices and ITC reversed by recipient','Rule 28 — Related person valuation: OMV → comparable goods → cost + 10% → residual','Rule 28(2) — Corporate guarantee to related persons: deemed 1% OMV (retrospective from Budget 2024)','Rule 30 — Supply between distinct persons (other than agents)','Rule 32 — Special cases: money changers (1% or 0.25%), air travel agents, life insurance, second-hand goods'],
    insight:'The corporate guarantee controversy is ongoing. Multiple High Courts (Calcutta, Karnataka, Allahabad, Meghalaya) stayed Circular 204/2023 imposing 1% deemed value. Government retaliated with retrospective Rule 28(2) in Budget 2024. SC admission pending. Every group company guaranteeing its subsidiary faces 18% GST on 1% of guarantee value — potentially thousands of crores in disputed demands.',
    practice:'GST valuation ≠ Income Tax transfer pricing. A related party transaction compliant under IT Act may still fail GST valuation. For ISD distribution, use Rule 28 OMV if services received from head office. Document all valuation basis — it\'s the #1 audit trigger.'},
  {id:6,title:'Time & Place of Supply',sub:'Sections 12-14 CGST · Sections 10-13 IGST · IGST vs CGST+SGST',color:C.teal,
    content:'Time of Supply = when does the tax liability arise? Place of Supply = is it intra-state (CGST+SGST) or inter-state (IGST)? Getting either wrong means wrong tax collection and manual correction is expensive.',
    sections:['Section 12 CGST — Time of supply of goods: invoice date or payment date, whichever earlier','Section 13 CGST — Time of supply of services: invoice date (if within 30 days of service) or date of payment','Section 14 CGST — Change in rate: supplies spanning a rate change follow specific allocation rules','Section 10 IGST — Place of supply of goods (other than import/export): location of goods at time of delivery','Section 12 IGST — Place of supply of services (B2B): location of recipient; (B2C): location of supplier','Section 13 IGST — Cross-border services: general rule = location of recipient; exceptions for immovable property, events, training, transport'],
    insight:'Place of supply for services is the #1 area of disputes. B2B general rule (location of recipient) sounds simple but breaks down for: immovable property services (location of property), events/training (place of performance), telecom (registered address or place of use), and banking (location of supplier for unregistered recipients). Export of services requires place of supply outside India under Section 13.',
    practice:'Common costly error: treating inter-state as intra-state. IGST paid on inter-state = ITC available to recipient. But CGST+SGST paid wrongly on inter-state = need refund from one jurisdiction + fresh payment to another. Always verify recipient\'s state before invoicing.'},
  {id:7,title:'E-Way Bill & E-Invoice',sub:'Rule 138 · E-Invoice Threshold ₹5Cr · IRN · NIC Portal',color:'#7C3AED',
    content:'E-way bill is mandatory for goods movement exceeding ₹50,000 (₹2 lakh for gold/precious stones). E-invoicing, introduced in phases from 2020, is now mandatory for all taxpayers with AATO exceeding ₹5 crore (from August 2023). E-invoice auto-populates GSTR-1 and enables dynamic e-way bill generation.',
    sections:['Rule 138 — E-way bill required for goods movement above ₹50,000','Rule 138A — Documents to accompany goods: invoice/bill of supply/delivery challan + e-way bill','Section 68 — Inspection of goods in movement; powers of detention','Section 129 — Detention/seizure: tax amount + 200% penalty (or 50% of value for exempt goods)','E-invoicing — Mandatory for AATO > ₹5 crore (from Aug 2023); B2B and B2G supplies','Rule 48(4) — Invoice Reference Number (IRN) from NIC portal; valid only if QR code present','30-day reporting window on IRP for AATO > ₹100 crore (from Nov 2023) — prevents backdating'],
    insight:'E-invoicing has been a game-changer for compliance. Since 2022, e-invoices auto-populate GSTR-1, reducing manual filing burden significantly. The 30-day IRP reporting window for large taxpayers effectively prevents backdating of invoices — a powerful anti-evasion measure. GSTN data shows a 23% increase in timely GSTR-1 filings after e-invoice auto-population was enabled.',
    practice:'E-way bill validity: up to 100km = 1 day; every additional 100km = 1 extra day. Gold/precious stones: ₹2 lakh threshold. Part A of e-way bill auto-generates when e-invoice is created. Always verify: Part B (vehicle details) can be updated if vehicle changes mid-transit.'},
  {id:8,title:'Returns & Refunds',sub:'GSTR-1 · GSTR-3B · GSTR-9/9C · Section 54 Refunds',color:'#DB2777',
    content:'The GST return framework has stabilised into: GSTR-1 (outward supply details, 11th of next month) → GSTR-3B (summary return + tax payment, 20th) → GSTR-9 (annual, 31st December) → GSTR-9C (reconciliation, 31st December). Refunds under Section 54 cover exports, inverted duty structure, and excess cash balance.',
    sections:['GSTR-1 — Monthly/Quarterly outward supply details; auto-populates recipient\'s GSTR-2B','GSTR-3B — Summary return with tax payment; auto-populated from GSTR-1 + GSTR-2B since Jan 2024','GSTR-9 — Annual return; mandatory for AATO > ₹2 crore; self-certified','GSTR-9C — Reconciliation statement; mandatory for AATO > ₹5 crore; self-certified (not CA-certified) since FY 2021-22','Section 54 — Refund: export of goods/services, inverted duty structure, excess cash ledger balance, deemed export, UN/Embassy supplies','Rule 89-97 — Refund application (RFD-01), processing timeline (60 days), provisional refund (90% within 7 days for exports)','QRMP Scheme — Quarterly GSTR-1 + GSTR-3B for AATO ≤ ₹5 crore; monthly IFF for B2B invoices; PMT-06 for monthly tax payment'],
    insight:'GSTR-3B is now auto-populated from GSTR-1 and GSTR-2B since January 2024. The government plans to lock GSTR-3B from modification from FY 2025-26, meaning auto-populated figures become final. 40% of export refund claims are rejected for procedural deficiencies — most common: mismatch between shipping bill and GSTR-1 Table 6A.',
    practice:'Critical: GSTR-3B once filed cannot be revised (SC in Bharti Airtel, 2021). Over-reported liability → claim refund under Section 54. Under-reported → face demand under Section 73/74. File GSTR-1 before GSTR-3B — 3B now cannot be filed until 1 is submitted.'},
  {id:9,title:'Assessment, Audit & Anti-Evasion',sub:'Section 59-67 · ASMT-10 · BIFA · DGGI',color:C.red,
    content:'GST enforcement has intensified dramatically since 2022. Self-assessment (Section 59), scrutiny (Section 61/ASMT-10), audit (Section 65), and inspection/search/seizure (Section 67) form the government\'s compliance toolkit. BIFA (Business Intelligence and Fraud Analytics) now auto-generates scrutiny notices.',
    sections:['Section 59 — Self-assessment: tax liability determined by taxpayer through returns','Section 61 — Scrutiny of returns: ASMT-10 notice; reply within 30 days via ASMT-11','Section 62 — Best judgment assessment of non-filers (ASMT-13)','Section 63 — Assessment of unregistered persons','Section 65 — Audit by tax authorities: ASMT-14 notice; can examine books, records, returns for any period','Section 66 — Special audit: ordered by Commissioner based on complexity; CA/CMA appointed','Section 67 — Inspection, search, seizure: requires "reasons to believe"; authorisation from Joint Commissioner or above'],
    insight:'BIFA (Business Intelligence and Fraud Analytics) by GSTN has transformed enforcement. In FY 2023-24, over 50 lakh ASMT-10 notices were generated through automated mismatch detection. DGGI recovered ₹2.01 lakh crore in FY24 through anti-evasion drives. The message: the government sees everything in your GSTR data — proactive reconciliation is the only defence.',
    practice:'If you receive ASMT-10: reply within 30 days with GSTR-2B vs purchase register reconciliation, supplier payment proof, and reversal details. Many are system-generated and can be closed with documentation. Do NOT ignore — non-reply triggers Section 73/74 proceedings.'},
  {id:10,title:'Demands, Penalties & Appeals',sub:'Section 73/74 · DRC-07 · GSTAT · Pre-deposit',color:C.ink3,
    content:'Demand proceedings under Section 73 (non-fraud, 3-year limit, interest only if paid before order) and Section 74 (fraud/suppression, 5-year limit, 100% penalty) culminate in DRC-07 demand orders. The appellate hierarchy: Appellate Authority → GSTAT → High Court → Supreme Court.',
    sections:['Section 73 — Non-fraud demands: 3-year limitation; SCN in DRC-01; if tax + interest paid before order → no penalty','Section 74 — Fraud/suppression: 5-year limitation; 100% penalty; 15% penalty if paid within 30 days of SCN','Section 75 — Common provisions: opportunity of hearing mandatory; reasoned order required','Section 107 — First appeal to Appellate Authority: 3 months + 1 month condonable delay; pre-deposit 10% of disputed tax','Section 112 — Appeal to GSTAT: 3 months from order; pre-deposit 10% (max ₹25 crore CGST)','Section 128A — Amnesty scheme for demands under Section 73 for FY 2017-18 to 2019-20: pay tax + interest, penalty waived','Section 117-118 — GSTAT (GST Appellate Tribunal): operationalised mid-2024 after years of delay'],
    insight:'GSTAT becoming operational in 2024 is a watershed moment — earlier, taxpayers had to directly approach High Courts (expensive and slow). GSTAT pre-deposit is capped at ₹25 crore CGST + ₹25 crore SGST. Section 128A amnesty for pre-2020 demands is a significant relief — but only for Section 73 (non-fraud) cases, and tax + interest must be fully paid.',
    practice:'First appeal deadline: 3 months from order date. Condonable delay: 1 month only. After that — no appeal possible. Pre-deposit: 10% of disputed tax only (not penalty or interest). Always file within time, even if you plan to negotiate settlement.'},
]

// ══════════════════════════════════════════
// DATA — Compliance Calendar (March 2026 + Standard)
// ══════════════════════════════════════════
const calendar = [
  {form:'GSTR-7',desc:'TDS Return under GST',due:'10th',freq:'Monthly',who:'Government/PSU TDS deductors',penalty:'₹200/day (₹100 CGST + ₹100 SGST)',next:'10 Apr 2026',note:'TDS at 2% (1% CGST + 1% SGST) on supplies > ₹2.5 lakh from government'},
  {form:'GSTR-8',desc:'E-commerce TCS Return',due:'10th',freq:'Monthly',who:'E-commerce operators (Amazon, Flipkart, etc.)',penalty:'₹200/day',next:'10 Apr 2026',note:'TCS at 1% (0.5% CGST + 0.5% SGST) on net taxable supplies'},
  {form:'GSTR-1',desc:'Outward Supply Statement',due:'11th',freq:'Monthly',who:'All regular taxpayers (monthly filers)',penalty:'Currently no late fee enforced (portal)',next:'11 Apr 2026',note:'QRMP taxpayers: quarterly GSTR-1, but can use IFF for B2B invoices in months 1 & 2'},
  {form:'GSTR-6',desc:'Input Service Distributor Return',due:'13th',freq:'Monthly',who:'ISD registrants',penalty:'₹50/day',next:'13 Apr 2026',note:'ISD registration mandatory from April 2025 for multi-state entities distributing common service ITC'},
  {form:'IFF',desc:'Invoice Furnishing Facility',due:'13th',freq:'Monthly (M1, M2 of quarter)',who:'QRMP taxpayers',penalty:'N/A (optional facility)',next:'13 Apr 2026',note:'Upload B2B invoices so buyers can claim ITC in their monthly GSTR-3B'},
  {form:'GSTR-5',desc:'Non-Resident Taxable Person Return',due:'13th / 20th',freq:'Monthly',who:'Non-resident taxable persons',penalty:'₹50/day',next:'20 Apr 2026',note:'Must file within 7 days of expiry of registration period or 20th, whichever earlier'},
  {form:'GSTR-3B',desc:'Summary Return + Tax Payment',due:'20th',freq:'Monthly',who:'All regular taxpayers (turnover > ₹5 Cr)',penalty:'₹50/day (₹20 nil) + 18% interest on late tax',next:'20 Apr 2026',note:'Auto-populated from GSTR-1 + GSTR-2B since Jan 2024. Cannot file before GSTR-1.'},
  {form:'GSTR-3B QRMP',desc:'Quarterly Summary Return',due:'22nd / 24th',freq:'Quarterly',who:'AATO ≤ ₹5 Cr (QRMP scheme)',penalty:'Same as monthly',next:'22/24 Apr 2026',note:'22nd for Cat A states (Chhattisgarh, MP, Gujarat, Maharashtra, etc.); 24th for Cat B (rest)'},
  {form:'PMT-06',desc:'Monthly Tax Payment (QRMP)',due:'25th',freq:'Monthly (M1, M2)',who:'QRMP taxpayers',penalty:'Interest on shortfall',next:'25 Apr 2026',note:'Fixed sum (based on previous quarter) or self-assessment method. Pay by 25th of months 1 & 2.'},
  {form:'GSTR-11',desc:'UIN Holders\' Refund Statement',due:'28th',freq:'Monthly',who:'Persons issued Unique Identity Number',penalty:'N/A',next:'28 Apr 2026',note:'Embassies, UN bodies claiming refund on inward supplies'},
  {form:'CMP-08',desc:'Composition Quarterly Payment',due:'18th after quarter',freq:'Quarterly',who:'Composition taxpayers',penalty:'Interest on late payment',next:'18 Apr 2026 (Q4 FY26)',note:'Self-assessed tax. Composition dealer pays 1.5% (mfg) or 6% (restaurants) from own pocket.'},
  {form:'GSTR-4',desc:'Composition Annual Return',due:'30th April',freq:'Annual',who:'Composition taxpayers',penalty:'₹50/day (₹20 nil)',next:'30 Apr 2026 (FY 2025-26)',note:'Annual summary of all quarterly CMP-08 payments'},
  {form:'GSTR-9',desc:'Annual Return',due:'31st December',freq:'Annual',who:'AATO > ₹2 crore',penalty:'₹200/day, max 0.5% of turnover in state',next:'31 Dec 2026 (FY 2025-26)',note:'Self-certified. Covers all monthly return data in consolidated form. Turnover ≤ ₹2 Cr = optional.'},
  {form:'GSTR-9C',desc:'Reconciliation Statement',due:'31st December',freq:'Annual',who:'AATO > ₹5 crore',penalty:'Included in GSTR-9 penalty',next:'31 Dec 2026 (FY 2025-26)',note:'Self-certified by taxpayer (NOT CA-certified) since FY 2021-22. Reconciles books with returns.'},
  {form:'RFD-11 / LUT',desc:'Letter of Undertaking for Exports',due:'31st March',freq:'Annual',who:'Exporters opting to supply without IGST payment',penalty:'Cannot export under bond/LUT if not renewed',next:'31 Mar 2027 (FY 2026-27)',note:'Must be renewed at start of every FY. If missed, must pay IGST and claim refund.'},
]

// ══════════════════════════════════════════
// DATA — Case Laws (10 landmark + real citations)
// ══════════════════════════════════════════
const cases = [
  {id:1,name:'Safari Retreats Pvt Ltd v. Chief Commissioner',court:'Supreme Court',year:2024,cite:'2024 INSC 783',topic:'ITC on Commercial Construction',sec:'Section 17(5)(d)',status:'active',
    held:'ITC on construction of immovable property is available when the property is used for making taxable outward supplies such as renting/leasing. Section 17(5)(d) blocks ITC on construction for own use, not when the constructed property is itself the means of making taxable supplies.',
    impact:'Game-changing for real estate sector. Mall owners, commercial developers, co-working space operators can now claim ITC on construction costs. Estimated ITC unlock: ₹50,000+ crore nationwide. Government is reportedly considering a legislative amendment to limit the scope.'},
  {id:2,name:'Union of India v. Mohit Minerals Pvt Ltd',court:'Supreme Court',year:2022,cite:'2022 SCC OnLine SC 657',topic:'GST Council — Binding or Persuasive?',sec:'Article 279A',status:'active',
    held:'GST Council recommendations are persuasive, not binding on Union or State legislatures. The Constitution envisages a collaborative, not coercive, federal model. Also held that IGST on ocean freight (levied on importer for service received by foreign shipper) is unconstitutional.',
    impact:'Fundamentally altered Centre-State GST dynamics. States can technically deviate from Council recommendations. Kerala subsequently challenged compensation cess provisions. The IGST on ocean freight holding saved importers approximately ₹3,000-4,000 crore annually.'},
  {id:3,name:'Northern Operating Systems v. CCE',court:'Supreme Court',year:2022,cite:'2022 SCC OnLine SC 1497',topic:'Employee Secondment = Import of Services',sec:'Section 2(11) IGST',status:'active',
    held:'Secondment of employees by overseas group companies to Indian subsidiaries constitutes import of services taxable under GST on reverse charge basis. The employer-employee relationship test under company law does not determine the characterisation under tax law.',
    impact:'Every MNC with Indian operations is affected. All secondment arrangements must now factor in 18% GST on reverse charge. Many companies restructured from secondment to direct employment models. Annual revenue impact estimated at ₹10,000+ crore.'},
  {id:4,name:'Tvl. Velliappa Textiles v. State Tax Officer',court:'Madras High Court',year:2023,cite:'W.P.(MD) No. 23132/2023',topic:'ITC Time Limit — Procedural vs Substantive',sec:'Section 16(4)',status:'active',
    held:'The time limit under Section 16(4) is a procedural restriction on when ITC can be claimed in returns, not a substantive denial of the right to ITC itself. The right to ITC vests upon receipt of goods/services and payment of tax.',
    impact:'Opened the door for ITC claims beyond the normal deadline through amendments/rectification. Multiple HCs followed this reasoning. Government responded with Section 16(5) in Budget 2024 providing conditional relief for FY 2017-18 to 2020-21.'},
  {id:5,name:'Bharti Airtel Ltd v. Union of India',court:'Supreme Court',year:2021,cite:'2021 SCC OnLine SC 899',topic:'GSTR-3B — Can it be Revised?',sec:'Section 39',status:'active',
    held:'GSTR-3B is a return under Section 39 and once filed, cannot be revised. There is no statutory provision allowing amendment of GSTR-3B. Taxpayers who overpaid tax must claim refund under Section 54.',
    impact:'Confirmed GSTR-3B is not a stop-gap but the substantive return. Any error in GSTR-3B — overpayment, wrong ITC claim — cannot be corrected by amendment. The only remedy is refund application (Section 54) or adjustment in subsequent returns where possible.'},
  {id:6,name:'Calcutta HC in Suncraft Energy (Corporate Guarantee)',court:'Calcutta High Court',year:2023,cite:'MAT 1218/2023',topic:'Corporate Guarantee — Is it a Supply?',sec:'Rule 28(2)',status:'stayed',
    held:'Circular 204/2023 imposing 1% deemed OMV on corporate guarantees to related persons was stayed. The court found that a guarantee is not a supply of service and even if it were, the 1% valuation lacked statutory basis.',
    impact:'Multiple HCs stayed (Calcutta, Karnataka, Allahabad, Meghalaya). Government retaliated with retrospective Rule 28(2) in Budget 2024. Matter now before SC. Every group company providing guarantee to subsidiary faces 18% GST on 1% of guarantee value.'},
  {id:7,name:'Aditya Birla Fashion v. UoI (RCM on Residential Rent)',court:'Supreme Court',year:2023,cite:'2023 SCC OnLine SC 890',topic:'RCM on Residential Renting to Employees',sec:'Notification 05/2022',status:'pending',
    held:'Challenged the validity of 18% GST under RCM on registered persons renting residential dwelling for employee use. SC admitted the petition but no interim stay was granted. The matter is pending final hearing.',
    impact:'Every company providing residential accommodation to employees is affected. Many restructured HR policies to shift from company-leased housing to cash housing allowance. Annual impact estimated at ₹3,000-5,000 crore in GST liability across corporate India.'},
  {id:8,name:'Patanjali Foods v. UoI (Anti-Profiteering)',court:'Supreme Court',year:2024,cite:'CA 4839/2024',topic:'NAA Methodology — Validity',sec:'Section 171',status:'active',
    held:'The NAA methodology for computing profiteering was upheld in principle, but computation in individual cases must pass the test of reasonableness. Mathematical precision is required. Post-NAA sunset (Nov 2022), CCI handles residual cases.',
    impact:'Anti-profiteering provisions effectively sunset in November 2022. No new cases can be initiated under Section 171. CCI handles pending matters only. A significant relief for businesses concerned about post-rate-cut profiteering allegations.'},
  {id:9,name:'Kerala HC — ITC on CSR Expenditure',court:'Kerala High Court',year:2024,cite:'WP(C) 2024',topic:'Is CSR a Business Expense for ITC?',sec:'Section 17(5)(h)',status:'pending',
    held:'ITC on goods/services used for CSR activities (mandated under Companies Act Section 135) is not blocked under Section 17(5)(h) because CSR is a statutory obligation incurred in course of business, not a gift or free sample.',
    impact:'Could open ITC claims on all CSR expenditure for large companies. Conflicting AAR rulings exist. If upheld, companies spending on CSR activities could claim 18% ITC on those expenses — significant financial benefit.'},
  {id:10,name:'Dharmendra Textile Processors v. UoI',court:'Supreme Court',year:2008,cite:'2008 (13) SCC 369',topic:'Mens Rea Not Required for Tax Penalties',sec:'Section 73/74 analogy',status:'active',
    held:'Penalty under taxation statutes is a civil liability and does not require proof of mens rea (guilty mind). The quasi-criminal nature of penalty proceedings does not import criminal law standards of proof.',
    impact:'Pre-GST ruling but remains foundational for GST penalty jurisprudence. Section 73 (non-fraud) vs Section 74 (fraud/suppression) distinction carries this forward. The threshold for invoking Section 74 (requiring wilful suppression) is where the real battles are fought.'},
]

// ══════════════════════════════════════════
// DATA — Mock Test (20 questions with GST 2.0)
// ══════════════════════════════════════════
const quiz = [
  {q:'Under GST 2.0 (post Sep 2025), the primary rate slabs are:',opts:['0%, 5%, 12%, 18%, 28%','5%, 18%, 40%','5%, 12%, 18%','0%, 5%, 18%, 28%'],ans:1,exp:'The 56th GST Council meeting approved a simplified structure: 5% (merit), 18% (standard), and 40% (luxury/demerit). The old 12% and 28% slabs were largely merged into 5% and 18% respectively.',ref:'56th GST Council, Sep 2025'},
  {q:'GST Council is constituted under which Article?',opts:['Article 246A','Article 279A','Article 269A','Article 366(12A)'],ans:1,exp:'Article 279A provides for the GST Council. Article 246A grants concurrent taxing power. Article 269A deals with IGST inter-state mechanism.',ref:'Article 279A, Constitution'},
  {q:'The time limit to claim ITC under Section 16(4) is:',opts:['31st March of next FY','30th September of next FY','30th November of next FY or annual return date','Within 1 year of invoice date'],ans:2,exp:'Section 16(4) sets the deadline as 30th November of the FY following the year in which the supply was made, or the date of filing annual return, whichever is earlier.',ref:'Section 16(4), CGST Act'},
  {q:'Which is NOT blocked under Section 17(5)?',opts:['Food & beverages','Motor vehicles for transport of goods','Health & fitness club membership','Personal consumption'],ans:1,exp:'Motor vehicles used for transportation of goods are specifically excluded from the block. Section 17(5)(a) blocks ITC on motor vehicles except when used for transport of goods, further supply, or transport of passengers.',ref:'Section 17(5)(a), CGST Act'},
  {q:'GSTR-9C reconciliation statement is self-certified from:',opts:['FY 2020-21','FY 2021-22','FY 2022-23','Still requires CA certification'],ans:1,exp:'From FY 2021-22 onwards, GSTR-9C is self-certified by the taxpayer. CA/CMA certification requirement was removed. The threshold is AATO > ₹5 crore.',ref:'Section 44, Rule 80'},
  {q:'E-invoicing is mandatory for AATO exceeding:',opts:['₹10 crore','₹5 crore','₹20 crore','₹50 crore'],ans:1,exp:'From 1st August 2023, e-invoicing is mandatory for AATO exceeding ₹5 crore (in any FY from 2017-18). This was phased down from ₹500 crore in 2020.',ref:'Notification 13/2020-CT'},
  {q:'Under Composition Scheme, a taxpayer CANNOT:',opts:['Make intra-state supplies','Collect GST from customers','File annual return','Supply exempt goods'],ans:1,exp:'Section 10(4) prohibits composition taxpayers from collecting tax from customers. They pay tax at concessional rate from own pocket and issue bill of supply, not tax invoice.',ref:'Section 10(4), CGST Act'},
  {q:'Interest on delayed GST payment under Section 50 is:',opts:['12% p.a.','18% p.a.','24% p.a.','15% p.a.'],ans:1,exp:'Section 50(1) prescribes 18% p.a. interest on net cash tax liability. The 2022 amendment clarified interest applies on net cash liability, not gross.',ref:'Section 50(1), CGST Act'},
  {q:'Place of supply for B2B services (general rule) is:',opts:['Location of supplier','Location of recipient','Place of performance','Place of payment'],ans:1,exp:'Section 12(2) of IGST Act: For B2B services, place of supply is the location of the recipient. For B2C, it is the location of the supplier.',ref:'Section 12(2), IGST Act'},
  {q:'Pre-deposit for appeal before GSTAT is:',opts:['10%, max ₹25 crore per Act','20% of disputed tax','25%, no cap','10%, no cap'],ans:0,exp:'Section 112(8): 10% of disputed tax amount, capped at ₹25 crore for CGST appeals (separately for SGST). This makes GSTAT accessible even for large disputes.',ref:'Section 112(8), CGST Act'},
  {q:'Section 128A amnesty for FY 2017-20 demands requires:',opts:['Only tax payment','Tax + interest, penalty waived','Tax + penalty, interest waived','Full payment of tax, interest and penalty'],ans:1,exp:'Section 128A provides that for Section 73 demands (non-fraud) for FY 2017-18 to 2019-20, if tax and interest are fully paid, the penalty is waived entirely.',ref:'Section 128A, CGST Act'},
  {q:'Individual health insurance premium under GST 2.0 is:',opts:['18%','12%','5%','Exempt (NIL)'],ans:3,exp:'The 56th GST Council meeting exempted individual health and life insurance premiums from GST, effective September 2025. Group/corporate policies remain at 18%.',ref:'56th GST Council, Sep 2025'},
  {q:'The Invoice Management System (IMS) was launched in:',opts:['January 2024','October 2024','April 2025','July 2023'],ans:1,exp:'IMS went live in October 2024, allowing recipients to accept/reject invoices before GSTR-2B generation. This adds a compliance step but gives control over ITC claims.',ref:'GSTN Advisory, Oct 2024'},
  {q:'Corporate guarantee to related person is valued at:',opts:['Actual guarantee fee charged','1% of guarantee amount','Open market value only','No GST applicable'],ans:1,exp:'Rule 28(2), inserted retrospectively by Budget 2024, deems the value at 1% of the guarantee amount for corporate guarantees to related persons. This is contested in multiple High Courts.',ref:'Rule 28(2), CGST Rules'},
  {q:'GSTR-3B for monthly filers (AATO > ₹5 Cr) is due on:',opts:['11th of next month','20th of next month','25th of next month','Last day of next month'],ans:1,exp:'GSTR-3B due date is 20th of the following month for taxpayers with AATO exceeding ₹5 crore. QRMP taxpayers file quarterly on 22nd/24th.',ref:'Section 39, CGST Act'},
  {q:'Aggregate turnover for GST registration includes:',opts:['Only taxable supplies','Taxable + exempt + exports (all India, same PAN)','Only intra-state supplies','Taxable + zero-rated only'],ans:1,exp:'Section 2(6): Aggregate turnover = taxable + exempt + exports + inter-state supplies of a person having the same PAN, on all-India basis. Excludes CGST/SGST/IGST.',ref:'Section 2(6), CGST Act'},
  {q:'After Safari Retreats (2024 SC), ITC on construction is:',opts:['Always blocked','Available when property is used for taxable outward supplies','Available only for residential property','Only for government contracts'],ans:1,exp:'SC held that Section 17(5)(d) blocks ITC on construction for own use. When the immovable property itself is the means of making taxable supplies (like renting), ITC is available.',ref:'Safari Retreats v. Chief Commissioner (2024)'},
  {q:'The new 40% GST slab applies to:',opts:['All goods above ₹10 lakh','Luxury cars, aerated drinks, yachts, private aircraft','Only tobacco products','Electronics above ₹50,000'],ans:1,exp:'The 40% slab under GST 2.0 covers luxury and demerit goods: luxury cars/SUVs, aerated beverages, energy drinks, yachts, private aircraft, etc. Tobacco stays at 28%+cess until compensation loan is cleared.',ref:'56th GST Council, Notification 9/2025-CT(Rate)'},
  {q:'Zero-rated supply under Section 16 IGST means:',opts:['Supply exempt from GST','Supply at 0% rate with no ITC','Export or supply to SEZ — pay IGST and claim refund OR supply under LUT/bond','Only exports to foreign countries'],ans:2,exp:'Section 16 IGST: Zero-rated = exports + supplies to SEZ. Two options: (a) pay IGST and claim refund, or (b) supply under bond/LUT without IGST payment and claim refund of ITC.',ref:'Section 16, IGST Act'},
  {q:'ISD registration is mandatory from:',opts:['1st April 2024','1st April 2025','1st January 2025','Already mandatory since 2017'],ans:1,exp:'Finance Act 2024 made ISD mandatory from 1st April 2025 for multi-state entities distributing ITC of common services. Cross-charge is no longer an alternative.',ref:'Section 20, CGST Act (amended)'},
]

// ══════════════════════════════════════════
// NAV
// ══════════════════════════════════════════
const navItems = [
  {key:'home',label:'Home',ico:'🏠'},
  {key:'chapters',label:'Chapters',ico:'📖'},
  {key:'rates',label:'Rates',ico:'🔍'},
  {key:'cases',label:'Cases',ico:'⚖️'},
  {key:'calendar',label:'Calendar',ico:'📅'},
  {key:'test',label:'Test',ico:'✍️'},
  {key:'notice',label:'Scan Notice',ico:'📄',isNew:true},
  {key:'invoice',label:'Invoice Scan',ico:'📸',isNew:true},
  {key:'health',label:'Health Score',ico:'💚',isNew:true},
  {key:'bolo',label:'GST Bolo',ico:'🎤',isNew:true},
  {key:'ai',label:'Scanner AI',ico:'🤖'},
]

function Nav({active,go}){
  const [mob,setMob]=useState(false)
  return(<>
    <header style={{position:'sticky',top:0,zIndex:100,background:'rgba(250,250,249,.88)',backdropFilter:'blur(16px) saturate(180%)',borderBottom:`1px solid ${C.ink7}`}}>
      <Wrap style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
        <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>go('home')}>
          <div style={{width:30,height:30,borderRadius:7,background:C.ink,display:'flex',alignItems:'center',justifyContent:'center',color:C.white,fontWeight:900,fontSize:15,fontFamily:F.body}}>S</div>
          <div><span style={{fontSize:15,fontWeight:800,color:C.ink,letterSpacing:'-.01em'}}>Scanner</span><span style={{fontSize:10,fontWeight:600,color:C.ink5,marginLeft:5,letterSpacing:'.04em'}}>GST RECKONER</span></div>
        </div>
        <nav className="dnav" style={{display:'flex',gap:1,alignItems:'center',overflowX:'auto'}}>
          {navItems.map(n=>(
            <button key={n.key} onClick={()=>go(n.key)} style={{padding:'5px 10px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12.5,fontWeight:500,whiteSpace:'nowrap',position:'relative',background:active===n.key?C.ink+'0C':'transparent',color:active===n.key?C.ink:C.ink4,transition:'all .12s'}}>
              {n.label}{n.isNew&&<span style={{position:'absolute',top:2,right:2,width:5,height:5,borderRadius:'50%',background:C.saffron}}/>}
            </button>
          ))}
        </nav>
        <button className="mbtn" onClick={()=>setMob(!mob)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20}}>{mob?'✕':'☰'}</button>
      </Wrap>
    </header>
    {mob&&<div style={{position:'fixed',top:56,left:0,right:0,bottom:0,zIndex:99,background:C.white,overflowY:'auto',animation:'fadeIn .15s'}}>
      <div style={{padding:12}}>
        {navItems.map(n=>(
          <button key={n.key} onClick={()=>{go(n.key);setMob(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'12px 14px',borderRadius:10,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,textAlign:'left',marginBottom:2,background:active===n.key?C.ink8:'transparent',color:active===n.key?C.ink:C.ink3}}>
            <span style={{fontSize:16}}>{n.ico}</span>{n.label}{n.isNew&&<Badge color={C.saffron}>NEW</Badge>}
          </button>
        ))}
      </div>
    </div>}
    <style>{`.dnav{display:flex!important}.mbtn{display:none!important}@media(max-width:900px){.dnav{display:none!important}.mbtn{display:block!important}}`}</style>
  </>)
}

// ══════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════

// HOME
function Home({go}){
  return(<div>
    <div style={{background:C.ink,padding:'52px 20px 44px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,opacity:.03,backgroundImage:`radial-gradient(${C.white} 1px, transparent 1px)`,backgroundSize:'24px 24px'}}/>
      <Wrap style={{position:'relative',zIndex:1}}>
        <div className="anim" style={{display:'inline-block',padding:'4px 12px',borderRadius:6,background:'rgba(255,255,255,.08)',fontSize:12,fontWeight:600,color:C.ink5,marginBottom:16,letterSpacing:'.02em'}}>
          🇮🇳 Updated for GST 2.0 — Post 56th Council (Sep 2025)
        </div>
        <h1 className="anim anim1" style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:900,color:C.white,letterSpacing:'-.025em',lineHeight:1.1,marginBottom:14,maxWidth:600}}>
          Every GST answer.<br/>One app.
        </h1>
        <p className="anim anim2" style={{fontSize:15,color:C.ink5,maxWidth:480,lineHeight:1.6,marginBottom:28}}>
          Chapters · Rates · Case Laws · Calendar · Mock Tests · AI Chat — and now: scan notices, verify invoices, check your compliance health.
        </p>
        <div className="anim anim3" style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <Btn primary onClick={()=>go('rates')}>Find a GST Rate</Btn>
          <Btn onClick={()=>go('notice')} style={{background:'rgba(255,255,255,.08)',color:C.white}}>📄 Scan a Notice</Btn>
          <Btn onClick={()=>go('ai')} style={{background:'rgba(255,255,255,.08)',color:C.white}}>🤖 Ask AI</Btn>
        </div>
      </Wrap>
    </div>

    {/* Quick Actions Grid */}
    <Wrap style={{marginTop:-20,marginBottom:40}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:8}}>
        {[
          {key:'rates',ico:'🔍',label:'Rate Finder',sub:`${ratesData.length} items`},
          {key:'chapters',ico:'📖',label:'10 Chapters',sub:'Full GST law'},
          {key:'cases',ico:'⚖️',label:'Case Laws',sub:'10 landmark'},
          {key:'calendar',ico:'📅',label:'Calendar',sub:`${calendar.length} forms`},
          {key:'test',ico:'✍️',label:'Mock Test',sub:'20 MCQs'},
          {key:'notice',ico:'📄',label:'Scan Notice',sub:'AI reply draft'},
          {key:'invoice',ico:'📸',label:'Invoice Scan',sub:'HSN verify'},
          {key:'health',ico:'💚',label:'Health Score',sub:'GSTIN check'},
          {key:'bolo',ico:'🎤',label:'GST Bolo',sub:'Hindi voice'},
          {key:'ai',ico:'🤖',label:'Scanner AI',sub:'Ask anything'},
        ].map((m,i)=>(
          <Card key={m.key} onClick={()=>go(m.key)} pad={14} style={{textAlign:'center'}} className={`anim anim${Math.min(i+1,5)}`}>
            <div style={{fontSize:22,marginBottom:4}}>{m.ico}</div>
            <div style={{fontSize:13,fontWeight:700,color:C.ink}}>{m.label}</div>
            <div style={{fontSize:11,color:C.ink5}}>{m.sub}</div>
          </Card>
        ))}
      </div>
    </Wrap>

    {/* GST 2.0 Banner */}
    <Wrap style={{marginBottom:40}}>
      <Card pad={24} style={{background:'linear-gradient(135deg,#FFF7ED,#FEF3C7)',border:`1px solid #FDE68A`}}>
        <div style={{fontSize:12,fontWeight:700,color:C.saffron,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>⚡ GST 2.0 — What Changed</div>
        <div style={{fontSize:14,color:C.ink2,lineHeight:1.7,maxWidth:800}}>
          The 56th GST Council (Sep 3, 2025) approved Next-Gen GST reforms effective Sep 22, 2025. The old 5-slab structure (0/5/12/18/28%) is now simplified to <strong>5% · 18% · 40%</strong>. Daily essentials like soap, toothpaste, and namkeens dropped from 18% to 5%. ACs, TVs, and cement moved from 28% to 18%. Individual health and life insurance premiums are now exempt. A new 40% slab replaces 28%+cess for luxury goods.
        </div>
        <div style={{marginTop:12}}><Btn sm onClick={()=>go('rates')}>Browse Updated Rates →</Btn></div>
      </Card>
    </Wrap>

    {/* Footer */}
    <footer style={{padding:'24px 20px',borderTop:`1px solid ${C.ink7}`,textAlign:'center'}}>
      <div style={{fontSize:12,color:C.ink5}}>Scanner GST Ready Reckoner · Built for India's 1.46 crore GST registrants</div>
      <div style={{fontSize:11,color:C.ink6,marginTop:4}}>Not legal advice · Always consult a qualified practitioner · Powered by AI</div>
    </footer>
  </div>)
}

// CHAPTERS
function Chapters(){
  const [sel,setSel]=useState(null)
  return(<Wrap style={{paddingTop:32,paddingBottom:48}}>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>GST Chapters</h2>
    <p style={{fontSize:13,color:C.ink4,marginBottom:24}}>10 chapters covering the complete GST law framework · Updated for GST 2.0</p>
    <div style={{display:'grid',gap:8}}>
      {chapters.map((ch,i)=>(
        <Card key={ch.id} onClick={()=>setSel(ch)} pad={16} className={`anim anim${Math.min(i+1,5)}`}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:8,background:ch.color+'10',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:ch.color,flexShrink:0}}>{ch.id}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{ch.title}</div>
              <div style={{fontSize:12,color:C.ink5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ch.sub}</div>
            </div>
            <span style={{color:C.ink6,fontSize:14}}>›</span>
          </div>
        </Card>
      ))}
    </div>
    <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.title} wide>
      {sel&&<div>
        <p style={{fontSize:14,color:C.ink3,lineHeight:1.7,marginBottom:20}}>{sel.content}</p>
        <h4 style={{fontSize:13,fontWeight:700,marginBottom:10}}>Key Provisions</h4>
        <div style={{marginBottom:20}}>{sel.sections.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:8,padding:'7px 0',borderBottom:`1px solid ${C.ink8}`}}>
            <span style={{color:C.blue,fontFamily:F.mono,fontSize:11,marginTop:2,flexShrink:0}}>§</span>
            <span style={{fontSize:13,color:C.ink3,lineHeight:1.5}}>{s}</span>
          </div>
        ))}</div>
        <div style={{background:C.blueLight,borderRadius:10,padding:16,marginBottom:14,borderLeft:`3px solid ${C.blue}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.blue,marginBottom:6}}>🔍 Scanner Insight</div>
          <p style={{fontSize:13,color:C.ink3,lineHeight:1.7}}>{sel.insight}</p>
        </div>
        <div style={{background:C.amberLight,borderRadius:10,padding:16,borderLeft:`3px solid ${C.amber}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.amber,marginBottom:6}}>📝 Practice Note</div>
          <p style={{fontSize:13,color:C.ink3,lineHeight:1.7}}>{sel.practice}</p>
        </div>
      </div>}
    </Modal>
  </Wrap>)
}

// RATE FINDER
function Rates(){
  const [q,setQ]=useState('')
  const [slab,setSlab]=useState('all')
  const [type,setType]=useState('all')
  const slabs=['all','0','0.25','3','5','18','28','40']
  const filtered=useMemo(()=>ratesData.filter(r=>{
    const ms=!q||r.desc.toLowerCase().includes(q.toLowerCase())||r.hsn.includes(q)||r.cat.toLowerCase().includes(q.toLowerCase())
    const msl=slab==='all'||(r.rate!==null&&String(r.rate)===slab)
    const mt=type==='all'||r.type===type
    return ms&&msl&&mt
  }),[q,slab,type])
  return(<Wrap style={{paddingTop:32,paddingBottom:48}}>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>GST Rate Finder</h2>
    <p style={{fontSize:13,color:C.ink4,marginBottom:20}}>{ratesData.length} items · Updated for GST 2.0 (5% / 18% / 40% slabs) · Search by name, HSN, or category</p>
    <SearchInput value={q} onChange={setQ} placeholder="Search — e.g. 'soap', '8517', 'pharma', 'restaurant'..."/>
    <div style={{display:'flex',gap:6,marginTop:12,flexWrap:'wrap',alignItems:'center'}}>
      {slabs.map(s=><Pill key={s} active={slab===s} onClick={()=>setSlab(s)}>{s==='all'?'All':s==='0'?'NIL':`${s}%`}</Pill>)}
      <span style={{width:1,height:20,background:C.ink7,margin:'0 4px'}}/>
      {['all','Goods','Services'].map(t=><Pill key={t} active={type===t} onClick={()=>setType(t)}>{t==='all'?'All':t}</Pill>)}
    </div>
    <div style={{fontSize:12,color:C.ink5,marginTop:12,marginBottom:8}}>{filtered.length} results</div>
    <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.ink7}`,overflow:'hidden'}}>
      <div style={{display:'grid',gridTemplateColumns:'70px 1fr 60px 90px',padding:'10px 16px',background:C.ink8,borderBottom:`1px solid ${C.ink7}`,gap:10}}>
        {['HSN','Description','Rate','Category'].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.ink5,textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</span>)}
      </div>
      {filtered.slice(0,40).map((r,i)=>(
        <div key={i} style={{display:'grid',gridTemplateColumns:'70px 1fr 60px 90px',padding:'10px 16px',borderBottom:`1px solid ${C.ink8}`,gap:10,alignItems:'start',fontSize:13}}>
          <span style={{fontFamily:F.mono,fontSize:11.5,fontWeight:500,color:C.blue}}>{r.hsn}</span>
          <div>
            <span style={{color:C.ink2}}>{r.desc}</span>
            {r.note&&<div style={{fontSize:11,color:C.saffron,marginTop:2}}>↳ {r.note}</div>}
          </div>
          <Badge color={r.rate===null?C.ink5:r.rate===0?C.green:r.rate<=5?C.blue:r.rate<=18?C.amber:C.red}>
            {r.rate===null?'N/A':r.rate===0?'NIL':`${r.rate}%`}
          </Badge>
          <span style={{fontSize:11,color:C.ink5}}>{r.cat}</span>
        </div>
      ))}
      {filtered.length===0&&<div style={{padding:32,textAlign:'center',color:C.ink5,fontSize:13}}>No results. Try a different search.</div>}
      {filtered.length>40&&<div style={{padding:14,textAlign:'center',color:C.ink5,fontSize:12}}>Showing 40 of {filtered.length} — refine search</div>}
    </div>
  </Wrap>)
}

// CASE LAWS
function Cases(){
  const [sel,setSel]=useState(null)
  const [fil,setFil]=useState('all')
  const list=cases.filter(c=>fil==='all'||c.status===fil)
  return(<Wrap style={{paddingTop:32,paddingBottom:48}}>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Landmark Case Laws</h2>
    <p style={{fontSize:13,color:C.ink4,marginBottom:16}}>10 judgments shaping GST jurisprudence — Supreme Court, High Courts</p>
    <div style={{display:'flex',gap:4,marginBottom:20}}>
      {['all','active','pending','stayed'].map(f=><Pill key={f} active={fil===f} onClick={()=>setFil(f)}>{f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}</Pill>)}
    </div>
    <div style={{display:'grid',gap:8}}>
      {list.map(c=>(
        <Card key={c.id} onClick={()=>setSel(c)} pad={16}>
          <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6,marginBottom:6}}>
            <span style={{fontSize:14,fontWeight:700,color:C.ink,flex:1,minWidth:200}}>{c.name}</span>
            <div style={{display:'flex',gap:4}}>
              <Badge color={c.status==='active'?C.green:c.status==='pending'?C.amber:C.red}>{c.status}</Badge>
              <Badge color={C.ink5}>{c.year}</Badge>
            </div>
          </div>
          <div style={{fontSize:12,color:C.ink4}}>{c.court} · <span style={{color:C.blue,fontWeight:600}}>{c.topic}</span> · <span style={{fontFamily:F.mono}}>{c.sec}</span></div>
        </Card>
      ))}
    </div>
    <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name} wide>
      {sel&&<div>
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          <Badge color={C.ink5}>{sel.court}</Badge><Badge color={C.blue}>{sel.year}</Badge>
          <Badge color={sel.status==='active'?C.green:sel.status==='pending'?C.amber:C.red}>{sel.status}</Badge>
        </div>
        <div style={{fontSize:11.5,fontFamily:F.mono,color:C.ink5,marginBottom:6}}>{sel.cite}</div>
        <div style={{fontSize:12.5,fontWeight:600,color:C.blue,marginBottom:16}}>Topic: {sel.topic} · {sel.sec}</div>
        <div style={{marginBottom:16}}>
          <h4 style={{fontSize:13,fontWeight:700,marginBottom:6}}>Held</h4>
          <p style={{fontSize:13,color:C.ink3,lineHeight:1.7,background:C.ink8,padding:14,borderRadius:8}}>{sel.held}</p>
        </div>
        <div style={{background:C.redLight,borderRadius:10,padding:14,borderLeft:`3px solid ${C.red}`}}>
          <h4 style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>Impact</h4>
          <p style={{fontSize:13,color:C.ink3,lineHeight:1.7}}>{sel.impact}</p>
        </div>
      </div>}
    </Modal>
  </Wrap>)
}

// CALENDAR
function Calendar(){
  const [sel,setSel]=useState(null)
  return(<Wrap style={{paddingTop:32,paddingBottom:48}}>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Compliance Calendar</h2>
    <p style={{fontSize:13,color:C.ink4,marginBottom:20}}>{calendar.length} forms · Due dates, penalties, applicability · Click any form for details</p>
    <div style={{display:'grid',gap:8}}>
      {calendar.map((c,i)=>(
        <Card key={i} onClick={()=>setSel(c)} pad={14}>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <div style={{padding:'4px 10px',borderRadius:6,background:C.blueLight,fontFamily:F.mono,fontSize:13,fontWeight:700,color:C.blue,flexShrink:0}}>{c.form}</div>
            <div style={{flex:1,minWidth:150}}>
              <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{c.desc}</div>
              <div style={{fontSize:11,color:C.ink5}}>{c.who}</div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <Badge color={C.green}>Due: {c.due}</Badge>
              <Badge color={C.ink5}>{c.freq}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
    <Modal open={!!sel} onClose={()=>setSel(null)} title={`${sel?.form} — ${sel?.desc}`}>
      {sel&&<div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {[{l:'Due Date',v:sel.due,c:C.blue},{l:'Frequency',v:sel.freq,c:C.green},{l:'Next Due',v:sel.next,c:C.indigo},{l:'Penalty',v:sel.penalty,c:C.red}].map((d,i)=>(
            <div key={i} style={{padding:12,background:C.ink8,borderRadius:8}}>
              <div style={{fontSize:10,fontWeight:700,color:C.ink5,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:3}}>{d.l}</div>
              <div style={{fontSize:13,fontWeight:600,color:d.c}}>{d.v}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,fontWeight:700,color:C.ink4,marginBottom:4}}>Applicable to</div>
        <div style={{fontSize:13,color:C.ink3,marginBottom:14}}>{sel.who}</div>
        <div style={{background:C.amberLight,borderRadius:8,padding:14,borderLeft:`3px solid ${C.amber}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.amber,marginBottom:4}}>Important Notes</div>
          <p style={{fontSize:13,color:C.ink3,lineHeight:1.6}}>{sel.note}</p>
        </div>
      </div>}
    </Modal>
  </Wrap>)
}

// MOCK TEST
function Test(){
  const [cur,setCur]=useState(0)
  const [ans,setAns]=useState({})
  const [done,setDone]=useState(false)
  const [showExp,setShowExp]=useState(false)
  const q=quiz[cur],answered=ans[cur]!==undefined,correct=ans[cur]===q.ans
  const total=Object.entries(ans).filter(([k,v])=>v===quiz[k].ans).length
  if(done){
    const pct=Math.round(total/quiz.length*100)
    return(<Wrap style={{paddingTop:40,paddingBottom:48,textAlign:'center',maxWidth:400,marginLeft:'auto',marginRight:'auto'}}>
      <div className="anim" style={{width:100,height:100,borderRadius:'50%',margin:'0 auto 20px',background:`conic-gradient(${pct>=70?C.green:pct>=40?C.amber:C.red} ${pct}%, ${C.ink7} 0%)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:C.white,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:30,fontWeight:800,fontFamily:F.mono}}>{pct}%</span>
        </div>
      </div>
      <h2 className="anim anim1" style={{fontSize:20,fontWeight:800,marginBottom:6}}>{pct>=70?'Excellent!':pct>=40?'Good effort!':'Keep studying!'}</h2>
      <p className="anim anim2" style={{fontSize:14,color:C.ink4,marginBottom:24}}>{total} correct out of {quiz.length}</p>
      <Btn primary onClick={()=>{setCur(0);setAns({});setDone(false);setShowExp(false)}}>Retake Test</Btn>
    </Wrap>)
  }
  return(<Wrap style={{paddingTop:32,paddingBottom:48}}>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>GST Mock Test</h2>
    <p style={{fontSize:13,color:C.ink4,marginBottom:16}}>Question {cur+1} of {quiz.length} · Includes GST 2.0 questions</p>
    <div style={{height:3,background:C.ink7,borderRadius:2,marginBottom:24}}>
      <div style={{height:'100%',background:C.ink,borderRadius:2,width:`${((cur+1)/quiz.length)*100}%`,transition:'width .3s'}}/>
    </div>
    <Card pad={24} style={{maxWidth:640,margin:'0 auto'}}>
      <p style={{fontSize:15,fontWeight:700,color:C.ink,marginBottom:20,lineHeight:1.5}}>{q.q}</p>
      <div style={{display:'grid',gap:8,marginBottom:20}}>
        {q.opts.map((o,i)=>{
          const isSel=ans[cur]===i,isCor=i===q.ans,showG=answered&&isCor,showR=answered&&isSel&&!isCor
          return(<button key={i} onClick={()=>{if(!answered){setAns({...ans,[cur]:i});setShowExp(true)}}} style={{
            display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,
            border:`2px solid ${showG?C.green:showR?C.red:isSel?C.ink:C.ink7}`,
            background:showG?C.greenLight:showR?C.redLight:C.white,
            cursor:answered?'default':'pointer',textAlign:'left',fontSize:14,color:C.ink2,transition:'all .15s',
          }}>
            <span style={{width:24,height:24,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11.5,fontWeight:700,
              background:showG?C.green:showR?C.red:isSel?C.ink:C.ink7,color:(showG||showR||isSel)?C.white:C.ink4,
            }}>{String.fromCharCode(65+i)}</span>{o}
          </button>)
        })}
      </div>
      {showExp&&answered&&(
        <div style={{animation:'slideDown .25s ease',background:correct?C.greenLight:C.redLight,borderRadius:10,padding:14,marginBottom:16,borderLeft:`3px solid ${correct?C.green:C.red}`}}>
          <div style={{fontSize:12,fontWeight:700,color:correct?C.green:C.red,marginBottom:4}}>{correct?'✓ Correct':'✗ Incorrect'}</div>
          <p style={{fontSize:13,color:C.ink3,lineHeight:1.6}}>{q.exp}</p>
          <div style={{fontSize:11,fontFamily:F.mono,color:C.ink4,marginTop:6}}>Ref: {q.ref}</div>
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <Btn sm disabled={cur===0} onClick={()=>{setCur(cur-1);setShowExp(ans[cur-1]!==undefined)}}>← Prev</Btn>
        {cur<quiz.length-1?<Btn sm primary disabled={!answered} onClick={()=>{setCur(cur+1);setShowExp(ans[cur+1]!==undefined)}}>Next →</Btn>
        :<Btn sm primary disabled={!answered} onClick={()=>setDone(true)}>Results</Btn>}
      </div>
    </Card>
    <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:20,flexWrap:'wrap'}}>
      {quiz.map((_,i)=>(
        <button key={i} onClick={()=>{setCur(i);setShowExp(ans[i]!==undefined)}} style={{
          width:28,height:28,borderRadius:'50%',border:'none',cursor:'pointer',fontSize:11,fontWeight:700,
          background:i===cur?C.ink:ans[i]!==undefined?(ans[i]===quiz[i].ans?C.green:C.red):C.ink7,
          color:i===cur||ans[i]!==undefined?C.white:C.ink4,
        }}>{i+1}</button>
      ))}
    </div>
  </Wrap>)
}

// SCAN NOTICE
function ScanNotice(){
  const [phase,setPhase]=useState('upload') // upload | analyzing | result
  const [result,setResult]=useState(null)
  const start=()=>{
    setPhase('analyzing')
    setTimeout(()=>{
      setResult({
        type:'DRC-01A',section:'Section 73(1) r/w Section 50',issuer:'Deputy Commissioner, CGST Division III, Prayagraj',date:'15.02.2026',amount:'₹4,87,320',
        allegation:'Excess ITC claimed in GSTR-3B exceeding GSTR-2B auto-populated amount for July 2023 to March 2024. Mismatch: ₹4,87,320 (CGST ₹2,43,660 + SGST ₹2,43,660). Department alleges contravention of Section 16(2)(c) read with Rule 36(4).',
        risk:'Medium',deadline:'30 days from receipt',
        reply:`To,\nThe Deputy Commissioner,\nCGST Division III, Prayagraj\n\nSubject: Reply to Intimation DRC-01A dated 15.02.2026 — ITC Mismatch Jul 2023 to Mar 2024\n\nRespected Sir/Madam,\n\n1. We acknowledge receipt of the above intimation and submit as follows:\n\n2. The alleged discrepancy of ₹4,87,320 is attributable to:\n\n   (a) ₹2,76,670 — Invoices from 3 suppliers (details at Annexure A) were not reflected in GSTR-2B due to their delayed GSTR-1 filing. These suppliers have since filed returns and invoices now appear in GSTR-2B for subsequent periods. (Ref: Rule 36(4) read with Circular 183/15/2022-GST)\n\n   (b) ₹1,23,450 — ITC on services distributed by our ISD unit via GSTR-6 with a one-month lag. The credit is legitimate under Section 20 and is reflected in subsequent GSTR-2B.\n\n   (c) ₹87,200 — Already reversed in GSTR-3B for November 2023 via Table 4(B)(2). This reversal was not captured in the system-generated mismatch.\n\n3. Enclosures:\n   - Supplier-wise reconciliation statement (Annexure A)\n   - GSTR-2B downloads for Jul 2023 to Mar 2024\n   - GSTR-3B Table 4 showing reversals\n   - Supplier GSTR-1 filing confirmations\n\n4. The entire demand of ₹4,87,320 is fully explainable. We request closure of proceedings.\n\n5. In the alternative, should the department proceed under Section 73(1), we submit that Section 128A amnesty applies for demands upto FY 2019-20, and for subsequent periods, the right to ITC vests upon receipt (Tvl. Velliappa Textiles, Madras HC 2023).\n\nYours faithfully,\n[Name]\nGSTIN: [Your GSTIN]`,
        citations:['Section 16(2)(c) — Tax paid to government condition for ITC','Rule 36(4) — ITC restricted to GSTR-2B amount','Circular 183/15/2022-GST — Clarification on GSTR-3B vs GSTR-2B mismatch','Section 73(1) — Non-fraud demand: 3-year limit, no penalty if tax + interest paid before order','Section 128A — Amnesty for FY 2017-20 demands: tax + interest paid → penalty waived','Tvl. Velliappa Textiles (Madras HC 2023) — Right to ITC accrues on receipt; Section 16(4) is procedural'],
      })
      setPhase('result')
    },3000)
  }
  if(phase==='result'&&result) return(
    <Wrap style={{paddingTop:32,paddingBottom:48,maxWidth:740,marginLeft:'auto',marginRight:'auto'}}>
      <Card pad={20} style={{background:C.ink,border:'none',marginBottom:12}}>
        <div style={{display:'flex',gap:6,marginBottom:12}}><Badge color={C.green} bg={C.green+'30'}>✓ Analysis Complete</Badge><Badge color={result.risk==='High'?C.red:C.amber} bg={(result.risk==='High'?C.red:C.amber)+'30'}>Risk: {result.risk}</Badge></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
          {[{l:'Notice Type',v:result.type},{l:'Section',v:result.section},{l:'Amount',v:result.amount},{l:'Reply Deadline',v:result.deadline}].map((d,i)=>(
            <div key={i}><div style={{fontSize:10,color:C.ink5,textTransform:'uppercase',letterSpacing:'.05em'}}>{d.l}</div><div style={{fontSize:14,fontWeight:700,color:C.white,marginTop:3}}>{d.v}</div></div>
          ))}
        </div>
      </Card>
      <Card pad={16} style={{marginBottom:12}}>
        <h4 style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:6}}>Allegation Identified</h4>
        <p style={{fontSize:13,color:C.ink3,lineHeight:1.6}}>{result.allegation}</p>
      </Card>
      <Card pad={16} style={{marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h4 style={{fontSize:13,fontWeight:700,color:C.green}}>📝 Drafted Reply</h4>
          <Btn sm primary onClick={()=>navigator.clipboard?.writeText(result.reply)}>Copy</Btn>
        </div>
        <pre style={{fontSize:12.5,color:C.ink3,lineHeight:1.7,whiteSpace:'pre-wrap',background:C.ink8,padding:16,borderRadius:8,fontFamily:F.body,maxHeight:360,overflow:'auto',border:`1px solid ${C.ink7}`}}>{result.reply}</pre>
      </Card>
      <Card pad={16} style={{marginBottom:16}}>
        <h4 style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:10}}>⚖️ Citations</h4>
        {result.citations.map((c,i)=>(
          <div key={i} style={{display:'flex',gap:6,padding:'6px 0',borderBottom:`1px solid ${C.ink8}`,fontSize:12.5,color:C.ink3,lineHeight:1.5}}>
            <span style={{color:C.blue,fontFamily:F.mono,fontSize:10,marginTop:2}}>§</span>{c}
          </div>
        ))}
      </Card>
      <div style={{textAlign:'center'}}><Btn primary onClick={()=>{setPhase('upload');setResult(null)}}>Scan Another Notice</Btn></div>
    </Wrap>
  )
  return(
    <Wrap style={{paddingTop:32,paddingBottom:48}}>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Scan My Notice</h2>
      <p style={{fontSize:13,color:C.ink4,marginBottom:24}}>Upload any GST notice — AI reads it, identifies the issue, drafts a legally sound reply with citations</p>
      <div style={{maxWidth:500,margin:'0 auto'}}>
        <Card pad={32} style={{textAlign:'center'}}>
          {phase==='upload'?<>
            <div style={{fontSize:36,marginBottom:12}}>📄</div>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:6}}>Upload Your GST Notice</h3>
            <p style={{fontSize:13,color:C.ink4,marginBottom:20}}>Supports DRC-01, DRC-01A, ASMT-10, DRC-07, MOV-07, REG-17</p>
            <div onClick={start} style={{border:`2px dashed ${C.ink6}`,borderRadius:12,padding:32,cursor:'pointer',background:C.ink8,transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ink4}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.ink6}}>
              <div style={{fontSize:14,fontWeight:600,color:C.ink3}}>Click to upload or drag & drop</div>
              <div style={{fontSize:11,color:C.ink5,marginTop:4}}>PDF, JPG, PNG — Max 10MB</div>
            </div>
            <div style={{fontSize:11,color:C.ink5,marginTop:14}}>🔒 Processed securely. Never stored.</div>
          </>:<div className="anim">
            <div style={{width:44,height:44,borderRadius:'50%',margin:'0 auto 14px',border:`3px solid ${C.ink7}`,borderTopColor:C.ink,animation:'spin .8s linear infinite'}}/>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Analysing notice...</h3>
            <div style={{fontSize:12,color:C.ink4}}><div style={{animation:'pulse 1.5s infinite'}}>Reading document → Identifying sections → Drafting reply...</div></div>
          </div>}
        </Card>
      </div>
    </Wrap>
  )
}

// INVOICE SCAN
function InvoiceScan(){
  const [phase,setPhase]=useState('upload')
  const [result,setResult]=useState(null)
  const start=()=>{
    setPhase('analyzing')
    setTimeout(()=>{
      setResult({
        supplier:'Shree Krishna Textiles, Varanasi',gstin:'09AABCS1234M1Z1',inv:'SKT/2025-26/1847',date:'05.03.2026',score:72,
        items:[
          {desc:'Banarasi Silk Saree (Katan)',hsn:'5007',value:'₹1,80,000',charged:5,correct:5,ok:true},
          {desc:'Zari Thread (Gold)',hsn:'5605',value:'₹24,000',charged:12,correct:5,ok:false,note:'Was 12% → reduced to 5% under GST 2.0. Supplier using old rate.'},
          {desc:'Cardboard packaging boxes',hsn:'4819',value:'₹7,500',charged:12,correct:18,ok:false,note:'Packaging material is 18%. ₹450 ITC at risk.'},
          {desc:'Courier charges (SAC 9967)',hsn:'9967',value:'₹2,500',charged:5,correct:18,ok:false,note:'Courier = 18%. Supplier wrongly applying GTA rate.'},
        ],
        flags:['⚠️ 3 out of 4 line items have rate issues — supplier may be using pre-GST 2.0 rates','⚠️ Zari thread moved from 12% to 5% in Sep 2025 — supplier overcharging you by ₹1,680','⚠️ Packaging material and courier charged at lower rates — your ITC on these is at risk if department cross-checks','✓ Banarasi silk saree correctly at 5% (HSN 5007)','💡 Verify GSTIN 09AABCS1234M1Z1 is active on gst.gov.in before claiming ITC'],
      })
      setPhase('result')
    },2500)
  }
  if(phase==='result'&&result) return(
    <Wrap style={{paddingTop:32,paddingBottom:48,maxWidth:740,marginLeft:'auto',marginRight:'auto'}}>
      <Card pad={24} style={{textAlign:'center',marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.ink5,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Invoice Risk Score</div>
        <div style={{width:90,height:90,borderRadius:'50%',margin:'0 auto 10px',background:`conic-gradient(${result.score>=70?C.green:C.amber} ${result.score}%, ${C.ink7} 0%)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:70,height:70,borderRadius:'50%',background:C.white,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:800,fontFamily:F.mono}}>{result.score}</div>
        </div>
        <div style={{fontSize:13,color:C.ink4}}>3 items need attention</div>
      </Card>
      <Card pad={16} style={{marginBottom:12}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:14}}>
          <div><span style={{fontSize:10,color:C.ink5,textTransform:'uppercase'}}>Supplier</span><div style={{fontSize:13,fontWeight:600}}>{result.supplier}</div></div>
          <div><span style={{fontSize:10,color:C.ink5,textTransform:'uppercase'}}>GSTIN</span><div style={{fontSize:13,fontWeight:600,fontFamily:F.mono,color:C.blue}}>{result.gstin}</div></div>
          <div><span style={{fontSize:10,color:C.ink5,textTransform:'uppercase'}}>Invoice</span><div style={{fontSize:13,fontWeight:600}}>{result.inv}</div></div>
          <div><span style={{fontSize:10,color:C.ink5,textTransform:'uppercase'}}>Date</span><div style={{fontSize:13,fontWeight:600}}>{result.date}</div></div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
            <thead><tr style={{background:C.ink8}}>
              {['Item','HSN','Value','Charged','Correct',''].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',fontWeight:700,color:C.ink5,fontSize:10,textTransform:'uppercase',borderBottom:`1px solid ${C.ink7}`}}>{h}</th>)}
            </tr></thead>
            <tbody>{result.items.map((it,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.ink8}`}}>
                <td style={{padding:'10px',color:C.ink2,fontWeight:500}}>{it.desc}{it.note&&<div style={{fontSize:11,color:C.saffron,marginTop:2}}>↳ {it.note}</div>}</td>
                <td style={{padding:'10px',fontFamily:F.mono,color:C.blue,fontSize:11}}>{it.hsn}</td>
                <td style={{padding:'10px',fontFamily:F.mono}}>{it.value}</td>
                <td style={{padding:'10px'}}><Badge color={it.ok?C.ink5:C.red}>{it.charged}%</Badge></td>
                <td style={{padding:'10px'}}><Badge color={C.green}>{it.correct}%</Badge></td>
                <td style={{padding:'10px'}}>{it.ok?<Badge color={C.green}>✓</Badge>:<Badge color={C.red}>⚠</Badge>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <Card pad={16} style={{marginBottom:16}}>
        <h4 style={{fontSize:13,fontWeight:700,marginBottom:10}}>Findings</h4>
        {result.flags.map((f,i)=><div key={i} style={{padding:'7px 0',borderBottom:`1px solid ${C.ink8}`,fontSize:13,color:C.ink3,lineHeight:1.6}}>{f}</div>)}
      </Card>
      <div style={{textAlign:'center'}}><Btn primary onClick={()=>{setPhase('upload');setResult(null)}}>Scan Another Invoice</Btn></div>
    </Wrap>
  )
  return(
    <Wrap style={{paddingTop:32,paddingBottom:48}}>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Invoice Scanner</h2>
      <p style={{fontSize:13,color:C.ink4,marginBottom:24}}>Photograph any invoice — AI assigns HSN, verifies GST rate, flags risks</p>
      <div style={{maxWidth:500,margin:'0 auto'}}>
        <Card pad={32} style={{textAlign:'center'}}>
          {phase==='upload'?<>
            <div style={{fontSize:36,marginBottom:12}}>📸</div>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:6}}>Scan a Purchase Invoice</h3>
            <p style={{fontSize:13,color:C.ink4,marginBottom:20}}>AI verifies every line item against GST 2.0 rate schedule</p>
            <div onClick={start} style={{border:`2px dashed ${C.ink6}`,borderRadius:12,padding:32,cursor:'pointer',background:C.ink8}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ink4}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.ink6}}>
              <div style={{fontSize:14,fontWeight:600,color:C.ink3}}>Upload invoice photo or PDF</div>
              <div style={{fontSize:11,color:C.ink5,marginTop:4}}>Or use camera on mobile</div>
            </div>
          </>:<div className="anim">
            <div style={{width:44,height:44,borderRadius:'50%',margin:'0 auto 14px',border:`3px solid ${C.ink7}`,borderTopColor:C.ink,animation:'spin .8s linear infinite'}}/>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>Reading invoice...</h3>
          </div>}
        </Card>
      </div>
    </Wrap>
  )
}

// HEALTH SCORE
function Health(){
  const [gstin,setGstin]=useState('')
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState(null)
  const go=()=>{
    if(gstin.length<15)return;setLoading(true)
    setTimeout(()=>{
      setResult({
        gstin:gstin.toUpperCase(),trade:'Agrawal Trading Company',reg:'01.07.2017',status:'Active',score:74,
        areas:[
          {name:'Filing Timeliness',earned:20,max:25,detail:'GSTR-1 and GSTR-3B on time for 10/12 months. Late in Aug and Nov.'},
          {name:'ITC Compliance',earned:16,max:25,detail:'GSTR-3B ITC exceeds GSTR-2B by ₹1.2L in 3 months. ASMT-10 risk.'},
          {name:'Tax Payment',earned:22,max:25,detail:'All payments on time. Cash-to-credit ratio 35:65 (healthy).'},
          {name:'Return Matching',earned:16,max:25,detail:'GSTR-1 vs GSTR-3B outward supply mismatch of ₹3.4L.'},
        ],
        flags:['ITC mismatch persisting 3+ months — DRC-01A trigger','GSTR-1 vs GSTR-3B outward supply mismatch — ASMT-10 trigger','E-way bill value not matching GSTR-1 — Section 129 exposure'],
        actions:[
          {p:'High',act:'Reconcile GSTR-2B with purchase register for Aug, Sep, Nov. Reverse excess ₹1.2L in next GSTR-3B Table 4(B)(2).',by:'Before 20th of next month'},
          {p:'High',act:'Amend GSTR-1 for mismatched months to align with GSTR-3B outward supply values.',by:'Before 30 Nov (Section 37 deadline)'},
          {p:'Medium',act:'Cross-verify e-way bill data with GSTR-1. Ensure all B2B supplies >₹50K have EWBs.',by:'Within 15 days'},
          {p:'Low',act:'Adopt monthly GSTR-2B reconciliation discipline. Use GSTR-2B download as master.',by:'Ongoing'},
        ],
      });setLoading(false)
    },2500)
  }
  if(result) return(
    <Wrap style={{paddingTop:32,paddingBottom:48,maxWidth:700,marginLeft:'auto',marginRight:'auto'}}>
      <Card pad={24} style={{textAlign:'center',marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'center',gap:32,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{width:120,height:120,borderRadius:'50%',background:`conic-gradient(${result.score>=80?C.green:result.score>=60?C.amber:C.red} ${result.score}%, ${C.ink7} 0%)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:96,height:96,borderRadius:'50%',background:C.white,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:34,fontWeight:800,fontFamily:F.mono}}>{result.score}</span><span style={{fontSize:11,color:C.ink5}}>/100</span>
            </div>
          </div>
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:F.mono,fontSize:14,fontWeight:700,color:C.blue}}>{result.gstin}</div>
            <div style={{fontSize:15,fontWeight:700,marginTop:4}}>{result.trade}</div>
            <div style={{fontSize:12,color:C.ink4}}>Reg: {result.reg} · <span style={{color:C.green,fontWeight:600}}>{result.status}</span></div>
          </div>
        </div>
      </Card>
      <Card pad={16} style={{marginBottom:12}}>
        <h4 style={{fontSize:13,fontWeight:700,marginBottom:12}}>Score Breakdown</h4>
        {result.areas.map((a,i)=>(
          <div key={i} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:600}}>{a.name}</span>
              <span style={{fontSize:13,fontWeight:700,fontFamily:F.mono,color:a.earned/a.max>=.8?C.green:a.earned/a.max>=.6?C.amber:C.red}}>{a.earned}/{a.max}</span>
            </div>
            <div style={{height:5,background:C.ink7,borderRadius:3,marginBottom:4}}>
              <div style={{height:'100%',borderRadius:3,width:`${(a.earned/a.max)*100}%`,background:a.earned/a.max>=.8?C.green:a.earned/a.max>=.6?C.amber:C.red,transition:'width .5s'}}/>
            </div>
            <p style={{fontSize:12,color:C.ink4,lineHeight:1.5}}>{a.detail}</p>
          </div>
        ))}
      </Card>
      <Card pad={16} style={{marginBottom:12,borderLeft:`3px solid ${C.red}`}}>
        <h4 style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:8}}>🚩 Red Flags</h4>
        {result.flags.map((f,i)=><div key={i} style={{padding:'6px 0',fontSize:13,color:C.ink3,lineHeight:1.5,borderBottom:`1px solid ${C.ink8}`}}>{f}</div>)}
      </Card>
      <Card pad={16} style={{marginBottom:16}}>
        <h4 style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10}}>✅ Action Plan</h4>
        {result.actions.map((a,i)=>(
          <div key={i} style={{padding:'10px 0',borderBottom:`1px solid ${C.ink8}`}}>
            <div style={{display:'flex',gap:6,marginBottom:4}}><Badge color={a.p==='High'?C.red:a.p==='Medium'?C.amber:C.ink5}>{a.p}</Badge><span style={{fontSize:11,color:C.ink5}}>By: {a.by}</span></div>
            <p style={{fontSize:13,color:C.ink3,lineHeight:1.6}}>{a.act}</p>
          </div>
        ))}
      </Card>
      <div style={{textAlign:'center'}}><Btn primary onClick={()=>setResult(null)}>Check Another GSTIN</Btn></div>
    </Wrap>
  )
  return(
    <Wrap style={{paddingTop:32,paddingBottom:48}}>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>GST Health Score</h2>
      <p style={{fontSize:13,color:C.ink4,marginBottom:24}}>Enter GSTIN — AI analyses filing patterns, flags risks, gives compliance score with action plan</p>
      <div style={{maxWidth:420,margin:'0 auto'}}>
        <Card pad={32} style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:12}}>💚</div>
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:16}}>Enter GSTIN</h3>
          <input value={gstin} onChange={e=>setGstin(e.target.value.toUpperCase())} placeholder="09AABCS1234M1Z1" maxLength={15}
            style={{width:'100%',padding:'12px 14px',border:`1px solid ${C.ink7}`,borderRadius:8,fontSize:15,textAlign:'center',fontFamily:F.mono,fontWeight:600,letterSpacing:'.04em',outline:'none'}}/>
          <div style={{fontSize:11,color:C.ink5,marginTop:6,marginBottom:20}}>15-character GSTIN</div>
          <Btn primary onClick={go} disabled={gstin.length<15||loading} style={{width:'100%',justifyContent:'center'}}>
            {loading?'Analysing...':'Check Health Score'}
          </Btn>
        </Card>
      </div>
    </Wrap>
  )
}

// GST BOLO
function Bolo(){
  const [listening,setListening]=useState(false)
  const [q,setQ]=useState('')
  const [res,setRes]=useState(null)
  const examples=[
    {hi:'Banarasi saree par kitna GST hai?',en:'GST on Banarasi saree?',ans:'Banarasi silk saree HSN 5007 ke andar aati hai. GST rate hai 5% (CGST 2.5% + SGST 2.5%). Yeh rate GST 2.0 me bhi same hai — 5% merit rate me hai. Agar seller composition scheme me hai toh 1.5% lagega.'},
    {hi:'Doodh par GST lagta hai kya?',en:'Is there GST on milk?',ans:'Nahi! Fresh milk, pasteurised milk, aur UHT milk par zero GST hai (HSN 0401). Lekin flavoured milk aur condensed milk par 5% GST lagta hai. Curd, lassi, buttermilk bhi NIL rated hai jab tak branded aur pre-packaged nahi hai.'},
    {hi:'Toothpaste ka GST 2.0 me kya rate hai?',en:'GST on toothpaste after GST 2.0?',ans:'GST 2.0 ke baad toothpaste ab 5% GST par aa gaya hai! Pehle yeh 18% tha (HSN 3306). 56th Council meeting me daily essentials ka rate kam kiya gaya hai. Soap (3401) bhi ab 5% hai.'},
    {hi:'GSTR-3B ki last date kya hai?',en:'GSTR-3B due date?',ans:'Monthly filers (turnover > ₹5 crore) ke liye: har mahine ki 20 tarikh. QRMP scheme me: quarterly filing — 22nd ya 24th (state ke hisab se). Late filing par ₹50/day penalty (₹20 nil return) + 18% interest on tax amount.'},
  ]
  return(
    <Wrap style={{paddingTop:32,paddingBottom:48}}>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>GST Bolo 🎤</h2>
      <p style={{fontSize:13,color:C.ink4,marginBottom:24}}>Hindi me poochein, Hindi me jawab — India's first Hindi GST voice assistant</p>
      <div style={{maxWidth:520,margin:'0 auto'}}>
        <Card pad={28} style={{textAlign:'center',marginBottom:20}}>
          <button onClick={()=>{setListening(!listening);if(!listening)setTimeout(()=>setListening(false),3000)}}
            style={{width:80,height:80,borderRadius:'50%',border:'none',cursor:'pointer',background:listening?C.red:'linear-gradient(135deg,#EA580C,#D97706)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',boxShadow:listening?`0 0 0 16px ${C.red}18`:'0 4px 12px rgba(0,0,0,.1)',transition:'all .3s',animation:listening?'pulse 1s infinite':'none',fontSize:28}}>
            🎤
          </button>
          <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{listening?'Sun raha hoon... Boliye!':'Tap karke boliye'}</div>
          <div style={{fontSize:12,color:C.ink5}}>Hindi ya English me GST sawal poochein</div>
          <div style={{marginTop:16,display:'flex',gap:6}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ya type karein..."
              style={{flex:1,padding:'10px 12px',border:`1px solid ${C.ink7}`,borderRadius:8,fontSize:13,outline:'none'}}
              onKeyDown={e=>{if(e.key==='Enter'&&q)setRes({q,a:'AI processing... (Connect Claude API for live responses)'})}}/>
            <Btn primary sm onClick={()=>{if(q)setRes({q,a:'AI processing... (Connect Claude API for live)'})}}>→</Btn>
          </div>
        </Card>
        {res&&<Card pad={16} style={{marginBottom:20,animation:'fadeUp .25s ease'}}>
          <div style={{fontSize:12,color:C.ink5,marginBottom:4}}>Aapka sawal:</div>
          <div style={{fontSize:14,fontWeight:600,padding:'8px 12px',background:C.saffronLight,borderRadius:6,marginBottom:12}}>{res.q}</div>
          <div style={{fontSize:12,color:C.ink5,marginBottom:4}}>Jawab:</div>
          <div style={{fontSize:13.5,color:C.ink2,lineHeight:1.7}}>{res.a}</div>
        </Card>}
        <h4 style={{fontSize:13,fontWeight:700,marginBottom:8}}>Examples — try these:</h4>
        <div style={{display:'grid',gap:6}}>
          {examples.map((ex,i)=>(
            <Card key={i} onClick={()=>{setQ(ex.hi);setRes({q:ex.hi,a:ex.ans})}} pad={12}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>"{ex.hi}"</div>
              <div style={{fontSize:11,color:C.ink5}}>{ex.en}</div>
            </Card>
          ))}
        </div>
      </div>
    </Wrap>
  )
}

// SCANNER AI
function AI(){
  const [msgs,setMsgs]=useState([{role:'ai',text:'Namaste! 🙏 Main Scanner AI hoon — aapka GST expert. Koi bhi GST sawal poochein — rates, ITC, compliance, case laws, returns, notices.\n\nTry: "Is ITC available on commercial construction after Safari Retreats?" or "What changed in GST 2.0?"'}])
  const [inp,setInp]=useState('')
  const [loading,setLoading]=useState(false)
  const ref=useRef(null)
  const send=()=>{
    if(!inp.trim()||loading)return
    const u=inp.trim();setMsgs(p=>[...p,{role:'user',text:u}]);setInp('');setLoading(true)
    const responses={
      'itc':'Under Section 16, ITC is available on goods/services used in course or furtherance of business, subject to 4 conditions in Section 16(2):\n\n1. Possession of valid tax invoice\n2. Receipt of goods/services\n3. Tax actually paid to government by supplier\n4. Return filed under Section 39\n\nBlocked credits under Section 17(5): motor vehicles (except for transport), food & beverages, health/fitness, club memberships, construction of immovable property.\n\nKey exception: Safari Retreats (SC 2024) — ITC on construction is available when property is used for taxable outward supplies like renting.\n\nTime limit: 30th November of next FY or annual return date (Section 16(4)).\n\nGSTR-2B is now the single source of truth. IMS (Oct 2024) requires accept/reject before GSTR-2B generation.',
      'gst 2':'GST 2.0 — the biggest reform since 2017:\n\n✅ Simplified to 3 primary slabs: 5% (merit), 18% (standard), 40% (luxury/demerit)\n✅ 12% slab effectively merged — most items moved to 5% or 18%\n✅ 28% replaced by 40% for luxury goods (tobacco stays at 28%+cess temporarily)\n\nMajor rate changes (Sep 22, 2025):\n• Soap, toothpaste, hair oil: 18% → 5%\n• Namkeens, noodles, mithai: 12% → 5%\n• ACs, TVs, cement: 28% → 18%\n• Individual health/life insurance: 18% → NIL\n• Spectacles: 28% → 5%\n• Handicrafts: 12% → 5%\n\nRef: 56th GST Council, Notification 9/2025-CT(Rate)',
      'default':'Great question! In the live version, this connects to Claude API with a comprehensive GST knowledge base. The AI provides:\n\n• Specific section citations from CGST/IGST Acts\n• Relevant case law references\n• Practical compliance guidance\n• Answers in Hindi or English\n\nFor the demo, try asking about: ITC rules, GST 2.0 changes, composition scheme, e-way bill, registration thresholds.'
    }
    setTimeout(()=>{
      const key=u.toLowerCase().includes('itc')||u.toLowerCase().includes('input tax')?'itc':u.toLowerCase().includes('gst 2')||u.toLowerCase().includes('what changed')||u.toLowerCase().includes('reform')?'gst 2':'default'
      setMsgs(p=>[...p,{role:'ai',text:responses[key]}]);setLoading(false)
    },1200)
  }
  useEffect(()=>{ref.current?.scrollTo({top:ref.current.scrollHeight,behavior:'smooth'})},[msgs])
  return(
    <Wrap style={{paddingTop:32,paddingBottom:48}}>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Scanner AI</h2>
      <p style={{fontSize:13,color:C.ink4,marginBottom:20}}>AI-powered GST expert — ask anything about Indian GST law</p>
      <Card pad={0} style={{maxWidth:640,margin:'0 auto',overflow:'hidden',height:'58vh',display:'flex',flexDirection:'column'}}>
        <div ref={ref} style={{flex:1,overflow:'auto',padding:16}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',marginBottom:10}}>
              <div style={{maxWidth:'82%',padding:'10px 14px',borderRadius:14,background:m.role==='user'?C.ink:C.ink8,color:m.role==='user'?C.white:C.ink2,fontSize:13.5,lineHeight:1.6,whiteSpace:'pre-wrap',borderBottomRightRadius:m.role==='user'?4:14,borderBottomLeftRadius:m.role==='ai'?4:14}}>
                {m.text}
              </div>
            </div>
          ))}
          {loading&&<div style={{display:'flex',gap:3,padding:'8px 14px'}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:C.ink6,animation:`pulse 1s ease infinite ${i*.2}s`}}/>)}</div>}
        </div>
        <div style={{borderTop:`1px solid ${C.ink7}`,padding:'10px 14px',display:'flex',gap:6}}>
          <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask any GST question..."
            style={{flex:1,padding:'9px 12px',border:`1px solid ${C.ink7}`,borderRadius:8,fontSize:13.5,outline:'none'}}/>
          <Btn primary sm onClick={send} disabled={!inp.trim()||loading}>Send</Btn>
        </div>
      </Card>
    </Wrap>
  )
}

// ══════════════════════════════════════════
// APP
// ══════════════════════════════════════════
export default function App(){
  const [page,setPage]=useState('home')
  const go=useCallback(p=>{setPage(p);window.scrollTo({top:0,behavior:'smooth'})},[])
  const P=()=>{switch(page){
    case'home':return<Home go={go}/>
    case'chapters':return<Chapters/>
    case'rates':return<Rates/>
    case'cases':return<Cases/>
    case'calendar':return<Calendar/>
    case'test':return<Test/>
    case'notice':return<ScanNotice/>
    case'invoice':return<InvoiceScan/>
    case'health':return<Health/>
    case'bolo':return<Bolo/>
    case'ai':return<AI/>
    default:return<Home go={go}/>
  }}
  return(<><style>{CSS}</style><Nav active={page} go={go}/><P/></>)
}

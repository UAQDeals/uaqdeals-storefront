// @ts-nocheck
/* eslint-disable */
/* Pure document builder: form data in, pdfmake document definition out. */
var UAQ = {
  legal: 'Ultimate Affordable Quickmark Deals FZC LLC',
  license: '2623415470888',
  authority: 'Ajman Nuventures Centre Free Zone',
  address: 'CWS-3V-147022, 26th Floor, Amber Gem Tower, Ajman',
  signatory: 'Ali Saif Mohamed Boassaibah Al Ali',
  designation: 'Managing Director',
  email: 'info@uaqdeals.ae',
  issue: 'June 4, 2026',
  expiry: 'May 24, 2027',
  activity: 'Commercial Brokers; Non-Specialized Wholesale Trading; Retail Sale via Mail Order/Internet; Digital Content Services; IT Consultancy; and other activities per license.',
  owners: 'Ali Saif Mohamed Boassaibah Al Ali (50%); Irshad Kannankuzhiyan (50%)',
  manager: 'Irshad Kannankuzhiyan'
};
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseDate(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return null;
  return { y: +m[1], m: +m[2], d: +m[3] };
}
function ordinal(n) {
  var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function dateCover(iso) { var d = parseDate(iso); return d ? d.d + ' ' + MONTHS[d.m - 1] + ' ' + d.y : ''; }
function dateClause(iso) { var d = parseDate(iso); return d ? ordinal(d.d) + ' day of ' + MONTHS[d.m - 1] + ', ' + d.y : ''; }
function dateLicense(iso) { var d = parseDate(iso); return d ? MONTHS[d.m - 1] + ' ' + d.d + ', ' + d.y : ''; }

function numWords(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return 'zero';
  var ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function under1000(x) {
    var out = [];
    if (x >= 100) { out.push(ones[Math.floor(x / 100)] + ' hundred'); x %= 100; if (x) out.push('and'); }
    if (x >= 20) { out.push(tens[Math.floor(x / 10)] + (x % 10 ? '-' + ones[x % 10] : '')); }
    else if (x > 0) out.push(ones[x]);
    return out.join(' ');
  }
  var parts = [], units = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
  for (var i = 0; i < units.length; i++) {
    if (n >= units[i][0]) { parts.push(under1000(Math.floor(n / units[i][0])) + ' ' + units[i][1]); n %= units[i][0]; }
  }
  if (n > 0) parts.push((parts.length && n < 100 ? 'and ' : '') + under1000(n));
  return parts.join(' ');
}
function titleCase(s) { return s.replace(/(^|[\s-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/\bAnd\b/g, 'and'); }
function money(n) { return Math.floor(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function pctWords(p) {
  var n = Number(p) || 0, whole = Math.floor(n), frac = String(p).split('.')[1];
  var w = numWords(whole);
  if (frac && Number(frac) > 0) {
    var dn = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    w += ' point ' + frac.replace(/0+$/, '').split('').map(function (c) { return dn[+c]; }).join(' ');
  }
  return w;
}
function pctNum(p) { return String(Number(p) || 0); }
function withThe(s) { return /^the\s/i.test(s) ? s : 'the ' + s; }
function article(s) { return (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s; }

export function derive(d) {
  return {
    dateCover: dateCover(d.effDate),
    dateClause: dateClause(d.effDate),
    feeText: 'AED ' + money(d.fee) + ' (UAE Dirhams ' + titleCase(numWords(d.fee)) + ' only)',
    commissionText: pctWords(d.commission) + ' percent (' + pctNum(d.commission) + '%)',
    settleText: numWords(d.settleDays) + ' (' + Math.floor(Number(d.settleDays) || 0) + ') days',
    tradeName: d.vTradeName || d.vName,
    licenseFull: d.vLicNo + (d.vRegNo ? ' (Reg. No. ' + d.vRegNo + ')' : '')
  };
}

export function buildDoc(d, logo) {
  var x = derive(d);
  var MAROON = '#8B1A3A', GOLD = '#C9A961', CREAM = '#F5EFE6', INK = '#1F1F1F', MUTE = '#555555';
  var W = 451; // usable width on A4 with 72pt margins
  var body = [];
  var toc = [];

  function rule(color, w) { return { canvas: [{ type: 'line', x1: 0, y1: 0, x2: W, y2: 0, lineWidth: w || 0.7, lineColor: color || GOLD }], margin: [0, 3, 0, 8] }; }
  function H(title, tocTitle, id, opts) {
    toc.push([tocTitle, id]);
    var node = { text: title, id: id, font: 'Caladea', bold: true, fontSize: 12.5, color: MAROON, margin: [0, 14, 0, 0], headlineLevel: 1 };
    if (opts && opts.pageBreak) { node.pageBreak = 'before'; node.margin = [0, 0, 0, 0]; }
    body.push(node, rule());
  }
  function P(text, o) { body.push(Object.assign({ text: text, margin: [0, 0, 0, 7] }, o || {})); }
  function clause(num, text) {
    body.push({ columns: [{ width: 30, text: num, bold: true }, { width: '*', text: text }], columnGap: 0, margin: [0, 0, 0, 7] });
  }
  function subs(items, o) {
    o = o || {};
    items.forEach(function (t, i) {
      body.push({ columns: [{ width: 20, text: '(' + String.fromCharCode(97 + i) + ')', bold: true }, { width: '*', text: t }], columnGap: 0, margin: [o.indent == null ? 30 : o.indent, 0, 0, o.gap == null ? 6 : o.gap] });
    });
  }
  function def(term, text) {
    body.push({ text: [{ text: '"' + term + '"  ', bold: true }, text], margin: [18, 0, 0, 7], leadingIndent: -18 });
  }
  function whereas(text) {
    body.push({ text: [{ text: 'WHEREAS,  ', bold: true, italics: true }, text], margin: [18, 0, 0, 7], leadingIndent: -18 });
  }

  /* ---------- Agreement opening ---------- */
  body.push({ text: 'VENDOR PARTNERSHIP AGREEMENT', font: 'Caladea', bold: true, fontSize: 13, color: MAROON, alignment: 'center', margin: [0, 0, 0, 12] });
  P('This Vendor Partnership Agreement (“Agreement”) is made and entered into on this ' + x.dateClause + ' (“Effective Date”),');
  P('BY AND BETWEEN', { alignment: 'center' });
  P(UAQ.legal + ', trading as “UAQ Deals”, a Free Zone Limited Liability Company incorporated under the laws of the Emirate of Ajman, United Arab Emirates, holding Trade License No. ' + UAQ.license + ' issued by ' + UAQ.authority + ', Government of Ajman, with its registered office at ' + UAQ.address + ', United Arab Emirates, represented herein by its ' + UAQ.designation + ', Mr. ' + UAQ.signatory + ' (hereinafter referred to as “UAQ Deals” or the “Platform”, which expression shall, unless repugnant to the context, include its successors and permitted assigns);');
  P('AND', { alignment: 'center' });
  var signName = (d.sTitle ? d.sTitle + ' ' : '') + d.sName + (d.sShare ? ' (' + d.sShare + ')' : '');
  P(d.vName + ', ' + article(d.vType) + ' licensed under License No. ' + d.vLicNo + (d.vRegNo ? ' (Registration No. ' + d.vRegNo + ')' : '') + ' issued by ' + withThe(d.vAuthority) + ', Government of ' + d.vEmirate + ', United Arab Emirates, with its registered address at ' + d.vAddress + ', United Arab Emirates, ' + (d.vOwnerClause ? 'owned by ' + d.vOwnerClause + ' and ' : '') + 'represented herein by its ' + d.sDesignation + ', ' + signName + ' (hereinafter referred to as the “Vendor”, which expression shall, unless repugnant to the context, include its successors and permitted assigns).');
  P('UAQ Deals and the Vendor are hereinafter individually referred to as a “Party” and collectively as the “Parties.”');

  body.push({ text: 'RECITALS', font: 'Caladea', bold: true, fontSize: 11.5, color: MAROON, margin: [0, 2, 0, 6] });
  whereas('UAQ Deals owns and operates a hyperlocal e-commerce marketplace platform, comprising websites, a customer mobile application, a vendor application, and related digital infrastructure, under the brand “UAQ Deals,” offering customers access to products, services, and restaurants across Ajman and Umm Al Quwain, United Arab Emirates (the “Platform”);');
  whereas('the Vendor is engaged in ' + d.bizDesc + ', under License No. ' + d.vLicNo + ', and wishes to list and sell its Products through the Platform;');
  whereas('UAQ Deals is willing to provide the Vendor with vendor listing, digital marketing, order management, and fulfilment-support services through the Platform, on the terms and subject to the conditions set out in this Agreement; and');
  whereas('the Parties wish to record, in writing, the complete commercial and legal terms governing their relationship.');
  P('NOW, THEREFORE, in consideration of the mutual covenants and agreements set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:');

  /* ---------- 1 ---------- */
  H('1.  DEFINITIONS AND INTERPRETATION', '1.  Definitions and Interpretation', 's1');
  clause('1.1', 'In this Agreement, unless the context otherwise requires, the following terms shall have the meanings set out below:');
  def('Agreement', 'means this Vendor Partnership Agreement, including its Recitals and Annexures, as may be amended in writing from time to time.');
  def('Commission', 'means the fee described in Clause 5, calculated as a fixed percentage of the Order Value of each Order.');
  def('Customer', 'means any end-user who browses or purchases Products through the Platform.');
  def('Order', 'means a confirmed purchase transaction placed by a Customer through the Platform for the Vendor\'s Products.');
  def('Order Value', 'means the total sale price of Products comprised in an Order, as reflected on the Platform, exclusive of Value Added Tax (VAT) and any separately itemised delivery fee.');
  def('Platform', 'means UAQ Deals\'s website(s), customer mobile application, vendor application (“Vendor App”), and related digital infrastructure through which Products are listed, marketed, and sold.');
  def('Products', 'means the ' + d.productsDef + ' that the Vendor lists, offers, and sells or provides through the Platform.');
  def('Promotional Services', 'means the optional, additional, separately chargeable marketing features described in Clause 6, including Web and App Banners, Deals, Cross-Sell, Up-Sell, Sponsored Search, and Feature My Product.');
  def('Vendor App', 'means the vendor-facing dashboard and/or mobile application provided by UAQ Deals for order management, listings, reporting, and account administration.');
  def('Annual Fee', 'means the fixed annual fee payable by the Vendor under Clause 4 for Vendor Listing and Digital Marketing services.');
  clause('1.2', 'Headings are inserted for convenience of reference only and shall not affect the interpretation of this Agreement. Words importing the singular include the plural and vice versa, and words importing a gender include every gender.');

  H('2.  TERM AND RENEWAL', '2.  Term and Renewal', 's2');
  clause('2.1', 'This Agreement shall commence on the Effective Date and shall remain in force for a period of one (1) year (“Initial Term”), unless terminated earlier in accordance with Clause 17.');
  clause('2.2', 'This Agreement shall automatically renew for successive one (1) year periods (each a “Renewal Term”) upon payment of the then-applicable Annual Fee, unless either Party gives the other written notice of non-renewal at least thirty (30) days prior to expiry of the then-current Term.');
  clause('2.3', 'UAQ Deals may revise the Annual Fee, the Commission rate, or Promotional Service charges for any Renewal Term, provided that written notice of any such revision is given to the Vendor at least thirty (30) days before the renewal date. Continued use of the Platform after the revised terms take effect constitutes acceptance of the revision.');

  H('3.  APPOINTMENT AND SCOPE', '3.  Appointment and Scope', 's3');
  clause('3.1', 'UAQ Deals grants the Vendor a non-exclusive, non-transferable right to list and sell its Products through the Platform, subject to this Agreement and to UAQ Deals\'s standard vendor policies and operating procedures, as amended from time to time and notified via the Vendor App.');
  clause('3.2', 'Nothing in this Agreement grants the Vendor exclusivity within its product category, geographic area, or delivery zone. UAQ Deals may onboard other vendors offering the same or competing Products at its sole discretion.');
  clause('3.3', 'The Vendor\'s Products shall be presented on the Platform under the Vendor\'s own registered trade name, “' + x.tradeName + ',” or such other trading name as the Vendor may notify to UAQ Deals in writing from time to time.');

  H('4.  VENDOR LISTING & DIGITAL MARKETING FEE (ANNUAL FEE)', '4.  Vendor Listing & Digital Marketing Fee (Annual Fee)', 's4');
  clause('4.1', 'In consideration of Vendor Listing and Digital Marketing services, the Vendor shall pay UAQ Deals a fixed annual fee of ' + x.feeText + ' (“Annual Fee”).');
  clause('4.2', 'The Annual Fee is exclusive of VAT. VAT shall be added at the applicable statutory rate and invoiced separately in accordance with Article 8.');
  clause('4.3', 'The Annual Fee covers:');
  subs([
    'listing of the Vendor\'s Products on the Platform, across both the web storefront and the customer mobile application;',
    'standard digital marketing of the Vendor\'s storefront and Products through the Platform\'s general/organic marketing channels; and',
    'all technical expenses associated with hosting, maintaining, and operating the Vendor\'s listing on the Platform, including the Vendor\'s access to the Vendor App.'
  ]);
  clause('4.4', 'The Annual Fee does not include Promotional Services, which are optional and separately chargeable in accordance with Clause 6.');
  clause('4.5', 'The Annual Fee is payable in advance, in a single instalment, within seven (7) days of the Effective Date, and thereafter within seven (7) days of each renewal date, unless the Parties agree otherwise in writing.');
  clause('4.6', 'The Annual Fee is non-refundable, save where this Agreement is terminated by the Vendor as a direct result of UAQ Deals\'s uncured material breach, in which case a pro-rated refund for the unexpired portion of the then-current Term shall apply.');

  H('5.  COMMISSION ON ORDERS', '5.  Commission on Orders', 's5');
  clause('5.1', 'In addition to the Annual Fee, the Vendor shall pay UAQ Deals a fixed commission of ' + x.commissionText + ' of the Order Value on every Order successfully placed, fulfilled, and completed through the Platform (“Commission”).');
  clause('5.2', 'The Commission is calculated on the Order Value, exclusive of VAT and delivery charges, and shall be deducted by UAQ Deals from amounts collected from Customers prior to settlement to the Vendor under Clause 7.');
  clause('5.3', 'The Commission is payable irrespective of the Customer\'s payment method (cash on delivery, online payment, or wallet) and irrespective of whether delivery is fulfilled through UAQ Deals\'s own logistics network or otherwise, unless the Parties agree otherwise in writing.');
  clause('5.4', 'Commission shall not apply to Orders cancelled prior to fulfilment or fully refunded to the Customer in accordance with the Platform\'s standard refund policy, except that where the cancellation or refund results from the Vendor\'s act, omission, or breach of this Agreement, UAQ Deals may retain or recover the applicable Commission.');

  H('6.  OPTIONAL PROMOTIONAL SERVICES', '6.  Optional Promotional Services', 's6');
  clause('6.1', 'The Annual Fee and Commission under Articles 4 and 5 do not include, and the Vendor may separately elect to purchase, the following optional Promotional Services:');
  subs(['Web and App Banners;', 'Deals (time-bound promotional discount campaigns);', 'Cross-Sell placements;', 'Up-Sell placements;', 'Sponsored Search placement; and', '“Feature My Product” placement.']);
  clause('6.2', 'Charges for Promotional Services are variable and shall be displayed live within the Vendor App at the time of purchase, reflecting UAQ Deals\'s then-current rate card. The Vendor may review the applicable charge before confirming purchase of any Promotional Service, and no Promotional Service charge shall be applied without the Vendor\'s in-app confirmation.');
  clause('6.3', 'Promotional Services are entirely optional. The Vendor\'s Products shall remain listed and available for sale on the Platform under Articles 4 and 5 whether or not the Vendor purchases any Promotional Service.');
  clause('6.4', 'UAQ Deals may add, remove, or modify the scope, pricing, or availability of Promotional Services from time to time, with such changes reflected in the Vendor App prior to purchase.');

  H('7.  PAYMENT TERMS & SETTLEMENT', '7.  Payment Terms & Settlement', 's7');
  clause('7.1', 'UAQ Deals shall collect payment from Customers on behalf of the Vendor through the Platform\'s payment infrastructure, including cash-on-delivery amounts collected by UAQ Deals\'s delivery personnel.');
  clause('7.2', 'UAQ Deals shall remit to the Vendor the net proceeds of completed Orders — being Order Value less Commission, less any Promotional Service charges incurred, and less any refunds or claw-backs — on a recurring settlement cycle of every ' + x.settleText + ', by bank transfer to the Vendor\'s designated bank account.');
  clause('7.3', 'The Vendor shall provide accurate bank account details to UAQ Deals and shall promptly notify UAQ Deals in writing of any change to those details.');
  clause('7.4', 'UAQ Deals shall make available to the Vendor, through the Vendor App, a statement of Orders, Commission deducted, Promotional Service charges, refunds/claw-backs, and net amount payable for each settlement cycle.');
  clause('7.5', 'The Vendor shall notify UAQ Deals in writing of any discrepancy in a settlement statement within seven (7) days of its being made available; failing which, the statement shall be deemed accepted and final.');

  H('8.  VAT AND TAXES', '8.  VAT and Taxes', 's8');
  clause('8.1', 'All amounts stated in this Agreement are exclusive of Value Added Tax (VAT) unless expressly stated otherwise. VAT shall be applied, collected, and remitted in accordance with the regulations of the UAE Federal Tax Authority.');
  clause('8.2', 'Each Party is responsible for its own tax registration, filing, and compliance obligations under UAE law, including maintaining a valid Tax Registration Number (TRN) where legally required.');

  H('9.  VENDOR OBLIGATIONS', '9.  Vendor Obligations', 's9');
  clause('9.', 'The Vendor undertakes and agrees to:');
  var vo = [
    'provide accurate, complete, and up-to-date product listings, descriptions, pricing, and stock availability at all times;',
    'maintain valid trade licenses, permits, and any regulatory approvals required to sell or provide the Products;',
    'ensure Products sold are genuine and authentic, accurately described, and compliant with all applicable UAE federal and local laws, and refrain from selling counterfeit, smuggled, or unauthorized replica goods;'
  ];
  if (d.hasRepair) vo.push('when providing repair services, exercise reasonable care and skill, use quality replacement parts, and safeguard any personal data stored on Customer devices left for repair, in accordance with Article 13 (Data Protection);');
  vo.push(
    'prepare and hand over Orders for pickup or delivery within the timeframes communicated via the Vendor App;',
    'refrain from using the Platform, or any Customer information obtained through it, to solicit Customers to transact outside the Platform in a manner that circumvents the Commission payable under Article 5;',
    'comply with all Platform policies, guidelines, and standard operating procedures as communicated by UAQ Deals from time to time; and',
    'refrain from fraudulent, deceptive, or misleading conduct in connection with the Platform.'
  );
  subs(vo);

  H('10.  UAQ DEALS OBLIGATIONS', '10.  UAQ Deals Obligations', 's10');
  clause('10.', 'UAQ Deals undertakes and agrees to:');
  subs([
    'maintain and operate the Platform so as to enable Customers to browse and purchase the Vendor\'s Products;',
    'provide the Vendor Listing and standard Digital Marketing services described in Article 4;',
    'provide the Vendor with access to the Vendor App for order management, reporting, and settlement visibility;',
    'collect payment from Customers and remit net proceeds to the Vendor in accordance with Article 7;',
    'provide reasonable customer support in relation to Orders placed on the Platform; and',
    'coordinate pickup and delivery logistics for Orders through UAQ Deals\'s driver/courier network, where applicable.'
  ]);

  H('11.  INTELLECTUAL PROPERTY', '11.  Intellectual Property', 's11');
  clause('11.1', 'All right, title, and interest in the Platform — including the “UAQ Deals” and “UAQ Deals Mart” names, associated logos and trademarks, software, and underlying technology — are and shall remain the exclusive property of UAQ Deals.');
  clause('11.2', 'The Vendor grants UAQ Deals a non-exclusive, royalty-free licence to use the Vendor\'s trade name, logo, and Product images/descriptions solely for the purpose of listing, marketing, and promoting the Vendor\'s Products on the Platform during the Term.');
  clause('11.3', 'Nothing in this Agreement transfers ownership of either Party\'s pre-existing intellectual property to the other Party.');

  H('12.  CONFIDENTIALITY', '12.  Confidentiality', 's12');
  clause('12.1', 'Each Party shall keep confidential all non-public business, financial, technical, and commercial information disclosed by the other Party in connection with this Agreement (“Confidential Information”) and shall not disclose it to any third party without the prior written consent of the disclosing Party, save as required by law or a competent regulatory or judicial authority.');
  clause('12.2', 'This obligation shall survive termination or expiry of this Agreement for a period of two (2) years.');

  H('13.  DATA PROTECTION', '13.  Data Protection', 's13');
  clause('13.1', 'Each Party shall comply with applicable UAE data protection laws in respect of any Customer or personal data accessed or processed in connection with this Agreement.');
  clause('13.2', 'The Vendor shall not use Customer data obtained through the Platform for any purpose other than fulfilling Orders, and shall not retain, sell, or share such data with any third party.');

  H('14.  REPRESENTATIONS AND WARRANTIES', '14.  Representations and Warranties', 's14');
  clause('14.1', 'Each Party represents and warrants that it is duly licensed and authorised to carry on its business and to enter into and perform its obligations under this Agreement.');
  clause('14.2', 'Each Party shall comply with all applicable UAE federal and local laws, regulations, and licensing conditions in the performance of this Agreement.');

  H('15.  INDEMNIFICATION', '15.  Indemnification', 's15');
  clause('15.1', 'The Vendor shall indemnify and hold harmless UAQ Deals, its officers, employees, and agents against any claims, damages, losses, or expenses arising from: (a) defective, unsafe, counterfeit, or misdescribed Products' + (d.hasRepair ? ', including any repair services performed by the Vendor' : '') + '; (b) the Vendor\'s breach of this Agreement or of applicable law; or (c) any third-party claim arising from the Vendor\'s Products or conduct.');
  clause('15.2', 'UAQ Deals shall indemnify and hold harmless the Vendor against any claims, damages, losses, or expenses arising from UAQ Deals\'s gross negligence or wilful misconduct in the operation of the Platform.');

  H('16.  LIMITATION OF LIABILITY', '16.  Limitation of Liability', 's16');
  clause('16.1', 'Neither Party shall be liable to the other for any indirect, incidental, special, or consequential loss, including loss of profit or business opportunity, arising out of or in connection with this Agreement.');
  clause('16.2', 'UAQ Deals\'s aggregate liability under this Agreement shall not exceed the total Annual Fee paid by the Vendor in the twelve (12) months preceding the event giving rise to the claim.');

  H('17.  TERMINATION', '17.  Termination', 's17');
  clause('17.1', 'Either Party may terminate this Agreement for convenience by giving the other thirty (30) days\' prior written notice.');
  clause('17.2', 'UAQ Deals may terminate this Agreement immediately, without notice, if the Vendor:');
  subs([
    'breaches any material term of this Agreement and fails to remedy such breach within seven (7) days of written notice;',
    'has its Trade License suspended, revoked, or not renewed;',
    'engages in fraud, misrepresentation, or conduct harmful to the Platform, to Customers, or to UAQ Deals\'s reputation; or',
    'becomes insolvent or is subjected to bankruptcy, winding-up, or liquidation proceedings.'
  ]);
  clause('17.3', 'Upon termination, the Vendor\'s Products shall be removed from the Platform, and any accrued but unpaid amounts owed by either Party shall be settled within thirty (30) days of the termination date.');
  clause('17.4', 'Articles 11 (Intellectual Property), 12 (Confidentiality), 13 (Data Protection), 15 (Indemnification), 16 (Limitation of Liability), and 20 (Governing Law and Dispute Resolution) shall survive termination or expiry of this Agreement.');

  H('18.  FORCE MAJEURE', '18.  Force Majeure', 's18');
  clause('18.1', 'Neither Party shall be liable for any delay in, or failure to, perform its obligations under this Agreement where such delay or failure arises from causes beyond its reasonable control, including but not limited to acts of God, natural disaster, government action, epidemic or pandemic, or failure of internet or telecommunications infrastructure.');

  H('19.  INDEPENDENT CONTRACTOR RELATIONSHIP', '19.  Independent Contractor Relationship', 's19');
  clause('19.1', 'Nothing in this Agreement creates a partnership, joint venture, agency, or employment relationship between the Parties. Each Party remains an independent entity responsible for its own employees, taxes, and statutory obligations.');

  H('20.  GOVERNING LAW AND DISPUTE RESOLUTION', '20.  Governing Law and Dispute Resolution', 's20');
  clause('20.1', 'This Agreement is governed by, and shall be construed in accordance with, the laws of the United Arab Emirates as applied in the Emirate of Ajman.');
  clause('20.2', 'Any dispute arising out of or in connection with this Agreement shall first be referred to good-faith negotiation between the Parties, to be concluded within thirty (30) days of written notice of the dispute.');
  clause('20.3', 'Failing amicable resolution under Clause 20.2, the dispute shall be referred to the exclusive jurisdiction of the competent courts of the Emirate of Ajman, United Arab Emirates.');

  H('21.  NOTICES', '21.  Notices', 's21');
  clause('21.1', 'All notices under this Agreement shall be in writing and delivered by email or registered post to the address/email below, and shall be deemed received upon confirmation of delivery:');
  P('For UAQ Deals:  ' + UAQ.email + ' — ' + UAQ.address + ', UAE', { margin: [30, 0, 0, 6] });
  P('For the Vendor:  ' + (d.vEmail ? d.vEmail + ' — ' : '') + d.vAddress + ', UAE', { margin: [30, 0, 0, 7] });

  H('22.  MISCELLANEOUS', '22.  Miscellaneous', 's22');
  clause('22.1', 'Entire Agreement. This Agreement, together with its Annexures, constitutes the entire agreement between the Parties in relation to its subject matter and supersedes all prior discussions, understandings, or agreements, whether written or oral.');
  clause('22.2', 'Amendment. No amendment to this Agreement shall be effective unless in writing and signed by both Parties, save for updates to Platform policies, the rate card, or Promotional Service pricing as permitted under Clauses 2.3 and 6.4.');
  clause('22.3', 'Severability. If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.');
  clause('22.4', 'Assignment. Neither Party may assign or transfer its rights or obligations under this Agreement without the other Party\'s prior written consent, except that UAQ Deals may assign this Agreement to an affiliate or successor entity.');
  clause('22.5', 'Counterparts. This Agreement may be executed in counterparts, including scanned or electronic copies, each of which shall be deemed an original and all of which together constitute one and the same instrument.');

  /* ---------- Signature page ---------- */
  toc.push(['Signature Page', 'sig']);
  body.push({ text: 'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.', bold: true, id: 'sig', pageBreak: 'before', margin: [0, 0, 0, 22] });
  var sigRows = [
    [{ text: 'For and on behalf of UAQ Deals', bold: true, color: MAROON, fontSize: 11 }, { text: 'For and on behalf of the Vendor', bold: true, color: MAROON, fontSize: 11 }],
    [{ text: '(' + UAQ.legal + ')', italics: true, fontSize: 9, color: MUTE }, { text: '(' + d.vName + ')', italics: true, fontSize: 9, color: MUTE }],
    ['Name:  ' + UAQ.signatory, 'Name:  ' + d.sName],
    ['Designation:  ' + UAQ.designation, 'Designation:  ' + d.sDesignation],
    ['Signature:  _______________________', 'Signature:  _______________________'],
    ['Date:  _______________________', 'Date:  _______________________']
  ];
  var sigGap = [10, 26, 22, 44, 30, 0];
  body.push({
    table: { widths: ['*', '*'], body: sigRows },
    layout: {
      hLineWidth: function () { return 0; }, vLineWidth: function () { return 0; },
      paddingLeft: function () { return 0; }, paddingRight: function () { return 16; },
      paddingTop: function () { return 0; }, paddingBottom: function (i) { return sigGap[i]; }
    }
  });

  /* ---------- Annexures ---------- */
  function tableLayout() {
    return {
      hLineWidth: function () { return 0.6; }, vLineWidth: function () { return 0.6; },
      hLineColor: function () { return '#000000'; }, vLineColor: function () { return '#000000'; },
      paddingLeft: function () { return 7; }, paddingRight: function () { return 7; },
      paddingTop: function () { return 7; }, paddingBottom: function () { return 7; }
    };
  }
  function th(t) { return { text: t, bold: true, color: '#FFFFFF', fillColor: MAROON }; }

  H('ANNEXURE A — TRADE LICENSE DETAILS', 'Annexure A — Trade License Details', 'anxA', { pageBreak: true });
  P('The following details are extracted from the Parties\' respective trade licenses and are provided for reference. Each Party remains responsible for notifying the other of any change in licensing status.');
  var rowsA = [
    ['Legal Name', UAQ.legal, d.vName],
    ['License No.', UAQ.license, x.licenseFull],
    ['Legal Type', 'Free Zone Company – FZC LLC', d.vType],
    ['Issuing Authority', UAQ.authority + ', Government of Ajman', d.vAuthority + ', ' + d.vEmirate],
    ['Issue Date', UAQ.issue, dateLicense(d.vIssue)],
    ['Expiry Date', UAQ.expiry, dateLicense(d.vExpiry)],
    ['Registered Address', UAQ.address + ', UAE', d.vAddress + ', UAE'],
    ['Licensed Activity', UAQ.activity, d.vActivity],
    ['Owner(s) / Shareholders', UAQ.owners, d.vOwners],
    ['Manager', UAQ.manager, d.vManager]
  ];
  body.push({
    fontSize: 9.5, layout: tableLayout(),
    table: {
      headerRows: 1, widths: [96, '*', '*'], dontBreakRows: true,
      body: [[th('Field'), th('UAQ Deals'), th('Vendor')]].concat(rowsA.map(function (r, i) {
        return [{ text: r[0], bold: true, fillColor: i % 2 === 0 ? CREAM : null }, r[1] || '—', r[2] || '—'];
      }))
    }
  });

  H('ANNEXURE B — FEE SCHEDULE', 'Annexure B — Fee Schedule', 'anxB', { pageBreak: true });
  var live = 'Charge displayed live in the Vendor App at time of purchase.';
  var rowsB = [
    ['Annual Vendor Listing + Digital Marketing Fee', 'AED ' + money(d.fee) + ' / year', 'Covers listing, standard marketing, and all technical/hosting expenses. Excl. VAT.'],
    ['Commission', pctNum(d.commission) + '% of Order Value, per Order', 'Deducted from Order Value before settlement to Vendor.'],
    ['Web & App Banners', 'Variable', live], ['Deals', 'Variable', live], ['Cross-Sell', 'Variable', live],
    ['Up-Sell', 'Variable', live], ['Sponsored Search', 'Variable', live], ['Feature My Product', 'Variable', live]
  ];
  body.push({
    fontSize: 9.5, layout: tableLayout(),
    table: {
      headerRows: 1, widths: [146, 100, '*'], dontBreakRows: true,
      body: [[th('Item'), th('Amount / Rate'), th('Notes')]].concat(rowsB.map(function (r, i) {
        var f = i % 2 === 0 ? CREAM : null;
        return r.map(function (c) { return { text: c, fillColor: f }; });
      }))
    }
  });

  H('ANNEXURE C — ADDITIONAL TERMS', 'Annexure C — Additional Terms', 'anxC', { pageBreak: true });
  var C = { fontSize: 9.5, lineHeight: 1.1 };
  function ch(t) { body.push({ text: t, font: 'Caladea', bold: true, fontSize: 10.5, color: MAROON, margin: [0, 4, 0, 2] }); }
  function cp(t) { body.push(Object.assign({ text: t, margin: [0, 0, 0, 3] }, C)); }
  function cs(items) {
    items.forEach(function (t, i) {
      body.push(Object.assign({ columns: [{ width: 16, text: '(' + String.fromCharCode(97 + i) + ')', bold: true }, { width: '*', text: t }], columnGap: 0, margin: [14, 0, 0, 1] }, C));
    });
  }
  ch('C.1  Order Preparation and Service Levels');
  cp('The Vendor shall prepare and make Orders available for collection within the preparation time communicated through the Vendor App. Repeated delays, failure to prepare Orders on time, or persistent failure to meet the Platform\'s service standards may result in warnings, temporary suspension of the Vendor\'s account, financial penalties (if applicable), or termination of this Agreement at UAQ Deals\'s sole discretion.');
  ch('C.2  Vendor Performance Standards (KPIs)');
  cp('The Vendor shall maintain the minimum performance standards established by UAQ Deals from time to time, including but not limited to:');
  cs(['Order Acceptance Rate;', 'Order Preparation Time;', 'Order Cancellation Rate;', 'Customer Ratings and Reviews; and', 'Order Fulfilment Accuracy.']);
  cp('UAQ Deals may periodically review the Vendor\'s performance against these standards. Failure to maintain the required performance standards may result in corrective action, suspension of the Vendor\'s account, or termination of this Agreement.');
  ch('C.3  Right of Set-Off');
  cp('UAQ Deals shall have the right to deduct, withhold, or set off any amounts owed by the Vendor under this Agreement — including Customer refunds, compensation, chargebacks, penalties, losses, damages, or other liabilities — from any payments or settlement amounts otherwise payable to the Vendor.');
  ch('C.4  Suspension Rights');
  cp('Without prejudice to any other rights available under this Agreement, UAQ Deals may immediately suspend the Vendor\'s account, in whole or in part, where:');
  cs([
    'the Vendor receives repeated Customer complaints;',
    'the Vendor\'s Trade License or any required regulatory approval expires, is suspended, or is revoked;',
    'the Vendor breaches applicable consumer protection, telecommunications, municipality, or other regulatory requirements;',
    'the Vendor engages in fraudulent, misleading, or unlawful conduct; or',
    'UAQ Deals reasonably believes that continued operation of the Vendor may adversely affect Customers, the Platform, or UAQ Deals\'s reputation.'
  ]);
  cp('Such suspension may remain in effect until the issue has been resolved to UAQ Deals\'s reasonable satisfaction.');
  ch('C.5  Non-Circumvention');
  cp('The Vendor shall not directly or indirectly encourage, solicit, or induce Customers introduced through the Platform to transact outside the Platform for the purpose of avoiding Commission or other fees payable to UAQ Deals. Any breach of this Clause shall constitute a material breach of this Agreement and shall entitle UAQ Deals to suspend or terminate the Vendor\'s account and to seek any other remedies available under applicable law.');
  ch('C.6  Platform Availability');
  cp('UAQ Deals shall use commercially reasonable efforts to maintain the availability and operation of the Platform. The Vendor acknowledges that the Platform may be temporarily unavailable due to scheduled maintenance, upgrades, technical failures, third-party service interruptions, cybersecurity incidents, or circumstances beyond UAQ Deals\'s reasonable control. Such temporary interruptions shall not constitute a breach of this Agreement, and UAQ Deals shall not be liable for any resulting loss, delay, or interruption of business.');

  /* ---------- Cover + contents ---------- */
  var cover = [
    { text: UAQ.legal.toUpperCase(), font: 'Caladea', fontSize: 10, color: MUTE, alignment: 'center', margin: [0, 28, 0, 4] },
    { text: 'trading as', italics: true, fontSize: 9, color: MUTE, alignment: 'center', margin: [0, 0, 0, 10] },
    { image: logo, width: 98, alignment: 'center', margin: [0, 0, 0, 36] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: W, y2: 0, lineWidth: 0.7, lineColor: '#A8B86A' }], margin: [0, 0, 0, 22] },
    { text: 'VENDOR PARTNERSHIP AGREEMENT', font: 'Caladea', bold: true, fontSize: 20, color: INK, alignment: 'center', margin: [0, 0, 0, 10] },
    { text: 'Vendor Listing, Digital Marketing & Order Commission Terms', italics: true, fontSize: 12, color: MUTE, alignment: 'center', margin: [0, 0, 0, 40] },
    { text: 'BETWEEN', fontSize: 9, color: MUTE, alignment: 'center', margin: [0, 0, 0, 8] },
    { text: UAQ.legal + ' (“UAQ Deals”)', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5] },
    { text: 'License No. ' + UAQ.license + ' — ' + UAQ.authority, fontSize: 8.5, color: MUTE, alignment: 'center', margin: [0, 0, 0, 14] },
    { text: 'AND', fontSize: 9, color: MUTE, alignment: 'center', margin: [0, 0, 0, 8] },
    { text: d.vName + ' (“Vendor”)', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 5] },
    { text: 'License No. ' + d.vLicNo + ' — ' + d.vAuthority + ', ' + d.vEmirate, fontSize: 8.5, color: MUTE, alignment: 'center', margin: [0, 0, 0, 40] },
    { text: 'Effective Date:  ' + x.dateCover, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 44] },
    { text: 'CONFIDENTIAL — Prepared for execution between the Parties named herein.', italics: true, fontSize: 8, color: MUTE, alignment: 'center' }
  ];
  var contents = [
    { text: 'TABLE OF CONTENTS', font: 'Caladea', bold: true, fontSize: 12.5, color: MAROON, pageBreak: 'before' },
    rule(),
    {
      layout: 'noBorders', margin: [0, 0, 0, 0],
      table: { widths: ['*', 30], body: toc.map(function (t) { return [{ text: t[0], margin: [0, 2.5, 0, 2.5] }, { pageReference: t[1], bold: true, alignment: 'right', margin: [0, 2.5, 0, 2.5] }]; }) }
    },
    { text: '', pageBreak: 'after' }
  ];

  return {
    pageSize: 'A4',
    pageMargins: [72, 74, 72, 68],
    info: { title: 'Vendor Partnership Agreement — ' + d.vName, author: UAQ.legal, subject: 'UAQ Deals Vendor Partnership Agreement' },
    defaultStyle: { font: 'Carlito', fontSize: 10.5, lineHeight: 1.18, color: INK },
    header: function (page) {
      if (page === 1) return null;
      return { text: UAQ.legal.toUpperCase(), fontSize: 7, color: '#777777', alignment: 'right', margin: [72, 40, 72, 0] };
    },
    footer: function (page, pages) {
      if (page === 1) return null;
      return {
        margin: [72, 14, 72, 0],
        stack: [
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: W, y2: 0, lineWidth: 0.7, lineColor: GOLD }] },
          { margin: [0, 8, 0, 0], columns: [
            { text: 'UAQ Deals — Vendor Partnership Agreement (Confidential)', fontSize: 8, color: MUTE },
            { text: [{ text: 'Page ', fontSize: 8 }, { text: String(page), fontSize: 10 }, { text: ' of ', fontSize: 8 }, { text: String(pages), fontSize: 10 }], color: MUTE, alignment: 'right', width: 'auto' }
          ] }
        ]
      };
    },
    pageBreakBefore: function (node, following) {
      return node.headlineLevel === 1 && !node.pageBreak && following.length <= 8;
    },
    content: cover.concat(contents, body)
  };
}


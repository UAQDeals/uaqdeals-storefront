export const EMIRATES = ['Umm Al Quwain', 'Ajman', 'Sharjah', 'Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Fujairah'];
export const SECTIONS: [string, any[]][] = [
  ['Agreement', [
    { id: 'effDate', label: 'Effective date', type: 'date', req: 1 }
  ]],
  ['Vendor trade license', [
    { id: 'vName', label: 'Legal name', req: 1, hint: 'Exactly as printed on the trade license.' },
    { id: 'vTradeName', label: 'Trading name on the platform', hint: 'Leave blank to use the legal name.' },
    { id: 'vType', label: 'Legal type', req: 1, list: ['Limited Liability Company', 'Sole Establishment', 'Single Owner LLC', 'Free Zone Company', 'Civil Company', 'Branch of a Company'] },
    { id: 'vLicNo', label: 'License no.', req: 1 },
    { id: 'vRegNo', label: 'Registration no.' },
    { id: 'vAuthority', label: 'Issuing authority', req: 1, list: ['Department of Economic Development', 'Ajman Free Zone', 'Umm Al Quwain Free Trade Zone', 'Ajman Nuventures Centre Free Zone'] },
    { id: 'vEmirate', label: 'Emirate', type: 'select', options: EMIRATES, req: 1 },
    { id: 'vAddress', label: 'Registered address', req: 1, hint: 'Without the country, e.g. "Alreqa 2, Umm Al Quwain".' },
    { id: 'vIssue', label: 'License issue date', type: 'date', req: 1 },
    { id: 'vExpiry', label: 'License expiry date', type: 'date', req: 1 },
    { id: 'vActivity', label: 'Licensed activity', type: 'textarea', wide: 1, req: 1, hint: 'Separate activities with semicolons.' },
    { id: 'vOwners', label: 'Owner(s) / shareholders', type: 'textarea', wide: 1, req: 1, hint: 'For Annexure A, e.g. "Name (51%); Name (49%)".' },
    { id: 'vManager', label: 'Manager on the license', req: 1 },
    { id: 'vEmail', label: 'Email for notices', type: 'email' }
  ]],
  ['Vendor signatory', [
    { id: 'sTitle', label: 'Title', type: 'select', options: ['Mr.', 'Ms.', 'Mrs.', 'Dr.', ''] },
    { id: 'sName', label: 'Signatory full name', req: 1 },
    { id: 'sDesignation', label: 'Designation', req: 1, hint: 'e.g. Partner and Manager, Owner, General Manager.' },
    { id: 'sShare', label: 'Signatory\'s shareholding', hint: 'Shown in brackets after the name, e.g. 49%.' },
    { id: 'vOwnerClause', label: 'Other owner named in the parties clause', wide: 1, hint: 'Completes "owned by … and represented herein by". e.g. "Mr. Salah Ali Jasim Humaid Al Ali (51%)". Leave blank to omit.' }
  ]],
  ['Business and products', [
    { id: 'bizDesc', label: 'The Vendor is engaged in…', type: 'textarea', wide: 1, req: 1, hint: 'Completes the recital. Start with "the", no full stop.' },
    { id: 'productsDef', label: '"Products" means the…', type: 'textarea', wide: 1, req: 1, hint: 'Completes the definition. No full stop.' },
    { id: 'hasRepair', label: 'Vendor provides repair services', type: 'checkbox', wide: 1, hint: 'Adds the repair-care obligation (Clause 9) and the repair indemnity wording (Clause 15.1).' }
  ]],
  ['Commercial terms', [
    { id: 'fee', label: 'Annual fee (AED, excl. VAT)', type: 'number', req: 1, min: 0, step: 1 },
    { id: 'commission', label: 'Commission (% of order value)', type: 'number', req: 1, min: 0, max: 100, step: 0.5 },
    { id: 'settleDays', label: 'Settlement cycle (days)', type: 'number', req: 1, min: 1, step: 1 }
  ]]
];
export const EXAMPLE: Record<string, any> = { effDate: '2026-07-23', vName: 'Nay Phone Mobile L.L.C', vTradeName: '', vType: 'Limited Liability Company', vLicNo: 'LIC-COM-2515', vRegNo: '5599', vAuthority: 'Department of Economic Development', vEmirate: 'Umm Al Quwain', vAddress: 'Alreqa 2, Umm Al Quwain', vIssue: '2005-11-12', vExpiry: '2026-11-11', vActivity: 'Retail Sale of Mobile Phones; Mobile Phones Repairing', vOwners: 'Salah Ali Jasim Humaid Al Ali (51%); Salahudeen Muhammed Kunju Muhammed Kunju (49%)', vManager: 'Salahudeen Muhammed Kunju Muhammed Kunju', vEmail: 'alnayehone@gmail.com', sTitle: 'Mr.', sName: 'Salahudeen Muhammed Kunju Muhammed Kunju', sDesignation: 'Partner and Manager', sShare: '49%', vOwnerClause: 'Mr. Salah Ali Jasim Humaid Al Ali (51%)', bizDesc: 'the retail sale of mobile phones and mobile phone accessories, and the provision of mobile phone repair services', productsDef: 'mobile phones, mobile phone accessories, and mobile phone repair services', hasRepair: true, fee: '50000', commission: '15', settleDays: '14' };
export const BLANK_DEFAULTS: Record<string, any> = { vEmirate: 'Umm Al Quwain', sTitle: 'Mr.', vType: 'Limited Liability Company', fee: '50000', commission: '15', settleDays: '14' };

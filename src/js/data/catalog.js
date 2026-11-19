/**
 * VYROX Phase 1 demonstration catalogue.
 * SAMPLE DATA — every product, order, customer and figure here is fictional.
 * Phase 4 replaces this module with PHP/MySQL endpoints.
 */

const CDN = 'https://images.unsplash.com/photo-';
export const img = (id, w = 900) => `${CDN}${id}?auto=format&fit=crop&w=${w}&q=80`;

const pool = {
  fashion: ['1521572163474-6864f9cf17ab', '1551028719-00167b16eac5', '1542291026-7eec264c27ff', '1576566588028-4147f3842f27', '1595777457583-95e059d581b8'],
  electronics: ['1505740420928-5e560c06d30e', '1511707171634-5f897ff02aa9', '1546868871-7041f2a55e12', '1588872657578-7efd1f1555ed', '1523275335684-37898b6baf30'],
  accessories: ['1553062407-98eeb64c6a62', '1523170335258-f5ed11844a49', '1511499767150-a48a237f0083', '1590874103328-eac38a683ce7'],
  beauty: ['1556228578-8c89e6adf883', '1522338242992-e1a54906a8da', '1596462502278-27bfdc403348', '1571781926291-c477ebfd024b'],
  home: ['1555041469-a586c61ea9bc', '1567538096630-e0c55bd6374c', '1586023492125-27b2c045efd7', '1616486338812-3dadae4b4ace'],
  lifestyle: ['1513475382585-d06e58bcb0e0', '1544947950-fa07a98d237f', '1524758631624-e2822e304c36', '1526170375885-4d8ecf77b99f'],
  sports: ['1571019613454-1cb2f99b2d8b', '1518611012118-696072aa579a', '1517836357463-d25dfeac3438', '1544367567-0f2fcb009e0b'],
  general: ['1607082348824-0a96f2a4b9da', '1526170375885-4d8ecf77b99f', '1544947950-fa07a98d237f']
};

export const categories = [
  { slug: 'fashion', name: 'Fashion', tagline: 'Streetwear built for the after-dark', image: img('1551028719-00167b16eac5', 900), icon: 'shirt', count: 4 },
  { slug: 'electronics', name: 'Electronics', tagline: 'Sound, signal, speed', image: img('1505740420928-5e560c06d30e', 900), icon: 'smartphone', count: 4 },
  { slug: 'accessories', name: 'Accessories', tagline: 'Carry the statement', image: img('1553062407-98eeb64c6a62', 900), icon: 'watch', count: 3 },
  { slug: 'beauty', name: 'Beauty', tagline: 'Rituals for the bold', image: img('1556228578-8c89e6adf883', 900), icon: 'spray-can', count: 3 },
  { slug: 'home', name: 'Home & Living', tagline: 'Your space, engineered', image: img('1555041469-a586c61ea9bc', 900), icon: 'lamp', count: 3 },
  { slug: 'lifestyle', name: 'Lifestyle', tagline: 'Objects with a point of view', image: img('1513475382585-d06e58bcb0e0', 900), icon: 'globe', count: 3 },
  { slug: 'sports', name: 'Sports & Fitness', tagline: 'Move with intent', image: img('1571019613454-1cb2f99b2d8b', 900), icon: 'dumbbell', count: 2 },
  { slug: 'general', name: 'Essentials', tagline: 'Everyday, upgraded', image: img('1607082348824-0a96f2a4b9da', 900), icon: 'package', count: 2 }
];

const C = {
  black: { name: 'Black', hex: '#111111' },
  white: { name: 'White', hex: '#F5F5F5' },
  red: { name: 'Power Red', hex: '#E31B32' },
  charcoal: { name: 'Charcoal', hex: '#1C1C1F' },
  sand: { name: 'Sand', hex: '#D6C6B3' },
  olive: { name: 'Olive', hex: '#5B5F45' },
  silver: { name: 'Silver', hex: '#C9CCD1' },
  navy: { name: 'Navy', hex: '#1B2436' }
};

const seed = [
  ['fashion', 'VYROX Oversized Boxy Tee', 'fashion-tee', 1290, 1590, 4.8, 126, 42, 'SALE', 'Heavyweight 260gsm cotton with a boxy drop-shoulder cut, garment-dyed in small batches. The VYROX mark is printed at the chest; the back carries the season coordinate.', [C.black, C.white, C.sand], ['S', 'M', 'L', 'XL'], '1521572163474-6864f9cf17ab', { featured: true, bestSeller: true, sold: 312 }],
  ['fashion', 'Nomad Leather Biker Jacket', 'nomad-biker-jacket', 6990, 8990, 4.9, 84, 11, 'LIMITED', 'Full-grain cowhide, asymmetric zip, quilted shoulder panels and a cropped urban fit. Ages into a patina that is entirely yours.', [C.black, C.charcoal], ['S', 'M', 'L', 'XL'], '1551028719-00167b16eac5', { featured: true, isNew: true, sold: 96 }],
  ['fashion', 'Apex Court Sneakers', 'apex-court-sneakers', 4490, null, 4.7, 203, 28, 'BESTSELLER', 'Low-profile court silhouette on a sculpted rubber sole with a red heel clip. Full-grain leather upper, padded collar, all-day footbed.', [C.white, C.black, C.red], ['7', '8', '9', '10', '11', '12'], '1542291026-7eec264c27ff', { bestSeller: true, featured: true, sold: 480 }],
  ['fashion', 'Utility Cargo Pants', 'utility-cargo-pants', 2490, 2990, 4.5, 61, 34, 'SALE', 'Ripstop cotton cargo pant with articulated knees, six pockets and adjustable ankle cinch. Cut straight with a slight taper.', [C.olive, C.black, C.sand], ['S', 'M', 'L', 'XL'], '1576566588028-4147f3842f27', { isNew: true, sold: 118 }],
  ['electronics', 'Auralis ANC Headphones', 'auralis-anc-headphones', 8990, 10990, 4.9, 341, 19, 'SALE', 'Adaptive hybrid noise cancelling, 40-hour battery, LDAC and a machined aluminium frame. Foldable with a hard shell case and USB-C fast charge.', [C.black, C.silver], [], '1505740420928-5e560c06d30e', { featured: true, bestSeller: true, sold: 640 }],
  ['electronics', 'Pulse X5 Smartphone', 'pulse-x5-smartphone', 24990, null, 4.6, 188, 23, 'NEW', '6.7-inch 120Hz AMOLED, triple 50MP camera system, 5000mAh battery and 67W charging. 256GB storage, 12GB RAM, dual SIM.', [C.black, C.silver, C.navy], [], '1511707171634-5f897ff02aa9', { isNew: true, featured: true, sold: 205 }],
  ['electronics', 'Chrono S Smartwatch', 'chrono-s-smartwatch', 7490, 8490, 4.4, 97, 8, 'SALE', 'Always-on AMOLED, 14-day battery, dual-band GPS and 100+ training modes in a 42mm titanium case. 5ATM water resistance.', [C.black, C.silver], ['42mm', '46mm'], '1546868871-7041f2a55e12', { sold: 143 }],
  ['electronics', 'Vector Pro 14 Laptop', 'vector-pro-14-laptop', 54990, null, 4.8, 52, 6, 'LIMITED', '14-inch 2.8K OLED, 12-core CPU, 16GB unified memory and 1TB SSD. 1.29kg magnesium chassis with a 75Wh battery.', [C.charcoal, C.silver], [], '1588872657578-7efd1f1555ed', { featured: true, sold: 64 }],
  ['accessories', 'Vault Commuter Backpack', 'vault-commuter-backpack', 3490, null, 4.7, 154, 47, 'BESTSELLER', '22L weatherproof commuter pack with a 16-inch laptop sleeve, magnetic quick-access pocket and luggage pass-through.', [C.black, C.olive], [], '1553062407-98eeb64c6a62', { bestSeller: true, sold: 388 }],
  ['accessories', 'Nocturne Chronograph', 'nocturne-chronograph', 5990, 6990, 4.6, 72, 14, 'SALE', '38mm brushed steel chronograph, sapphire crystal and a black sunray dial with red sub-second accent. 5ATM rated.', [C.black, C.silver], [], '1523170335258-f5ed11844a49', { featured: true, sold: 121 }],
  ['accessories', 'Eclipse Sunglasses', 'eclipse-sunglasses', 1990, null, 4.3, 89, 0, 'NEW', 'Angular acetate frame with polarised CR-39 lenses and a red temple detail. Includes a felt sleeve and hard case.', [C.black, C.red], [], '1511499767150-a48a237f0083', { isNew: true, sold: 77 }],
  ['beauty', 'Ritual Glow Serum', 'ritual-glow-serum', 1490, null, 4.8, 267, 63, 'BESTSELLER', 'Niacinamide, hyaluronic acid and vitamin C in a lightweight daily serum. 30ml, fragrance-free and dermatologist tested.', [C.white], ['30ml'], '1556228578-8c89e6adf883', { bestSeller: true, sold: 702 }],
  ['beauty', 'Noir Eau de Parfum', 'noir-eau-de-parfum', 2990, 3490, 4.7, 118, 26, 'SALE', 'Black pepper, smoked cedar and amber. A dark, dry signature that lasts 8+ hours. 50ml with a magnetic cap.', [C.black], ['50ml', '100ml'], '1522338242992-e1a54906a8da', { featured: true, sold: 189 }],
  ['beauty', 'Studio Matte Kit', 'studio-matte-kit', 1890, null, 4.5, 64, 31, 'NEW', 'Six-pan matte palette, precision liner and a velvet lip in Power Red. Buildable pigment, cruelty-free formulas.', [C.red], [], '1596462502278-27bfdc403348', { isNew: true, sold: 91 }],
  ['home', 'Form Modular Sofa', 'form-modular-sofa', 24990, null, 4.9, 38, 4, 'LIMITED', 'Three-seat modular sofa in bouclé with a solid beech frame and pocket-spring seat. Configure left or right and add the ottoman later.', [C.sand, C.charcoal], [], '1555041469-a586c61ea9bc', { featured: true, sold: 41 }],
  ['home', 'Halo Floor Lamp', 'halo-floor-lamp', 4290, 4990, 4.6, 47, 17, 'SALE', 'Matte black steel arc lamp with a dimmable warm-white halo head and a weighted marble base. 1.65m reach.', [C.black, C.sand], [], '1567538096630-e0c55bd6374c', { isNew: true, sold: 58 }],
  ['home', 'Axis Lounge Chair', 'axis-lounge-chair', 8990, null, 4.7, 29, 9, 'NEW', 'Low-slung lounge chair with a powder-coated frame and full-grain leather sling. Designed for long sessions.', [C.black, C.sand], [], '1586023492125-27b2c045efd7', { featured: true, sold: 33 }],
  ['lifestyle', 'Analog Field Camera', 'analog-field-camera', 12990, null, 4.8, 41, 5, 'LIMITED', '35mm rangefinder-style field camera with a 40mm f/2.8 lens, brass top plate and leather wrap. Fully serviced.', [C.black, C.sand], [], '1513475382585-d06e58bcb0e0', { featured: true, sold: 27 }],
  ['lifestyle', 'Curated Coffee Table Books', 'curated-coffee-table-books', 1590, null, 4.4, 58, 44, 'NEW', 'A three-book set on brutalist architecture, urban photography and modern typography. Linen-bound, 320 pages total.', [C.white, C.black], [], '1544947950-fa07a98d237f', { isNew: true, sold: 112 }],
  ['lifestyle', 'Studio Desk Organizer', 'studio-desk-organizer', 990, 1290, 4.2, 33, 58, 'SALE', 'Powder-coated steel desk system with a pen well, cable channel and a phone dock. Modular, stackable, quiet.', [C.black, C.red], [], '1524758631624-e2822e304c36', { sold: 86 }],
  ['sports', 'Iron Hex Dumbbell Set', 'iron-hex-dumbbell-set', 4990, 5990, 4.8, 76, 12, 'SALE', 'Pair of rubber-encased hex dumbbells, 2 × 10kg, with knurled chrome handles. Floor-safe and rack-friendly.', [C.black], ['2 × 8kg', '2 × 10kg', '2 × 12kg'], '1571019613454-1cb2f99b2d8b', { bestSeller: true, sold: 168 }],
  ['sports', 'Motion Yoga Mat', 'motion-yoga-mat', 1290, null, 4.5, 145, 71, 'BESTSELLER', '5mm natural rubber mat with a grippy top layer and alignment marks. Includes a carry strap.', [C.black, C.olive, C.red], [], '1518611012118-696072aa579a', { bestSeller: true, sold: 421 }],
  ['general', 'VYROX Everyday Tote', 'vyrox-everyday-tote', 890, null, 4.3, 92, 88, 'NEW', '16oz washed canvas tote with an internal zip pocket, key leash and the VYROX slash print. 38 × 42cm.', [C.white, C.black], [], '1607082348824-0a96f2a4b9da', { isNew: true, sold: 244 }],
  ['general', 'Pocket Film Camera', 'pocket-film-camera', 6990, 7990, 4.6, 37, 7, 'SALE', 'Rechargeable 35mm point-and-shoot with a fixed 32mm lens, built-in flash and a glass viewfinder. Film not included.', [C.black, C.sand], [], '1526170375885-4d8ecf77b99f', { featured: true, sold: 52 }]
];

const dates = [
  '2026-11-12', '2026-11-10', '2026-11-08', '2026-11-05', '2026-10-29',
  '2026-10-24', '2026-10-18', '2026-10-11', '2026-09-30', '2026-09-21',
  '2026-09-14', '2026-09-02', '2026-08-27', '2026-08-19', '2026-08-08',
  '2026-07-30', '2026-07-22', '2026-07-14', '2026-07-03', '2026-06-25',
  '2026-06-17', '2026-06-09', '2026-05-28', '2026-05-16'
];

export const products = seed.map(([category, name, id, price, compareAt, rating, reviewCount, stock, badge, description, colors, sizes, photo, flags], index) => {
  const images = [img(photo, 1000)];
  const gallery = pool[category];
  for (let i = 1; i <= 2; i += 1) {
    const next = gallery[(gallery.indexOf(photo) + i) % gallery.length];
    if (next && !images.includes(img(next, 1000))) images.push(img(next, 1000));
  }
  return {
    id,
    name,
    category,
    categoryName: categories.find((c) => c.slug === category)?.name ?? category,
    brand: 'VYROX',
    price,
    compareAt: compareAt ?? null,
    rating,
    reviewCount,
    stock,
    badge,
    description,
    colors,
    sizes,
    images,
    specs: [
      ['Category', categories.find((c) => c.slug === category)?.name ?? category],
      ['SKU', `VX-${String(index + 1).padStart(3, '0')}-${id.slice(0, 3).toUpperCase()}`],
      ['Material', category === 'fashion' ? 'Premium textile / leather' : 'Mixed premium materials'],
      ['Warranty', category === 'electronics' ? '12 months VYROX care' : '30-day returns'],
      ['Origin', 'Designed in Manila · Made responsibly']
    ],
    featured: Boolean(flags.featured),
    isNew: Boolean(flags.isNew),
    bestSeller: Boolean(flags.bestSeller),
    sold: flags.sold,
    createdAt: dates[index],
    demo: true
  };
});

export const getProduct = (id) => products.find((p) => p.id === id) ?? products.find((p) => p.id === 'fashion-tee');

export const queryProducts = ({ q = '', category = 'all', min = 0, max = 0, rating = 0, inStock = false, sale = false, sort = 'featured', page = 1, perPage = 9 } = {}) => {
  const term = q.trim().toLowerCase();
  let list = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (term && !`${p.name} ${p.categoryName} ${p.brand}`.toLowerCase().includes(term)) return false;
    if (min && p.price < min) return false;
    if (max && p.price > max) return false;
    if (rating && p.rating < rating) return false;
    if (inStock && p.stock < 1) return false;
    if (sale && !p.compareAt) return false;
    return true;
  });

  const sorters = {
    featured: (a, b) => Number(b.featured) - Number(a.featured) || b.sold - a.sold,
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    popular: (a, b) => b.sold - a.sold
  };
  list = [...list].sort(sorters[sort] ?? sorters.featured);

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  return { items: list.slice((current - 1) * perPage, current * perPage), total, pages, page: current };
};

export const priceRange = { min: 0, max: 60000 };

/* ---------------------------------------------------------------- reviews */
export const reviews = [
  { id: 'r1', productId: 'fashion-tee', name: 'Mika R.', rating: 5, date: '2026-11-02', title: 'Perfect weight', body: 'The cotton is genuinely heavy and the boxy cut lands exactly where I wanted. Washed it four times, zero shrink.', verified: true, status: 'approved' },
  { id: 'r2', productId: 'fashion-tee', name: 'Jules A.', rating: 4, date: '2026-10-27', title: 'Runs large, looks right', body: 'I sized down and it is still roomy. Print is clean and the red is deep, not orange.', verified: true, status: 'approved' },
  { id: 'r3', productId: 'auralis-anc-headphones', name: 'Raf D.', rating: 5, date: '2026-11-05', title: 'Quiet in EDSA traffic', body: 'ANC actually holds up against the bus noise. Battery lasts my whole week of commutes.', verified: true, status: 'approved' },
  { id: 'r4', productId: 'auralis-anc-headphones', name: 'Nina C.', rating: 4, date: '2026-10-19', title: 'Great, slightly tight', body: 'Sound is excellent and the build feels premium. Clamp is a little firm for the first week.', verified: true, status: 'approved' },
  { id: 'r5', productId: 'apex-court-sneakers', name: 'Paolo G.', rating: 5, date: '2026-10-30', title: 'Daily driver', body: 'True to size, comfortable out of the box and the red heel is a nice detail in person.', verified: true, status: 'approved' },
  { id: 'r6', productId: 'ritual-glow-serum', name: 'Sam T.', rating: 5, date: '2026-11-07', title: 'No sting, real glow', body: 'Three weeks in and my texture is calmer. Absorbs fast under sunscreen.', verified: true, status: 'approved' },
  { id: 'r7', productId: 'vault-commuter-backpack', name: 'Kai M.', rating: 4, date: '2026-10-22', title: 'Carries everything', body: 'Laptop, gym kit and a change of clothes with room left. The magnetic pocket is addictive.', verified: true, status: 'pending' },
  { id: 'r8', productId: 'nocturne-chronograph', name: 'Bea L.', rating: 3, date: '2026-10-12', title: 'Smaller than expected', body: 'The 38mm case is elegant but reads smaller on my wrist. Build quality is good for the price.', verified: true, status: 'pending' }
];

/* ------------------------------------------------------------ demo orders */
const orderSeeds = [
  ['VYX-2611-8841', 'Mika Reyes', 'mika.reyes@example.com', '2026-11-12', 'shipped', 'paid', 'GCash', ['fashion-tee', 'eclipse-sunglasses'], 1290 + 1990, 'Metro Manila'],
  ['VYX-2611-8720', 'Jules Alvarez', 'jules.a@example.com', '2026-11-11', 'processing', 'paid', 'Maya', ['auralis-anc-headphones'], 8990, 'Cavite'],
  ['VYX-2611-8655', 'Raf Dizon', 'raf.dizon@example.com', '2026-11-10', 'pending', 'unpaid', 'COD', ['vault-commuter-backpack', 'motion-yoga-mat'], 3490 + 1290, 'Quezon City'],
  ['VYX-2611-8590', 'Nina Cruz', 'nina.cruz@example.com', '2026-11-09', 'ready', 'paid', 'Bank Transfer', ['ritual-glow-serum', 'noir-eau-de-parfum'], 1490 + 2990, 'Makati'],
  ['VYX-2611-8512', 'Paolo Garcia', 'paolo.g@example.com', '2026-11-08', 'delivered', 'paid', 'GCash', ['apex-court-sneakers'], 4490, 'Cebu'],
  ['VYX-2611-8440', 'Sam Tan', 'sam.tan@example.com', '2026-11-07', 'delivered', 'paid', 'Maya', ['form-modular-sofa'], 24990, 'Metro Manila'],
  ['VYX-2611-8388', 'Kai Mendoza', 'kai.m@example.com', '2026-11-06', 'cancelled', 'refunded', 'GCash', ['pulse-x5-smartphone'], 24990, 'Davao'],
  ['VYX-2610-8211', 'Bea Lim', 'bea.lim@example.com', '2026-11-02', 'delivered', 'paid', 'COD', ['curated-coffee-table-books', 'vyrox-everyday-tote'], 1590 + 890, 'Pasig'],
  ['VYX-2610-8106', 'Marco Uy', 'marco.uy@example.com', '2026-10-30', 'shipped', 'paid', 'Bank Transfer', ['vector-pro-14-laptop'], 54990, 'Batangas'],
  ['VYX-2610-8044', 'Iya Santos', 'iya.santos@example.com', '2026-10-28', 'delivered', 'paid', 'GCash', ['halo-floor-lamp', 'studio-desk-organizer'], 4290 + 990, 'Metro Manila']
];

export const demoTax = 0;
export const demoOrders = orderSeeds.map(([id, customer, email, date, status, payment, method, itemIds, total, region], index) => ({
  id,
  customer,
  email,
  date,
  status,
  payment,
  method,
  region,
  total,
  shipping: total >= 2500 ? 0 : 99,
  items: itemIds.map((pid, i) => {
    const p = products.find((x) => x.id === pid);
    return { id: pid, name: p?.name ?? pid, qty: i === 0 && index % 3 === 0 ? 2 : 1, price: p?.price ?? 0, image: p?.images[0] };
  }),
  timeline: [
    ['Order placed', date, true],
    ['Payment verified', date, payment === 'paid'],
    ['Processing', date, ['processing', 'ready', 'shipped', 'delivered'].includes(status)],
    ['Ready to ship', date, ['ready', 'shipped', 'delivered'].includes(status)],
    ['Shipped', date, ['shipped', 'delivered'].includes(status)],
    ['Delivered', date, status === 'delivered']
  ],
  demo: true
}));

/* -------------------------------------------------------- demo customers */
export const demoCustomers = [
  ['Mika Reyes', 'mika.reyes@example.com', '+63 917 420 8841', 'Metro Manila', 6, 18420, '2025-03-12'],
  ['Jules Alvarez', 'jules.a@example.com', '+63 918 552 0193', 'Cavite', 3, 12980, '2025-06-08'],
  ['Raf Dizon', 'raf.dizon@example.com', '+63 916 771 2020', 'Quezon City', 4, 9870, '2025-08-21'],
  ['Nina Cruz', 'nina.cruz@example.com', '+63 920 330 9182', 'Makati', 8, 23140, '2024-11-30'],
  ['Paolo Garcia', 'paolo.g@example.com', '+63 915 884 1120', 'Cebu', 2, 6490, '2026-01-14'],
  ['Sam Tan', 'sam.tan@example.com', '+63 927 118 4432', 'Metro Manila', 5, 31760, '2024-09-02'],
  ['Kai Mendoza', 'kai.m@example.com', '+63 939 220 7741', 'Davao', 1, 24990, '2026-02-19'],
  ['Bea Lim', 'bea.lim@example.com', '+63 906 441 8820', 'Pasig', 3, 5280, '2025-10-05']
].map(([name, email, phone, region, orders, spent, joined], i) => ({
  id: `CUS-${String(1001 + i)}`,
  name,
  email,
  phone,
  region,
  orders,
  spent,
  joined,
  status: i === 6 ? 'inactive' : 'active',
  demo: true
}));

/* ----------------------------------------------------------- demo coupons */
export const demoCoupons = [
  { code: 'VYROX10', type: 'percent', value: 10, cap: 500, minimum: 0, usage: 248, limit: 500, status: 'active', expires: '2026-12-31', note: '10% off, capped at ₱500' },
  { code: 'URBAN500', type: 'fixed', value: 500, cap: 0, minimum: 3000, usage: 87, limit: 300, status: 'active', expires: '2026-12-15', note: '₱500 off orders over ₱3,000' },
  { code: 'FREESHIP', type: 'shipping', value: 0, cap: 0, minimum: 0, usage: 412, limit: 1000, status: 'active', expires: '2027-01-31', note: 'Free shipping nationwide' },
  { code: 'DROP20', type: 'percent', value: 20, cap: 1000, minimum: 5000, usage: 120, limit: 120, status: 'expired', expires: '2026-10-31', note: 'Launch drop — fully redeemed' }
];

/* ------------------------------------------------------------ demo users */
export const demoAdminUsers = [
  ['Alexis Ramos', 'alexis@vyrox.ph', 'Owner', 'admin', 'active', '2026-11-12 09:41'],
  ['Trina Bautista', 'trina@vyrox.ph', 'Store Manager', 'manager', 'active', '2026-11-12 08:15'],
  ['Dale Navarro', 'dale@vyrox.ph', 'Fulfilment', 'staff', 'active', '2026-11-11 18:02'],
  ['Kiko Salazar', 'kiko@vyrox.ph', 'Support', 'staff', 'invited', '2026-11-09 14:20']
].map(([name, email, role, level, status, lastActive], i) => ({ id: `USR-${i + 1}`, name, email, role, level, status, lastActive, demo: true }));

export const demoLog = [
  ['Stock adjusted', 'Auralis ANC Headphones', '+12 units', '2026-11-12 10:02'],
  ['Order shipped', 'VYX-2611-8841', '2GO · TRK-994120', '2026-11-12 09:18'],
  ['Payment verified', 'VYX-2611-8720', 'Maya · ref 8841-220', '2026-11-11 16:44'],
  ['Coupon created', 'URBAN500', '₱500 · min ₱3,000', '2026-11-10 11:30'],
  ['Product published', 'Pocket Film Camera', '7 in stock', '2026-11-09 15:07']
].map(([action, subject, detail, at], i) => ({ id: `LOG-${i + 1}`, action, subject, detail, at }));

export const regions = ['Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Rizal', 'Bulacan', 'Pampanga', 'Cebu', 'Davao', 'Iloilo', 'Baguio', 'Other province'];
